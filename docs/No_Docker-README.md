# 🚀 Codify Backend — Local Setup Without Docker

## ✅ Requirements

| Tool | Download |
|---|---|
| **Node.js 20 LTS** | https://nodejs.org |
| **pnpm** | https://pnpm.io/installation |
| **PostgreSQL 16** | https://www.postgresql.org/download |
| **Redis 7** | https://redis.io/docs/install |
| **Git** | https://git-scm.com/downloads |

---

## 📥 Step 1 — Clone the Repository

```bash
git clone https://github.com/JamJam126/Codify-Backend.git
cd Codify-Backend
```

---

## 🗄️ Step 2 — Setup PostgreSQL

```bash
psql -U postgres
```

```sql
CREATE USER codify WITH PASSWORD 'localpassword';
CREATE DATABASE codify OWNER codify;
GRANT ALL PRIVILEGES ON DATABASE codify TO codify;
\q
```

---

## ⚡ Step 3 — Start Redis

**Mac:**
```bash
brew services start redis
```

**Linux:**
```bash
sudo systemctl start redis
```

**Windows:** Run `redis-server.exe`

---

## 📦 Step 4 — Install Dependencies

```bash
pnpm install
```

---

## 🔐 Step 5 — Setup Environment Variables

```bash
cp .env.example .env
```

Fill in `.env`:

```env
DATABASE_URL=postgresql://codify:localpassword@localhost:5432/codify
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=any-random-string-at-least-32-chars
PORT=3000
NODE_ENV=development
```

---

## 🗃️ Step 6 — Run Migrations & Seed

```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

---

## ▶️ Step 7 — Start the Backend

```bash
pnpm build
node dist/src/main
```

API is now running at `http://localhost:3000/api`

---

## 📋 Quick Summary

```bash
git clone https://github.com/JamJam126/Codify-Backend.git
cd Codify-Backend
pnpm install
cp .env.example .env        
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
pnpm build
node dist/main
```