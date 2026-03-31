"""Prompt template for Phase 2: Student Code Evaluation."""

from __future__ import annotations

from app.prompts.system_role import (
    SKILL_STATUS_DEMONSTRATED,
    SKILL_STATUS_NOT_DEMONSTRATED,
    SKILL_STATUS_UNCERTAIN,
)

EVALUATE_PROMPT = """Analyze the student's code against the approved micro-skills.

## Context
- Language: {language}
- Question: 
{question_description}

- Starter Code:
```{language}
{starter_code}

- Student Submission:
{student_code}

- Test Cases Result: 
{test_cases_summary}

- Approved Micro-Skills to Evaluate
{skills_list}

Evaluation Rules
1. For each skill, determine if the student's code demonstrates it.
2. The status MUST be exactly one of: "{demonstrated}", "{not_demonstrated}", or "{uncertain}".
3. The "why" field must explain your reasoning clearly based on the code.
4. The "snippet" field must contain the exact line(s) of the student's code relevant to this skill. Use null if no specific snippet applies.
5. CRITICAL: The "hint" field MUST be null if the status is "{demonstrated}".
6. CRITICAL: Do not write corrected code. Write only a conceptual hint that points the student toward the fix without solving it for them.
7. CRITICAL: Do NOT reveal, repeat, or reference any specific test case inputs or expected outputs from the Test Cases Result.
8. Return a JSON object with a "results" array containing an evaluation object for every skill provided.

Example Output
{{
  "results": [
    {{
      "skill_id": "sk_01",
      "skill_name": "Access array elements using index",
      "status": "demonstrated",
      "why": "You correctly used arr[i] throughout your loop.",
      "snippet": "arr[i] = arr[i+1];",
      "hint": null
    }},
    {{
      "skill_id": "sk_02",
      "skill_name": "Shift elements without data loss",
      "status": "not_demonstrated",
      "why": "The first element is overwritten immediately and lost before it can be shifted.",
      "snippet": "for (int i=0; i<5; i++) {{ arr[i]=arr[i+1]; }}",
      "hint": "Think about what value disappears on the very first step. How could you preserve it before the loop begins?"
    }}
  ]
}}
```"""


def build_evaluate_prompt(
    question_description: str,
    starter_code: str,
    student_code: str,
    test_cases_summary: str,
    approved_skills: list[dict[str, str]],
    language: str,
) -> str:
    """Build the Phase 2 prompt for evaluating student code.

    Args:
        question_description: The assignment prompt text.
        starter_code: The teacher's starter code.
        student_code: The student's submitted code.
        test_cases_summary: Aggregated test results (e.g., "Passed 2/5 tests").
        approved_skills: List of approved skill dicts with 'id', 'name', 'description'.
        language: The programming language.

    Returns:
        The formatted prompt string.
    """
    skills_formatted = "\n".join(
        f"- {skill['id']}: {skill['name']} ({skill['description']})"
        for skill in approved_skills
    )

    return EVALUATE_PROMPT.format(
        language=language,
        question_description=question_description,
        starter_code=starter_code,
        student_code=student_code,
        test_cases_summary=test_cases_summary,
        skills_list=skills_formatted,
        demonstrated=SKILL_STATUS_DEMONSTRATED,
        not_demonstrated=SKILL_STATUS_NOT_DEMONSTRATED,
        uncertain=SKILL_STATUS_UNCERTAIN,
    )