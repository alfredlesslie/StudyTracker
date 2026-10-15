"""
StudySense AI - Database Models Package
Exports all entity models for easy import by Alembic and application services.
"""

from backend.app.models.student import Student
from backend.app.models.subject import Subject, Module
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.models.study_session import StudySession
from backend.app.models.quiz_attempt import QuizAttempt
from backend.app.models.exam import Exam
from backend.app.models.study_plan import StudyPlan, StudyPlanItem
from backend.app.models.prediction import ExamPrediction

__all__ = [
    "Student",
    "Subject",
    "Module",
    "Topic",
    "TopicProgress",
    "StudySession",
    "QuizAttempt",
    "Exam",
    "StudyPlan",
    "StudyPlanItem",
    "ExamPrediction",
]
