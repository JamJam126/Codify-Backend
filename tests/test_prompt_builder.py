"""Tests for app.core.prompt_builder module."""

from __future__ import annotations

import pytest

from app.core.prompt_builder import (
    RAG_CONTEXT_PREFIX,
    build_evaluation_messages,
    build_skill_gen_messages,
    _parse_skills_from_context,
)


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def safe_evaluation_context() -> dict[str, str]:
    """Provide a mock context dict matching context_builder output."""
    return {
        "question_description": "Reverse array",
        "starter_code": "int arr[5];",
        "student_code": "int main() { int arr[5]; arr[0]=1; }",
        "test_cases_summary": "Passed 2/5",
        "skills_list": "- sk_01: Loop init (Start at 0)\n- sk_02: Array access (Use arr[i])",
        "language": "c",
        "rag_context": "",
    }


# =============================================================================
# Phase 1: Skill Gen Tests
# =============================================================================


class TestBuildSkillGenMessages:
    """Tests for the Phase 1 prompt builder."""

    def test_returns_tuple_of_strings(self) -> None:
        """Should return a 2-tuple of strings."""
        result = build_skill_gen_messages("Q", "Code", "c")
        assert isinstance(result, tuple)
        assert len(result) == 2
        assert all(isinstance(s, str) for s in result)

    def test_system_prompt_contains_role(self) -> None:
        """System prompt must contain the evaluator role definition."""
        system_prompt, _ = build_skill_gen_messages("Q", "Code", "c")
        assert "Codify Evaluator" in system_prompt

    def test_user_prompt_contains_inputs(self) -> None:
        """User prompt must contain the question and starter code."""
        _, user_prompt = build_skill_gen_messages("Reverse string", "int main() {}", "c")
        assert "Reverse string" in user_prompt
        assert "int main() {}" in user_prompt

    def test_appends_rag_context_if_provided(self) -> None:
        """Should append RAG context to the user prompt if non-empty."""
        _, user_prompt = build_skill_gen_messages(
            "Q", "C", "c", rag_context="Use temp vars."
        )
        assert "## Reference Knowledge" in user_prompt
        assert "Use temp vars." in user_prompt

    def test_ignores_empty_rag_context(self) -> None:
        """Should not append RAG prefix if context is empty."""
        _, user_prompt = build_skill_gen_messages("Q", "C", "c", rag_context="")
        assert "## Reference Knowledge" not in user_prompt


# =============================================================================
# Phase 2: Evaluation Tests
# =============================================================================


class TestBuildEvaluationMessages:
    """Tests for the Phase 2 prompt builder."""

    def test_returns_tuple_of_strings(self, safe_evaluation_context: dict[str, str]) -> None:
        """Should return a 2-tuple of strings."""
        result = build_evaluation_messages(safe_evaluation_context)
        assert isinstance(result, tuple)
        assert len(result) == 2

    def test_user_prompt_contains_student_code(self, safe_evaluation_context: dict[str, str]) -> None:
        """User prompt must contain the student's submission."""
        _, user_prompt = build_evaluation_messages(safe_evaluation_context)
        assert "int main() { int arr[5]; arr[0]=1; }" in user_prompt

    def test_user_prompt_contains_sanitized_tests(self, safe_evaluation_context: dict[str, str]) -> None:
        """User prompt must use the safe test summary, not raw I/O."""
        _, user_prompt = build_evaluation_messages(safe_evaluation_context)
        assert "Passed 2/5" in user_prompt

    def test_user_prompt_contains_parsed_skills(self, safe_evaluation_context: dict[str, str]) -> None:
        """User prompt must contain the skill IDs after parsing."""
        _, user_prompt = build_evaluation_messages(safe_evaluation_context)
        assert "sk_01" in user_prompt
        assert "sk_02" in user_prompt

    def test_appends_rag_context_if_provided(self, safe_evaluation_context: dict[str, str]) -> None:
        """Should append RAG context to the evaluation user prompt."""
        safe_evaluation_context["rag_context"] = "Common mistake: off-by-one."
        _, user_prompt = build_evaluation_messages(safe_evaluation_context)
        assert "Common mistake: off-by-one." in user_prompt


# =============================================================================
# Internal Parser Tests
# =============================================================================


class TestParseSkillsFromContext:
    """Tests for the _parse_skills_from_context helper."""

    def test_parses_valid_formatted_string(self) -> None:
        """Should extract id, name, and description correctly."""
        formatted = "- sk_01: Loop init (Start at 0)\n- sk_02: Array access (Use arr[i])"
        result = _parse_skills_from_context(formatted)
        
        assert len(result) == 2
        assert result[0] == {"id": "sk_01", "name": "Loop init", "description": "Start at 0"}
        assert result[1] == {"id": "sk_02", "name": "Array access", "description": "Use arr[i]"}

    def test_returns_empty_for_no_skills_string(self) -> None:
        """Should return empty list for the fallback message."""
        result = _parse_skills_from_context("No skills provided.")
        assert result == []

    def test_returns_empty_for_empty_string(self) -> None:
        """Should return empty list for empty string."""
        result = _parse_skills_from_context("")
        assert result == []