"""
StudySense AI - Subjects and Syllabus Router
Retrieves subjects, curriculum modules, and syllabus topics.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.subject import Subject
from backend.app.models.topic import Topic
from backend.app.schemas.subject import SubjectResponse, SubjectDetailResponse
from backend.app.schemas.topic import TopicResponse

router = APIRouter(tags=["Subjects & Syllabus"])


@router.get("/api/subjects", response_model=List[SubjectResponse])
def list_subjects(db: Session = Depends(get_db)):
    """
    Retrieve all 4 Semester V curriculum subjects.
    """
    subjects = db.query(Subject).all()
    results = []
    for s in subjects:
        results.append(
            SubjectResponse(
                id=s.id,
                subject_code=s.subject_code,
                subject_name=s.subject_name,
                semester=s.semester,
                credits=s.credits,
                description=s.description,
                color=s.color,
                icon=s.icon,
                module_count=len(s.modules),
                topic_count=len(s.topics)
            )
        )
    return results


@router.get("/api/subjects/{subject_id}", response_model=SubjectDetailResponse)
def get_subject_detail(subject_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a specific subject with its curriculum modules.
    """
    subject = db.query(Subject).filter(
        (Subject.id == subject_id) | (Subject.subject_code == subject_id)
    ).first()

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{subject_id}' not found."
        )

    return subject


@router.get("/api/subjects/{subject_id}/topics", response_model=List[TopicResponse])
def get_subject_topics(subject_id: str, db: Session = Depends(get_db)):
    """
    Retrieve all syllabus topics belonging to a specific subject.
    """
    subject = db.query(Subject).filter(
        (Subject.id == subject_id) | (Subject.subject_code == subject_id)
    ).first()

    if not subject:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{subject_id}' not found."
        )

    topics = db.query(Topic).filter(Topic.subject_id == subject.id).order_by(Topic.module_number, Topic.id).all()
    return topics


@router.get("/api/topics/{topic_id}", response_model=TopicResponse)
def get_topic(topic_id: str, db: Session = Depends(get_db)):
    """
    Retrieve full details for an individual topic by ID.
    """
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{topic_id}' not found."
        )
    return topic
