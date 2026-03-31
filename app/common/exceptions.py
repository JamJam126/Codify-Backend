"""Custom exceptions for the Evaluator service."""

from __future__ import annotations


class EvaluatorError(Exception):
    """Base exception for all Evaluator service errors."""


class LLMClientError(EvaluatorError):
    """Raised when the LLM client fails to generate a response.

    Attributes:
        provider: The LLM provider that failed (e.g., 'groq', 'openai').
    """

    def __init__(self, message: str, provider: str | None = None) -> None:
        self.provider = provider
        super().__init__(message)


class VectorStoreError(EvaluatorError):
    """Raised when vector database operations fail.

    Attributes:
        operation: The operation that failed (e.g., 'search', 'upsert').
    """

    def __init__(self, message: str, operation: str | None = None) -> None:
        self.operation = operation
        super().__init__(message)


class SafetyValidationError(EvaluatorError):
    """Raised when LLM output fails safety validation.

    Attributes:
        rule_violated: Identifier of the violated safety rule (e.g., 'no_solution_leak').
    """

    def __init__(self, message: str, rule_violated: str | None = None) -> None:
        self.rule_violated = rule_violated
        super().__init__(message)


class SchemaValidationError(EvaluatorError):
    """Raised when input data fails schema validation.

    Attributes:
        field: The field that failed validation, if applicable.
    """

    def __init__(self, message: str, field: str | None = None) -> None:
        self.field = field
        super().__init__(message)


class EmbeddingError(EvaluatorError):
    """Raised when text embedding generation fails.

    Attributes:
        model: The embedding model that failed (e.g., 'all-MiniLM-L6-v2').
    """

    def __init__(self, message: str, model: str | None = None) -> None:
        self.model = model
        super().__init__(message)