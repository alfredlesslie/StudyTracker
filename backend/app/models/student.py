"""
StudySense AI - Student Model
Persistent prototype student entity.
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Student(Base):
    __tablename__ = "students"

    id = Column(String(64), primary_key=True, index=True, default="student-001")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    progress = relationship("TopicProgress", back_populates="student", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="student", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="student", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="student", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlan", back_populates="student", cascade="all, delete-orphan")
    predictions = relationship("ExamPrediction", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student(id='{self.id}')>"
