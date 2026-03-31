"""Tests for app.core.skill_generator module."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.common.exceptions import EvaluatorError, LLMClientError, VectorStoreError
from app.core.skill_generator import SkillGenerator
from app.schemas import SkillGenerateResponse


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_llm_client() -> AsyncMock:
    """Provide a mocked LLM client."""
    client = MagicMock(spec=["generate"])
    client.generate = AsyncMock()
    return client


@pytest.fixture
def mock_vector_client() -> MagicMock:
    """Provide a mocked Vector client."""
    return MagicMock()


@pytest.fixture
def mock_embedding_service() -> MagicMock:
    """Provide a mocked Embedding service."""
    return MagicMock()


@pytest.fixture
def valid_llm_skill_response() -> str:
    """Provide a valid JSON response from the LLM."""
    data = {
        "candidate_skills": [
            {
                "id": "sk_01",
                "name": "Loop initialization",
                "description": "Initialize loop counter to 0",
            },
            {
                "id": "sk_02",
                "name": "Array indexing",
                "description": "Access array using bracket notation",
            },
        ]
    }
    return json.dumps(data)


@pytest.fixture
def approved_skills_for_regen() -> list[dict[str, str]]:
    """Provide a list of already approved skills for regeneration testing."""
    return [
        {"id": "sk_01", "name": "Read integers", "description": "Use scanf"}
    ]


# =============================================================================
# Success Path Tests
# =============================================================================


class TestSkillGeneratorSuccess:
    """Tests for successful skill generation."""

    @pytest.mark.asyncio
    async def test_returns_valid_response(
        self,
        mock_llm_client: AsyncMock,
        valid_llm_skill_response: str,
    ) -> None:
        """Should return SkillGenerateResponse with parsed skills."""
        mock_llm_client.generate.return_value = valid_llm_skill_response
        generator = SkillGenerator(mock_llm_client, None, None)

        result = await generator.generate_skills("Reverse array", "int arr[5];", "c")

        assert isinstance(result, SkillGenerateResponse)
        assert len(result.candidate_skills) == 2
        assert result.candidate_skills[0].id == "sk_01"
        assert result.candidate_skills[1].name == "Array indexing"

    @pytest.mark.asyncio
    async def test_includes_rag_context_in_prompt(
        self,
        mock_llm_client: AsyncMock,
        mock_vector_client: MagicMock,
        mock_embedding_service: MagicMock,
        valid_llm_skill_response: str,
    ) -> None:
        """Should call LLM with RAG context if vector DB returns results."""
        mock_embedding_service.embed_text.return_value = [0.1] * 384
        mock_vector_client.search.return_value = [{"content": "Use temp variables."}]
        mock_llm_client.generate.return_value = valid_llm_skill_response

        generator = SkillGenerator(mock_llm_client, mock_vector_client, mock_embedding_service)
        await generator.generate_skills("Q", "C", "c")

        # Verify the prompt sent to LLM contains the RAG text
        call_args = mock_llm_client.generate.call_args
        user_prompt = call_args[0][1]
        assert "Use temp variables." in user_prompt

    @pytest.mark.asyncio
    async def test_passes_approved_skills_to_prompt(
        self,
        mock_llm_client: AsyncMock,
        valid_llm_skill_response: str,
        approved_skills_for_regen: list[dict[str, str]],
    ) -> None:
        """Should inject the exclusion block into the prompt if approved skills are provided."""
        mock_llm_client.generate.return_value = valid_llm_skill_response
        generator = SkillGenerator(mock_llm_client, None, None)

        await generator.generate_skills(
            question_description="Shift array",
            starter_code="int arr[5];",
            language="c",
            already_approved_skills=approved_skills_for_regen,
        )

        # Verify the prompt sent to LLM contains the exclusion text
        call_args = mock_llm_client.generate.call_args
        user_prompt = call_args[0][1]
        assert "## Exclusion List" in user_prompt
        assert "sk_01: Read integers" in user_prompt
        assert "Do NOT generate skills that overlap" in user_prompt


# =============================================================================
# Graceful Degradation Tests
# =============================================================================


class TestSkillGeneratorRAGFailure:
    """Tests for RAG component failures."""

    @pytest.mark.asyncio
    async def test_proceeds_if_vector_db_fails(
        self,
        mock_llm_client: AsyncMock,
        mock_vector_client: MagicMock,
        mock_embedding_service: MagicMock,
        valid_llm_skill_response: str,
    ) -> None:
        """Should still generate skills if vector search throws an error."""
        mock_embedding_service.embed_text.return_value = [0.1] * 384
        mock_vector_client.search.side_effect = VectorStoreError("Connection lost")
        mock_llm_client.generate.return_value = valid_llm_skill_response

        generator = SkillGenerator(mock_llm_client, mock_vector_client, mock_embedding_service)

        # Should NOT raise, should successfully return response
        result = await generator.generate_skills("Q", "C", "c")
        assert len(result.candidate_skills) == 2

        # Verify RAG context is NOT in the prompt
        call_args = mock_llm_client.generate.call_args
        user_prompt = call_args[0][1]
        assert "## Reference Knowledge" not in user_prompt

    @pytest.mark.asyncio
    async def test_proceeds_if_no_clients_provided(
        self,
        mock_llm_client: AsyncMock,
        valid_llm_skill_response: str,
    ) -> None:
        """Should work normally if vector_client and embedding_service are None."""
        mock_llm_client.generate.return_value = valid_llm_skill_response
        generator = SkillGenerator(mock_llm_client, None, None)

        result = await generator.generate_skills("Q", "C", "c")
        assert isinstance(result, SkillGenerateResponse)


# =============================================================================
# Error Handling Tests
# =============================================================================


class TestSkillGeneratorErrors:
    """Tests for error handling during generation."""

    @pytest.mark.asyncio
    async def test_raises_llm_error_on_api_failure(
        self,
        mock_llm_client: AsyncMock,
    ) -> None:
        """Should raise LLMClientError if the API call fails."""
        mock_llm_client.generate.side_effect = LLMClientError("Timeout", provider="groq")
        generator = SkillGenerator(mock_llm_client, None, None)

        with pytest.raises(LLMClientError):
            await generator.generate_skills("Q", "C", "c")

    @pytest.mark.asyncio
    async def test_raises_evaluator_error_on_invalid_json(
        self,
        mock_llm_client: AsyncMock,
    ) -> None:
        """Should raise EvaluatorError if LLM returns malformed JSON."""
        mock_llm_client.generate.return_value = "This is not JSON"
        generator = SkillGenerator(mock_llm_client, None, None)

        with pytest.raises(EvaluatorError) as exc_info:
            await generator.generate_skills("Q", "C", "c")

        assert "invalid json" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_raises_evaluator_error_on_missing_key(
        self,
        mock_llm_client: AsyncMock,
    ) -> None:
        """Should raise EvaluatorError if 'candidate_skills' key is missing."""
        mock_llm_client.generate.return_value = json.dumps({"data": []})
        generator = SkillGenerator(mock_llm_client, None, None)

        with pytest.raises(EvaluatorError) as exc_info:
            await generator.generate_skills("Q", "C", "c")

        assert "missing 'candidate_skills'" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_skips_invalid_skill_and_raises_if_all_invalid(
        self,
        mock_llm_client: AsyncMock,
    ) -> None:
        """Should skip malformed skills, but raise if NONE are valid."""
        bad_data = {
            "candidate_skills": [
                {"id": "invalid_id", "name": "Test"}  # Missing description, bad ID format
            ]
        }
        mock_llm_client.generate.return_value = json.dumps(bad_data)
        generator = SkillGenerator(mock_llm_client, None, None)

        with pytest.raises(EvaluatorError) as exc_info:
            await generator.generate_skills("Q", "C", "c")

        assert "0 valid candidate skills" in str(exc_info.value)

    @pytest.mark.asyncio
    async def test_keeps_valid_skills_skips_invalid(
        self,
        mock_llm_client: AsyncMock,
    ) -> None:
        """Should keep valid skills even if one in the list is malformed."""
        mixed_data = {
            "candidate_skills": [
                {"id": "invalid", "name": "Bad"},  # Invalid
                {"id": "sk_01", "name": "Good", "description": "Valid skill"},  # Valid
            ]
        }
        mock_llm_client.generate.return_value = json.dumps(mixed_data)
        generator = SkillGenerator(mock_llm_client, None, None)

        result = await generator.generate_skills("Q", "C", "c")

        # Should succeed because 1 valid skill was found
        assert len(result.candidate_skills) == 1
        assert result.candidate_skills[0].id == "sk_01"