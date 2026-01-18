# Dockerfile.c
FROM gcc:latest

# Set working directory inside the container
WORKDIR /code

# Copy everything from your current folder into /code
COPY . /code

# Keep container alive (so Node.js can connect and run commands)
CMD ["sleep", "infinity"]