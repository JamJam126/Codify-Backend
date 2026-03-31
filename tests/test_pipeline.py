"""Tests for app.core.pipeline module."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from app.common.exceptions import LLMClientError, SafetyValidationError, VectorStoreError
from app.core.pipeline import EvaluationPipeline
from app.schemas import ApprovedSkill, EvaluateRequest, EvaluateResponse


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_approved_skills() -> list[ApprovedSkill]:
    """Provide a list of approved skills."""
    return [
        ApprovedSkill(id="sk_01", name="Loop init", description="Start at 0"),
        ApprovedSkill(id="sk_02", name="Data preservation", description="Use temp var"),
    ]


@pytest.fixture
def evaluate_request(mock_approved_skills: list[ApprovedSkill]) -> EvaluateRequest:
    """Provide a valid EvaluateRequest payload."""
    return EvaluateRequest(
        question_description="Shift array left",
        starter_code="int arr[5];",
        test_cases="Passed 2/5",
        student_code="int main() { int arr[5]; arr[0]=arr[1]; }",
        approved_skills=mock_approved_skills,
        language="c",
    )


@pytest.fixture
def valid_llm_eval_response() -> str:
    """Provide a valid JSON evaluation response from the LLM."""
    data = {
        "results": [
            {
                "skill_id": "sk_01",
                "skill_name": "Loop init",
                "status": "demonstrated",
                "why": "Loop starts correctly.",
                "snippet": "for(int i=0; ...)",
                "hint": None,
            },
            {
                "skill_id": "sk_02",
                "skill_name": "Data preservation",
                "status": "not_demonstrated",
                "why": "First element is overwritten.",
                "snippet": "arr[0]=arr[1];",
                "hint": "Consider saving the first element first.",
            },
        ]
    }
    return json.dumps(data)


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


# =============================================================================
# Success Path Tests
# =============================================================================


class TestEvaluationPipelineSuccess:
    """Tests for successful evaluation execution."""

    @pytest.mark.asyncio
    async def test_returns_valid_response(
        self,
        mock_llm_client: AsyncMock,
        evaluate_request: EvaluateRequest,
        valid_llm_eval_response: str,
    ) -> None:
        """Should return EvaluateResponse with correctly mapped results."""
        mock_llm_client.generate.return_value = valid_llm_eval_response
        pipeline = EvaluationPipeline(mock_llm_client, None, None)

        result = await pipeline.evaluate(evaluate_request)

        assert isinstance(result, EvaluateResponse)
        assert len(result.results) == 2
        assert result.results[0].status == "demonstrated"
        assert result.results[0].hint is None
        assert result.results[1].status == "not_demonstrated"
        assert result.results[1].hint == "Consider saving the first element first."

    @pytest.mark.asyncio
    async def test_includes_rag_context_in_prompt(
        self,
        mock_llm_client: AsyncMock,
        mock_vector_client: MagicMock,
        mock_embedding_service: MagicMock,
        evaluate_request: EvaluateRequest,
        valid_llm_eval_response: str,
    ) -> None:
        """Should append RAG context to the LLM prompt if available."""
        mock_embedding_service.embed_text.return_value = [0.1] * 384
        mock_vector_client.search.return_value = [{"content": "Common mistake: off-by-one."}]
        mock_llm_client.generate.return_value = valid_llm_eval_response

        pipeline = EvaluationPipeline(mock_llm_client, mock_vector_client, mock_embedding_service)
        await pipeline.evaluate(evaluate_request)

        call_args = mock_llm_client.generate.call_args
        user_prompt = call_args[0][1]
        assert "Common mistake: off-by-one." in user_prompt

    @pytest.mark.asyncio
    async def test_sanitizes_test_cases_before_prompting(
        self,
        mock_llm_client: AsyncMock,
        evaluate_request: EvaluateRequest,
        valid_llm_eval_response: str,
    ) -> None:
        """Should ensure raw dangerous test cases are NOT sent to the LLM."""
        # Override the test cases in the request to something dangerous
        evaluate_request.test_cases = "Input: 1 2 3\nExpected: 3 2 1"

        mock_llm_client.generate.return_value = valid_llm_eval_response
        pipeline = EvaluationPipeline(mock_llm_client, None, None)

        await pipeline.evaluate(evaluate_request)

        call_args = mock_llm_client.generate.call_args
        user_prompt = call_args[0][1]

        # The raw input should be redacted
        assert "Input: 1 2 3" not in user_prompt
        # The safe fallback should be present
        assert "details hidden for academic integrity" in user_prompt


# =============================================================================
# Graceful Degradation Tests
# =============================================================================


class TestEvaluationPipelineRAGFailure:
    """Tests for RAG component failures during evaluation."""

    @pytest.mark.asyncio
    async def test_proceeds_if_vector_db_fails(
        self,
        mock_llm_client: AsyncMock,
        mock_vector_client: MagicMock,
        mock_embedding_service: MagicMock,
        evaluate_request: EvaluateRequest,
        valid_llm_eval_response: str,
    ) -> None:
        """Should still evaluate successfully if vector search throws an error."""
        mock_embedding_service.embed_text.return_value = [0.1] * 384
        mock_vector_client.search.side_effect = VectorStoreError("Connection lost")
        mock_llm_client.generate.return_value = valid_llm_eval_response

        pipeline = EvaluationPipeline(mock_llm_client, mock_vector_client, mock_embedding_service)

        result = await pipeline.evaluate(evaluate_request)
        assert isinstance(result, EvaluateResponse)


# =============================================================================
# Error Handling Tests
# =============================================================================


class TestEvaluationPipelineErrors:
    """Tests for error handling and safety validation."""

    @pytest.mark.asyncio
    async def test_raises_llm_error_on_api_failure(
        self,
        mock_llm_client: AsyncMock,
        evaluate_request: EvaluateRequest,
    ) -> None:
        """Should raise LLMClientError if the API call fails."""
        mock_llm_client.generate.side_effect = LLMClientError("Timeout", provider="groq")
        pipeline = EvaluationPipeline(mock_llm_client, None, None)

        with pytest.raises(LLMClientError):
            await pipeline.evaluate(evaluate_request)

    @pytest.mark.asyncio
    async def test_raises_safety_error_on_code_leak(
        self,
        mock_llm_client: AsyncMock,
        evaluate_request: EvaluateRequest,
    ) -> None:
        """Should raise SafetyValidationError if LLM puts code in a hint."""
        dangerous_response = json.dumps({
            "results": [
                {
                    "skill_id": "sk_01",
                    "skill_name": "Loop init",
                    "status": "demonstrated",
                    "why": "Good",
                    "snippet": "code",
                    "hint": None,
                },
                {
                    "skill_id": "sk_02",
                    "skill_name": "Data preservation",
                    "status": "not_demonstrated",
                    "why": "Bad",
                    "snippet": "arr[0]=arr[1];",
                    "hint": "Fix it like this:\n```c\nint temp = arr[0];\n```",
                },
            ]
        })

        mock_llm_client.generate.return_value = dangerous_response
        pipeline = EvaluationPipeline(mock_llm_client, None, None)

        with pytest.raises(SafetyValidationError) as exc_info:
            await pipeline.evaluate(evaluate_request)

        assert "code_block_in_hint" == exc_info.value.rule_violated

    @pytest.mark.asyncio
    async def test_raises_safety_error_on_hallucinated_skills(
        self,
        mock_llm_client: AsyncMock,
        evaluate_request: EvaluateRequest,
    ) -> None:
        """Should raise SafetyValidationError if LLM returns an unapproved skill ID."""
        hallucinated_response = json.dumps({
            "results": [
                {
                    "skill_id": "sk_01",
                    "skill_name": "Loop init",
                    "status": "demonstrated",
                    "why": "Good",
                    "snippet": "code",
                    "hint": None,
                },
                {
                    "skill_id": "sk_99",  # Hallucinated!
                    "skill_name": "Made up skill",
                    "status": "demonstrated",
                    "why": "Good",
                    "snippet": "code",
                    "hint": None,
                },
            ]
        })

        mock_llm_client.generate.return_value = hallucinated_response
        pipeline = EvaluationPipeline(mock_llm_client, None, None)

        with pytest.raises(SafetyValidationError) as exc_info:
            await pipeline.evaluate(evaluate_request)

        assert "unapproved_skills_in_output" == exc_info.value.rule_violated