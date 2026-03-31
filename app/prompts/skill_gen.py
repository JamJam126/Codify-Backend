"""Prompt template for Phase 1: Micro-Skill Generation."""

from __future__ import annotations

from typing import Any

SKILL_GEN_PROMPT = """You are generating candidate micro-skills for a programming assignment. The teacher will review and approve or reject these skills.

## Assignment Details
- Language: {language}
- Question: 
{question_description}

- Starter Code:
```{language}
{starter_code}
{exclusion_block}

Micro-Skill Quality Rules
A valid micro-skill MUST be:

Atomic: One single concept, not two combined.
Observable: Can be visibly identified in the student's code.
Language-aware: Specific to the programming language ({language}).
Generalizable: Not tied to exact variable names used in the starter code.
Educational: Suitable for providing feedback, not just a grading criterion.

Output Format
Return a JSON object containing a single key "candidate_skills" with an array of skill objects.
Each skill object must have exactly three keys: "id", "name", and "description".
The "id" must follow the format "sk_XX" where XX is a zero-padded number (e.g., "sk_01", "sk_02").
Generate 3 to 5 high-quality micro-skills for this assignment.

Example Output
{{
  "candidate_skills": [
    {{
      "id": "sk_01",
      "name": "Access array elements using index",
      "description": "Use bracket notation like arr[i] to read or write values at specific positions."
    }}
  ]
}}
```"""


def _build_exclusion_block(already_approved_skills: list[dict[str, str]] | None) -> str:
    """Build the exclusion block for the prompt if approved skills exist.

    Args:
        already_approved_skills: List of skills the teacher already approved.

    Returns:
        A formatted string instructing the LLM to avoid these skills, or an empty string.
    """
    if not already_approved_skills:
        return ""

    skills_text = "\n".join(
        f"- {skill['id']}: {skill['name']} ({skill['description']})"
        for skill in already_approved_skills
    )

    return (
        "\n## Exclusion List\n"
        "The teacher has ALREADY approved the following skills. "
        "Do NOT generate skills that overlap or duplicate these concepts:\n"
        f"{skills_text}\n"
        "Generate only NEW skills that cover the remaining aspects of the assignment.\n"
    )


def build_skill_gen_prompt(
    question_description: str,
    starter_code: str,
    language: str,
    already_approved_skills: list[dict[str, str]] | None = None,
) -> str:
    """Build the Phase 1 prompt for generating micro-skills.

    Args:
        question_description: The assignment prompt text.
        starter_code: The teacher's starter code.
        language: The programming language.
        already_approved_skills: Optional list of approved skills to exclude.

    Returns:
        The formatted prompt string.
    """
    exclusion_block = _build_exclusion_block(already_approved_skills)

    return SKILL_GEN_PROMPT.format(
        question_description=question_description,
        starter_code=starter_code,
        language=language,
        exclusion_block=exclusion_block,
    )