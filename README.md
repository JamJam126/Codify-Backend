Here is the updated README with the AutoEval‑C integration section added at the bottom.

---

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

1. Install project dependencies:

```bash
pnpm install
```

1. Install additional dependencies for the code runner:

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

### Verify schema exists, check folder structure

```
src/
  prisma/
    schema.prisma
```

### If the database does **not yet exist**, create it manually in PostgreSQL

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

- DB client
- TS types (User, Post, etc.)

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

If the migrations folder is empty → the project creator didn't include them, so you must run:

```bash
npx prisma db push
```

(creates tables without migrations).

> ⚠ Never run db push if migrations already exist!

### Seed the database with initial data (recommended)

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

The Dockerfile is already provided inside the `code-runner` folder. Navigate into it and build the image:

```bash
cd code-runner
docker build -t code-runner-c .
cd ..
```

Verify the image was created:

```bash
docker images | grep code-runner-c
```

Expected output:

```
code-runner-c    latest    abc123def456    2 minutes ago    200MB
```

## 🏃 Run Development Server

```bash
pnpm start:dev
```

## 📑 API Documentation (Swagger)

Swagger (OpenAPI) documentation is available once the server is running:

<http://localhost:3000/api>

## 🐳 Docker Compose Setup

Docker Compose runs everything together — app, Redis, PostgreSQL, and pgAdmin — in one command. Use this instead of running services manually.

### 1. Stop any running Redis container to avoid port conflicts

```bash
docker stop redis
docker rm redis
```

### 2. Remove node_modules if present

On Mac/Linux:

```bash
rm -rf node_modules
```

On Windows (PowerShell):

```powershell
Remove-Item -Recurse -Force node_modules
```

### 3. Build the code runner image

```bash
cd code-runner
docker build -t code-runner-c .
cd ..
```

### 4. Start all services

```bash
docker compose up --build
```

Once running, the API is available at:

```
http://localhost:3000
```

### Services

| Service    | URL                       |
|------------|---------------------------|
| API        | <http://localhost:3000>     |
| Swagger    | <http://localhost:3000/api> |
| PostgreSQL | localhost:5432            |
| Redis      | localhost:6379            |


### Stop all services

```bash
docker compose down
```

## 🧪 Unit Tests

### Test Location

- All unit tests are co-located with the module they test:

```
src/
  modules/
    classrooms/
      classroom.service.ts
      classroom.service.spec.ts
      classroom.controller.ts
      classroom.controller.spec.ts
    assignments/
      assignment.service.ts
      assignment.service.spec.ts
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

> Unit tests use mocks — no database or Redis setup needed.

## 🧪 Testing Code Runner

Submit a code execution job:

```bash
curl -X POST http://localhost:3000/code-runner/run \
  -H "Content-Type: application/json" \
  -d '{
    "language": "c",
    "code": "#include \nint main() {\n    printf(\"Hello World!\\n\");\n    return 0;\n}"
  }'
```

Expected response:

```json
{
  "jobId": "1",
  "status": "queued"
}
```

Check job status:

```bash
curl http://localhost:3000/code-runner/status/1
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

```bash
docker stop redis
docker rm redis
```

## 🔁 Flow Summary

### Local Development

```bash
pnpm install
npx prisma generate
npx prisma migrate dev
cd code-runner && docker build -t code-runner-c . && cd ..
docker run -d --name redis -p 6379:6379 redis:latest
pnpm start:dev
```

### Docker Compose

```bash
docker stop redis && docker rm redis
cd code-runner && docker build -t code-runner-c . && cd ..
docker compose up --build
```

## 📘 Common Prisma Workflows

| Situation / Action                    | Command                  | Notes                                                  |
|---------------------------------------|--------------------------|--------------------------------------------------------|
| First-time database setup             | `npx prisma migrate dev` | Applies migrations & creates DB tables                 |
| No migrations exist                   | `npx prisma db push`     | Creates tables directly from schema without migrations |
| Schema (`schema.prisma`) changed      | `npx prisma migrate dev` | Generates new migration and updates DB                 |
| Database changed manually             | `npx prisma db pull`     | Updates `schema.prisma` to match DB                    |
| Prisma client missing / types missing | `npx prisma generate`    | Regenerates client without touching DB                 |

## 🧱 Project Structure and Architecture Overview

See [docs/ORGANIZATION.md](docs/ORGANIZATION.md) for full explanation of folders and modules.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for backend architecture and module flow.

---

## 🤖 AI Evaluation with AutoEval‑C

