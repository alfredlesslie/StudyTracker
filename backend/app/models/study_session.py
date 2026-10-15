"""
StudySense AI - StudySession Model
Logs actual completed active study sessions across Learn, AI Tutor, Practice, and Focus.
"""

import uuid
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, ForeignKey, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from backend.app.database import Base


class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String(64), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True)
    topic_id = Column(String(64), ForeignKey("topics.id", ondelete="SET NULL"), nullable=True, index=True)
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True, index=True)
    activity_type = Column(String(32), nullable=False)  # 'learn', 'ai_tutor', 'practice', 'focus', 'study', 'revision'
    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    active_duration_seconds = Column(Integer, default=0, nullable=False)  # Strictly actual time, never planned
    completed = Column(Boolean, default=True, nullable=False)
    confidence = Column(String(32), nullable=True)  # 'not_confident', 'somewhat_confident', 'confident'
    difficulty = Column(String(32), nullable=True)  # 'easy', 'okay', 'difficult'
    notes = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("active_duration_seconds >= 0", name="ck_session_duration_non_negative"),
    )

    # Relationships
    student = relationship("Student", back_populates="study_sessions")
    topic = relationship("Topic", back_populates="study_sessions")
    subject = relationship("Subject")

    def __repr__(self):
        return f"<StudySession(id='{self.id}', type='{self.activity_type}', duration_sec={self.active_duration_seconds})>"
