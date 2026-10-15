"""
StudySense AI - TopicProgress Model
Tracks per-topic mastery, quiz performance, and completion state.
"""

import uuid
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class TopicProgress(Base):
    __tablename__ = "topic_progress"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(64), ForeignKey("topics.id", ondelete="CASCADE"), nullable=False, index=True)
    completion = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    mastery = Column(String(64), default="not_started", nullable=False)  # 'not_started', 'Needs Practice', 'Review soon', 'Doing well'
    status = Column(String(32), default="not_started", nullable=False)  # 'not_started', 'learning', 'learned', 'mastered', 'needs_practice'
    last_studied = Column(DateTime(timezone=True), nullable=True)
    quiz_attempts = Column(Integer, default=0, nullable=False)
    average_quiz_score = Column(Float, nullable=True)  # 0.0 to 100.0
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        CheckConstraint("completion >= 0.0 AND completion <= 100.0", name="ck_progress_completion_range"),
        CheckConstraint("quiz_attempts >= 0", name="ck_progress_quiz_attempts_non_negative"),
        CheckConstraint(
            "average_quiz_score IS NULL OR (average_quiz_score >= 0.0 AND average_quiz_score <= 100.0)",
            name="ck_progress_avg_quiz_score_range"
        ),
        UniqueConstraint("student_id", "topic_id", name="uq_student_topic_progress"),
    )

    # Relationships
    student = relationship("Student", back_populates="progress")
    topic = relationship("Topic", back_populates="progress_records")

    def __repr__(self):
        return f"<TopicProgress(student='{self.student_id}', topic='{self.topic_id}', completion={self.completion}%)>"
