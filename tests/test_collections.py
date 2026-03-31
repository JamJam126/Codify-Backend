"""Tests for app.vectorstore.collections module."""

from __future__ import annotations

import pytest

from app.config import Settings
from app.vectorstore.collections import (
    CollectionConfig,
    DEFAULT_COLLECTION_NAME,
    DEFAULT_DISTANCE_METRIC,
    MINILM_V2_DIMENSION,
    get_collection_config,
)


# =============================================================================
# Constants Tests
# =============================================================================


class TestConstants:
    """Tests for module-level constants."""

    def test_default_collection_name(self) -> None:
        """Should have a non-empty default collection name."""
        assert isinstance(DEFAULT_COLLECTION_NAME, str)
        assert len(DEFAULT_COLLECTION_NAME) > 0

    def test_default_distance_metric(self) -> None:
        """Should default to Cosine distance."""
        assert DEFAULT_DISTANCE_METRIC == "Cosine"

    def test_minilm_dimension(self) -> None:
        """Should define the correct dimension for MiniLM v2."""
        assert MINILM_V2_DIMENSION == 384


# =============================================================================
# CollectionConfig Tests
# =============================================================================


class TestCollectionConfig:
    """Tests for the CollectionConfig dataclass."""

    def test_create_config(self) -> None:
        """Should instantiate with all required fields."""
        config = CollectionConfig(
            name="test_col",
            dimension=512,
            distance_metric="Dot",
        )
        assert config.name == "test_col"
        assert config.dimension == 512
        assert config.distance_metric == "Dot"

    def test_config_is_frozen(self) -> None:
        """Should be immutable (frozen dataclass)."""
        config = CollectionConfig(
            name="test_col",
            dimension=384,
            distance_metric="Cosine",
        )
        with pytest.raises(AttributeError):
            config.name = "new_name"  # type: ignore[misc]

    def test_config_equality(self) -> None:
        """Should evaluate equality based on all fields."""
        config1 = CollectionConfig("col", 384, "Cosine")
        config2 = CollectionConfig("col", 384, "Cosine")
        assert config1 == config2


# =============================================================================
# get_collection_config Tests
# =============================================================================


class TestGetCollectionConfig:
    """Tests for the get_collection_config helper function."""

    def test_returns_config_instance(self) -> None:
        """Should return a CollectionConfig instance."""
        settings = Settings(_env_file=None)
        config = get_collection_config(settings)
        assert isinstance(config, CollectionConfig)

    def test_defaults_to_minilm_dimension(self) -> None:
        """Should default to 384 dimensions if model name is unrecognized."""
        settings = Settings(_env_file=None, llm_model="unknown-model/v3")
        config = get_collection_config(settings)
        assert config.dimension == MINILM_V2_DIMENSION

    def test_uses_correct_defaults(self) -> None:
        """Should use the module defaults for name and metric."""
        settings = Settings(_env_file=None)
        config = get_collection_config(settings)
        assert config.name == DEFAULT_COLLECTION_NAME
        assert config.distance_metric == DEFAULT_DISTANCE_METRIC