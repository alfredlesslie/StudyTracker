"""
StudySense AI - Progress Router
Tracks student topic completion, status, and quiz mastery.
"""

from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.schemas.progress import TopicProgressResponse, TopicProgressUpdate

router = APIRouter(tags=["Progress"])


@router.get("/api/progress", response_model=List[TopicProgressResponse])
def get_all_progress(
    student_id: Optional[str] = None,
    subject_id: Optional[str] = Query(None, description="Optional subject filter"),
    db: Session = Depends(get_db)
):
    """
    Retrieve progress records for all topics for the prototype student.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID

    query = db.query(TopicProgress).filter(TopicProgress.student_id == sid)

    if subject_id:
        query = query.join(Topic).filter(Topic.subject_id == subject_id)

    return query.all()


@router.get("/api/topics/{topic_id}/progress", response_model=TopicProgressResponse)
def get_topic_progress(
    topic_id: str,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve progress for a specific topic.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID

    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found."
        )

    progress = db.query(TopicProgress).filter(
        TopicProgress.student_id == sid,
        TopicProgress.topic_id == topic_id
    ).first()

    if not progress:
        # Create default initial record
        progress = TopicProgress(
            student_id=sid,
            topic_id=topic_id,
            completion=0.0,
            mastery="not_started",
            status="not_started"
        )
        db.add(progress)
        db.commit()
        db.refresh(progress)

    return progress


@router.put("/api/topics/{topic_id}/progress", response_model=TopicProgressResponse)
def update_topic_progress(
    topic_id: str,
    update_data: TopicProgressUpdate,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update progress metrics (completion %, mastery status, quiz performance) for a topic.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID

    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found."
        )

    progress = db.query(TopicProgress).filter(
        TopicProgress.student_id == sid,
        TopicProgress.topic_id == topic_id
    ).first()

    if not progress:
        progress = TopicProgress(
            student_id=sid,
            topic_id=topic_id,
            completion=0.0,
            mastery="not_started",
            status="not_started"
        )
        db.add(progress)
        db.flush()

    if update_data.completion is not None:
        if not (0.0 <= update_data.completion <= 100.0):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Completion percentage must be between 0.0 and 100.0"
            )
        progress.completion = update_data.completion

    if update_data.mastery is not None:
        progress.mastery = update_data.mastery

    if update_data.status is not None:
        progress.status = update_data.status

    if update_data.quiz_attempts is not None:
        if update_data.quiz_attempts < 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Quiz attempts cannot be negative."
            )
        progress.quiz_attempts = update_data.quiz_attempts

    if update_data.average_quiz_score is not None:
        if not (0.0 <= update_data.average_quiz_score <= 100.0):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Average quiz score must be between 0.0 and 100.0"
            )
        progress.average_quiz_score = update_data.average_quiz_score

    progress.last_studied = update_data.last_studied or datetime.now(timezone.utc)

    db.commit()
    db.refresh(progress)
    return progress
