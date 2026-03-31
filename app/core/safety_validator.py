"""Safety validation for LLM-generated evaluation outputs."""

from __future__ import annotations

import json
import re
from typing import Any

from app.common.exceptions import SafetyValidationError

CODE_BLOCK_PATTERN = re.compile(r"```[\s\S]*?```", re.MULTILINE)

VALID_STATUSES = {"demonstrated", "not_demonstrated", "uncertain"}


def validate_evaluation_output(
    raw_output: str,
    approved_skill_ids: list[str],
) -> list[dict[str, Any]]:
    """Validate the LLM JSON output against all safety rules.

    Args:
        raw_output: The raw JSON string returned by the LLM.
        approved_skill_ids: List of skill IDs that the teacher approved.

    Returns:
        The parsed list of result dictionaries if validation passes.

    Raises:
        SafetyValidationError: If any safety rule is violated.
    """
    parsed_data = _parse_json(raw_output)
    
    if "results" not in parsed_data or not isinstance(parsed_data["results"], list):
        raise SafetyValidationError(
            "LLM output missing 'results' array.",
            rule_violated="missing_results_key",
        )

    results = parsed_data["results"]
    _validate_skill_ids_match(results, approved_skill_ids)

    for result in results:
        _validate_result_structure(result)
        _validate_status(result.get("status"))
        _validate_hint_is_null_if_demonstrated(result.get("status"), result.get("hint"))
        
        hint = result.get("hint")
        if hint:
            _validate_no_code_blocks(hint, "hint")

    return results


def _parse_json(raw_output: str) -> dict[str, Any]:
    """Safely parse the raw LLM output string to a dictionary.

    Args:
        raw_output: The JSON string from the LLM.

    Returns:
        The parsed Python dictionary.

    Raises:
        SafetyValidationError: If the string is not valid JSON.
    """
    try:
        return json.loads(raw_output)
    except json.JSONDecodeError as error:
        raise SafetyValidationError(
            f"LLM returned invalid JSON: {error}",
            rule_violated="invalid_json",
        ) from error


def _validate_skill_ids_match(
    results: list[dict[str, Any]],
    approved_skill_ids: list[str],
) -> None:
    """Ensure the LLM only returned results for approved skill IDs.

    Args:
        results: The list of result dictionaries from the LLM.
        approved_skill_ids: The list of IDs the teacher approved.

    Raises:
        SafetyValidationError: If an unexpected skill ID is found or if IDs are missing.
    """
    returned_ids = {r.get("skill_id") for r in results if "skill_id" in r}
    expected_ids = set(approved_skill_ids)

    if returned_ids != expected_ids:
        missing = expected_ids - returned_ids
        extra = returned_ids - expected_ids
        
        msg_parts = []
        if missing:
            msg_parts.append(f"Missing skills: {missing}")
        if extra:
            msg_parts.append(f"Unauthorized skills: {extra}")
            
        raise SafetyValidationError(
            "Skill ID mismatch. " + " ".join(msg_parts),
            rule_violated="unapproved_skills_in_output",
        )


def _validate_result_structure(result: dict[str, Any]) -> None:
    """Ensure a single result dictionary has all required keys.

    Args:
        result: A single skill evaluation dictionary.

    Raises:
        SafetyValidationError: If required keys are missing.
    """
    required_keys = {"skill_id", "skill_name", "status", "why"}
    missing_keys = required_keys - result.keys()
    
    if missing_keys:
        raise SafetyValidationError(
            f"Result missing required keys: {missing_keys}",
            rule_violated="malformed_result_structure",
        )


def _validate_status(status: Any) -> None:
    """Ensure the status field is a valid allowed value.

    Args:
        status: The status value from the result.

    Raises:
        SafetyValidationError: If the status is not in the allowed set.
    """
    if status not in VALID_STATUSES:
        raise SafetyValidationError(
            f"Invalid status '{status}'. Must be one of {VALID_STATUSES}",
            rule_violated="invalid_status_value",
        )


def _validate_hint_is_null_if_demonstrated(status: str | None, hint: Any) -> None:
    """Ensure the hint is null when the skill is demonstrated.

    Args:
        status: The evaluation status.
        hint: The hint value provided by the LLM.

    Raises:
        SafetyValidationError: If hint is provided for a demonstrated skill.
    """
    if status == "demonstrated" and hint is not None:
        raise SafetyValidationError(
            "Hint must be null when status is 'demonstrated'.",
            rule_violated="hint_provided_for_demonstrated_skill",
        )


def _validate_no_code_blocks(text: str, field_name: str) -> None:
    """Ensure the text does not contain markdown code blocks.

    Args:
        text: The text to inspect.
        field_name: The name of the field being checked (for error context).

    Raises:
        SafetyValidationError: If a code block is detected.
    """
    if CODE_BLOCK_PATTERN.search(text):
        raise SafetyValidationError(
            f"Runnable code block detected in '{field_name}'. "
            "Hints must be conceptual only.",
            rule_violated="code_block_in_hint",
        )