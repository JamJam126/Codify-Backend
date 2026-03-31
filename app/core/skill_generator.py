"""Phase 1 orchestration: Micro-Skill Generation."""

from __future__ import annotations

import json
import logging
from typing import Any

from pydantic import ValidationError

from app.common.exceptions import EvaluatorError, LLMClientError, VectorStoreError
from app.core.prompt_builder import build_skill_gen_messages
from app.integrations.llm_client import LLMClient
from app.integrations.vector_client import VectorClient
from app.schemas import CandidateSkill, SkillGenerateResponse
from app.vectorstore.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

DEFAULT_RAG_LIMIT = 3


class SkillGenerator:
    """Orchestrates the generation of candidate micro-skills.

    Handles RAG retrieval (if available), prompt construction, LLM invocation,
    and response parsing into structured Pydantic models.
    """

    def __init__(
        self,
        llm_client: LLMClient,
        vector_client: VectorClient | None,
        embedding_service: EmbeddingService | None,
    ) -> None:
        """Initialize the SkillGenerator.

        Args:
            llm_client: The client used to communicate with the LLM.
            vector_client: Optional client for RAG knowledge retrieval.
            embedding_service: Optional service for generating text embeddings.
        """
        self._llm_client = llm_client
        self._vector_client = vector_client
        self._embedding_service = embedding_service

    async def generate_skills(
        self,
        question_description: str,
        starter_code: str,
        language: str,
        already_approved_skills: list[dict[str, str]] | None = None,
    ) -> SkillGenerateResponse:
        """Generate candidate micro-skills for an assignment.

        Args:
            question_description: The assignment prompt text.
            starter_code: The teacher's starter code.
            language: The programming language.
            already_approved_skills: Optional list of skills the teacher already
                approved, used to prevent duplicates during regeneration.

        Returns:
            A SkillGenerateResponse containing the candidate skills.

        Raises:
            LLMClientError: If the LLM fails to return a response.
            EvaluatorError: If the LLM response is invalid or cannot be parsed.
        """
        rag_context = self._retrieve_rag_context(question_description)

        system_prompt, user_prompt = build_skill_gen_messages(
            question_description=question_description,
            starter_code=starter_code,
            language=language,
            rag_context=rag_context,
            already_approved_skills=already_approved_skills,
        )

        raw_response = await self._llm_client.generate(system_prompt, user_prompt)

        candidate_skills = self._parse_response(raw_response)

        return SkillGenerateResponse(candidate_skills=candidate_skills)

    def _retrieve_rag_context(self, query_text: str) -> str:
        """Attempt to retrieve similar knowledge from the vector DB.

        If retrieval fails or components are missing, it gracefully degrades
        to an empty string so generation can proceed without RAG.

        Args:
            query_text: The text to search the vector DB with.

        Returns:
            A concatenated string of relevant context, or an empty string.
        """
        if not self._vector_client or not self._embedding_service:
            return ""

        try:
            query_vector = self._embedding_service.embed_text(query_text)
            results = self._vector_client.search(query_vector, limit=DEFAULT_RAG_LIMIT)

            if not results:
                return ""

            context_pieces = [r.get("content", "") for r in results if r.get("content")]
            return "\n\n".join(context_pieces)

        except (VectorStoreError, Exception) as error:
            # Graceful degradation: RAG is a enhancement, not a hard requirement
            logger.warning(
                "RAG retrieval failed, proceeding without context",
                extra={"error": str(error)},
            )
            return ""

    def _parse_response(self, raw_response: str) -> list[CandidateSkill]:
        """Parse the raw LLM JSON string into validated CandidateSkill models.

        Args:
            raw_response: The JSON string returned by the LLM.

        Returns:
            A list of validated CandidateSkill objects.

        Raises:
            EvaluatorError: If parsing or validation fails.
        """
        try:
            data = json.loads(raw_response)
        except json.JSONDecodeError as error:
            logger.error("Failed to parse skill generation JSON", extra={"error": str(error)})
            raise EvaluatorError(
                f"LLM returned invalid JSON for skill generation: {error}"
            ) from error

        if "candidate_skills" not in data or not isinstance(data["candidate_skills"], list):
            raise EvaluatorError(
                "LLM response missing 'candidate_skills' array."
            )

        validated_skills: list[CandidateSkill] = []
        for item in data["candidate_skills"]:
            try:
                skill = CandidateSkill(**item)
                validated_skills.append(skill)
            except ValidationError as error:
                logger.warning(
                    "Failed to validate a candidate skill, skipping",
                    extra={"error": str(error), "skill_data": item},
                )
                # Skip malformed skills instead of failing the whole request

        if not validated_skills:
            raise EvaluatorError(
                "LLM returned 0 valid candidate skills after validation."
            )

        return validated_skills