"""
StudySense AI - StudySession Schemas
Pydantic schemas for logging and summarizing actual completed study sessions.
"""

from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class StudySessionCreate(BaseModel):
    id: Optional[str] = None
    student_id: Optional[str] = "student-001"
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    activity_type: str = Field(description="Activity type: learn, ai_tutor, practice, focus, study, revision")
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    active_duration_seconds: int = Field(ge=0, description="Actual recorded active study duration in seconds")
    completed: bool = True
    confidence: Optional[str] = None
    difficulty: Optional[str] = None
    notes: Optional[str] = None


class StudySessionResponse(BaseModel):
    id: str
    student_id: str
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    activity_type: str
    started_at: datetime
    ended_at: Optional[datetime] = None
    active_duration_seconds: int = Field(ge=0)
    completed: bool
    confidence: Optional[str] = None
    difficulty: Optional[str] = None
    notes: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class StudySessionSummaryResponse(BaseModel):
    student_id: str
    total_active_seconds: int
    total_active_minutes: int
    total_sessions_count: int
    by_activity_type: Dict[str, int] = {}  # activity_type -> minutes
    by_subject: Dict[str, int] = {}  # subject_id -> minutes
