"""
StudySense AI - Schemas Package
Exports all Pydantic request/response schemas.
"""

from backend.app.schemas.student import StudentCreate, StudentResponse
from backend.app.schemas.subject import SubjectResponse, SubjectDetailResponse, ModuleResponse
from backend.app.schemas.topic import TopicResponse, TopicWithProgressResponse
from backend.app.schemas.progress import TopicProgressUpdate, TopicProgressResponse
from backend.app.schemas.study_session import StudySessionCreate, StudySessionResponse, StudySessionSummaryResponse
from backend.app.schemas.quiz_attempt import QuizAttemptCreate, QuizAttemptResponse
from backend.app.schemas.exam import ExamCreate, ExamUpdate, ExamResponse
from backend.app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyPlanResponse,
    StudyPlanItemCreate,
    StudyPlanItemUpdate,
    StudyPlanItemResponse,
)
from backend.app.schemas.prediction import (
    DirectFeaturePredictionInput,
    DirectPredictionResponse,
    ExamPredictionResponse,
    PredictionResultResponse,
)
from backend.app.schemas.health import HealthResponse

__all__ = [
    "StudentCreate",
    "StudentResponse",
    "SubjectResponse",
    "SubjectDetailResponse",
    "ModuleResponse",
    "TopicResponse",
    "TopicWithProgressResponse",
    "TopicProgressUpdate",
    "TopicProgressResponse",
    "StudySessionCreate",
    "StudySessionResponse",
    "StudySessionSummaryResponse",
    "QuizAttemptCreate",
    "QuizAttemptResponse",
    "ExamCreate",
    "ExamUpdate",
    "ExamResponse",
    "StudyPlanCreate",
    "StudyPlanUpdate",
    "StudyPlanResponse",
    "StudyPlanItemCreate",
    "StudyPlanItemUpdate",
    "StudyPlanItemResponse",
    "DirectFeaturePredictionInput",
    "DirectPredictionResponse",
    "ExamPredictionResponse",
    "PredictionResultResponse",
    "HealthResponse",
]
