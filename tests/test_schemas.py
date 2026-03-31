"""Tests for app.schemas module."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.schemas import (
    ApprovedSkill,
    CandidateSkill,
    EvaluateRequest,
    EvaluateResponse,
    HealthResponse,
    SkillEvaluationResult,
    SkillGenerateRequest,
    SkillGenerateResponse,
)


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def valid_skill_data() -> dict[str, str]:
    """Provide a valid dictionary for a skill object."""
    return {
        "id": "sk_01",
        "name": "Access array elements using index",
        "description": "Use arr[i] to read or write values",
    }


@pytest.fixture
def valid_approved_skill() -> ApprovedSkill:
    """Provide a valid ApprovedSkill instance."""
    return ApprovedSkill(
        id="sk_01",
        name="Read integers",
        description="Use scanf",
    )


# =============================================================================
# Phase 1 Schemas Tests
# =============================================================================


class TestSkillGenerateRequest:
    """Tests for SkillGenerateRequest schema."""

    def test_valid_request(self) -> None:
        """Should instantiate with all required fields."""
        req = SkillGenerateRequest(
            question_description="Write a loop",
            starter_code="int main() {}",
            language="c",
        )
        assert req.language == "c"

    def test_missing_description_raises(self) -> None:
        """Should raise ValidationError if question_description is missing."""
        with pytest.raises(ValidationError) as exc_info:
            SkillGenerateRequest(
                starter_code="int main() {}",
                language="c",
            )
        assert "question_description" in str(exc_info.value)

    def test_empty_description_raises(self) -> None:
        """Should raise ValidationError if question_description is empty."""
        with pytest.raises(ValidationError):
            SkillGenerateRequest(
                question_description="",
                starter_code="int main() {}",
                language="c",
            )

    def test_empty_language_raises(self) -> None:
        """Should raise ValidationError if language is empty string."""
        with pytest.raises(ValidationError):
            SkillGenerateRequest(
                question_description="Write a loop",
                starter_code="int main() {}",
                language="",
            )

    def test_defaults_approved_skills_to_none(self) -> None:
        """Should default already_approved_skills to None if not provided."""
        req = SkillGenerateRequest(
            question_description="Q",
            starter_code="C",
            language="c",
        )
        assert req.already_approved_skills is None

    def test_accepts_approved_skills_list(self, valid_approved_skill: ApprovedSkill) -> None:
        """Should accept a list of ApprovedSkill objects."""
        req = SkillGenerateRequest(
            question_description="Q",
            starter_code="C",
            language="c",
            already_approved_skills=[valid_approved_skill],
        )
        assert req.already_approved_skills is not None
        assert len(req.already_approved_skills) == 1
        assert req.already_approved_skills[0].id == "sk_01"

    def test_accepts_empty_list_for_approved_skills(self) -> None:
        """Should accept an empty list without raising."""
        req = SkillGenerateRequest(
            question_description="Q",
            starter_code="C",
            language="c",
            already_approved_skills=[],
        )
        assert req.already_approved_skills == []


class TestCandidateSkill:
    """Tests for CandidateSkill schema."""

    def test_valid_skill(self, valid_skill_data: dict[str, str]) -> None:
        """Should instantiate with valid data."""
        skill = CandidateSkill(**valid_skill_data)
        assert skill.id == "sk_01"
        assert skill.name == "Access array elements using index"

    def test_invalid_id_pattern_raises(self, valid_skill_data: dict[str, str]) -> None:
        """Should raise ValidationError if id does not match sk_\\d+ pattern."""
        invalid_data = valid_skill_data.copy()
        invalid_data["id"] = "skill_1"
        with pytest.raises(ValidationError):
            CandidateSkill(**invalid_data)

    def test_empty_name_raises(self, valid_skill_data: dict[str, str]) -> None:
        """Should raise ValidationError if name is empty."""
        invalid_data = valid_skill_data.copy()
        invalid_data["name"] = ""
        with pytest.raises(ValidationError):
            CandidateSkill(**invalid_data)


class TestSkillGenerateResponse:
    """Tests for SkillGenerateResponse schema."""

    def test_valid_response(self, valid_skill_data: dict[str, str]) -> None:
        """Should instantiate with a list of candidate skills."""
        skills = [CandidateSkill(**valid_skill_data)]
        resp = SkillGenerateResponse(candidate_skills=skills)
        assert len(resp.candidate_skills) == 1
        assert resp.candidate_skills[0].id == "sk_01"

    def test_empty_list_is_valid(self) -> None:
        """Should allow an empty list of candidate skills."""
        resp = SkillGenerateResponse(candidate_skills=[])
        assert resp.candidate_skills == []


# =============================================================================
# Phase 2 Schemas Tests
# =============================================================================


class TestApprovedSkill:
    """Tests for ApprovedSkill schema."""

    def test_valid_approved_skill(self, valid_skill_data: dict[str, str]) -> None:
        """Should instantiate identically to CandidateSkill."""
        skill = ApprovedSkill(**valid_skill_data)
        assert skill.id == "sk_01"


class TestEvaluateRequest:
    """Tests for EvaluateRequest schema."""

    def test_valid_request(self, valid_skill_data: dict[str, str]) -> None:
        """Should instantiate with all required fields."""
        req = EvaluateRequest(
            question_description="Shift array",
            starter_code="int arr[5];",
            test_cases="1 2 3 -> 2 3 0",
            student_code="int main() { int arr[5]; }",
            approved_skills=[ApprovedSkill(**valid_skill_data)],
        )
        assert req.language == "c"

    def test_default_language_is_c(self, valid_skill_data: dict[str, str]) -> None:
        """Should default language to 'c' if not provided."""
        req = EvaluateRequest(
            question_description="Shift array",
            starter_code="int arr[5];",
            test_cases="...",
            student_code="int main() {}",
            approved_skills=[ApprovedSkill(**valid_skill_data)],
        )
        assert req.language == "c"

    def test_missing_student_code_raises(self, valid_skill_data: dict[str, str]) -> None:
        """Should raise ValidationError if student_code is missing."""
        with pytest.raises(ValidationError):
            EvaluateRequest(
                question_description="Shift array",
                starter_code="int arr[5];",
                test_cases="...",
                approved_skills=[ApprovedSkill(**valid_skill_data)],
            )

    def test_empty_approved_skills_raises(self) -> None:
        """Should raise ValidationError if approved_skills is empty."""
        with pytest.raises(ValidationError):
            EvaluateRequest(
                question_description="Shift array",
                starter_code="int arr[5];",
                test_cases="...",
                student_code="int main() {}",
                approved_skills=[],
            )


class TestSkillEvaluationResult:
    """Tests for SkillEvaluationResult schema."""

    def test_demonstrated_status(self) -> None:
        """Should instantiate correctly for a demonstrated skill."""
        result = SkillEvaluationResult(
            skill_id="sk_01",
            skill_name="Array access",
            status="demonstrated",
            why="You correctly used arr[i].",
            snippet="arr[i] = arr[i+1];",
            hint=None,
        )
        assert result.status == "demonstrated"
        assert result.hint is None

    def test_not_demonstrated_status_with_hint(self) -> None:
        """Should instantiate correctly for a failed skill with a hint."""
        result = SkillEvaluationResult(
            skill_id="sk_02",
            skill_name="Data preservation",
            status="not_demonstrated",
            why="Data is lost during the shift.",
            snippet="arr[0] = arr[1];",
            hint="Think about what value disappears.",
        )
        assert result.status == "not_demonstrated"
        assert result.hint is not None

    def test_uncertain_status(self) -> None:
        """Should accept 'uncertain' as a valid status."""
        result = SkillEvaluationResult(
            skill_id="sk_03",
            skill_name="Edge handling",
            status="uncertain",
            why="The loop bounds are unusual.",
            snippet=None,
            hint="Consider what happens if the array is empty.",
        )
        assert result.status == "uncertain"

    def test_invalid_status_raises(self) -> None:
        """Should raise ValidationError for invalid status strings."""
        with pytest.raises(ValidationError):
            SkillEvaluationResult(
                skill_id="sk_01",
                skill_name="Test",
                status="invalid_status",
                why="reason",
            )

    def test_missing_why_raises(self) -> None:
        """Should raise ValidationError if why is missing."""
        with pytest.raises(ValidationError):
            SkillEvaluationResult(
                skill_id="sk_01",
                skill_name="Test",
                status="demonstrated",
            )


class TestEvaluateResponse:
    """Tests for EvaluateResponse schema."""

    def test_valid_response(self) -> None:
        """Should instantiate with a list of results."""
        results = [
            SkillEvaluationResult(
                skill_id="sk_01",
                skill_name="Test",
                status="demonstrated",
                why="Good job.",
            )
        ]
        resp = EvaluateResponse(results=results)
        assert len(resp.results) == 1


# =============================================================================
# Health Schema Tests
# =============================================================================


class TestHealthResponse:
    """Tests for HealthResponse schema."""

    def test_default_status_is_ok(self) -> None:
        """Should default status to 'ok' if no value provided."""
        resp = HealthResponse()
        assert resp.status == "ok"

    def test_explicit_status(self) -> None:
        """Should allow explicit status override if needed."""
        resp = HealthResponse(status="degraded")
        assert resp.status == "degraded"