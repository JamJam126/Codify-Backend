"""Phase 2 orchestration: Student Code Evaluation."""

from __future__ import annotations

import logging
from typing import Any

from pydantic import ValidationError

from app.common.exceptions import EvaluatorError, LLMClientError, SafetyValidationError, VectorStoreError
from app.core.context_builder import build_evaluation_context
from app.core.prompt_builder import build_evaluation_messages
from app.core.safety_validator import validate_evaluation_output
from app.integrations.llm_client import LLMClient
from app.integrations.vector_client import VectorClient
from app.schemas import EvaluateRequest, EvaluateResponse, SkillEvaluationResult
from app.vectorstore.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

DEFAULT_RAG_LIMIT = 3


class EvaluationPipeline:
    """Orchestrates the evaluation of a student's code submission.

    Handles context assembly, RAG retrieval, prompt construction, LLM invocation,
    safety validation, and response structuring for Phase 2.
    """

    def __init__(
        self,
        llm_client: LLMClient,
        vector_client: VectorClient | None,
        embedding_service: EmbeddingService | None,
    ) -> None:
        """Initialize the EvaluationPipeline.

        Args:
            llm_client: The client used to communicate with the LLM.
            vector_client: Optional client for RAG knowledge retrieval.
            embedding_service: Optional service for generating text embeddings.
        """
        self._llm_client = llm_client
        self._vector_client = vector_client
        self._embedding_service = embedding_service

    async def evaluate(self, request: EvaluateRequest) -> EvaluateResponse:
        """Evaluate a student submission against approved micro-skills.

        Args:
            request: The validated evaluation request payload.

        Returns:
            An EvaluateResponse containing per-skill feedback.

        Raises:
            SafetyValidationError: If the LLM output violates safety rules.
            EvaluatorError: If the LLM output cannot be mapped to the response schema.
            LLMClientError: If the LLM API call fails.
        """
        approved_skill_ids = [skill.id for skill in request.approved_skills]
        
        safe_context = build_evaluation_context(
            question_description=request.question_description,
            starter_code=request.starter_code,
            student_code=request.student_code,
            raw_test_cases=request.test_cases,
            approved_skills=[skill.model_dump() for skill in request.approved_skills],
            language=request.language,
        )

        rag_context = self._retrieve_rag_context(request.question_description)
        safe_context["rag_context"] = rag_context

        system_prompt, user_prompt = build_evaluation_messages(safe_context)

        raw_response = await self._llm_client.generate(system_prompt, user_prompt)

        validated_results = validate_evaluation_output(raw_response, approved_skill_ids)

        return self._build_response(validated_results)

    def _retrieve_rag_context(self, query_text: str) -> str:
        """Attempt to retrieve similar knowledge from the vector DB.

        If retrieval fails or components are missing, it gracefully degrades
        to an empty string so evaluation can proceed without RAG.

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
            logger.warning(
                "RAG retrieval failed, proceeding without context",
                extra={"error": str(error)},
            )
            return ""

    def _build_response(
        self,
        validated_results: list[dict[str, Any]],
    ) -> EvaluateResponse:
        """Map validated dictionaries to Pydantic response models.

        Args:
            validated_results: The list of validated result dictionaries from safety_validator.

        Returns:
            A structured EvaluateResponse.

        Raises:
            EvaluatorError: If a validated dictionary fails Pydantic parsing.
        """
        skill_results: list[SkillEvaluationResult] = []

        for item in validated_results:
            try:
                # Map 'snippet' to allow None if missing (safety_validator ensures required keys exist,
                # but snippet/hint are optional in the final schema)
                result = SkillEvaluationResult(
                    skill_id=item["skill_id"],
                    skill_name=item["skill_name"],
                    status=item["status"],
                    why=item["why"],
                    snippet=item.get("snippet"),
                    hint=item.get("hint"),
                )
                skill_results.append(result)
            except ValidationError as error:
                logger.error(
                    "Failed to map validated result to SkillEvaluationResult",
                    extra={"error": str(error), "skill_id": item.get("skill_id")},
                )
                raise EvaluatorError(
                    f"Failed to structure response for skill {item.get('skill_id')}: {error}"
                ) from error

        return EvaluateResponse(results=skill_results)