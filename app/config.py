"""Environment-based configuration for the Evaluator service."""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    Values are read from the .env file or actual environment variables.
    Pydantic handles type coercion automatically.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # LLM Configuration
    llm_provider: str = "groq"
    llm_model: str = "moonshotai/kimi-k2-instruct"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 4096
    llm_response_format: str = "json_object"

    # API Keys
    groq_api_key: str = ""
    cerebras_api_key: str = ""
    mistral_api_key: str = ""
    zhipu_api_key: str = ""
    cloudflare_account_id: str = ""
    cloudflare_api_key: str = ""

    # Vector Database Configuration
    vector_db_provider: str = "qdrant"
    qdrant_url: str = "http://localhost:6333"
    chroma_db_path: str = "./data/chroma"

    # Retry / Stability
    llm_max_retries: int = 3
    llm_retry_delay_seconds: int = 20

    # App Configuration
    app_env: str = "development"
    log_level: str = "INFO"


def get_settings() -> Settings:
    """Get the application settings singleton.

    Returns:
        The configured Settings instance.
    """
    return Settings()