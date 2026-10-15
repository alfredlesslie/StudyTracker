"""
StudySense AI - QuizAttempt Model
Stores quiz attempt performance, question counts, and duration.
"""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(64), ForeignKey("topics.id", ondelete="CASCADE"), nullable=True, index=True)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    exam_id = Column(String(64), ForeignKey("exams.id", ondelete="CASCADE"), nullable=True, index=True)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    duration_seconds = Column(Integer, default=0, nullable=False)
    percentage = Column(Float, nullable=False)  # 0.0 to 100.0
    difficulty = Column(String(32), default="medium", nullable=True)
    format = Column(String(64), default="Quick Practice", nullable=True)
    answers_json = Column(Text, nullable=True)
    module_scope_json = Column(Text, nullable=True)
    module_results_json = Column(Text, nullable=True)
    attempted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)

    __table_args__ = (
        CheckConstraint("score >= 0.0", name="ck_quiz_score_non_negative"),
        CheckConstraint("total_questions > 0", name="ck_quiz_total_questions_positive"),
        CheckConstraint("duration_seconds >= 0", name="ck_quiz_duration_non_negative"),
        CheckConstraint("percentage >= 0.0 AND percentage <= 100.0", name="ck_quiz_percentage_range"),
    )

    # Relationships
    student = relationship("Student", back_populates="quiz_attempts")
    topic = relationship("Topic", back_populates="quiz_attempts")
    subject = relationship("Subject")
    exam = relationship("Exam")

    def __repr__(self):
        return f"<QuizAttempt(id='{self.id}', score={self.score}/{self.total_questions}, pct={self.percentage}%)>"
