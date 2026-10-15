"""
StudySense AI - StudyPlans Router
Full CRUD endpoints for daily study plans and individual scheduled plan items.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.study_plan import StudyPlan, StudyPlanItem
from backend.app.models.topic import Topic
from backend.app.schemas.study_plan import (
    StudyPlanCreate,
    StudyPlanUpdate,
    StudyPlanResponse,
    StudyPlanItemCreate,
    StudyPlanItemUpdate,
    StudyPlanItemResponse,
)

router = APIRouter(prefix="/api/study-plans", tags=["Study Plans"])


@router.get("", response_model=List[StudyPlanResponse])
def list_study_plans(
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all study plans with nested plan items for the student.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    plans = db.query(StudyPlan).filter(StudyPlan.student_id == sid).order_by(StudyPlan.created_at.desc()).all()
    return plans


@router.post("", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
def create_study_plan(
    plan_data: StudyPlanCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new study plan with scheduled items.
    """
    sid = plan_data.student_id or settings.PROTOTYPE_STUDENT_ID
    plan_id = plan_data.id or f"plan-{int(datetime.now().timestamp())}-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)

    db_plan = StudyPlan(
        id=plan_id,
        student_id=sid,
        title=plan_data.title,
        created_at=now,
        updated_at=now
    )
    db.add(db_plan)
    db.flush()

    for item in plan_data.items:
        if item.planned_duration_minutes <= 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Planned duration minutes must be greater than zero."
            )

        # Look up topic for title and subject if available
        sub_id = item.subject_id
        item_title = item.title
        if item.topic_id:
            top = db.query(Topic).filter(Topic.id == item.topic_id).first()
            if top:
                sub_id = sub_id or top.subject_id
                item_title = item_title or top.title

        item_id = item.id or f"task-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:6]}"
        db_item = StudyPlanItem(
            id=item_id,
            study_plan_id=plan_id,
            topic_id=item.topic_id,
            subject_id=sub_id,
            title=item_title or "Study Session",
            planned_datetime=item.planned_datetime,
            planned_duration_minutes=item.planned_duration_minutes,
            status=item.status or "pending",
            completed_at=now if item.status == "completed" else None,
            notes=item.notes
        )
        db.add(db_item)

    db.commit()
    db.refresh(db_plan)
    return db_plan


@router.get("/{plan_id}", response_model=StudyPlanResponse)
def get_study_plan(plan_id: str, db: Session = Depends(get_db)):
    """
    Retrieve details and scheduled items for a specific study plan.
    """
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan '{plan_id}' not found."
        )
    return plan


@router.put("/{plan_id}", response_model=StudyPlanResponse)
def update_study_plan(
    plan_id: str,
    updates: StudyPlanUpdate,
    db: Session = Depends(get_db)
):
    """
    Update study plan title or synchronize plan items.
    """
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan '{plan_id}' not found."
        )

    now = datetime.now(timezone.utc)
    if updates.title is not None:
        plan.title = updates.title

    if updates.items is not None:
        # Clear existing items and replace with updated set
        db.query(StudyPlanItem).filter(StudyPlanItem.study_plan_id == plan_id).delete()
        for item in updates.items:
            if item.planned_duration_minutes <= 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Planned duration minutes must be greater than zero."
                )

            sub_id = item.subject_id
            item_title = item.title
            if item.topic_id:
                top = db.query(Topic).filter(Topic.id == item.topic_id).first()
                if top:
                    sub_id = sub_id or top.subject_id
                    item_title = item_title or top.title

            item_id = item.id or f"task-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:6]}"
            db_item = StudyPlanItem(
                id=item_id,
                study_plan_id=plan_id,
                topic_id=item.topic_id,
                subject_id=sub_id,
                title=item_title or "Study Session",
                planned_datetime=item.planned_datetime,
                planned_duration_minutes=item.planned_duration_minutes,
                status=item.status or "pending",
                completed_at=now if item.status == "completed" else None,
                notes=item.notes
            )
            db.add(db_item)

    plan.updated_at = now
    db.commit()
    db.refresh(plan)
    return plan


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study_plan(plan_id: str, db: Session = Depends(get_db)):
    """
    Delete a study plan and all associated items.
    """
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Study plan '{plan_id}' not found."
        )

    db.delete(plan)
    db.commit()
    return None
