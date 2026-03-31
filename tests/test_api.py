"""Tests for app.main API endpoints."""

from __future__ import annotations

import json
from unittest.mock import AsyncMock, MagicMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.common.exceptions import LLMClientError, SafetyValidationError
from app.main import app, get_evaluation_pipeline, get_skill_generator
from app.schemas import EvaluateResponse, SkillGenerateResponse


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_skill_generator() -> AsyncMock:
    """Provide a mocked SkillGenerator."""
    generator = AsyncMock()
    generator.generate_skills.return_value = SkillGenerateResponse(
        candidate_skills=[
            {"id": "sk_01", "name": "Test Skill", "description": "A skill"}
        ]
    )
    return generator


@pytest.fixture
def mock_evaluation_pipeline() -> AsyncMock:
    """Provide a mocked EvaluationPipeline."""
    pipeline = AsyncMock()
    pipeline.evaluate.return_value = EvaluateResponse(
        results=[
            {
                "skill_id": "sk_01",
                "skill_name": "Test Skill",
                "status": "demonstrated",
                "why": "Good",
                "snippet": "code",
                "hint": None,
            }
        ]
    )
    return pipeline


@pytest.fixture
def anyio_client(
    mock_skill_generator: AsyncMock,
    mock_evaluation_pipeline: AsyncMock,
) -> AsyncClient:
    """Provide an async HTTP client with overridden dependencies."""
    app.dependency_overrides[get_skill_generator] = lambda: mock_skill_generator
    app.dependency_overrides[get_evaluation_pipeline] = lambda: mock_evaluation_pipeline

    transport = ASGITransport(app=app)
    client = AsyncClient(transport=transport, base_url="http://test")

    yield client

    app.dependency_overrides.clear()


# =============================================================================
# Health Endpoint Tests
# =============================================================================


class TestHealthEndpoint:
    """Tests for GET /health."""

    @pytest.mark.anyio
    async def test_health_returns_ok(self, anyio_client: AsyncClient) -> None:
        """Should return 200 with status ok."""
        response = await anyio_client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "ok"}


# =============================================================================
# Phase 1: Skill Generation Endpoint Tests
# =============================================================================


class TestSkillGenerationEndpoint:
    """Tests for POST /skills/generate."""

    @pytest.mark.anyio
    async def test_success_returns_200(self, anyio_client: AsyncClient) -> None:
        """Should return 200 and valid skills on successful generation."""
        payload = {
            "question_description": "Reverse array",
            "starter_code": "int arr[5];",
            "language": "c",
        }
        response = await anyio_client.post("/skills/generate", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert "candidate_skills" in data
        assert len(data["candidate_skills"]) == 1
        assert data["candidate_skills"][0]["id"] == "sk_01"

    @pytest.mark.anyio
    async def test_success_with_approved_skills_exclusion(
        self,
        anyio_client: AsyncClient,
        mock_skill_generator: AsyncMock,
    ) -> None:
        """Should pass already_approved_skills to the generator for exclusion."""
        payload = {
            "question_description": "Shift array",
            "starter_code": "int arr[5];",
            "language": "c",
            "already_approved_skills": [
                {"id": "sk_01", "name": "Read integers", "description": "Use scanf"}
            ],
        }
        response = await anyio_client.post("/skills/generate", json=payload)

        assert response.status_code == 200

        # Verify the generator was called and inspect the kwargs safely
        mock_skill_generator.generate_skills.assert_called_once()
        call_kwargs = mock_skill_generator.generate_skills.call_args.kwargs

        assert call_kwargs["question_description"] == "Shift array"
        assert call_kwargs["starter_code"] == "int arr[5];"
        assert call_kwargs["language"] == "c"
        
        # Verify the exclusion list was passed and converted by FastAPI/Pydantic
        approved_passed = call_kwargs["already_approved_skills"]
        assert len(approved_passed) == 1
        assert approved_passed[0].id == "sk_01"
        assert approved_passed[0].name == "Read integers"

    @pytest.mark.anyio
    async def test_validation_error_missing_field(self, anyio_client: AsyncClient) -> None:
        """Should return 422 if required fields are missing."""
        payload = {
            "question_description": "Reverse array"
            # missing starter_code and language
        }
        response = await anyio_client.post("/skills/generate", json=payload)

        assert response.status_code == 422
        assert "detail" in response.json()

    @pytest.mark.anyio
    async def test_validation_error_empty_string(self, anyio_client: AsyncClient) -> None:
        """Should return 422 if question_description is empty."""
        payload = {
            "question_description": "",
            "starter_code": "int main(){}",
            "language": "c",
        }
        response = await anyio_client.post("/skills/generate", json=payload)

        assert response.status_code == 422


# =============================================================================
# Phase 2: Evaluation Endpoint Tests
# =============================================================================


class TestEvaluationEndpoint:
    """Tests for POST /evaluate."""

    @pytest.mark.anyio
    async def test_success_returns_200(self, anyio_client: AsyncClient) -> None:
        """Should return 200 and per-skill results on successful evaluation."""
        payload = {
            "question_description": "Shift array",
            "starter_code": "int arr[5];",
            "test_cases": "Passed 2/5",
            "student_code": "int main() { int arr[5]; }",
            "approved_skills": [
                {"id": "sk_01", "name": "Loop init", "description": "Start at 0"}
            ],
            "language": "c",
        }
        response = await anyio_client.post("/evaluate", json=payload)

        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert data["results"][0]["status"] == "demonstrated"

    @pytest.mark.anyio
    async def test_validation_error_empty_approved_skills(self, anyio_client: AsyncClient) -> None:
        """Should return 422 if approved_skills is empty."""
        payload = {
            "question_description": "Shift array",
            "starter_code": "int arr[5];",
            "test_cases": "Passed",
            "student_code": "int main() {}",
            "approved_skills": [],
        }
        response = await anyio_client.post("/evaluate", json=payload)

        assert response.status_code == 422

    @pytest.mark.anyio
    async def test_safety_violation_returns_500(
        self,
        anyio_client: AsyncClient,
        mock_evaluation_pipeline: AsyncMock,
    ) -> None:
        """Should return 500 if the pipeline raises a SafetyValidationError."""
        mock_evaluation_pipeline.evaluate.side_effect = SafetyValidationError(
            "Code leaked", rule_violated="code_block_in_hint"
        )

        payload = {
            "question_description": "Shift array",
            "starter_code": "int arr[5];",
            "test_cases": "Passed",
            "student_code": "int main() {}",
            "approved_skills": [
                {"id": "sk_01", "name": "Test", "description": "Desc"}
            ],
        }
        response = await anyio_client.post("/evaluate", json=payload)

        assert response.status_code == 500
        assert "safety rules" in response.json()["detail"]

    @pytest.mark.anyio
    async def test_llm_error_returns_502(
        self,
        anyio_client: AsyncClient,
        mock_skill_generator: AsyncMock,
    ) -> None:
        """Should return 502 if the LLM client fails during skill generation."""
        mock_skill_generator.generate_skills.side_effect = LLMClientError(
            "Timeout", provider="groq"
        )

        payload = {
            "question_description": "Shift array",
            "starter_code": "int arr[5];",
            "language": "c",
        }
        response = await anyio_client.post("/skills/generate", json=payload)

        assert response.status_code == 502
        assert "groq" in response.json()["detail"]