"""
StudySense AI - StudySessions Router
Logs and aggregates actual active learning sessions across Learn, AI Tutor, Practice, and Focus.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.topic import Topic
from backend.app.models.study_session import StudySession
from backend.app.schemas.study_session import (
    StudySessionCreate,
    StudySessionResponse,
    StudySessionSummaryResponse,
)

router = APIRouter(prefix="/api/study-sessions", tags=["Study Sessions"])


@router.get("", response_model=List[StudySessionResponse])
def list_study_sessions(
    student_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    activity_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieve logged study sessions with optional subject, topic, and modality filters.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    query = db.query(StudySession).filter(StudySession.student_id == sid)

    if subject_id:
        query = query.filter(StudySession.subject_id == subject_id)
    if topic_id:
        query = query.filter(StudySession.topic_id == topic_id)
    if activity_type:
        query = query.filter(StudySession.activity_type == activity_type)

    return query.order_by(StudySession.started_at.desc()).limit(limit).all()


@router.post("", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
def create_study_session(
    session_data: StudySessionCreate,
    db: Session = Depends(get_db)
):
    """
    Log an active study session.
    Stores strictly actual active duration, not planned duration.
    """
    sid = session_data.student_id or settings.PROTOTYPE_STUDENT_ID

    if session_data.active_duration_seconds < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Active duration seconds cannot be negative."
        )

    # Infer subject_id from topic_id if not explicitly provided
    subject_id = session_data.subject_id
    if not subject_id and session_data.topic_id:
        topic = db.query(Topic).filter(Topic.id == session_data.topic_id).first()
        if topic:
            subject_id = topic.subject_id

    session_id = session_data.id or f"session-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)

    db_session = StudySession(
        id=session_id,
        student_id=sid,
        topic_id=session_data.topic_id,
        subject_id=subject_id,
        activity_type=session_data.activity_type,
        started_at=session_data.started_at or now,
        ended_at=session_data.ended_at or now,
        active_duration_seconds=session_data.active_duration_seconds,
        completed=session_data.completed,
        confidence=session_data.confidence,
        difficulty=session_data.difficulty,
        notes=session_data.notes
    )

    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


@router.get("/summary", response_model=StudySessionSummaryResponse)
def get_study_sessions_summary(
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get aggregated study session statistics for the student.
    Returns total active study minutes, session count, and breakdown by modality & subject.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    sessions = db.query(StudySession).filter(StudySession.student_id == sid).all()

    total_seconds = 0
    by_activity = {}
    by_subject = {}

    for s in sessions:
        sec = s.active_duration_seconds or 0
        total_seconds += sec
        mins = sec // 60

        # Activity breakdown
        atype = s.activity_type or "other"
        by_activity[atype] = by_activity.get(atype, 0) + mins

        # Subject breakdown
        sub = s.subject_id or "general"
        by_subject[sub] = by_subject.get(sub, 0) + mins

    return StudySessionSummaryResponse(
        student_id=sid,
        total_active_seconds=total_seconds,
        total_active_minutes=total_seconds // 60,
        total_sessions_count=len(sessions),
        by_activity_type=by_activity,
        by_subject=by_subject
    )
