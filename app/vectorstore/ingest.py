"""Knowledge base ingestion into the vector database."""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import Any

import chromadb
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams

from app.common.exceptions import EmbeddingError, VectorStoreError
from app.config import Settings
from app.vectorstore.collections import CollectionConfig, DEFAULT_DISTANCE_METRIC, get_collection_config
from app.vectorstore.embeddings import EmbeddingService

logger = logging.getLogger(__name__)

KNOWLEDGE_DIR_NAME = "knowledge"
SUPPORTED_EXTENSIONS = {".txt", ".md"}


class IngestionService:
    """Handles reading local knowledge files and upserting them into the vector DB.

    Expects a directory structure like:
        knowledge/
        ├── blueprints/
        ├── micro_skills/
        ├── common_mistakes/
        └── hint_templates/
    """

    def __init__(
        self,
        settings: Settings,
        embedding_service: EmbeddingService,
    ) -> None:
        """Initialize the IngestionService.

        Args:
            settings: Application settings for DB connection and config.
            embedding_service: The service used to generate text embeddings.
        """
        self._settings = settings
        self._embedding_service = embedding_service
        self._collection_config = get_collection_config(settings)
        self._db_client: QdrantClient | chromadb.PersistentClient | None = None

    def ingest_all(self, base_dir: str | Path = KNOWLEDGE_DIR_NAME) -> int:
        """Read all supported files from the knowledge directory and ingest them.

        Args:
            base_dir: The root directory containing knowledge subdirectories.

        Returns:
            The total number of documents successfully ingested.

        Raises:
            VectorStoreError: If database operations fail.
            EmbeddingError: If text embedding fails.
        """
        knowledge_path = Path(base_dir)
        if not knowledge_path.is_dir():
            logger.warning(
                "Knowledge directory does not exist, skipping ingestion",
                extra={"path": str(knowledge_path)},
            )
            return 0

        self._init_db_client()
        self._ensure_collection_exists()

        total_ingested = 0
        for subdir in knowledge_path.iterdir():
            if subdir.is_dir():
                category = subdir.name
                count = self._ingest_directory(subdir, category)
                total_ingested += count

        logger.info(
            "Ingestion complete",
            extra={"total_documents": total_ingested},
        )
        return total_ingested

    def _init_db_client(self) -> None:
        """Initialize the appropriate database client based on settings."""
        provider = self._settings.vector_db_provider
        
        if provider == "qdrant":
            try:
                self._db_client = QdrantClient(url=self._settings.qdrant_url)
            except Exception as error:
                raise VectorStoreError(
                    f"Failed to connect to Qdrant for ingestion: {error}",
                    operation="init",
                ) from error
        elif provider == "chroma":
            try:
                self._db_client = chromadb.PersistentClient(path=self._settings.chroma_db_path)
            except Exception as error:
                raise VectorStoreError(
                    f"Failed to initialize Chroma for ingestion: {error}",
                    operation="init",
                ) from error
        else:
            raise VectorStoreError(
                f"Unsupported provider: {provider}",
                operation="init",
            )

    def _ensure_collection_exists(self) -> None:
        """Create the vector collection if it does not already exist."""
        config = self._collection_config
        provider = self._settings.vector_db_provider

        if provider == "qdrant":
            existing = [c.name for c in self._db_client.get_collections().collections]  # type: ignore[union-attr]
            if config.name not in existing:
                self._db_client.create_collection(  # type: ignore[union-attr]
                    collection_name=config.name,
                    vectors_config=VectorParams(
                        size=config.dimension,
                        distance=Distance.COSINE,
                    ),
                )
                logger.info("Created Qdrant collection", extra={"collection": config.name})
        elif provider == "chroma":
            existing = [c.name for c in self._db_client.list_collections()]  # type: ignore[union-attr]
            if config.name not in existing:
                self._db_client.create_collection(  # type: ignore[union-attr]
                    name=config.name,
                    metadata={"hnsw:space": DEFAULT_DISTANCE_METRIC.lower()},
                )
                logger.info("Created Chroma collection", extra={"collection": config.name})

    def _ingest_directory(self, dir_path: Path, category: str) -> int:
        """Ingest all valid files from a specific subdirectory.

        Args:
            dir_path: Path to the subdirectory.
            category: The category name (e.g., 'blueprints').

        Returns:
            Number of documents ingested from this directory.
        """
        files = [f for f in dir_path.iterdir() if f.is_file() and f.suffix in SUPPORTED_EXTENSIONS]
        if not files:
            return 0

        documents: list[str] = []
        metadatas: list[dict[str, Any]] = []
        ids: list[str] = []

        for file_path in files:
            content = file_path.read_text(encoding="utf-8").strip()
            if content:
                documents.append(content)
                metadatas.append({
                    "category": category,
                    "source_file": file_path.name,
                })
                ids.append(f"{category}_{file_path.stem}")

        if not documents:
            return 0

        try:
            embeddings = self._embedding_service.embed_batch(documents)
        except EmbeddingError:
            raise

        provider = self._settings.vector_db_provider
        if provider == "qdrant":
            self._upsert_qdrant(ids, embeddings, documents, metadatas)
        elif provider == "chroma":
            self._upsert_chroma(ids, embeddings, documents, metadatas)

        logger.info(
            "Ingested directory",
            extra={"category": category, "file_count": len(documents)},
        )
        return len(documents)

    def _upsert_qdrant(
        self,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> None:
        """Upsert documents into Qdrant.

        Args:
            ids: List of unique document IDs.
            embeddings: List of embedding vectors.
            documents: List of text contents.
            metadatas: List of metadata dictionaries.
        """
        points = [
            PointStruct(
                id=uuid.uuid4().hex,
                vector=vector,
                payload={
                    "content": doc,
                    "metadata": meta,
                    "external_id": doc_id,
                },
            )
            for doc_id, vector, doc, meta in zip(ids, embeddings, documents, metadatas)
        ]
        self._db_client.upsert(  # type: ignore[union-attr]
            collection_name=self._collection_config.name,
            points=points,
        )

    def _upsert_chroma(
        self,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> None:
        """Upsert documents into Chroma.

        Args:
            ids: List of unique document IDs.
            embeddings: List of embedding vectors.
            documents: List of text contents.
            metadatas: List of metadata dictionaries.
        """
        collection = self._db_client.get_collection(self._collection_config.name)  # type: ignore[union-attr]
        collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas,
        )