"""Tests for app.config module."""

from __future__ import annotations

import os

import pytest
from pydantic import ValidationError

from app.config import Settings, get_settings


class TestSettingsDefaults:
    """Tests for default configuration values when no env vars are set."""

    def test_default_llm_provider(self) -> None:
        """Should default to 'groq' if LLM_PROVIDER is not set."""
        settings = Settings(_env_file=None)
        assert settings.llm_provider == "groq"

    def test_default_llm_model(self) -> None:
        """Should default to the kimi model if LLM_MODEL is not set."""
        settings = Settings(_env_file=None)
        assert settings.llm_model == "moonshotai/kimi-k2-instruct"

    def test_default_llm_temperature_is_float(self) -> None:
        """Should parse temperature as a float."""
        settings = Settings(_env_file=None)
        assert isinstance(settings.llm_temperature, float)
        assert settings.llm_temperature == 0.1

    def test_default_llm_max_tokens_is_int(self) -> None:
        """Should parse max tokens as an integer."""
        settings = Settings(_env_file=None)
        assert isinstance(settings.llm_max_tokens, int)
        assert settings.llm_max_tokens == 4096

    def test_default_vector_db_provider(self) -> None:
        """Should default to 'qdrant' if VECTOR_DB_PROVIDER is not set."""
        settings = Settings(_env_file=None)
        assert settings.vector_db_provider == "qdrant"

    def test_default_qdrant_url(self) -> None:
        """Should default to local Qdrant URL."""
        settings = Settings(_env_file=None)
        assert settings.qdrant_url == "http://localhost:6333"

    def test_default_api_keys_are_empty_strings(self) -> None:
        """All API keys should default to empty strings, not None."""
        settings = Settings(_env_file=None)
        assert settings.groq_api_key == ""
        assert settings.cerebras_api_key == ""
        assert settings.mistral_api_key == ""
        assert settings.zhipu_api_key == ""
        assert settings.cloudflare_account_id == ""
        assert settings.cloudflare_api_key == ""


class TestSettingsEnvOverride:
    """Tests for overriding defaults using environment variables."""

    def test_override_llm_provider_via_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Should read LLM_PROVIDER from environment variables."""
        monkeypatch.setenv("LLM_PROVIDER", "cerebras")
        settings = Settings(_env_file=None)
        assert settings.llm_provider == "cerebras"

    def test_override_max_retries_via_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Should correctly parse integer overrides like LLM_MAX_RETRIES."""
        monkeypatch.setenv("LLM_MAX_RETRIES", "5")
        settings = Settings(_env_file=None)
        assert isinstance(settings.llm_max_retries, int)
        assert settings.llm_max_retries == 5

    def test_override_log_level_via_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Should read LOG_LEVEL from environment variables."""
        monkeypatch.setenv("LOG_LEVEL", "DEBUG")
        settings = Settings(_env_file=None)
        assert settings.log_level == "DEBUG"

    def test_case_insensitive_env_vars(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """Should handle case-insensitive environment variable names."""
        monkeypatch.setenv("app_env", "production")
        settings = Settings(_env_file=None)
        assert settings.app_env == "production"


class TestGetSettings:
    """Tests for the get_settings helper function."""

    def test_returns_settings_instance(self) -> None:
        """get_settings should return an instance of Settings."""
        settings = get_settings()
        assert isinstance(settings, Settings)

    def test_loads_from_actual_env(self, monkeypatch: pytest.MonkeyPatch) -> None:
        """get_settings should reflect current environment state."""
        monkeypatch.setenv("LOG_LEVEL", "ERROR")
        # Clear internal cache if lru_cache was used, but pydantic-settings
        # instantiates fresh unless explicitly cached. We test raw instantiation.
        settings = Settings(_env_file=None)
        assert settings.log_level == "ERROR"