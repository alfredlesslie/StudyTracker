"""
StudySense AI - ExamPrediction Model
Stores authentic ML regression predictions generated from student learning data.
"""

import uuid
from sqlalchemy import Column, String, Float, DateTime, Text, ForeignKey, CheckConstraint

from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class ExamPrediction(Base):
    __tablename__ = "exam_predictions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    exam_id = Column(String(64), ForeignKey("exams.id", ondelete="SET NULL"), nullable=True, index=True)
    predicted_score = Column(Float, nullable=False)  # 0.0 to 100.0
    model_version = Column(String(64), nullable=False)
    data_status = Column(String(32), default="good", nullable=False)  # 'good', 'limited'
    score_range_min = Column(Float, nullable=True)
    score_range_max = Column(Float, nullable=True)
    confidence_margin = Column(Float, nullable=True)
    module_ids = Column(Text, nullable=True)  # JSON-encoded array of evaluated module IDs
    module_metrics_json = Column(Text, nullable=True)  # JSON-encoded snapshot of module-level completion and quiz stats
    actual_score = Column(Float, nullable=True)  # Populated after exam for model validation and residual tracking
    generated_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    input_data_timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)


    __table_args__ = (
        CheckConstraint("predicted_score >= 0.0 AND predicted_score <= 100.0", name="ck_pred_score_range"),
    )

    # Relationships
    student = relationship("Student", back_populates="predictions")
    subject = relationship("Subject", back_populates="predictions")
    exam = relationship("Exam", back_populates="predictions")

    def __repr__(self):
        return f"<ExamPrediction(subject='{self.subject_id}', score={self.predicted_score}, model='{self.model_version}')>"
