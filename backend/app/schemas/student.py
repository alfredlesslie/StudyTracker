"""
StudySense AI - Student Schemas
Pydantic schemas for Student entity.
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict


class StudentBase(BaseModel):
    id: str = "student-001"


class StudentCreate(StudentBase):
    pass


class StudentResponse(StudentBase):
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
