# 🚀 Codify Backend — Production Server Deployment Guide

## ✅ Requirements

Before you start, make sure you have:

| Requirement | Details |
|---|---|
| **AWS Account** | With EC2 access |
| **EC2 Instance** | t3.small — Amazon Linux 2023 — 30GB storage |
| **Domain Name** | e.g. `codify.works` pointed to your EC2 Elastic IP |
| **SSH Key (.pem)** | Downloaded when creating the EC2 instance |

> ⚠️ You do NOT need Docker installed locally — everything runs on the server.

---

## 🖥️ Step 1 — Launch EC2 Instance on AWS

1. Go to **AWS Console → EC2 → Launch Instance**
2. Configure:
   - **AMI**: Amazon Linux 2023 (64-bit x86)
   - **Instance Type**: `t3.small` (minimum — t2.micro is too small)
   - **Key Pair**: Create new → RSA → `.pem` → download and save
   - **Storage**: 30 GB gp3
3. Under **Security Group**, add these inbound rules:

| Port | Source | Purpose |
|---|---|---|
| 22 | My IP only | SSH access |
| 80 | 0.0.0.0/0 | HTTP + SSL certificate challenge |
| 443 | 0.0.0.0/0 | HTTPS production traffic |

4. Go to **EC2 → Elastic IPs → Allocate → Associate** to your instance
   > ⚠️ Without Elastic IP, your server IP changes every reboot and breaks your domain.

---

## 🌐 Step 2 — Point Your Domain to EC2

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

```
A record   @    → <YOUR_ELASTIC_IP>
A record   www  → <YOUR_ELASTIC_IP>
```

Verify DNS is live before continuing:

```bash
ping codify.works
# Must return your Elastic IP — wait 5–10 min if not yet
```

---

## 🔌 Step 3 — SSH Into the Server

```bash
# Connect
ssh -i your-key.pem ec2-user@<YOUR_ELASTIC_IP>
```

---

## 🐳 Step 4 — Install Docker on the Server

```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

Install Docker Compose:

```bash
sudo mkdir -p /usr/local/lib/docker/cli-plugins
sudo curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
```

Upgrade Docker Buildx:

```bash
mkdir -p ~/.docker/cli-plugins
curl -SL https://github.com/docker/buildx/releases/download/v0.19.3/buildx-v0.19.3.linux-amd64 \
  -o ~/.docker/cli-plugins/docker-buildx
chmod +x ~/.docker/cli-plugins/docker-buildx
```

---

## 📥 Step 5 — Clone the Repositories

```bash
mkdir ~/codify && cd ~/codify
git clone https://github.com/JamJam126/Codify-Backend.git backend
git clone https://github.com/YOUR_ORG/Codify-Frontend.git frontend
mkdir -p nginx/conf.d certbot/conf certbot/www
```

---

## 🔐 Step 6 — Setup Environment Variables

```bash
cd ~/codify/backend
cp .env.example ../.env
cd ~/codify
nano .env
```

Fill in all values:

```env
# Database
POSTGRES_USER=codify
POSTGRES_PASSWORD=<run: openssl rand -hex 16>
POSTGRES_DB=codify

# Backend
JWT_SECRET=<run: openssl rand -base64 32>
JWT_EXPIRES_IN=3600

# Frontend (baked into Docker image at build time)
VITE_API_BASE_URL=https://codify.works/api
```

> ⚠️ Never commit `.env` to git — it's already in `.gitignore`.

Generate strong secrets:

```bash
openssl rand -hex 16      # use this for POSTGRES_PASSWORD
openssl rand -base64 32   # use this for JWT_SECRET
```

---

## 🔒 Step 7 — Get SSL Certificate (HTTPS)

> ⚠️ DNS must be pointing to your server before this step or it will fail.

Start a temporary Nginx for the ACME challenge:

```bash
docker run --rm -d --name nginx_init -p 80:80 \
  -v $(pwd)/certbot/www:/var/www/certbot nginx:1.25-alpine
```

Issue the certificate:

```bash
docker run --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  --webroot-path /var/www/certbot \
  --email your@email.com --agree-tos \
  -d codify.works -d www.codify.works
```

Stop temporary Nginx:

```bash
docker stop nginx_init
```

---

## 📄 Step 8 — Setup Nginx Config

```bash
nano ~/codify/nginx/conf.d/default.conf
```

Paste this:

```nginx
server {
    listen 80;
    server_name codify.works www.codify.works;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 301 https://$host$request_uri; }
}

server {
    listen 443 ssl;
    server_name codify.works www.codify.works;

    ssl_certificate     /etc/letsencrypt/live/codify.works/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/codify.works/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass         http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   Upgrade           $http_upgrade;
        proxy_set_header   Connection        "upgrade";
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }
}
```

---

## 🐳 Step 9 — Build Code Runner Images

```bash
cd ~/codify

# C runner
docker build -f backend/code-runner/Dockerfile -t code-runner-c ./backend/code-runner

# Python runner
printf 'FROM python:3.11-slim\nWORKDIR /code\nCMD ["sleep","infinity"]' \
  | docker build -t code-runner-python -

# Create temp directory for code runner
sudo mkdir -p /code-temp && sudo chmod 777 /code-temp
```

---

## ▶️ Step 10 — Start Everything

```bash
cd ~/codify
docker compose up -d --build
```

> ⏳ First time takes 5–10 minutes to build images.

Check all services are running:

```bash
docker compose ps
```

Expected output:

```
NAME                STATUS
codify_postgres     running (healthy)
codify_redis        running (healthy)
codify_backend      running
codify_frontend     running
codify_nginx        running
```

---

## 🌱 Step 11 — Seed the Database (First Time Only)

```bash
docker compose exec backend npx prisma db seed
```

> ✅ Run this once only. Skip on future deploys.

---

## ✅ Verify It's Live

```bash
curl https://codify.works/api-json
```

Open in browser:

| URL | What you see |
|---|---|
| `https://codify.works` | ✅ frontend |
| `https://codify.works/api` | ✅ Swagger API docs |

---

## 🔁 Updating the Server (After Code Changes)

```bash
cd ~/codify

# Pull latest code
git -C backend fetch origin && git -C backend reset --hard origin/main
git -C frontend fetch origin && git -C frontend reset --hard origin/main

# Rebuild and restart
docker compose up -d --build backend
docker compose up -d --build frontend
```

---

## 🛑 Stop / Start / Restart

```bash
# Stop all (data is preserved)
docker compose down

# Start all (already built)
docker compose up -d

# Restart one service
docker compose restart backend

# View live logs
docker compose logs -f backend
```

---

## 📋 Quick Summary

```bash
# 1. SSH into server
ssh -i your-key.pem ec2-user@<EC2_IP>

# 2. Install Docker + Compose (Step 4)

# 3. Clone repos
mkdir ~/codify && cd ~/codify
git clone https://github.com/JamJam126/Codify-Backend.git backend
git clone https://github.com/YOUR_ORG/Codify-Frontend.git frontend

# 4. Setup env
cp backend/.env.example .env && nano .env

# 5. Get SSL cert (Step 7)

# 6. Build code runners (Step 9)

# 7. Start everything
docker compose up -d --build

# 8. Seed database (first time only)
docker compose exec backend npx prisma db seed

# 9. Verify
curl https://codify.works/api-json
```

---

