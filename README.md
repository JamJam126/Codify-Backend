# EduAI GitHub Assistant - Backend

This repository contains the full backend system for the EduAI platform.
It includes user authentication and management, assignment handling, GitHub integration, code execution, AI evaluation, and all supporting modules, built with NestJS, Prisma, and PostgreSQL.

The codebase follows a modular architecture and provides documentation for structure, architecture, and development guidelines.

## 🚀 Tech Stack

- **NestJS**
- **Prisma ORM**
- **PostgreSQL**
- **Docker & Dockerode**
- **Redis & BullMQ**
- **pnpm**

## 📋 Prerequisites

Make sure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Docker** (v20 or higher)
- **PostgreSQL** (v14 or higher)

## 📦 Installation

Install project dependencies:
```bash
pnpm install
```

Install additional dependencies for the code runner:
```bash
pnpm install bullmq dockerode redis uuid
pnpm install -D @types/dockerode
```

## 🗄 Database Setup

Run migrations to initialize the database:
```bash
npx prisma migrate dev
```

Seed the database with initial data:
```bash
npx prisma db seed
```

## 🐳 Docker Setup for Code Runner

### 1. Run Redis

Redis is required for BullMQ job queue management.
```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

Verify Redis is running:
```bash
docker ps | grep redis
```

Test Redis connection:
```bash
redis-cli ping
# Should return: PONG
```

### 2. Build Docker Image for C Runner

Create `Dockerfile.c` in the project root:
```dockerfile
FROM gcc:latest

WORKDIR /code

COPY . /code

CMD ["sleep", "infinity"]
```

Build the Docker image:
```bash
docker build -f Dockerfile.c -t code-runner-c .
```

Verify the image was created:
```bash
docker images | grep code-runner-c
```

Expected output:
```
code-runner-c    latest    abc123def456    2 minutes ago    1.2GB
```

## 🏃 Run Development Server
```bash
pnpm start:dev
```

You should see logs indicating the worker has started:
```
[CodeRunnerProcessor] Initializing CodeRunner Worker...
```

## 🔐 Environment Variables

Create a `.env` file from the example:
```bash
cp .env.example .env
```

Update variables as needed:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/eduai"
JWT_SECRET="your-secret-key"
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379
PORT=3000
```

## 🧪 Testing Code Runner

Submit a code execution job:
```bash
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "code": "#include <stdio.h>\nint main() {\n    printf(\"Hello World!\\n\");\n    return 0;\n}"
  }'
```

Expected response:
```json
{
  "jobId": "1",
  "status": "queued"
}
```

Check job status (replace `1` with actual job ID):
```bash
curl http://localhost:3000/status/1
```

Expected response:
```json
{
  "jobId": "1",
  "state": "completed",
  "result": {
    "stdout": "Hello World!",
    "status": "success"
  }
}
```

## 🛑 Stop Services

Stop and remove Redis container:
```bash
docker stop redis
docker rm redis
```

## 🧱 Project Structure

See [docs/ORGANIZATION.md](docs/ORGANIZATION.md) for full explanation of folders and modules.

## 🧩 Architecture Overview

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for backend architecture and module flow.

