"""CLI script to check the health of the Evaluator service."""

from __future__ import annotations

import sys

import httpx

HEALTH_URL = "http://localhost:8000/health"
TIMEOUT_SECONDS = 5


def main() -> None:
    """Ping the health endpoint and exit with appropriate code."""
    try:
        response = httpx.get(HEALTH_URL, timeout=TIMEOUT_SECONDS)
        
        if response.status_code == 200 and response.json().get("status") == "ok":
            print("Service is healthy.")
            sys.exit(0)
        else:
            print(f"Unhealthy status code: {response.status_code}")
            sys.exit(1)
            
    except httpx.ConnectError:
        print("Failed to connect to the service.")
        sys.exit(1)
        
    except httpx.TimeoutException:
        print("Health check timed out.")
        sys.exit(1)


if __name__ == "__main__":
    main()