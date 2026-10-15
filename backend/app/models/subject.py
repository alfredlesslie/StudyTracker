"""
StudySense AI - Subject and Module Models
Entity models representing the curriculum subjects and module units.
"""

from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(64), primary_key=True, index=True)  # e.g., 'cs-cn'
    subject_code = Column(String(32), unique=True, index=True, nullable=False)  # e.g., '24CST501'
    subject_name = Column(String(128), nullable=False)  # e.g., 'Computer Networks'
    semester = Column(String(32), default="Semester V", nullable=False)
    credits = Column(Integer, default=4, nullable=False)
    description = Column(Text, nullable=True)
    color = Column(String(32), nullable=True)
    icon = Column(String(32), nullable=True)

    # Relationships
    modules = relationship("Module", back_populates="subject", cascade="all, delete-orphan", order_by="Module.order")
    topics = relationship("Topic", back_populates="subject", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="subject", cascade="all, delete-orphan")
    predictions = relationship("ExamPrediction", back_populates="subject", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Subject(code='{self.subject_code}', name='{self.subject_name}')>"


class Module(Base):
    __tablename__ = "modules"

    id = Column(String(64), primary_key=True, index=True)  # e.g., 'cn-m1'
    subject_id = Column(String(64), ForeignKey("subjects.id", ondelete="CASCADE"), nullable=False, index=True)
    order = Column(Integer, nullable=False)  # 1, 2, 3, 4
    title = Column(String(256), nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    subject = relationship("Subject", back_populates="modules")

    def __repr__(self):
        return f"<Module(id='{self.id}', order={self.order})>"
