"""Tests for app.vectorstore.embeddings module."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import numpy as np
import pytest

from app.common.exceptions import EmbeddingError
from app.vectorstore.embeddings import EmbeddingService


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_transformer_model() -> MagicMock:
    """Provide a mocked SentenceTransformer model."""
    mock_model = MagicMock()
    # Single string input returns a 1D array
    mock_model.encode.return_value = np.array([0.1, 0.2, 0.3])
    return mock_model


# =============================================================================
# Initialization Tests
# =============================================================================


class TestEmbeddingServiceInit:
    """Tests for EmbeddingService initialization."""

    def test_does_not_load_model_on_init(self) -> None:
        """Should not load the ML model during __init__ to save memory."""
        service = EmbeddingService()
        assert service._model is None

    def test_stores_custom_model_name(self) -> None:
        """Should store the provided custom model name."""
        service = EmbeddingService(model_name="custom-model/v2")
        assert service._model_name == "custom-model/v2"


# =============================================================================
# Model Loading Tests
# =============================================================================


class TestModelLoading:
    """Tests for the lazy model loading mechanism."""

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_loads_model_on_first_call(self, mock_st_cls: MagicMock, mock_transformer_model: MagicMock) -> None:
        """Should instantiate the model on the first embedding call."""
        mock_st_cls.return_value = mock_transformer_model
        service = EmbeddingService()

        service.embed_text("test text")

        mock_st_cls.assert_called_once_with("all-MiniLM-L6-v2")

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_reuses_model_on_subsequent_calls(self, mock_st_cls: MagicMock, mock_transformer_model: MagicMock) -> None:
        """Should not re-instantiate the model on subsequent calls."""
        mock_st_cls.return_value = mock_transformer_model
        service = EmbeddingService()

        service.embed_text("text 1")
        service.embed_text("text 2")

        # Called exactly once, proving it was cached
        assert mock_st_cls.call_count == 1

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_raises_embedding_error_on_load_failure(self, mock_st_cls: MagicMock) -> None:
        """Should raise EmbeddingError if the model fails to load."""
        mock_st_cls.side_effect = OSError("Model not found")
        service = EmbeddingService()

        with pytest.raises(EmbeddingError) as exc_info:
            service.embed_text("test")

        assert "Failed to load" in str(exc_info.value)
        assert exc_info.value.model == "all-MiniLM-L6-v2"


# =============================================================================
# Embedding Generation Tests
# =============================================================================


class TestEmbedText:
    """Tests for the embed_text method."""

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_returns_list_of_floats(self, mock_st_cls: MagicMock, mock_transformer_model: MagicMock) -> None:
        """Should return a standard Python list of floats."""
        mock_st_cls.return_value = mock_transformer_model
        service = EmbeddingService()

        result = service.embed_text("array shift logic")

        assert isinstance(result, list)
        assert all(isinstance(x, float) for x in result)
        assert result == [0.1, 0.2, 0.3]

    def test_raises_on_empty_string(self) -> None:
        """Should raise EmbeddingError if the input text is empty."""
        service = EmbeddingService()

        with pytest.raises(EmbeddingError) as exc_info:
            service.embed_text("")

        assert "empty text" in str(exc_info.value).lower()

    def test_raises_on_whitespace_only_string(self) -> None:
        """Should raise EmbeddingError if the input text is only whitespace."""
        service = EmbeddingService()

        with pytest.raises(EmbeddingError):
            service.embed_text("   \n\t  ")

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_raises_on_inference_failure(self, mock_st_cls: MagicMock, mock_transformer_model: MagicMock) -> None:
        """Should raise EmbeddingError if model.encode fails during inference."""
        mock_st_cls.return_value = mock_transformer_model
        mock_transformer_model.encode.side_effect = RuntimeError("CUDA out of memory")
        service = EmbeddingService()

        with pytest.raises(EmbeddingError) as exc_info:
            service.embed_text("valid text")

        assert "generation failed" in str(exc_info.value).lower()


class TestEmbedBatch:
    """Tests for the embed_batch method."""

    @patch("app.vectorstore.embeddings.SentenceTransformer")
    def test_returns_list_of_lists(self, mock_st_cls: MagicMock) -> None:
        """Should return a list containing lists of floats."""
        mock_model = MagicMock()
        # Simulate batch output (2 texts, 3 dimensions)
        mock_model.encode.return_value = np.array([
            [0.1, 0.2, 0.3],
            [0.4, 0.5, 0.6],
        ])
        mock_st_cls.return_value = mock_model

        service = EmbeddingService()
        result = service.embed_batch(["text one", "text two"])

        assert len(result) == 2
        assert result[0] == [0.1, 0.2, 0.3]
        assert result[1] == [0.4, 0.5, 0.6]

    def test_returns_empty_list_for_empty_input(self) -> None:
        """Should return an empty list without calling the model if input is empty."""
        service = EmbeddingService()
        result = service.embed_batch([])
        assert result == []