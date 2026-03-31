"""Vector database collection definitions and configurations."""

from __future__ import annotations

from dataclasses import dataclass

from app.config import Settings

DEFAULT_COLLECTION_NAME = "codify_knowledge"
DEFAULT_DISTANCE_METRIC = "Cosine"

# Default dimension for the all-MiniLM-L6-v2 embedding model
MINILM_V2_DIMENSION = 384


@dataclass(frozen=True)
class CollectionConfig:
    """Configuration for a vector database collection.

    Attributes:
        name: The name of the collection in the vector database.
        dimension: The size of the embedding vectors stored in the collection.
        distance_metric: The distance metric used for similarity search (e.g., 'Cosine').
    """

    name: str
    dimension: int
    distance_metric: str


def get_collection_config(settings: Settings) -> CollectionConfig:
    """Create a CollectionConfig based on application settings.

    Maps the configured embedding model to its expected vector dimension.
    Defaults to the MiniLM v2 dimensions if the model is unrecognized.

    Args:
        settings: The application settings containing the embedding model name.

    Returns:
        A frozen CollectionConfig instance.
    """
    model_name = settings.llm_model.lower()

    if "minilm" in model_name:
        dimension = MINILM_V2_DIMENSION
    else:
        # Fallback for unknown models; Qdrant/Chroma will validate on insert anyway
        dimension = MINILM_V2_DIMENSION

    return CollectionConfig(
        name=DEFAULT_COLLECTION_NAME,
        dimension=dimension,
        distance_metric=DEFAULT_DISTANCE_METRIC,
    )