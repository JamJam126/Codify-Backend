"""Text embedding generation for vector database operations."""

from __future__ import annotations

import logging
from typing import Any

from sentence_transformers import SentenceTransformer

from app.common.exceptions import EmbeddingError

logger = logging.getLogger(__name__)

DEFAULT_MODEL = "all-MiniLM-L6-v2"


class EmbeddingService:
    """Handles conversion of text to vector embeddings.

    Uses sentence-transformers locally to generate embeddings.
    The ML model is lazily loaded on the first call to prevent
    slow startup times and unnecessary memory usage.
    """

    def __init__(self, model_name: str = DEFAULT_MODEL) -> None:
        """Initialize the EmbeddingService.

        Args:
            model_name: The HuggingFace model identifier to use.
        """
        self._model_name = model_name
        self._model: SentenceTransformer | None = None

    def _load_model(self) -> SentenceTransformer:
        """Lazily load the sentence-transformer model.

        Returns:
            The loaded SentenceTransformer model instance.

        Raises:
            EmbeddingError: If the model fails to load.
        """
        if self._model is not None:
            return self._model

        logger.info("Loading embedding model", extra={"model": self._model_name})
        try:
            self._model = SentenceTransformer(self._model_name)
            return self._model
        except Exception as error:
            logger.error(
                "Failed to load embedding model",
                extra={"model": self._model_name, "error": str(error)},
            )
            raise EmbeddingError(
                f"Failed to load embedding model {self._model_name}: {error}",
                model=self._model_name,
            ) from error

    def embed_text(self, text: str) -> list[float]:
        """Generate an embedding vector for a single text string.

        Args:
            text: The text to embed.

        Returns:
            A list of floats representing the embedding vector.

        Raises:
            EmbeddingError: If the embedding generation fails.
        """
        if not text or not text.strip():
            raise EmbeddingError("Cannot embed empty text", model=self._model_name)

        try:
            model = self._load_model()
            embedding = model.encode(text)
            return embedding.tolist()
        except EmbeddingError:
            raise
        except Exception as error:
            logger.error(
                "Failed to generate embedding for text",
                extra={"error": str(error)},
            )
            raise EmbeddingError(
                f"Embedding generation failed: {error}",
                model=self._model_name,
            ) from error

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        """Generate embedding vectors for a batch of text strings.

        Args:
            texts: A list of text strings to embed.

        Returns:
            A list of embedding vectors (list of lists of floats).

        Raises:
            EmbeddingError: If the batch embedding generation fails.
        """
        if not texts:
            return []

        try:
            model = self._load_model()
            embeddings = model.encode(texts)
            return embeddings.tolist()
        except EmbeddingError:
            raise
        except Exception as error:
            logger.error(
                "Failed to generate batch embeddings",
                extra={"error": str(error)},
            )
            raise EmbeddingError(
                f"Batch embedding generation failed: {error}",
                model=self._model_name,
            ) from error