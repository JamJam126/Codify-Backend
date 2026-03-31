"""Structured logging configuration for the Evaluator service."""

from __future__ import annotations

import logging
import sys
from typing import Any

DEFAULT_LOG_FORMAT = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
DEFAULT_DATE_FORMAT = "%Y-%m-%d %H:%M:%S"


def setup_logging(log_level: str = "INFO") -> None:
    """Configure structured logging for the application.

    Sets up the root logger with a standard format to ensure consistent
    log output across all modules.

    Args:
        log_level: The minimum log level to capture (e.g., 'INFO', 'DEBUG').
    """
    numeric_level = getattr(logging, log_level.upper(), logging.INFO)

    root_logger = logging.getLogger()
    root_logger.setLevel(numeric_level)

    # Prevent adding duplicate handlers if called multiple times
    if not root_logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(DEFAULT_LOG_FORMAT, datefmt=DEFAULT_DATE_FORMAT)
        handler.setFormatter(formatter)
        root_logger.addHandler(handler)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger instance.

    Args:
        name: The logger name, typically __name__ of the calling module.

    Returns:
        A configured logger instance.
    """
    return logging.getLogger(name)


def log_with_context(
    logger: logging.Logger,
    level: int,
    message: str,
    context: dict[str, Any] | None = None,
) -> None:
    """Log a message with structured context.

    Uses the logging module's extra parameter to pass structured data,
    which can be picked up by structured logging processors if needed.

    Args:
        logger: The logger instance to use.
        level: The logging level (e.g., logging.INFO).
        message: The primary log message.
        context: Additional structured context to include in the log record.
    """
    if context:
        logger.log(level, message, extra=context)
    else:
        logger.log(level, message)