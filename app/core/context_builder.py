"""Context assembly and sanitization for LLM prompts."""

from __future__ import annotations

import logging
import re
from typing import Any

logger = logging.getLogger(__name__)

SAFE_TEST_SUMMARY_FALLBACK = "Test cases executed (details hidden for academic integrity)."
PASS_FAIL_PATTERN = re.compile(r"(passed|failed)\s*\d*", re.IGNORECASE)


def summarize_test_cases(raw_test_cases: str) -> str:
    """Sanitize raw test cases to prevent leaking hidden inputs/outputs.

    If the input looks like a simple summary (e.g., 'Passed 4/5'), it is returned.
    If the input looks like raw multi-line I/O pairs, it is redacted to a safe fallback.

    Args:
        raw_test_cases: The raw test case string from the Node.js backend.

    Returns:
        A safe string suitable for inclusion in the LLM prompt.
    """
    if not raw_test_cases or not raw_test_cases.strip():
        return SAFE_TEST_SUMMARY_FALLBACK

    lines = raw_test_cases.splitlines()
    
    # Allow short summaries that explicitly mention pass/fail counts
    is_short_summary = len(lines) <= 2 and PASS_FAIL_PATTERN.search(raw_test_cases)
    
    if is_short_summary:
        return raw_test_cases.strip()

    # Multi-line input is assumed to be raw I/O data. Redact it.
    logger.warning(
        "Detected multi-line test case data. Redacting to prevent leakage.",
        extra={"line_count": len(lines)},
    )
    return SAFE_TEST_SUMMARY_FALLBACK


def format_skills_list(skills: list[dict[str, Any]]) -> str:
    """Format the approved skills into a readable string for the prompt.

    Args:
        skills: List of skill dictionaries containing 'id', 'name', 'description'.

    Returns:
        A newline-separated string of skills.
    """
    if not skills:
        return "No skills provided."
    
    formatted_lines = [
        f"- {skill.get('id', 'unknown')}: {skill.get('name', 'Unnamed skill')} "
        f"({skill.get('description', 'No description')})"
        for skill in skills
    ]
    return "\n".join(formatted_lines)


def build_evaluation_context(
    question_description: str,
    starter_code: str,
    student_code: str,
    raw_test_cases: str,
    approved_skills: list[dict[str, Any]],
    language: str,
    rag_context: str = "",
) -> dict[str, str]:
    """Assemble and sanitize all inputs into a safe context dictionary.

    This function acts as the gateway between raw external data and the LLM prompt,
    ensuring that sensitive information (like hidden test cases) is stripped out.

    Args:
        question_description: The assignment prompt text.
        starter_code: The teacher's starter code.
        student_code: The student's submitted code.
        raw_test_cases: Raw test case string (may contain I/O pairs).
        approved_skills: List of approved skill objects.
        language: The programming language.
        rag_context: Optional context retrieved from the vector database.

    Returns:
        A dictionary containing sanitized fields for prompt building.
    """
    safe_test_summary = summarize_test_cases(raw_test_cases)
    formatted_skills = format_skills_list(approved_skills)

    return {
        "question_description": question_description,
        "starter_code": starter_code,
        "student_code": student_code,
        "test_cases_summary": safe_test_summary,
        "skills_list": formatted_skills,
        "language": language,
        "rag_context": rag_context,
    }