This system integrates [AutoEval‑C](https://github.com/NhaNhaa/Codify.works-Evaluation), an AI‑powered C code evaluation service built with FastAPI, ChromaDB, and constrained AI agents.

### How it works

1. **Teacher uploads assignment files** (`instructions.md`, `starter_code.c`, `teacher_correction_code.c`).
2. **AutoEval‑C extracts/generates micro skills** (Phase 1).
3. **Student submits code** – the request is enqueued via BullMQ.
4. **Evaluation runs asynchronously** – the queue processor calls AutoEval‑C and stores the result.
5. **Results are fetched** – PASS/FAIL feedback per skill with line references and recommended fixes.

### Prerequisites for AutoEval‑C

- **Python 3.10+** (the service runs in its own Docker container)
- **Groq API key** (or other supported provider – see the [AutoEval‑C README](https://github.com/NhaNhaa/Codify.works-Evaluation))
- **Docker** (already required)

### Environment Variables

Add the following to your `.env` file (used by docker-compose):

```env
# AutoEval‑C
GROQ_API_KEY=your_groq_api_key_here
```

### Adding AutoEval‑C to Docker Compose

The `docker-compose.yaml` already includes a `codify_evaluation` service. If you haven't added it yet, copy the service definition from the repository or use the snippet below:

```yaml
codify_evaluation:
  build:
    context: ../Codify.works-Evaluation    # adjust path to your Python project
    dockerfile: docker/Dockerfile
  container_name: codify_evaluation
  ports:
    - "8000:8000"                 # optional, for direct Swagger access
  environment:
    GROQ_API_KEY: ${GROQ_API_KEY}
    LLM_PROVIDER: groq
    AGENT1_MODEL: moonshotai/kimi-k2-instruct
    AGENT2_MODEL: moonshotai/kimi-k2-instruct
    AGENT3_MODEL: moonshotai/kimi-k2-instruct
  volumes:
    - ./data/inputs:/app/data/inputs
    - ./data/outputs:/app/data/outputs
    - ./data/chroma_storage:/app/data/chroma_storage
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
    interval: 10s
    timeout: 5s
    retries: 5
    start_period: 30s
  restart: unless-stopped
```

Make sure the `context` points to the folder containing your AutoEval‑C code.

### Evaluation Endpoints

The NestJS backend exposes the following endpoints under `/evaluation`:

| Method | Endpoint                              | Description                         |
|--------|---------------------------------------|-------------------------------------|
| POST   | `/evaluation/setup`                   | Upload assignment files (multipart) |
| POST   | `/evaluation/extract-skills`          | Run Phase 1 (skill extraction)      |
| POST   | `/evaluation/submit`                  | Submit student code (enqueues job)  |
| GET    | `/evaluation/result/:studentId`       | Fetch evaluation result (JSON+MD)   |
| DELETE | `/evaluation/result/:studentId`       | Delete output files                 |
| DELETE | `/evaluation/assignment/:assignmentId`| Delete everything for an assignment |
| GET    | `/evaluation/skills/:assignmentId`    | View stored micro skills            |

All endpoints require a valid JWT token (use the `Authorization: Bearer <token>` header).

### Testing the Evaluation Flow

1. **Login to get a token**  
   ```bash
   curl -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"alice@school.com","password":"owner123"}'
   ```
   Save the returned `access_token`.

2. **Upload assignment files**  
   ```bash
   curl -X POST http://localhost:3000/evaluation/setup \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "assignment_id=lab_01" \
     -F "instructions=@../Codify.works/Upload/instructions.md" \
     -F "starter_code=@../Codify.works/Upload/starter_code.c" \
     -F "teacher_code=@../Codify.works/Upload/teacher_correction_code.c"
   ```

3. **Extract skills**  
   ```bash
   curl -X POST http://localhost:3000/evaluation/extract-skills \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"assignment_id": "lab_01", "force_regenerate": true}'
   ```

4. **Submit a student**  
   ```bash
   curl -X POST http://localhost:3000/evaluation/submit \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "assignment_id=lab_01" \
     -F "student_id=student_01" \
     -F "student_code=@../Codify.works/Upload/student_01.c"
   ```
   Returns a `jobId`.

5. **Poll for the result**  
   ```bash
   curl http://localhost:3000/evaluation/result/student_01?assignmentId=lab_01 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

   When the job completes, you'll receive the full evaluation report (JSON + Markdown).

### AutoEval‑C Direct Access (Optional)

To view the AutoEval‑C Swagger UI directly, open [http://localhost:8000/docs](http://localhost:8000/docs). This is useful for debugging but not required for normal operation.

### Troubleshooting

- **Missing API key**: Ensure `GROQ_API_KEY` is set in your `.env` file and passed to the `codify_evaluation` container.
- **Evaluation job never finishes**: Check the logs of the `codify_evaluation` container (`docker logs codify_evaluation`) and the NestJS app.
- **Health check fails**: Make sure `curl` is installed in the Python Docker image (the provided Dockerfile includes it).
- **Port conflicts**: If port 8000 is already in use, change the `ports` mapping or remove it (the internal communication via `http://codify_evaluation:8000` still works without host port mapping).

---

Now the README includes full instructions for setting up and using the AI evaluation module.