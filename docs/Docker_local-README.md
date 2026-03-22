# 🚀 Codify Backend — Quick Start Guide for local

## ✅ Requirements

Before you start, make sure you have these installed:

| Tool | Version | Download |
|------|---------|----------|
| **Docker Desktop** | Latest | https://www.docker.com/products/docker-desktop |
| **Git** | Latest | https://git-scm.com/downloads |

> ⚠️ That's it! Docker handles everything else (Node.js, PostgreSQL, Redis) for you.

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/JamJam126/Codify-Backend.git
cd Codify-Backend
```

---

## 🔐 Step 2 — Setup Environment Variables

```bash
cp .env.example .env
```

Open `.env` and make sure it has these values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/codify"
JWT_SECRET=supersecretkey12345
JWT_EXPIRES_IN=3600
CODE_RUNNER_VOLUME_NAME=code-temp
DB_VOLUME_NAME=codifydb
```

---

## 📄 Step 3 — Check .dockerignore File

Make sure a `.dockerignore` file exists in the project root. If it doesn't, create one and add the following:

```
node_modules
dist
.env
.git
npm-debug.log
```

> ⚠️ Without this file, Docker may fail to build with errors like `cannot replace to directory node_modules`. This file tells Docker to skip your local `node_modules` and use the ones installed inside the container instead.

---

## 🐳 Step 4 — Build the Code Runner Image

```bash
cd code-runner
docker build -t code-runner-c .
cd ..
```

---

## ▶️ Step 5 — Start Everything

```bash
docker compose up --build
```

This will start all services together:

| Service | URL |
|---------|-----|
| API | http://localhost:3000 |
| Swagger Docs | http://localhost:3000/api |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

> ⏳ First time will take 5–10 minutes to download and build images. Wait until you see all containers running.

---

## 🌱 Step 6 — Seed the Database (First Time Only)

Open a **new terminal** while containers are running:

```bash
docker compose exec app npx prisma db seed
```
> ✅ You only need to run this **once**. Skip this step on future startups.

---

## 🛑 Stop All Services

```bash
docker compose down
```

---

## 🔁 Next Time You Start

No need to rebuild everything. Just run:

```bash
docker compose up
```


## 📋 Quick Summary

```bash
# 1. Clone
git clone https://github.com/JamJam126/Codify-Backend.git
cd Codify-Backend

# 2. Setup env
cp .env.example .env

# 3. Make sure .dockerignore exists with: node_modules, dist, .env, .git, npm-debug.log

# 4. Build code runner
cd code-runner && docker build -t code-runner-c . && cd ..

# 5. Start everything
docker compose up --build

# 6. Seed database (new terminal, first time only)
docker compose exec app npx prisma db seed
```
