# Codify - Backend

This repository contains the full backend system for Codify.
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

1. Clone the project

```bash
git clone https://github.com/JamJam126/Codify-Backend.git
cd EduAI-GitHub-Assistant-Backend
```

2. Install project dependencies:
```bash
pnpm install
```

3. Install additional dependencies for the code runner:
```bash
pnpm install bullmq dockerode redis uuid
pnpm install -D @types/dockerode
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
Prisma **requires** `DATABASE_URL` to be defined.

## 🗄 Database Setup

### Verify schema exists, check folder structure:

```
src/
  prisma/
    schema.prisma
```

### If the database does **not yet exist**, create it manually in PostgreSQL:

```bash
createdb codify
```

Or inside `psql`:

```sql
CREATE DATABASE codify;
```

### Generate Prisma
```bash
npx prisma generate
```
This step **reads your schema.prisma** and creates:

* DB client
* TS types (User, Post, etc.)

Verify:
```bash
node_modules/@prisma/client/
```

### Apply Migration
If the project already contains `/prisma/migrations/**`, run:

```bash
npx prisma migrate dev
```

This:

1. Compares schema ↔ DB
2. Applies needed SQL
3. Regenerates Prisma client

If the migrations folder is empty → the project creator didn’t include them, so you must run:

```bash
npx prisma db push
```

(creates tables without migrations).

> ⚠ Never run db push if migrations already exist!

### Seed the database with initial data (recommended):
```bash
npx prisma db seed
```

## 🐳 Docker Setup for Code Runner

### 1. Run Redis

Redis is required for BullMQ job queue management.
```bash
docker run -d --name redis -p 6379:6379 redis:latest
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
docker build -f Dockerfile -t code-runner-c .
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

## 📑 API Documentation (Swagger)

Swagger (OpenAPI) documentation is available once the server is running:

http://localhost:3000/api

## 🧪 Unit Tests

### Test Location
- All unit tests are co-located with the module they test:
```
src/
  modules/
    classrooms/
      classroom.service.ts
      classroom.service.spec.ts      # tests for classroom.service.ts
      classroom.controller.ts
      classroom.controller.spec.ts   # tests for classroom.controller.ts
    assignments/
      assignment.service.ts
      assignment.service.spec.ts     # tests for assignment.service.ts
```

### Running Unit Tests
Make sure dependencies are installed:

```bash
pnpm install
```

Run the unit tests:
```bash
pnpm test
```

Or run in watch mode (reruns on file change):
```bash
pnpm test:watch
```
Notes

Unit tests use fake repositories or mocks, so no database or Redis setup is needed.

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

## 🔁 Flow Summary

After cloning the project, run these commands in order:

```bash
pnpm install                  # Install dependencies
npx prisma generate           # Generate Prisma client & TS types
npx prisma migrate dev        # Apply migrations & create tables (or use db push if no migrations)
pnpm start:dev                # Start the development server
```


## 📘 Common Prisma Workflows

| Situation / Action | Command | Notes |
|-------------------|---------|-------|
| First-time database setup             | `npx prisma migrate dev` | Applies migrations & creates DB tables |
| No migrations exist                   | `npx prisma db push`     | Creates tables directly from schema without migrations |
| Schema (`schema.prisma`) changed      | `npx prisma migrate dev` | Generates new migration and updates DB |
| Database changed manually             | `npx prisma db pull`     | Updates `schema.prisma` to match DB |
| Prisma client missing / types missing | `npx prisma generate`    | Regenerates client without touching DB |


## 🧱 Project Structure and Architecture Overview

See [docs/ORGANIZATION.md](docs/ORGANIZATION.md) for full explanation of folders and modules. 

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for backend architecture and module flow.

---