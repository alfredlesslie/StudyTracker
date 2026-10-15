"""
StudySense AI - Backend Application Entry Point
FastAPI application with database initialization, CORS, Swagger UI documentation, and API routers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.config import settings
from backend.app.database import init_db, SessionLocal
from backend.app.seed.seed_data import seed_database
from backend.app.routers import (
    health_router,
    student_router,
    subjects_router,
    progress_router,
    study_sessions_router,
    quizzes_router,
    exams_router,
    study_plans_router,
    predictions_router,
    tutor_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler:
    Initializes database schema and ensures idempotent seeding on startup.
    """
    # Initialize tables
    init_db()

    # Seed syllabus data and prototype student
    db = SessionLocal()
    try:
        seed_database(db)
    except Exception as e:
        print(f"[Warning] Seeding encountered issue: {e}")
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack educational intelligence platform with syllabus management, progress tracking, study sessions, quizzes, exams, study plans, and machine learning exam score predictions.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for React Vite frontend and development servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(student_router)
app.include_router(subjects_router)
app.include_router(progress_router)
app.include_router(study_sessions_router)
app.include_router(quizzes_router)
app.include_router(exams_router)
app.include_router(study_plans_router)
app.include_router(predictions_router)
app.include_router(tutor_router)



if __name__ == "__main__":
    import uvicorn
    print(f"Starting StudySense AI Backend on http://{settings.HOST}:{settings.PORT} ...")
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
