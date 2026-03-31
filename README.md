# Codify Evaluator Service

A stateless, AI-powered Python microservice that provides educational feedback for student code submissions. It is the intelligence layer for the Codify university coding assignment platform.

> **Note:** This service does **not** decide if a student's code passes or fails. It takes the deterministic grading results from the Node.js runner and translates them into actionable, micro-skill-based educational feedback without revealing the answers.

---

## 🏗️ Architecture & Core Principles

*   **Strictly Stateless:** No database for evaluation results. The Node.js backend sends a JSON payload, and the Evaluator returns a JSON response. 
*   **Safety-First:** Multi-layer validation prevents the AI from leaking hidden test cases or providing full corrected solutions.
*   **RAG-Enhanced (Optional):** Uses Qdrant/Chroma internally to reuse micro-skill blueprints across similar assignments, reducing token costs and increasing consistency.
*   **Iterative Teacher Workflow:** Supports generating micro-skills, allowing teachers to approve/reject them, and regenerating *only* the rejected skills without losing context.

---

## 🚀 Local Development Setup

Follow these exact steps to run the service locally.

### 1. Prerequisites
*   Python 3.11+
*   Docker (for the local Vector Database)

### 2. Environment Setup
Open your terminal in the project root and run:

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```
*(Note: `sentence-transformers` may take a few minutes to download the ML model on first use).*

### 3. Configure Environment Variables
Copy the example env file and add your LLM API key:
```bash
cp .env.example .env
```
Edit `.env` and add your Groq API key (get one free at [console.groq.com](https://console.groq.com/keys)):
```env
GROQ_API_KEY=gsk_your_real_key_here
LLM_MODEL=llama-3.1-8b-instant  # Or any model available in your Groq account
```

It is **not** in the README yet. I only showed you how to start it, but forgot to add how to stop it! 

Here is how to turn it off right now, plus the updated section to paste into your `README.md`.

### How to stop the Qdrant container right now
Since you ran it in the background (with `-d`), run these two commands in your terminal:

```bash
# 1. Find the container ID
docker ps

# 2. Stop and remove it (replace <ID> with the actual ID from the first command)
docker stop <ID>
docker rm <ID>
```

### 4. Start the Vector Database (Optional but Recommended)
Open a **second terminal** and run Qdrant via Docker:
```bash
docker run -p 6333:6333 -d qdrant/qdrant:v1.12.1
```
*(If skipped, the Python service will still start but will log a warning and run without RAG context).*

**To stop the database when you are done:**
```bash
docker ps                   # Find the CONTAINER ID
docker stop <CONTAINER_ID>  # Stop it
docker rm <CONTAINER_ID>    # Remove it
```

### 5. Start the FastAPI Server
Back in your main terminal (with the venv activated):
```bash
uvicorn app.main:app --reload
```
The server will start at `http://localhost:8000`.

---

## 📖 API Usage & Workflow

Once running, open the interactive Swagger UI: **[http://localhost:8000/docs](http://localhost:8000/docs)**

The system operates in two phases.

### Phase 1: Generate Micro-Skills
**Endpoint:** `POST /skills/generate`

Teachers use this to generate a rubric of micro-skills for an assignment.

**Initial Call:**
```json
{
  "question_description": "Write a C program to shift an array left by one position.",
  "starter_code": "int main() { int arr[5]; return 0; }",
  "language": "c"
}
```

**Regeneration Call (If a teacher rejects some skills):**
Pass the approved skills in `already_approved_skills`. The AI will generate *only* replacement skills, avoiding duplicates.
```json
{
  "question_description": "Write a C program to shift an array left by one position.",
  "starter_code": "int main() { int arr[5]; return 0; }",
  "language": "c",
  "already_approved_skills": [
    {
      "id": "sk_01",
      "name": "Read integers using scanf",
      "description": "Use a loop with scanf to store user input."
    }
  ]
}
```

### Phase 2: Evaluate Student Submission
**Endpoint:** `POST /evaluate`

Called *after* the student submits and the Node.js runner has graded them.

```json
{
  "question_description": "Shift array left.",
  "starter_code": "int arr[5];",
  "test_cases": "Input:\n1 2 3 4 5\nExpected Output:\n2 3 4 5 1",
  "student_code": "int main() { int arr[5]; arr[0]=arr[1]; }",
  "approved_skills": [
    {
      "id": "sk_01",
      "name": "Preserve first element",
      "description": "Store the first element in a temp variable."
    }
  ],
  "language": "c"
}
```

---

## 🛡️ Safety Mechanisms (What happens under the hood)

When you hit `POST /evaluate`, the pipeline enforces strict academic integrity rules:

1.  **Test Case Redaction:** Even if you send raw hidden test inputs/outputs in the `test_cases` field, `context_builder.py` intercepts them and replaces them with a generic summary *before* the LLM sees them. Check your terminal logs for: `Detected multi-line test case data. Redacting to prevent leakage.`
2.  **Solution Leakage Prevention:** `safety_validator.py` scans the LLM's output. If the AI tries to put a runnable code block in a `hint` (e.g., ````c int temp = arr[0]; ```), the service throws a `500 Safety Error` instead of returning the data.
3.  **Strict Null Enforcement:** If a student passes a skill (`status: "demonstrated"`), the system forces the `hint` to be `null`.

---

## 🐳 Docker Deployment

To run the entire stack (Python app + Qdrant) in isolated containers:

```bash
# Build and start in detached mode
docker-compose up -d --build

# Check logs
docker-compose logs -f evaluator

# Stop when done
docker-compose down
```
The API will be available at `http://localhost:8000/docs`.

---

## 🧪 Running Tests

The project uses `pytest` with `anyio` for async testing. Configuration is in `pytest.ini`.

```bash
# Run full test suite
pytest -v

# Run a specific test file
pytest tests/test_safety_validator.py -v
```

---

## 📁 Project Structure

```
evaluator-service/
├── app/
│   ├── main.py              # FastAPI app, endpoints, exception handlers
│   ├── config.py            # Environment variable loader
│   ├── schemas.py           # Pydantic request/response models
│   ├── core/                # Business logic orchestration
│   │   ├── pipeline.py      # Phase 2 evaluation flow
│   │   ├── context_builder.py # Test case sanitization
│   │   ├── prompt_builder.py  # Assembles LLM prompts
│   │   ├── safety_validator.py # Regex & rule checks
│   │   └── skill_generator.py # Phase 1 skill generation
│   ├── integrations/        # External clients
│   │   ├── llm_client.py    # OpenAI-compatible wrapper
│   │   └── vector_client.py # Qdrant/Chroma wrapper
│   ├── vectorstore/         # RAG embeddings & ingestion
│   ├── prompts/             # System prompts & templates
│   └── common/              # Exceptions & logging
├── knowledge/               # Seed data for RAG (blueprints, hints)
├── scripts/                 # CLI tools (seed_knowledge.py)
├── tests/                   # Unit & Integration tests
├── docker-compose.yml
├── Dockerfile
└── requirements.txt
```

---

## 🤝 For Node.js Teammates (API Contract)

**Rule 1:** The Evaluator never sets the score. You own the database and grading logic.
**Rule 2:** Always pass `approved_skills` as an array of objects: `[{id, name, description}]`.
**Rule 3:** When a teacher rejects a skill, grab the approved ones from your database and send them in the `already_approved_skills` array on a `POST /skills/generate` call. The Python service will return *only* the replacement skills.
**Rule 4:** If the Evaluator returns a `500` status, check the `detail` message. If it says `"Safety rules"`, it means the AI tried to cheat. Just retry the request.
```