FROM debian:12-slim

RUN apt update && apt install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code-temp