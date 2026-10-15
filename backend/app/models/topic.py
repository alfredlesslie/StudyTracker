"""
StudySense AI - Topic Model
Preserves the 64 prototype topics across 4 modules per subject.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(64), primary_key=True, index=True)  # e.g., 'cn-m1-t1'
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    module_number = Column(Integer, nullable=False)  # 1 to 4
    module_id = Column(String(64), nullable=True)  # e.g., 'cn-m1'
    title = Column(String(256), nullable=False)
    difficulty = Column(String(32), default="medium", nullable=False)  # 'easy', 'medium', 'hard'
    estimated_minutes = Column(Integer, default=30, nullable=False)
    explanation = Column(Text, nullable=True)
    why_it_matters = Column(Text, nullable=True)
    exam_focus = Column(Text, nullable=True)

    __table_args__ = (
        CheckConstraint("estimated_minutes > 0", name="ck_topic_estimated_minutes_positive"),
        CheckConstraint("module_number >= 1 AND module_number <= 4", name="ck_topic_module_number_valid"),
    )

    # Relationships
    subject = relationship("Subject", back_populates="topics")
    progress_records = relationship("TopicProgress", back_populates="topic", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="topic")
    quiz_attempts = relationship("QuizAttempt", back_populates="topic", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Topic(id='{self.id}', title='{self.title}')>"
