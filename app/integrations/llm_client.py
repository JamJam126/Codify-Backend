"""LLM client wrapper for interacting with OpenAI-compatible providers."""

from __future__ import annotations

import logging
from typing import Any

from openai import AsyncOpenAI

from app.common.exceptions import LLMClientError
from app.config import Settings

logger = logging.getLogger(__name__)

GROQ_BASE_URL = "https://api.groq.com/openai/v1"
CEREBRAS_BASE_URL = "https://api.cerebras.ai/v1"
MISTRAL_BASE_URL = "https://api.mistral.ai/v1"
ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4/"


def _get_base_url(provider: str) -> str:
    """Return the base URL for the specified LLM provider.

    Args:
        provider: The LLM provider name (e.g., 'groq', 'cerebras').

    Returns:
        The API base URL for the provider.

    Raises:
        LLMClientError: If the provider is not supported.
    """
    urls = {
        "groq": GROQ_BASE_URL,
        "cerebras": CEREBRAS_BASE_URL,
        "mistral": MISTRAL_BASE_URL,
        "zhipu": ZHIPU_BASE_URL,
        "openai": "https://api.openai.com/v1",
    }
    if provider not in urls:
        raise LLMClientError(
            f"Unsupported LLM provider: {provider}",
            provider=provider,
        )
    return urls[provider]


def _get_api_key(settings: Settings) -> str:
    """Extract the correct API key based on the configured provider.

    Args:
        settings: The application settings containing API keys.

    Returns:
        The API key string.

    Raises:
        LLMClientError: If the required API key is missing or empty.
    """
    key_map = {
        "groq": settings.groq_api_key,
        "cerebras": settings.cerebras_api_key,
        "mistral": settings.mistral_api_key,
        "zhipu": settings.zhipu_api_key,
        "openai": "",  # OpenAI uses OPENAI_API_KEY env var automatically
    }

    api_key = key_map.get(settings.llm_provider, "")

    if not api_key and settings.llm_provider != "openai":
        raise LLMClientError(
            f"API key missing for provider: {settings.llm_provider}",
            provider=settings.llm_provider,
        )
    
    return api_key


class LLMClient:
    """Async wrapper for OpenAI-compatible LLM APIs.

    Handles provider routing, authentication, and retry logic automatically
    based on the application settings.
    """

    def __init__(self, settings: Settings) -> None:
        """Initialize the LLM client.

        Args:
            settings: Application settings for provider and API key configuration.
        """
        self._settings = settings
        self._provider = settings.llm_provider

        base_url = _get_base_url(self._provider)
        api_key = _get_api_key(settings)

        kwargs: dict[str, Any] = {
            "base_url": base_url,
            "max_retries": settings.llm_max_retries,
            "timeout": 60.0,
        }

        if api_key:
            kwargs["api_key"] = api_key

        self._client = AsyncOpenAI(**kwargs)

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate a completion from the LLM.

        Args:
            system_prompt: The system-level instructions.
            user_prompt: The user-level prompt containing the payload.

        Returns:
            The generated text content from the LLM.

        Raises:
            LLMClientError: If the API call fails after retries.
        """
        logger.info(
            "Calling LLM provider",
            extra={"provider": self._provider, "model": self._settings.llm_model},
        )

        response_format = None
        if self._settings.llm_response_format == "json_object":
            response_format = {"type": "json_object"}

        try:
            response = await self._client.chat.completions.create(
                model=self._settings.llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=self._settings.llm_temperature,
                max_tokens=self._settings.llm_max_tokens,
                response_format=response_format,
            )
        except Exception as error:
            logger.error(
                "LLM API call failed",
                extra={"provider": self._provider, "error": str(error)},
            )
            raise LLMClientError(
                f"Failed to get response from {self._provider}: {error}",
                provider=self._provider,
            ) from error

        content = response.choices[0].message.content
        if content is None:
            raise LLMClientError(
                "LLM returned empty response content",
                provider=self._provider,
            )

        logger.info("LLM generation successful")
        return content