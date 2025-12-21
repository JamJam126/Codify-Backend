# Code Execution POC - Docker & BullMQ

This Proof of Concept (POC) demonstrates the technical feasibility of executing user-submitted code in an isolated container environment using Docker and BullMQ queues. It allows multiple concurrent code executions while ensuring isolation and resource management.

## Overview

The POC includes:

- **Backend API** for submitting and tracking code execution jobs
- **Worker** that executes code inside Docker containers
- **BullMQ queue** for handling multiple submissions concurrently
- **Admin dashboard** for monitoring jobs
- **Frontend test script** for automated job submission

## Features

- Execute Python code safely inside containers
- Queue multiple code execution requests using BullMQ
- Concurrency control for simultaneous job execution
- Real-time monitoring with Bull Board dashboard
- Test script to submit 100 jobs automatically

## Project Structure
```
.
├── backend/               # Express server and BullMQ worker
│   ├── server.js          # Main API server
│   ├── queue.js           # BullMQ queue & worker
│   └── dashboard.js       # Bull Board dashboard setup
├── docker/                # Dockerfile for Python container
├── frontend/              # Job submission script
│   └── submitJobs.js
└── README.md
```

## Installation & Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start Redis

BullMQ requires Redis. Make sure Redis is running on `localhost:6379`.

### 3. Build Docker images
```bash
docker build -t code-runner-python ./docker

# Optional: build C image if supported
# docker build -t code-runner-c ./docker-c
```

### 4. Start backend API
```bash
node backend/server.js
```

### 5. Start dashboard (optional)
```bash
node backend/dashboard.js
```

Access dashboard at: http://localhost:8081/admin/queues

### 6. Submit test jobs
```bash
node frontend/submitJobs.js
```

## API Usage

### Submit a job

**POST** `/run`
```json
{
  "language": "python",
  "code": "print('Hello world')"
}
```

### Check job status

**GET** `/status/:jobId`

**Response:**
```json
{
  "jobId": "abc123",
  "state": "completed",
  "result": {
    "stdout": "Hello world",
    "status": "success"
  }
}
```

### Dashboard monitoring

Visit `/admin/queues` to see queued, active, and completed jobs.

## Technical Stack

- **Node.js** - Backend runtime
- **Express** - API server
- **BullMQ** - Job queue management
- **Redis** - Queue storage
- **Docker** - Container isolation
- **Bull Board** - Queue monitoring dashboard