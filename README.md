# StudySense AI

An intelligent full-stack learning platform for KTU Semester V Computer Science students featuring AI-powered tutoring, active focus sessions, adaptive quizzes, study planning, exam countdowns, and supervised machine learning exam score predictions.

---

## Quick Start

### 1. Backend (FastAPI + SQLAlchemy)

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start backend server (runs on http://127.0.0.1:8000)
python backend/run.py
```
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Endpoint: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Frontend (React + Vite)

```bash
# Install npm dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev
```

---

## System Architecture

- **Frontend**: React, Vite, Lucide Icons, Vanilla CSS Design System.
- **Backend API**: Python 3.13, FastAPI, SQLAlchemy 2.0, Pydantic v2.
- **Database**:
  - Local Development: Configurable SQLite database (`studysense.db`).
  - Production: PostgreSQL.
- **Migrations**: Alembic.
- **Machine Learning**: Supervised Linear Regression pipeline trained on student behavioral features to predict final subject exam scores with RMSE confidence intervals.

---

## Testing

Run all backend test suites using isolated test databases:
```bash
pytest backend/tests -v
```

Run frontend build verification:
```bash
npm run build
```
