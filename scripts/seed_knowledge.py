"""CLI script to seed the vector database with knowledge base files."""

from __future__ import annotations

import logging
import sys
from pathlib import Path

# Ensure the app module can be imported when running from the scripts/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.common.logging import setup_logging
from app.config import get_settings
from app.vectorstore.embeddings import EmbeddingService
from app.vectorstore.ingest import IngestionService

logger = logging.getLogger(__name__)

DEFAULT_KNOWLEDGE_DIR = "knowledge"


def main() -> None:
    """Execute the knowledge ingestion process."""
    setup_logging("INFO")
    settings = get_settings()

    logger.info("Starting knowledge base ingestion...")

    embedding_service = EmbeddingService(settings.embedding_model)
    ingestion_service = IngestionService(settings, embedding_service)

    try:
        count = ingestion_service.ingest_all(base_dir=DEFAULT_KNOWLEDGE_DIR)
        logger.info(f"Successfully ingested {count} documents.")
    except Exception as error:
        logger.error(f"Ingestion failed: {error}")
        sys.exit(1)


if __name__ == "__main__":
    main()