"""Tests for app.integrations.vector_client module."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest

from app.common.exceptions import VectorStoreError
from app.config import Settings
from app.integrations.vector_client import CHROMA_PROVIDER, QDRANT_PROVIDER, VectorClient


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def qdrant_settings() -> Settings:
    """Provide settings configured for Qdrant."""
    return Settings(
        _env_file=None,
        vector_db_provider=QDRANT_PROVIDER,
        qdrant_url="http://localhost:6333",
    )


@pytest.fixture
def chroma_settings() -> Settings:
    """Provide settings configured for Chroma."""
    return Settings(
        _env_file=None,
        vector_db_provider=CHROMA_PROVIDER,
        chroma_db_path="./data/chroma",
    )


@pytest.fixture
def mock_query_vector() -> list[float]:
    """Provide a dummy embedding vector."""
    return [0.1] * 384


# =============================================================================
# Initialization Tests
# =============================================================================


class TestVectorClientInit:
    """Tests for VectorClient initialization."""

    @patch("app.integrations.vector_client.QdrantClient")
    def test_init_qdrant_success(self, mock_qdrant_cls: MagicMock, qdrant_settings: Settings) -> None:
        """Should initialize Qdrant client without errors."""
        client = VectorClient(qdrant_settings, collection_name="test_col")
        mock_qdrant_cls.assert_called_once_with(url=qdrant_settings.qdrant_url)
        assert client._provider == QDRANT_PROVIDER

    @patch("app.integrations.vector_client.chromadb.PersistentClient")
    def test_init_chroma_success(self, mock_chroma_cls: MagicMock, chroma_settings: Settings) -> None:
        """Should initialize Chroma client without errors."""
        client = VectorClient(chroma_settings, collection_name="test_col")
        mock_chroma_cls.assert_called_once_with(path=chroma_settings.chroma_db_path)
        assert client._provider == CHROMA_PROVIDER

    def test_init_unsupported_provider_raises(self) -> None:
        """Should raise VectorStoreError for unsupported providers."""
        bad_settings = Settings(_env_file=None, vector_db_provider="weaviate")
        with pytest.raises(VectorStoreError) as exc_info:
            VectorClient(bad_settings)
        assert exc_info.value.operation == "init"
        assert "Unsupported" in str(exc_info.value)

    @patch("app.integrations.vector_client.QdrantClient")
    def test_init_qdrant_connection_failure_raises(self, mock_qdrant_cls: MagicMock, qdrant_settings: Settings) -> None:
        """Should raise VectorStoreError if Qdrant connection fails."""
        mock_qdrant_cls.side_effect = Exception("Connection refused")
        with pytest.raises(VectorStoreError) as exc_info:
            VectorClient(qdrant_settings)
        assert "connection failed" in str(exc_info.value).lower()


# =============================================================================
# Qdrant Search Tests
# =============================================================================


class TestQdrantSearch:
    """Tests for the Qdrant search path."""

    @patch("app.integrations.vector_client.QdrantClient")
    def test_search_returns_standardized_results(
        self,
        mock_qdrant_cls: MagicMock,
        qdrant_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should format Qdrant points into standardized dicts."""
        mock_point = MagicMock()
        mock_point.score = 0.95
        mock_point.payload = {"content": "Shift elements", "metadata": {"type": "blueprint"}}

        mock_qdrant_instance = MagicMock()
        mock_qdrant_instance.query_points.return_value = MagicMock(points=[mock_point])
        mock_qdrant_cls.return_value = mock_qdrant_instance

        client = VectorClient(qdrant_settings, collection_name="test_col")
        results = client.search(mock_query_vector, limit=1)

        assert len(results) == 1
        assert results[0]["content"] == "Shift elements"
        assert results[0]["score"] == 0.95
        assert results[0]["metadata"]["type"] == "blueprint"

    @patch("app.integrations.vector_client.QdrantClient")
    def test_search_handles_empty_payload(
        self,
        mock_qdrant_cls: MagicMock,
        qdrant_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should handle points with None or missing payload gracefully."""
        mock_point = MagicMock()
        mock_point.score = 0.80
        mock_point.payload = None

        mock_qdrant_instance = MagicMock()
        mock_qdrant_instance.query_points.return_value = MagicMock(points=[mock_point])
        mock_qdrant_cls.return_value = mock_qdrant_instance

        client = VectorClient(qdrant_settings)
        results = client.search(mock_query_vector)

        assert results[0]["content"] == ""
        assert results[0]["metadata"] == {}

    @patch("app.integrations.vector_client.QdrantClient")
    def test_search_failure_raises(
        self,
        mock_qdrant_cls: MagicMock,
        qdrant_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should raise VectorStoreError if the query API call fails."""
        mock_qdrant_instance = MagicMock()
        mock_qdrant_instance.query_points.side_effect = Exception("Timeout")
        mock_qdrant_cls.return_value = mock_qdrant_instance

        client = VectorClient(qdrant_settings)
        with pytest.raises(VectorStoreError) as exc_info:
            client.search(mock_query_vector)
        assert exc_info.value.operation == "search"


# =============================================================================
# Chroma Search Tests
# =============================================================================


class TestChromaSearch:
    """Tests for the Chroma search path."""

    @patch("app.integrations.vector_client.chromadb.PersistentClient")
    def test_search_returns_standardized_results(
        self,
        mock_chroma_cls: MagicMock,
        chroma_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should convert Chroma distances to similarity scores and standardize."""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            "documents": [["Use a temp variable"]],
            "distances": [[0.1]],
            "metadatas": [[{"topic": "arrays"}]],
        }

        mock_chroma_instance = MagicMock()
        mock_chroma_instance.get_collection.return_value = mock_collection
        mock_chroma_cls.return_value = mock_chroma_instance

        client = VectorClient(chroma_settings)
        results = client.search(mock_query_vector, limit=1)

        assert len(results) == 1
        assert results[0]["content"] == "Use a temp variable"
        assert results[0]["score"] == 0.9  # 1.0 - 0.1 distance
        assert results[0]["metadata"]["topic"] == "arrays"

    @patch("app.integrations.vector_client.chromadb.PersistentClient")
    def test_search_handles_empty_metadata(
        self,
        mock_chroma_cls: MagicMock,
        chroma_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should handle missing metadatas in Chroma response."""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            "documents": [["Scan array"]],
            "distances": [[0.2]],
            "metadatas": [None],
        }

        mock_chroma_instance = MagicMock()
        mock_chroma_instance.get_collection.return_value = mock_collection
        mock_chroma_cls.return_value = mock_chroma_instance

        client = VectorClient(chroma_settings)
        results = client.search(mock_query_vector)

        assert results[0]["metadata"] == {}

    @patch("app.integrations.vector_client.chromadb.PersistentClient")
    def test_search_handles_empty_results(
        self,
        mock_chroma_cls: MagicMock,
        chroma_settings: Settings,
        mock_query_vector: list[float],
    ) -> None:
        """Should return an empty list if Chroma returns no documents."""
        mock_collection = MagicMock()
        mock_collection.query.return_value = {
            "documents": [""],
            "distances": [[]],
            "metadatas": [[]],
        }

        mock_chroma_instance = MagicMock()
        mock_chroma_instance.get_collection.return_value = mock_collection
        mock_chroma_cls.return_value = mock_chroma_instance

        client = VectorClient(chroma_settings)
        results = client.search(mock_query_vector)

        assert results == []