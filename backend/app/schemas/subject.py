"""
StudySense AI - Subject and Module Schemas
Pydantic schemas for Subjects and Modules.
"""

from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ModuleResponse(BaseModel):
    id: str
    subject_id: str
    order: int
    title: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SubjectBase(BaseModel):
    id: str
    subject_code: str
    subject_name: str
    semester: str = "Semester V"
    credits: int = 4
    description: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class SubjectResponse(SubjectBase):
    module_count: Optional[int] = 4
    topic_count: Optional[int] = 16

    model_config = ConfigDict(from_attributes=True)


class SubjectDetailResponse(SubjectBase):
    modules: List[ModuleResponse] = []

    model_config = ConfigDict(from_attributes=True)
