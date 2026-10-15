"""
StudySense AI - Exam Model
Manages upcoming and scheduled subject examinations.
"""

import uuid
from sqlalchemy import Column, String, DateTime, Text, Float, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Exam(Base):
    __tablename__ = "exams"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(128), nullable=False)
    exam_datetime = Column(DateTime(timezone=True), nullable=False)
    notes = Column(Text, nullable=True)
    module_ids = Column(Text, nullable=True)  # JSON-encoded array of selected module IDs, e.g. '["cn-m1", "cn-m2"]'
    completed_module_ids = Column(Text, nullable=True)  # JSON-encoded array of completed module IDs, e.g. '["cn-m3"]'
    completed_topic_ids = Column(Text, nullable=True)  # JSON-encoded array of completed topic IDs for this exam, e.g. '["cn-m3-t1"]'
    actual_score = Column(Float, nullable=True)  # Recorded by student post-exam (0.0 to 100.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)


    # Relationships
    student = relationship("Student", back_populates="exams")
    subject = relationship("Subject", back_populates="exams")
    predictions = relationship("ExamPrediction", back_populates="exam")

    def __repr__(self):
        return f"<Exam(id='{self.id}', name='{self.name}', datetime='{self.exam_datetime}')>"

    @property
    def modules_list(self):
        import json
        if not self.module_ids:
            return []
        try:
            val = json.loads(self.module_ids)
            return val if isinstance(val, list) else [str(val)]
        except Exception:
            return [m.strip() for m in self.module_ids.split(",") if m.strip()]

    @property
    def completed_modules_list(self):
        import json
        if not self.completed_module_ids:
            return []
        try:
            val = json.loads(self.completed_module_ids)
            return val if isinstance(val, list) else [str(val)]
        except Exception:
            return [m.strip() for m in self.completed_module_ids.split(",") if m.strip()]

    @property
    def completed_topics_list(self):
        import json
        if not self.completed_topic_ids:
            return []
        try:
            val = json.loads(self.completed_topic_ids)
            return val if isinstance(val, list) else [str(val)]
        except Exception:
            return [t.strip() for t in self.completed_topic_ids.split(",") if t.strip()]

