"""
StudySense AI - Progress Schemas
Pydantic schemas for TopicProgress management.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TopicProgressUpdate(BaseModel):
    completion: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    mastery: Optional[str] = None
    status: Optional[str] = None
    quiz_attempts: Optional[int] = Field(default=None, ge=0)
    average_quiz_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    last_studied: Optional[datetime] = None


class TopicProgressResponse(BaseModel):
    id: str
    student_id: str
    topic_id: str
    completion: float = Field(ge=0.0, le=100.0)
    mastery: str
    status: str
    last_studied: Optional[datetime] = None
    quiz_attempts: int = Field(ge=0)
    average_quiz_score: Optional[float] = Field(default=None, ge=0.0, le=100.0)
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
