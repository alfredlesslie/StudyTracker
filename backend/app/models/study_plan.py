"""
StudySense AI - StudyPlan and StudyPlanItem Models
Manages planned study sessions and items, tracking scheduled timestamps and completion.
"""

import uuid
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(128), default="Daily Study Plan", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    student = relationship("Student", back_populates="study_plans")
    items = relationship(
        "StudyPlanItem",
        back_populates="study_plan",
        cascade="all, delete-orphan",
        order_by="StudyPlanItem.planned_datetime"
    )

    def __repr__(self):
        return f"<StudyPlan(id='{self.id}', title='{self.title}')>"


class StudyPlanItem(Base):
    __tablename__ = "study_plan_items"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    study_plan_id = Column(String(64), ForeignKey("study_plans.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(64), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(256), nullable=True)  # custom title or topic title
    planned_datetime = Column(DateTime(timezone=True), nullable=False)
    planned_duration_minutes = Column(Integer, default=25, nullable=False)
    status = Column(String(32), default="pending", nullable=False)  # 'pending', 'completed', 'skipped'
    completed_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("planned_duration_minutes > 0", name="ck_plan_duration_positive"),
    )

    # Relationships
    study_plan = relationship("StudyPlan", back_populates="items")
    topic = relationship("Topic")
    subject = relationship("Subject")

    def __repr__(self):
        return f"<StudyPlanItem(id='{self.id}', status='{self.status}', planned='{self.planned_datetime}')>"
