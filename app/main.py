"""FastAPI application entry point for the Codify Evaluator service."""

from __future__ import annotations

import logging

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from app.common.exceptions import (
    EvaluatorError,
    LLMClientError,
    SafetyValidationError,
)
from app.common.logging import setup_logging
from app.config import get_settings
from app.core.pipeline import EvaluationPipeline
from app.core.skill_generator import SkillGenerator
from app.integrations.llm_client import LLMClient
from app.integrations.vector_client import VectorClient
from app.schemas import (
    EvaluateRequest,
    EvaluateResponse,
    HealthResponse,
    SkillGenerateRequest,
    SkillGenerateResponse,
)
from app.vectorstore.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Application Initialization
# ---------------------------------------------------------------------------

settings = get_settings()
setup_logging(settings.log_level)

app = FastAPI(
    title="Codify Evaluator API",
    description="Stateless AI microservice for educational code evaluation.",
    version="1.0.0",
)

# ---------------------------------------------------------------------------
# Service Instantiation (V1: Singleton at startup)
# ---------------------------------------------------------------------------

try:
    llm_client = LLMClient(settings)
except Exception as error:
    logger.critical("Failed to initialize LLM client", extra={"error": str(error)})
    llm_client = None

try:
    vector_client = VectorClient(settings)
    embedding_service = EmbeddingService(settings.embedding_model)
except Exception as error:
    logger.warning(
        "Vector DB or Embedding service unavailable. RAG disabled.",
        extra={"error": str(error)},
    )
    vector_client = None
    embedding_service = None

# Pipeline singletons (gracefully handle missing dependencies)
skill_generator = SkillGenerator(llm_client, vector_client, embedding_service) if llm_client else None
evaluation_pipeline = EvaluationPipeline(llm_client, vector_client, embedding_service) if llm_client else None


# ---------------------------------------------------------------------------
# Dependency Getters (for easy testing overrides)
# ---------------------------------------------------------------------------

def get_skill_generator() -> SkillGenerator:
    """Return the SkillGenerator instance."""
    if skill_generator is None:
        raise HTTPException(status_code=503, detail="LLM service not configured")
    return skill_generator


def get_evaluation_pipeline() -> EvaluationPipeline:
    """Return the EvaluationPipeline instance."""
    if evaluation_pipeline is None:
        raise HTTPException(status_code=503, detail="LLM service not configured")
    return evaluation_pipeline


# ---------------------------------------------------------------------------
# Exception Handlers
# ---------------------------------------------------------------------------

@app.exception_handler(SafetyValidationError)
async def safety_validation_exception_handler(request: Request, exc: SafetyValidationError) -> JSONResponse:
    """Handle safety violations from the LLM output."""
    logger.error("Safety validation failed", extra={"rule": exc.rule_violated, "error": str(exc)})
    return JSONResponse(
        status_code=500,
        content={"detail": "Generated feedback violated safety rules. Please retry."},
    )


@app.exception_handler(LLMClientError)
async def llm_client_exception_handler(request: Request, exc: LLMClientError) -> JSONResponse:
    """Handle failures communicating with the LLM provider."""
    logger.error("LLM client error", extra={"provider": exc.provider, "error": str(exc)})
    return JSONResponse(
        status_code=502,
        content={"detail": f"Failed to communicate with LLM provider: {exc.provider}"},
    )


@app.exception_handler(EvaluatorError)
async def evaluator_exception_handler(request: Request, exc: EvaluatorError) -> JSONResponse:
    """Handle general evaluation processing errors."""
    logger.error("Evaluator processing error", extra={"error": str(exc)})
    return JSONResponse(
        status_code=500,
        content={"detail": "Failed to process evaluation."},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle Pydantic schema validation errors."""
    logger.warning("Request validation failed", extra={"errors": exc.errors()})
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Check that the service is running."""
    return HealthResponse(status="ok")


@app.post("/skills/generate", response_model=SkillGenerateResponse)
async def generate_skills(
    request: SkillGenerateRequest,
    generator: SkillGenerator = Depends(get_skill_generator),  # type: ignore[assignment]
) -> SkillGenerateResponse:
    """Phase 1 — Generate candidate micro-skills for teacher review."""
    # Convert Pydantic models to dicts at the API boundary, just like in /evaluate
    approved_dicts = (
        [skill.model_dump() for skill in request.already_approved_skills]
        if request.already_approved_skills
        else None
    )

    return await generator.generate_skills(
        question_description=request.question_description,
        starter_code=request.starter_code,
        language=request.language,
        already_approved_skills=approved_dicts,
    )


@app.post("/evaluate", response_model=EvaluateResponse)
async def evaluate_submission(
    request: EvaluateRequest,
    pipeline: EvaluationPipeline = Depends(get_evaluation_pipeline),  # type: ignore[assignment]
) -> EvaluateResponse:
    """Phase 2 — Run evaluation, return per-skill feedback."""
    return await pipeline.evaluate(request)