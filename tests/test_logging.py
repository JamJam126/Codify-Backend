"""Tests for app.common.logging module."""

from __future__ import annotations

import logging

import pytest

from app.common.logging import get_logger, log_with_context, setup_logging


class TestSetupLogging:
    """Tests for the setup_logging function."""

    def test_sets_root_logger_to_debug(self) -> None:
        """setup_logging should set root logger to DEBUG level."""
        setup_logging("DEBUG")
        assert logging.getLogger().level == logging.DEBUG

    def test_sets_root_logger_to_warning(self) -> None:
        """setup_logging should set root logger to WARNING level."""
        setup_logging("WARNING")
        assert logging.getLogger().level == logging.WARNING

    def test_defaults_to_info_for_invalid_level(self) -> None:
        """setup_logging should default to INFO if given an invalid string."""
        setup_logging("INVALID_LEVEL_STRING")
        assert logging.getLogger().level == logging.INFO

    def test_does_not_add_duplicate_handlers(self) -> None:
        """setup_logging should not add handlers if they already exist."""
        setup_logging("INFO")
        initial_handler_count = len(logging.getLogger().handlers)
        setup_logging("INFO")
        assert len(logging.getLogger().handlers) == initial_handler_count


class TestGetLogger:
    """Tests for the get_logger function."""

    def test_returns_logger_instance(self) -> None:
        """get_logger should return a logging.Logger instance."""
        logger = get_logger("test.module")
        assert isinstance(logger, logging.Logger)

    def test_returns_logger_with_correct_name(self) -> None:
        """get_logger should return a logger with the exact name provided."""
        logger = get_logger("my.custom.module")
        assert logger.name == "my.custom.module"


class TestLogWithContext:
    """Tests for the log_with_context function."""

    def test_logs_message_without_context(self, caplog: pytest.LogCaptureFixture) -> None:
        """log_with_context should log basic messages when context is None."""
        logger = get_logger("test.no_context")
        with caplog.at_level(logging.INFO):
            log_with_context(logger, logging.INFO, "simple message")
        
        assert "simple message" in caplog.text

    def test_logs_message_with_context(self, caplog: pytest.LogCaptureFixture) -> None:
        """log_with_context should accept context dict without crashing."""
        logger = get_logger("test.with_context")
        context_data = {"user_id": "123", "action": "submit"}
        
        with caplog.at_level(logging.INFO):
            log_with_context(logger, logging.INFO, "context message", context=context_data)
        
        assert "context message" in caplog.text

    def test_handles_explicit_none_context(self, caplog: pytest.LogCaptureFixture) -> None:
        """log_with_context should handle explicit None context gracefully."""
        logger = get_logger("test.none_context")
        
        with caplog.at_level(logging.WARNING):
            log_with_context(logger, logging.WARNING, "warning message", context=None)
        
        assert "warning message" in caplog.text