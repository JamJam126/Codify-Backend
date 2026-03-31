"""Pydantic input/output models for the Evaluator API."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


# =============================================================================
# Phase 1: Micro-Skill Generation Schemas
# =============================================================================


class SkillGenerateRequest(BaseModel):
    """Request body for POST /skills/generate.

    Attributes:
        question_description: The assignment prompt text.
        starter_code: Teacher-provided starter code template.
        language: Programming language (e.g., 'c', 'python').
        already_approved_skills: Optional list of skills the teacher already
            approved, used to prevent duplicates during regeneration.
    """

    question_description: str = Field(
        ...,
        description="Assignment prompt text",
        min_length=1,
    )
    starter_code: str = Field(
        ...,
        description="Teacher-provided starter code",
    )
    language: str = Field(
        ...,
        description="Programming language, e.g. 'c', 'python'",
        min_length=1,
    )
    already_approved_skills: list[ApprovedSkill] | None = Field(
        default=None,
        description="Optional list of previously approved skills to exclude from regeneration",
    )


class CandidateSkill(BaseModel):
    """A single candidate micro-skill generated for teacher review.

    Attributes:
        id: Unique skill identifier (e.g., 'sk_01').
        name: Human-readable skill name.
        description: Detailed description of what the skill entails.
    """

    id: str = Field(
        ...,
        description="Unique skill identifier, e.g. 'sk_01'",
        pattern=r"^sk_\d+$",
    )
    name: str = Field(
        ...,
        description="Human-readable skill name",
        min_length=1,
    )
    description: str = Field(
        ...,
        description="Detailed description of what the skill entails",
        min_length=1,
    )


class SkillGenerateResponse(BaseModel):
    """Response body for POST /skills/generate.

    Attributes:
        candidate_skills: List of candidate micro-skills for teacher review.
    """

    candidate_skills: list[CandidateSkill] = Field(
        ...,
        description="List of candidate micro-skills for teacher review",
    )


# =============================================================================
# Phase 2: Evaluation Schemas
# =============================================================================


class ApprovedSkill(BaseModel):
    """An approved micro-skill passed from Phase 1 to Phase 2.

    Attributes:
        id: Skill identifier matching the approved skill.
        name: Human-readable skill name.
        description: Detailed skill description.
    """

    id: str = Field(
        ...,
        description="Skill identifier matching the approved skill",
        pattern=r"^sk_\d+$",
    )
    name: str = Field(
        ...,
        description="Human-readable skill name",
        min_length=1,
    )
    description: str = Field(
        ...,
        description="Detailed skill description",
        min_length=1,
    )


class EvaluateRequest(BaseModel):
    """Request body for POST /evaluate.

    Attributes:
        question_description: The assignment prompt text.
        starter_code: Teacher-provided starter code.
        test_cases: Input/output test case pairs.
        student_code: Student's final submission code.
        approved_skills: List of teacher-approved micro-skills.
        language: Programming language, defaults to 'c'.
    """

    question_description: str = Field(
        ...,
        description="Assignment prompt text",
        min_length=1,
    )
    starter_code: str = Field(
        ...,
        description="Teacher-provided starter code",
    )
    test_cases: str = Field(
        ...,
        description="Input/output test case pairs",
    )
    student_code: str = Field(
        ...,
        description="Student's final submission code",
        min_length=1,
    )
    approved_skills: list[ApprovedSkill] = Field(
        ...,
        description="List of teacher-approved micro-skills",
        min_length=1,
    )
    language: str = Field(
        default="c",
        description="Programming language, defaults to 'c'",
    )


SkillStatus = Literal["demonstrated", "not_demonstrated", "uncertain"]


class SkillEvaluationResult(BaseModel):
    """Evaluation result for a single micro-skill.

    Attributes:
        skill_id: Identifier of the evaluated skill.
        skill_name: Human-readable skill name.
        status: Evaluation verdict for this skill.
        why: Explanation of the evaluation outcome.
        snippet: Relevant snippet from student's code.
        hint: Conceptual hint (null if status is demonstrated).
    """

    skill_id: str = Field(
        ...,
        description="Identifier of the evaluated skill",
    )
    skill_name: str = Field(
        ...,
        description="Human-readable skill name",
    )
    status: SkillStatus = Field(
        ...,
        description="Evaluation verdict for this skill",
    )
    why: str = Field(
        ...,
        description="Explanation of why the skill was or wasn't demonstrated",
        min_length=1,
    )
    snippet: str | None = Field(
        None,
        description="Relevant snippet from student's code",
    )
    hint: str | None = Field(
        None,
        description="Conceptual hint for improvement (null if demonstrated)",
    )


class EvaluateResponse(BaseModel):
    """Response body for POST /evaluate.

    Attributes:
        results: Per-skill evaluation results.
    """

    results: list[SkillEvaluationResult] = Field(
        ...,
        description="Per-skill evaluation results",
    )


# =============================================================================
# Health Check Schema
# =============================================================================


class HealthResponse(BaseModel):
    """Response body for GET /health.

    Attributes:
        status: Service health status.
    """

    status: str = Field(
        default="ok",
        description="Service health status",
    )