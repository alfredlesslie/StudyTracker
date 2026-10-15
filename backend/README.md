# StudySense AI — Backend & Database

FastAPI + SQLAlchemy backend service providing persistence, curriculum data management, progress tracking, study session logging, quiz attempts, examination scheduling, study plans, and machine learning exam score predictions for StudySense AI.

---

## Architecture Overview

```
Frontend (React + Vite, Port 5173)
  ├── apiClient.js (VITE_API_BASE_URL)
  └── Services (Syllabus, Progress, Sessions, Quizzes, Exams, Study Plans, Predictions)
          ↕ REST API (HTTP / JSON)
Backend (FastAPI, Port 8000)
  ├── API Routers (/health, /api/student, /api/subjects, /api/progress, ...)
  ├── SQLAlchemy ORM (11 relational entities with integrity constraints)
  ├── Alembic Migrations
  ├── Database Layer (Configurable: PostgreSQL production / SQLite local)
  └── ML Pipeline Integration (Supervised Regression Model from ml/models/best_model.joblib)
```

---

## Tech Stack

- **Framework**: Python 3.13 / FastAPI
- **Database ORM**: SQLAlchemy 2.0
- **Validation**: Pydantic v2
- **Database Engine**:
  - Development default: SQLite (`sqlite:///./studysense.db`)
  - Production: PostgreSQL (`postgresql://...`)
- **Migrations**: Alembic
- **Machine Learning**: scikit-learn / joblib / pandas / numpy
- **Testing**: pytest / httpx

---

## Database Configuration

The database connection is configurable through the `DATABASE_URL` environment variable.

### Local Development (Default SQLite)
If no `DATABASE_URL` is set, the application automatically uses a local SQLite database:
```
DATABASE_URL=sqlite:///./studysense.db
```
This allows the complete backend and tests to run immediately without installing PostgreSQL.

### Production (PostgreSQL)
Configure your PostgreSQL connection in `.env`:
```
DATABASE_URL=postgresql://username:password@localhost:5432/studysense_db
```

Never commit database credentials, passwords, or secrets to version control.

---

## Installation & Setup

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment (Optional)
```bash
# Copy example environment configuration
copy backend\.env.example backend\.env
```

### 3. Initialize & Seed Database
The application automatically creates tables and idempotently seeds the prototype student, 4 subjects, 16 modules, and 64 topics on startup. You can also run the seeder manually:
```bash
python -m backend.app.seed.seed_data
```

### 4. Run the Backend Server
```bash
python backend/run.py
```
Or directly using Uvicorn:
```bash
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server will be available at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## API Endpoints Reference

### Health & Student
- `GET /health` — System status, database connection, and ML pipeline availability
- `GET /api/student` — Retrieve or initialize the persistent prototype student (`student-001`)

### Subjects & Syllabus
- `GET /api/subjects` — List all 4 Semester V subjects
- `GET /api/subjects/{subject_id}` — Subject details with curriculum modules
- `GET /api/subjects/{subject_id}/topics` — List all 16 topics for a subject
- `GET /api/topics/{topic_id}` — Individual topic details

### Progress Tracking
- `GET /api/progress` — Topic progress records for the student
- `GET /api/topics/{topic_id}/progress` — Progress record for a specific topic
- `PUT /api/topics/{topic_id}/progress` — Update completion %, mastery, and quiz stats

### Study Sessions
- `GET /api/study-sessions` — List logged study sessions (filterable by subject, topic, type)
- `POST /api/study-sessions` — Log an active study session (actual active seconds)
- `GET /api/study-sessions/summary` — Aggregated study duration and breakdown by modality

### Quizzes
- `GET /api/quizzes/history` — Historical quiz attempts
- `POST /api/quizzes/attempts` — Record a quiz attempt and automatically update TopicProgress

### Exams (Full CRUD)
- `GET /api/exams` — List scheduled examinations
- `POST /api/exams` — Schedule a new examination
- `GET /api/exams/{exam_id}` — Get exam details
- `PUT /api/exams/{exam_id}` — Update examination date, title, or notes
- `DELETE /api/exams/{exam_id}` — Delete an examination

### Study Plans (Full CRUD)
- `GET /api/study-plans` — List study plans with scheduled items
- `POST /api/study-plans` — Create study plan with scheduled items
- `GET /api/study-plans/{plan_id}` — Get study plan details
- `PUT /api/study-plans/{plan_id}` — Update plan or scheduled items
- `DELETE /api/study-plans/{plan_id}` — Delete study plan

### ML Exam Predictions
- `GET /api/predictions` — Retrieve stored genuine ML predictions
- `GET /api/predictions/subject/{subject_id}` — Generate/retrieve genuine prediction based on actual activity. Returns `insufficient_data` when data is missing without fabricating numbers.
- `POST /predict` — Direct feature vector inference preserving Prompt 9 microservice contract

---

## Running Automated Tests

Run the test suite using an isolated in-memory test database (guaranteeing zero mutation to real student data):

```bash
pytest backend/tests -v
```
