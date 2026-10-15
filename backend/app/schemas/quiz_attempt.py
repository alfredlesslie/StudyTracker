"""
StudySense AI - QuizAttempt Schemas
Pydantic schemas for recording and retrieving quiz attempts and results.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class QuizAttemptCreate(BaseModel):
    id: Optional[str] = None
    student_id: Optional[str] = "student-001"
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    exam_id: Optional[str] = None
    score: float = Field(ge=0.0)
    total_questions: int = Field(gt=0)
    duration_seconds: int = Field(default=0, ge=0)
    percentage: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    difficulty: Optional[str] = "medium"
    format: Optional[str] = "Quick Practice"
    answers_json: Optional[str] = None
    module_scope_json: Optional[str] = None
    module_results_json: Optional[str] = None
    attempted_at: Optional[datetime] = None


class QuizAttemptResponse(BaseModel):
    id: str
    student_id: str
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    exam_id: Optional[str] = None
    score: float
    total_questions: int
    duration_seconds: int
    percentage: float
    difficulty: Optional[str] = None
    format: Optional[str] = None
    answers_json: Optional[str] = None
    module_scope_json: Optional[str] = None
    module_results_json: Optional[str] = None
    attempted_at: datetime

    model_config = ConfigDict(from_attributes=True)
