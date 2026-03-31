"""Tests for app.vectorstore.ingest module."""

from __future__ import annotations

from pathlib import Path
from unittest.mock import MagicMock, patch

import pytest

from app.common.exceptions import VectorStoreError
from app.config import Settings
from app.vectorstore.ingest import IngestionService


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_settings() -> Settings:
    """Provide settings configured for Qdrant."""
    return Settings(
        _env_file=None,
        vector_db_provider="qdrant",
        qdrant_url="http://localhost:6333",
    )


@pytest.fixture
def mock_embedding_service() -> MagicMock:
    """Provide a mocked EmbeddingService."""
    service = MagicMock()
    # Return a dummy 384-dimension vector for any input
    service.embed_batch.return_value = [[0.1] * 384, [0.2] * 384]
    return service


@pytest.fixture
def mock_qdrant_client() -> MagicMock:
    """Provide a mocked QdrantClient."""
    mock_client = MagicMock()
    mock_client.get_collections.return_value.collections = []
    return mock_client


# =============================================================================
# Ingestion Tests
# =============================================================================


class TestIngestAll:
    """Tests for the IngestionService.ingest_all method."""

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_returns_zero_if_directory_missing(
        self,
        mock_qdrant_cls: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
    ) -> None:
        """Should return 0 and skip if the knowledge directory doesn't exist."""
        service = IngestionService(mock_settings, mock_embedding_service)
        count = service.ingest_all(base_dir="/fake/path/that/does/not/exist")
        
        assert count == 0
        mock_qdrant_cls.assert_not_called()

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_ingests_files_from_subdirectories(
        self,
        mock_qdrant_cls: MagicMock,
        mock_qdrant_client: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should read valid files, embed them, and upsert to DB."""
        mock_qdrant_cls.return_value = mock_qdrant_client
        
        # Create fake knowledge structure
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "array_shift.txt").write_text("Shift array left", encoding="utf-8")
        (blueprints_dir / "loop_logic.txt").write_text("Use for loop", encoding="utf-8")

        service = IngestionService(mock_settings, mock_embedding_service)
        count = service.ingest_all(base_dir=tmp_path / "knowledge")

        assert count == 2
        mock_embedding_service.embed_batch.assert_called_once()
        mock_qdrant_client.upsert.assert_called_once()

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_skips_unsupported_extensions(
        self,
        mock_qdrant_cls: MagicMock,
        mock_qdrant_client: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should ignore files that are not .txt or .md."""
        mock_qdrant_cls.return_value = mock_qdrant_client
        
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "array_shift.txt").write_text("Valid", encoding="utf-8")
        (blueprints_dir / "image.png").write_bytes(b"fake_png_data")
        (blueprints_dir / "data.csv").write_text("a,b,c", encoding="utf-8")

        service = IngestionService(mock_settings, mock_embedding_service)
        count = service.ingest_all(base_dir=tmp_path / "knowledge")

        assert count == 1
        mock_embedding_service.embed_batch.assert_called_once_with(["Valid"])

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_skips_empty_files(
        self,
        mock_qdrant_cls: MagicMock,
        mock_qdrant_client: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should ignore files that are empty or only whitespace."""
        mock_qdrant_cls.return_value = mock_qdrant_client
        
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "empty.txt").write_text("", encoding="utf-8")
        (blueprints_dir / "whitespace.txt").write_text("   \n\t  ", encoding="utf-8")
        (blueprints_dir / "valid.txt").write_text("Has content", encoding="utf-8")

        service = IngestionService(mock_settings, mock_embedding_service)
        count = service.ingest_all(base_dir=tmp_path / "knowledge")

        assert count == 1


class TestEnsureCollectionExists:
    """Tests for collection creation logic."""

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_creates_collection_if_missing(
        self,
        mock_qdrant_cls: MagicMock,
        mock_qdrant_client: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should call create_collection if it doesn't exist."""
        mock_qdrant_cls.return_value = mock_qdrant_client
        mock_qdrant_client.get_collections.return_value.collections = []
        
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "f.txt").write_text("data", encoding="utf-8")

        service = IngestionService(mock_settings, mock_embedding_service)
        service.ingest_all(base_dir=tmp_path / "knowledge")

        mock_qdrant_client.create_collection.assert_called_once()

    @patch("app.vectorstore.ingest.QdrantClient")
    def test_skips_creation_if_exists(
        self,
        mock_qdrant_cls: MagicMock,
        mock_qdrant_client: MagicMock,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should NOT call create_collection if it already exists."""
        mock_qdrant_cls.return_value = mock_qdrant_client
        
        # Mock an existing collection
        mock_collection = MagicMock()
        mock_collection.name = "codify_knowledge"
        mock_qdrant_client.get_collections.return_value.collections = [mock_collection]
        
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "f.txt").write_text("data", encoding="utf-8")

        service = IngestionService(mock_settings, mock_embedding_service)
        service.ingest_all(base_dir=tmp_path / "knowledge")

        mock_qdrant_client.create_collection.assert_not_called()


class TestUnsupportedProvider:
    """Tests for error handling during initialization."""

    def test_raises_on_unsupported_provider(
        self,
        mock_settings: Settings,
        mock_embedding_service: MagicMock,
        tmp_path: Path,
    ) -> None:
        """Should raise VectorStoreError if provider is unsupported."""
        bad_settings = Settings(_env_file=None, vector_db_provider="weaviate")
        
        blueprints_dir = tmp_path / "knowledge" / "blueprints"
        blueprints_dir.mkdir(parents=True)
        (blueprints_dir / "f.txt").write_text("data", encoding="utf-8")

        service = IngestionService(bad_settings, mock_embedding_service)
        
        with pytest.raises(VectorStoreError) as exc_info:
            service.ingest_all(base_dir=tmp_path / "knowledge")
            
        assert "Unsupported" in str(exc_info.value)