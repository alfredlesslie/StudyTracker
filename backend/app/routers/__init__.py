"""
StudySense AI - Routers Package
Exports all API routers for inclusion in the FastAPI application.
"""

from backend.app.routers.health import router as health_router
from backend.app.routers.student import router as student_router
from backend.app.routers.subjects import router as subjects_router
from backend.app.routers.progress import router as progress_router
from backend.app.routers.study_sessions import router as study_sessions_router
from backend.app.routers.quizzes import router as quizzes_router
from backend.app.routers.exams import router as exams_router
from backend.app.routers.study_plans import router as study_plans_router
from backend.app.routers.predictions import router as predictions_router
from backend.app.routers.tutor import router as tutor_router

__all__ = [
    "health_router",
    "student_router",
    "subjects_router",
    "progress_router",
    "study_sessions_router",
    "quizzes_router",
    "exams_router",
    "study_plans_router",
    "predictions_router",
    "tutor_router",
]

