"""Tests for app.core.safety_validator module."""

from __future__ import annotations

import json

import pytest

from app.common.exceptions import SafetyValidationError
from app.core.safety_validator import validate_evaluation_output


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def valid_llm_output() -> str:
    """Provide a valid JSON string matching the expected schema."""
    data = {
        "results": [
            {
                "skill_id": "sk_01",
                "skill_name": "Loop init",
                "status": "demonstrated",
                "why": "Correctly initialized loop.",
                "snippet": "for(int i=0; ...)",
                "hint": None,
            },
            {
                "skill_id": "sk_02",
                "skill_name": "Data preservation",
                "status": "not_demonstrated",
                "why": "Data lost on first iteration.",
                "snippet": "arr[0] = arr[1];",
                "hint": "Think about what value disappears first.",
            },
        ]
    }
    return json.dumps(data)


@pytest.fixture
def approved_ids() -> list[str]:
    """Provide the list of approved skill IDs."""
    return ["sk_01", "sk_02"]


# =============================================================================
# Core Validation Tests
# =============================================================================


class TestValidateEvaluationOutput:
    """Tests for the main validate_evaluation_output function."""

    def test_valid_output_returns_parsed_list(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should return a list of dicts when output is fully valid."""
        result = validate_evaluation_output(valid_llm_output, approved_ids)
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["skill_id"] == "sk_01"

    def test_raises_on_invalid_json(self, approved_ids: list[str]) -> None:
        """Should raise SafetyValidationError if JSON is malformed."""
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output("{ invalid json }", approved_ids)
        
        assert exc_info.value.rule_violated == "invalid_json"

    def test_raises_if_missing_results_key(self, approved_ids: list[str]) -> None:
        """Should raise if the top-level 'results' key is missing."""
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output('{"data": []}', approved_ids)
        
        assert exc_info.value.rule_violated == "missing_results_key"


# =============================================================================
# Skill ID Validation Tests
# =============================================================================


class TestSkillIdValidation:
    """Tests for Rule 5: Only approved skills in output."""

    def test_raises_on_extra_skill_id(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if LLM hallucinates an extra skill ID."""
        modified_output = valid_llm_output.replace("sk_02", "sk_99")
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(modified_output, approved_ids)
        
        assert "Unauthorized skills" in str(exc_info.value)
        assert exc_info.value.rule_violated == "unapproved_skills_in_output"

    def test_raises_on_missing_skill_id(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if LLM drops one of the required skill IDs."""
        # Create output with only sk_01, but approved has sk_01 and sk_02
        incomplete_data = {
            "results": [
                {
                    "skill_id": "sk_01",
                    "skill_name": "Loop init",
                    "status": "demonstrated",
                    "why": "Good",
                    "snippet": "code",
                    "hint": None,
                }
            ]
        }
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(json.dumps(incomplete_data), approved_ids)
        
        assert "Missing skills" in str(exc_info.value)


# =============================================================================
# Structure and Status Validation Tests
# =============================================================================


class TestStructureAndStatusValidation:
    """Tests for result structure and valid status values."""

    def test_raises_on_missing_required_key(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if a required key like 'why' is missing."""
        bad_data = json.loads(valid_llm_output)
        del bad_data["results"][0]["why"]
        
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(json.dumps(bad_data), approved_ids)
        
        assert exc_info.value.rule_violated == "malformed_result_structure"

    def test_raises_on_invalid_status_string(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if status is not one of the 3 allowed values."""
        bad_data = json.loads(valid_llm_output)
        bad_data["results"][0]["status"] = "almost_correct"
        
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(json.dumps(bad_data), approved_ids)
        
        assert exc_info.value.rule_violated == "invalid_status_value"


# =============================================================================
# Hint Validation Tests
# =============================================================================


class TestHintValidation:
    """Tests for Rule 4 (No code blocks) and Rule 3 (Hints null if passed)."""

    def test_raises_if_hint_not_null_when_demonstrated(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if hint is provided for a 'demonstrated' skill."""
        bad_data = json.loads(valid_llm_output)
        bad_data["results"][0]["hint"] = "You did great!"
        
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(json.dumps(bad_data), approved_ids)
        
        assert exc_info.value.rule_violated == "hint_provided_for_demonstrated_skill"

    def test_raises_on_code_block_in_hint(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should raise if the hint contains a markdown code block (Rule 4)."""
        bad_data = json.loads(valid_llm_output)
        bad_data["results"][1]["hint"] = "Use a temp variable like this:\n```c\nint temp = arr[0];\n```"
        
        with pytest.raises(SafetyValidationError) as exc_info:
            validate_evaluation_output(json.dumps(bad_data), approved_ids)
        
        assert exc_info.value.rule_violated == "code_block_in_hint"

    def test_allows_conceptual_hint_text(
        self,
        valid_llm_output: str,
        approved_ids: list[str],
    ) -> None:
        """Should allow conceptual hints without code blocks."""
        bad_data = json.loads(valid_llm_output)
        bad_data["results"][1]["hint"] = "Consider what happens to the first element when you shift left."
        
        # Should not raise
        result = validate_evaluation_output(json.dumps(bad_data), approved_ids)
        assert result[1]["hint"] == "Consider what happens to the first element when you shift left."