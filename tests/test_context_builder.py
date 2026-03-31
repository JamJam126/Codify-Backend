"""Tests for app.core.context_builder module."""

from __future__ import annotations

import pytest

from app.core.context_builder import (
    SAFE_TEST_SUMMARY_FALLBACK,
    build_evaluation_context,
    format_skills_list,
    summarize_test_cases,
)


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def sample_skills() -> list[dict[str, str]]:
    """Provide a list of mock approved skills."""
    return [
        {"id": "sk_01", "name": "Loop init", "description": "Start at 0"},
        {"id": "sk_02", "name": "Array access", "description": "Use arr[i]"},
    ]


# =============================================================================
# Test Case Summarization Tests
# =============================================================================


class TestSummarizeTestCases:
    """Tests for the summarize_test_cases safety function."""

    def test_allows_simple_pass_summary(self) -> None:
        """Should allow short strings containing 'Passed'."""
        result = summarize_test_cases("Passed 4 out of 5 tests")
        assert result == "Passed 4 out of 5 tests"

    def test_allows_simple_fail_summary(self) -> None:
        """Should allow short strings containing 'Failed'."""
        result = summarize_test_cases("Failed 2/5")
        assert result == "Failed 2/5"

    def test_redacts_multiline_io_pairs(self) -> None:
        """Should redact multi-line strings assumed to be raw I/O data."""
        raw = "Input:\n1 2 3\nExpected Output:\n3 2 1\nActual Output:\n3 2 1"
        result = summarize_test_cases(raw)
        assert result == SAFE_TEST_SUMMARY_FALLBACK

    def test_redacts_single_long_line(self) -> None:
        """Should redact a single very long line without pass/fail keywords."""
        raw = "1 2 3 4 5 -> 5 4 3 2 1 | 6 7 8 -> 8 7 6"
        result = summarize_test_cases(raw)
        assert result == SAFE_TEST_SUMMARY_FALLBACK

    def test_handles_empty_string(self) -> None:
        """Should return fallback for empty string."""
        result = summarize_test_cases("")
        assert result == SAFE_TEST_SUMMARY_FALLBACK

    def test_handles_whitespace_only(self) -> None:
        """Should return fallback for whitespace-only string."""
        result = summarize_test_cases("   \n\t  ")
        assert result == SAFE_TEST_SUMMARY_FALLBACK

    def test_allows_two_line_summary(self) -> None:
        """Should allow up to 2 lines if they contain pass/fail."""
        raw = "Total tests: 5\nPassed: 5"
        result = summarize_test_cases(raw)
        assert "Passed: 5" in result


# =============================================================================
# Skills Formatting Tests
# =============================================================================


class TestFormatSkillsList:
    """Tests for the format_skills_list helper."""

    def test_formats_single_skill(self) -> None:
        """Should format a single skill correctly."""
        skills = [{"id": "sk_01", "name": "Test", "description": "Desc"}]
        result = format_skills_list(skills)
        assert "- sk_01: Test (Desc)" in result

    def test_formats_multiple_skills(self, sample_skills: list[dict[str, str]]) -> None:
        """Should format multiple skills separated by newlines."""
        result = format_skills_list(sample_skills)
        assert "- sk_01:" in result
        assert "- sk_02:" in result
        assert result.count("\n") == 1

    def test_handles_missing_keys_gracefully(self) -> None:
        """Should use fallbacks if skill dict keys are missing."""
        skills = [{"name": "Only Name"}]
        result = format_skills_list(skills)
        assert "unknown" in result
        assert "No description" in result

    def test_handles_empty_list(self) -> None:
        """Should return fallback message for empty list."""
        result = format_skills_list([])
        assert result == "No skills provided."


# =============================================================================
# Full Context Building Tests
# =============================================================================


class TestBuildEvaluationContext:
    """Tests for the main build_evaluation_context orchestrator."""

    def test_returns_all_required_keys(self, sample_skills: list[dict[str, str]]) -> None:
        """Should return a dictionary with all expected keys."""
        ctx = build_evaluation_context(
            question_description="Q",
            starter_code="S",
            student_code="C",
            raw_test_cases="Passed 5/5",
            approved_skills=sample_skills,
            language="c",
        )
        
        expected_keys = {
            "question_description",
            "starter_code",
            "student_code",
            "test_cases_summary",
            "skills_list",
            "language",
            "rag_context",
        }
        assert set(ctx.keys()) == expected_keys

    def test_sanitizes_test_cases_in_context(self, sample_skills: list[dict[str, str]]) -> None:
        """Should apply test case sanitization to the final context."""
        raw_dangerous = "Input: 1\nOutput: 2"
        ctx = build_evaluation_context(
            question_description="Q",
            starter_code="S",
            student_code="C",
            raw_test_cases=raw_dangerous,
            approved_skills=sample_skills,
            language="c",
        )
        
        assert ctx["test_cases_summary"] == SAFE_TEST_SUMMARY_FALLBACK
        # Ensure the raw dangerous string is NOT anywhere in the values
        assert "Input: 1" not in ctx.values()

    def test_includes_rag_context_if_provided(self, sample_skills: list[dict[str, str]]) -> None:
        """Should include the RAG context string when provided."""
        ctx = build_evaluation_context(
            question_description="Q",
            starter_code="S",
            student_code="C",
            raw_test_cases="",
            approved_skills=sample_skills,
            language="c",
            rag_context="Remember to use temp vars.",
        )
        
        assert ctx["rag_context"] == "Remember to use temp vars."

    def test_defaults_rag_context_to_empty(self, sample_skills: list[dict[str, str]]) -> None:
        """Should default RAG context to empty string if not provided."""
        ctx = build_evaluation_context(
            question_description="Q",
            starter_code="S",
            student_code="C",
            raw_test_cases="",
            approved_skills=sample_skills,
            language="c",
        )
        
        assert ctx["rag_context"] == ""