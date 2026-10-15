"""
StudySense AI - StudyPlan Schemas
Pydantic schemas for Study Plans and individual Plan Items.
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class StudyPlanItemBase(BaseModel):
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    title: Optional[str] = None
    planned_datetime: datetime
    planned_duration_minutes: int = Field(default=25, gt=0)
    status: str = "pending"  # pending, completed, skipped
    notes: Optional[str] = None


class StudyPlanItemCreate(StudyPlanItemBase):
    id: Optional[str] = None


class StudyPlanItemUpdate(BaseModel):
    topic_id: Optional[str] = None
    subject_id: Optional[str] = None
    title: Optional[str] = None
    planned_datetime: Optional[datetime] = None
    planned_duration_minutes: Optional[int] = Field(default=None, gt=0)
    status: Optional[str] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None


class StudyPlanItemResponse(StudyPlanItemBase):
    id: str
    study_plan_id: str
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class StudyPlanBase(BaseModel):
    title: str = "Daily Study Plan"


class StudyPlanCreate(StudyPlanBase):
    id: Optional[str] = None
    student_id: Optional[str] = "student-001"
    items: List[StudyPlanItemCreate] = []


class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    items: Optional[List[StudyPlanItemCreate]] = None


class StudyPlanResponse(StudyPlanBase):
    id: str
    student_id: str
    items: List[StudyPlanItemResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
