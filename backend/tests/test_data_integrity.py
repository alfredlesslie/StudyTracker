"""
StudySense AI - Data Integrity Tests
Validates database transaction rollbacks, check constraints, and rejection of invalid data.
"""

import pytest
from sqlalchemy.exc import IntegrityError
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.models.study_session import StudySession
from backend.app.models.quiz_attempt import QuizAttempt
from backend.app.models.study_plan import StudyPlanItem


def test_invalid_topic_estimated_minutes_constraint(db_session):
    """
    Test database rejects topic with non-positive estimated minutes.
    """
    with pytest.raises(IntegrityError):
        topic = Topic(
            id="invalid-t1",
            subject_id="cs-cn",
            module_number=1,
            title="Bad Topic",
            estimated_minutes=0  # Fails estimated_minutes > 0
        )
        db_session.add(topic)
        db_session.commit()
    db_session.rollback()


def test_invalid_progress_completion_constraint(db_session):
    """
    Test database rejects completion percentage exceeding 100.
    """
    with pytest.raises(IntegrityError):
        prog = TopicProgress(
            student_id="student-001",
            topic_id="cn-m1-t1",
            completion=120.0  # Fails 0 <= completion <= 100
        )
        db_session.add(prog)
        db_session.commit()
    db_session.rollback()


def test_invalid_negative_duration_constraint(db_session):
    """
    Test database rejects negative active duration seconds.
    """
    with pytest.raises(IntegrityError):
        session = StudySession(
            student_id="student-001",
            activity_type="learn",
            active_duration_seconds=-60  # Fails >= 0
        )
        db_session.add(session)
        db_session.commit()
    db_session.rollback()


def test_invalid_quiz_percentage_constraint(db_session):
    """
    Test database rejects quiz percentage > 100.
    """
    with pytest.raises(IntegrityError):
        attempt = QuizAttempt(
            student_id="student-001",
            topic_id="cn-m1-t1",
            score=5.0,
            total_questions=5,
            percentage=105.0  # Fails <= 100
        )
        db_session.add(attempt)
        db_session.commit()
    db_session.rollback()
