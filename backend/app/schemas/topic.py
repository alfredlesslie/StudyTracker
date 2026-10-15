"""
StudySense AI - Topic Schemas
Pydantic schemas for Topic entities and syllabus responses.
"""

from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TopicBase(BaseModel):
    id: str
    subject_id: str
    module_number: int = Field(ge=1, le=4)
    module_id: Optional[str] = None
    title: str
    difficulty: str = "medium"
    estimated_minutes: int = Field(default=30, gt=0)
    explanation: Optional[str] = None
    why_it_matters: Optional[str] = None
    exam_focus: Optional[str] = None


class TopicResponse(TopicBase):
    model_config = ConfigDict(from_attributes=True)


class TopicWithProgressResponse(TopicBase):
    completion: float = 0.0
    mastery: str = "not_started"
    status: str = "not_started"
    last_studied: Optional[str] = None
    quiz_attempts: int = 0
    average_quiz_score: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)
