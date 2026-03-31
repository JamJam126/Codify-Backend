"""Vector database client for RAG similarity search operations."""

from __future__ import annotations

import logging
from typing import Any

import chromadb
from qdrant_client import QdrantClient

from app.common.exceptions import VectorStoreError
from app.config import Settings

logger = logging.getLogger(__name__)

QDRANT_PROVIDER = "qdrant"
CHROMA_PROVIDER = "chroma"
DEFAULT_COLLECTION_NAME = "codify_knowledge"


class VectorClient:
    """Unified client for interacting with vector databases.

    Supports Qdrant and Chroma as backends, selected via configuration.
    Performs vector-based similarity searches to retrieve RAG context.
    """

    def __init__(
        self,
        settings: Settings,
        collection_name: str = DEFAULT_COLLECTION_NAME,
    ) -> None:
        """Initialize the VectorClient with the configured provider.

        Args:
            settings: Application settings for DB connection.
            collection_name: The name of the collection to query against.
        """
        self._provider = settings.vector_db_provider
        self._collection_name = collection_name
        self._settings = settings

        if self._provider == QDRANT_PROVIDER:
            self._init_qdrant(settings)
        elif self._provider == CHROMA_PROVIDER:
            self._init_chroma(settings)
        else:
            raise VectorStoreError(
                f"Unsupported vector DB provider: {self._provider}",
                operation="init",
            )

    def _init_qdrant(self, settings: Settings) -> None:
        """Initialize the Qdrant client connection.

        Args:
            settings: Application settings containing the Qdrant URL.
        """
        try:
            self._qdrant = QdrantClient(url=settings.qdrant_url)
            logger.info(
                "Qdrant client initialized",
                extra={
                    "url": settings.qdrant_url,
                    "collection": self._collection_name,
                },
            )
        except Exception as error:
            logger.error(
                "Failed to connect to Qdrant",
                extra={"error": str(error)},
            )
            raise VectorStoreError(
                f"Qdrant connection failed: {error}",
                operation="init",
            ) from error

    def _init_chroma(self, settings: Settings) -> None:
        """Initialize the Chroma client connection.

        Args:
            settings: Application settings containing the DB path.
        """
        try:
            self._chroma = chromadb.PersistentClient(path=settings.chroma_db_path)
            logger.info(
                "Chroma client initialized",
                extra={
                    "path": settings.chroma_db_path,
                    "collection": self._collection_name,
                },
            )
        except Exception as error:
            logger.error(
                "Failed to initialize Chroma",
                extra={"error": str(error)},
            )
            raise VectorStoreError(
                f"Chroma initialization failed: {error}",
                operation="init",
            ) from error

    def search(
        self,
        query_vector: list[float],
        limit: int = 5,
    ) -> list[dict[str, Any]]:
        """Search for similar vectors in the configured collection.

        Args:
            query_vector: The embedding vector to search against.
            limit: Maximum number of results to return.

        Returns:
            A list of dictionaries containing 'content', 'score', and 'metadata'.

        Raises:
            VectorStoreError: If the search operation fails.
        """
        if self._provider == QDRANT_PROVIDER:
            return self._search_qdrant(query_vector, limit)
        return self._search_chroma(query_vector, limit)

    def _search_qdrant(
        self,
        query_vector: list[float],
        limit: int,
    ) -> list[dict[str, Any]]:
        """Execute a similarity search against Qdrant.

        Args:
            query_vector: The embedding vector to search against.
            limit: Maximum number of results to return.

        Returns:
            Standardized list of search results.
        """
        try:
            response = self._qdrant.query_points(
                collection_name=self._collection_name,
                points=[query_vector],
                limit=limit,
                with_payload=True,
            )

            results = []
            for point in response.points:
                payload = point.payload or {}
                results.append({
                    "content": payload.get("content", ""),
                    "score": point.score,
                    "metadata": payload.get("metadata", {}),
                })

            logger.info(
                "Qdrant search completed",
                extra={
                    "collection": self._collection_name,
                    "returned_count": len(results),
                },
            )
            return results

        except Exception as error:
            logger.error(
                "Qdrant search failed",
                extra={"error": str(error)},
            )
            raise VectorStoreError(
                f"Qdrant search failed: {error}",
                operation="search",
            ) from error

    def _search_chroma(
        self,
        query_vector: list[float],
        limit: int,
    ) -> list[dict[str, Any]]:
        """Execute a similarity search against Chroma.

        Args:
            query_vector: The embedding vector to search against.
            limit: Maximum number of results to return.

        Returns:
            Standardized list of search results.
        """
        try:
            collection = self._chroma.get_collection(self._collection_name)
            response = collection.query(
                query_embeddings=[query_vector],
                n_results=limit,
            )

            results = []
            if response and response["documents"]:
                documents = response["documents"][0]
                distances = response["distances"][0]

                raw_metadatas = response["metadatas"]
                if raw_metadatas and raw_metadatas[0] is not None:
                    metadatas = raw_metadatas[0]
                else:
                    metadatas = [{}] * len(documents)

                for doc, dist, meta in zip(documents, distances, metadatas):
                    results.append({
                        "content": doc,
                        "score": 1.0 - dist,  # Chroma returns distances, convert to similarity score
                        "metadata": meta or {},
                    })

            logger.info(
                "Chroma search completed",
                extra={
                    "collection": self._collection_name,
                    "returned_count": len(results),
                },
            )
            return results

        except Exception as error:
            logger.error(
                "Chroma search failed",
                extra={"error": str(error)},
            )
            raise VectorStoreError(
                f"Chroma search failed: {error}",
                operation="search",
            ) from error