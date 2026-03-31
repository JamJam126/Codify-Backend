"""Tests for app.integrations.llm_client module."""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from openai import AuthenticationError, BadRequestError

from app.common.exceptions import LLMClientError
from app.config import Settings
from app.integrations.llm_client import LLMClient, _get_api_key, _get_base_url


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def mock_settings() -> Settings:
    """Provide a Settings instance with Groq configured."""
    return Settings(
        _env_file=None,
        llm_provider="groq",
        groq_api_key="test-groq-key",
    )


# =============================================================================
# Unit Tests for Helpers
# =============================================================================


class TestGetBaseUrl:
    """Tests for the _get_base_url helper function."""

    def test_returns_groq_url(self) -> None:
        """Should return the correct base URL for groq."""
        assert "groq.com" in _get_base_url("groq")

    def test_returns_cerebras_url(self) -> None:
        """Should return the correct base URL for cerebras."""
        assert "cerebras.ai" in _get_base_url("cerebras")

    def test_raises_for_unknown_provider(self) -> None:
        """Should raise LLMClientError for unsupported providers."""
        with pytest.raises(LLMClientError) as exc_info:
            _get_base_url("unknown_provider")
        assert exc_info.value.provider == "unknown_provider"


class TestGetApiKey:
    """Tests for the _get_api_key helper function."""

    def test_returns_groq_key(self, mock_settings: Settings) -> None:
        """Should extract the Groq API key from settings."""
        assert _get_api_key(mock_settings) == "test-groq-key"

    def test_raises_when_key_missing(self) -> None:
        """Should raise LLMClientError if provider key is empty."""
        settings = Settings(_env_file=None, llm_provider="groq", groq_api_key="")
        with pytest.raises(LLMClientError) as exc_info:
            _get_api_key(settings)
        assert "missing" in str(exc_info.value).lower()

    def test_allows_empty_for_openai(self) -> None:
        """Should allow empty key for native openai (relies on env var)."""
        settings = Settings(_env_file=None, llm_provider="openai")
        assert _get_api_key(settings) == ""


# =============================================================================
# Unit Tests for LLMClient
# =============================================================================


class TestLLMClientInit:
    """Tests for LLMClient initialization."""

    @patch("app.integrations.llm_client.AsyncOpenAI")
    def test_initializes_with_correct_base_url(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should pass the correct base_url to the OpenAI client."""
        LLMClient(mock_settings)
        call_kwargs = mock_openai.call_args[1]
        assert "groq.com" in call_kwargs["base_url"]

    @patch("app.integrations.llm_client.AsyncOpenAI")
    def test_initializes_with_retry_config(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should pass max_retries from settings to the OpenAI client."""
        LLMClient(mock_settings)
        call_kwargs = mock_openai.call_args[1]
        assert call_kwargs["max_retries"] == mock_settings.llm_max_retries

    @patch("app.integrations.llm_client.AsyncOpenAI")
    def test_raises_on_unsupported_provider(self, mock_openai: MagicMock) -> None:
        """Should raise LLMClientError if provider is invalid during init."""
        bad_settings = Settings(_env_file=None, llm_provider="bad_provider")
        with pytest.raises(LLMClientError):
            LLMClient(bad_settings)
        mock_openai.assert_not_called()


class TestLLMClientGenerate:
    """Tests for the LLMClient.generate method."""

    @pytest.mark.asyncio
    @patch("app.integrations.llm_client.AsyncOpenAI")
    async def test_generate_returns_content(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should return the string content from the LLM response."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"result": "success"}'

        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance

        client = LLMClient(mock_settings)
        result = await client.generate("System", "User")

        assert result == '{"result": "success"}'
        mock_client_instance.chat.completions.create.assert_called_once()

    @pytest.mark.asyncio
    @patch("app.integrations.llm_client.AsyncOpenAI")
    async def test_generate_passes_json_format(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should pass response_format when configured for json_object."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = "{}"

        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance

        client = LLMClient(mock_settings)
        await client.generate("System", "User")

        call_kwargs = mock_client_instance.chat.completions.create.call_args[1]
        assert call_kwargs["response_format"] == {"type": "json_object"}

    @pytest.mark.asyncio
    @patch("app.integrations.llm_client.AsyncOpenAI")
    async def test_generate_raises_on_api_error(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should wrap API errors in LLMClientError."""
        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.side_effect = AuthenticationError("Bad key", response=MagicMock(), body=None)
        mock_openai.return_value = mock_client_instance

        client = LLMClient(mock_settings)
        
        with pytest.raises(LLMClientError) as exc_info:
            await client.generate("System", "User")
        
        assert exc_info.value.provider == "groq"

    @pytest.mark.asyncio
    @patch("app.integrations.llm_client.AsyncOpenAI")
    async def test_generate_raises_on_empty_content(self, mock_openai: MagicMock, mock_settings: Settings) -> None:
        """Should raise LLMClientError if the response content is None."""
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = None

        mock_client_instance = AsyncMock()
        mock_client_instance.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client_instance

        client = LLMClient(mock_settings)
        
        with pytest.raises(LLMClientError) as exc_info:
            await client.generate("System", "User")
        
        assert "empty" in str(exc_info.value).lower()