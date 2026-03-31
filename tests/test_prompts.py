"""Tests for app.prompts modules."""

from __future__ import annotations

import pytest

from app.prompts.evaluate import build_evaluate_prompt
from app.prompts.skill_gen import build_skill_gen_prompt
from app.prompts.system_role import build_system_prompt


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def sample_skills() -> list[dict[str, str]]:
    """Provide a list of mock approved skills."""
    return [
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


@pytest.fixture
def sample_approved_for_regen() -> list[dict[str, str]]:
    """Provide a list of approved skills specifically for regeneration."""
    return [
        {
            "id": "sk_01",
            "name": "Read integers",
            "description": "Use scanf in a loop",
        }
    ]


# =============================================================================
# System Role Tests
# =============================================================================


class TestSystemRolePrompt:
    """Tests for the system role prompt."""

    def test_returns_string(self) -> None:
        """build_system_prompt should return a non-empty string."""
        prompt = build_system_prompt()
        assert isinstance(prompt, str)
        assert len(prompt) > 0

    def test_contains_safety_rules(self) -> None:
        """Prompt must explicitly forbid revealing test cases."""
        prompt = build_system_prompt()
        assert "NEVER reveal" in prompt
        assert "NEVER provide a full corrected solution" in prompt


# =============================================================================
# Skill Gen Tests
# =============================================================================


class TestSkillGenPrompt:
    """Tests for the skill generation prompt."""

    def test_formats_variables_correctly(self) -> None:
        """Should inject question, starter code, and language into the prompt."""
        prompt = build_skill_gen_prompt(
            question_description="Reverse a string",
            starter_code="int main() {}",
            language="c",
        )
        assert "Reverse a string" in prompt
        assert "int main() {}" in prompt
        assert "- Language: c" in prompt

    def test_requires_json_array_output(self) -> None:
        """Prompt must instruct the LLM to return JSON."""
        prompt = build_skill_gen_prompt("Q", "Code", "python")
        assert '"candidate_skills"' in prompt
        assert "JSON" in prompt

    def test_enforces_atomic_skills(self) -> None:
        """Prompt must mention the 'Atomic' rule."""
        prompt = build_skill_gen_prompt("Q", "Code", "c")
        assert "Atomic" in prompt

    def test_omits_exclusion_block_by_default(self) -> None:
        """Should NOT include the exclusion list if already_approved_skills is None."""
        prompt = build_skill_gen_prompt("Q", "Code", "c")
        assert "## Exclusion List" not in prompt

    def test_omits_exclusion_block_if_empty_list(self) -> None:
        """Should NOT include the exclusion list if already_approved_skills is empty."""
        prompt = build_skill_gen_prompt("Q", "Code", "c", already_approved_skills=[])
        assert "## Exclusion List" not in prompt

    def test_includes_exclusion_block_when_provided(
        self,
        sample_approved_for_regen: list[dict[str, str]],
    ) -> None:
        """Should include the exclusion list and specific skill names when provided."""
        prompt = build_skill_gen_prompt(
            "Shift array",
            "int arr[5];",
            "c",
            already_approved_skills=sample_approved_for_regen,
        )
        assert "## Exclusion List" in prompt
        assert "sk_01: Read integers" in prompt
        assert "Do NOT generate skills that overlap" in prompt
        assert "Generate only NEW skills" in prompt


# =============================================================================
# Evaluate Tests
# =============================================================================


class TestEvaluatePrompt:
    """Tests for the evaluation prompt."""

    def test_formats_all_variables(self, sample_skills: list[dict[str, str]]) -> None:
        """Should inject all context variables into the prompt."""
        prompt = build_evaluate_prompt(
            question_description="Shift array",
            starter_code="int arr[5];",
            student_code="int main() { int arr[5]; }",
            test_cases_summary="Passed 2/5",
            approved_skills=sample_skills,
            language="c",
        )
        assert "Shift array" in prompt
        assert "int arr[5];" in prompt
        assert "int main() { int arr[5]; }" in prompt
        assert "Passed 2/5" in prompt
        assert "sk_01: Loop initialization" in prompt

    def test_contains_status_literals(self, sample_skills: list[dict[str, str]]) -> None:
        """Should explicitly show the exact allowed status strings."""
        prompt = build_evaluate_prompt("Q", "C", "S", "T", sample_skills, "c")
        assert '"demonstrated"' in prompt
        assert '"not_demonstrated"' in prompt
        assert '"uncertain"' in prompt

    def test_enforces_no_code_hint_rule(self, sample_skills: list[dict[str, str]]) -> None:
        """Prompt must strictly forbid writing corrected code in hints."""
        prompt = build_evaluate_prompt("Q", "C", "S", "T", sample_skills, "c")
        assert "Do not write corrected code" in prompt
        assert "conceptual hint" in prompt

    def test_enforces_no_test_case_leakage(self, sample_skills: list[dict[str, str]]) -> None:
        """Prompt must forbid repeating test case inputs/outputs."""
        prompt = build_evaluate_prompt("Q", "C", "S", "T", sample_skills, "c")
        assert "Do NOT reveal, repeat, or reference any specific test case" in prompt

    def test_hint_null_when_demonstrated(self, sample_skills: list[dict[str, str]]) -> None:
        """Prompt must state that hint is null if demonstrated."""
        prompt = build_evaluate_prompt("Q", "C", "S", "T", sample_skills, "c")
        assert 'null if the status is "demonstrated"' in prompt