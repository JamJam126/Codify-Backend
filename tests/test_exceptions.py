"""Tests for app.common.exceptions module."""

from __future__ import annotations

import pytest

from app.common.exceptions import (
    EmbeddingError,
    EvaluatorError,
    LLMClientError,
    SafetyValidationError,
    SchemaValidationError,
    VectorStoreError,
)


class TestEvaluatorError:
    """Tests for the base EvaluatorError."""

    def test_base_exception_inherits_from_exception(self) -> None:
        """EvaluatorError should be a subclass of Exception."""
        assert issubclass(EvaluatorError, Exception)

    def test_base_exception_stores_message(self) -> None:
        """EvaluatorError should store and expose the message."""
        error = EvaluatorError("base error occurred")
        assert str(error) == "base error occurred"

    def test_base_exception_can_be_raised_and_caught(self) -> None:
        """EvaluatorError should be raisable and catchable."""
        with pytest.raises(EvaluatorError):
            raise EvaluatorError("test")


class TestLLMClientError:
    """Tests for LLMClientError."""

    def test_inherits_from_base(self) -> None:
        """LLMClientError should inherit from EvaluatorError."""
        assert issubclass(LLMClientError, EvaluatorError)

    def test_stores_message_only(self) -> None:
        """LLMClientError should work with message only."""
        error = LLMClientError("connection failed")
        assert str(error) == "connection failed"
        assert error.provider is None

    def test_stores_provider_attribute(self) -> None:
        """LLMClientError should store the provider attribute."""
        error = LLMClientError("timeout", provider="groq")
        assert error.provider == "groq"
        assert str(error) == "timeout"

    def test_catchable_as_base_error(self) -> None:
        """LLMClientError should be catchable as EvaluatorError."""
        with pytest.raises(EvaluatorError):
            raise LLMClientError("fail")


class TestVectorStoreError:
    """Tests for VectorStoreError."""

    def test_inherits_from_base(self) -> None:
        """VectorStoreError should inherit from EvaluatorError."""
        assert issubclass(VectorStoreError, EvaluatorError)

    def test_stores_message_only(self) -> None:
        """VectorStoreError should work with message only."""
        error = VectorStoreError("db down")
        assert str(error) == "db down"
        assert error.operation is None

    def test_stores_operation_attribute(self) -> None:
        """VectorStoreError should store the operation attribute."""
        error = VectorStoreError("search failed", operation="search")
        assert error.operation == "search"


class TestSafetyValidationError:
    """Tests for SafetyValidationError."""

    def test_inherits_from_base(self) -> None:
        """SafetyValidationError should inherit from EvaluatorError."""
        assert issubclass(SafetyValidationError, EvaluatorError)

    def test_stores_message_only(self) -> None:
        """SafetyValidationError should work with message only."""
        error = SafetyValidationError("validation failed")
        assert error.rule_violated is None

    def test_stores_rule_violated_attribute(self) -> None:
        """SafetyValidationError should store the rule_violated attribute."""
        error = SafetyValidationError(
            "solution leaked", rule_violated="no_solution_leak"
        )
        assert error.rule_violated == "no_solution_leak"


class TestSchemaValidationError:
    """Tests for SchemaValidationError."""

    def test_inherits_from_base(self) -> None:
        """SchemaValidationError should inherit from EvaluatorError."""
        assert issubclass(SchemaValidationError, EvaluatorError)

    def test_stores_message_only(self) -> None:
        """SchemaValidationError should work with message only."""
        error = SchemaValidationError("invalid input")
        assert error.field is None

    def test_stores_field_attribute(self) -> None:
        """SchemaValidationError should store the field attribute."""
        error = SchemaValidationError("missing field", field="question_description")
        assert error.field == "question_description"


class TestEmbeddingError:
    """Tests for EmbeddingError."""

    def test_inherits_from_base(self) -> None:
        """EmbeddingError should inherit from EvaluatorError."""
        assert issubclass(EmbeddingError, EvaluatorError)

    def test_stores_message_only(self) -> None:
        """EmbeddingError should work with message only."""
        error = EmbeddingError("model failed")
        assert error.model is None

    def test_stores_model_attribute(self) -> None:
        """EmbeddingError should store the model attribute."""
        error = EmbeddingError("timeout", model="all-MiniLM-L6-v2")
        assert error.model == "all-MiniLM-L6-v2"