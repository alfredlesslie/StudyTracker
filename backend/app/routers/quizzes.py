"""
StudySense AI - Quizzes Router
Handles quiz attempt submission, score history, and updates to TopicProgress.
"""

import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.models.quiz_attempt import QuizAttempt
from backend.app.models.exam import Exam
from backend.app.schemas.quiz_attempt import QuizAttemptCreate, QuizAttemptResponse

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


@router.get("/history", response_model=List[QuizAttemptResponse])
def get_quiz_history(
    student_id: Optional[str] = None,
    topic_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    exam_id: Optional[str] = None,
    practice_only: bool = Query(False, description="Filter for practice attempts with no exam_id"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """
    Retrieve historical quiz attempts with optional topic, subject, or exam filtering.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    query = db.query(QuizAttempt).filter(QuizAttempt.student_id == sid)

    if practice_only:
        query = query.filter(QuizAttempt.exam_id == None)
    elif exam_id:
        query = query.filter(QuizAttempt.exam_id == exam_id)
    if topic_id:
        query = query.filter(QuizAttempt.topic_id == topic_id)
    if subject_id:
        query = query.filter(QuizAttempt.subject_id == subject_id)

    return query.order_by(QuizAttempt.attempted_at.desc()).limit(limit).all()


@router.post("/attempts", response_model=QuizAttemptResponse, status_code=status.HTTP_201_CREATED)
def record_quiz_attempt(
    attempt: QuizAttemptCreate,
    db: Session = Depends(get_db)
):
    """
    Record a completed quiz attempt.
    For single-topic quizzes, updates TopicProgress metrics (attempts and average score)
    without modifying syllabus completion (which is strictly driven by Learn).
    For exam-practice quizzes (with exam_id), scopes to exam without altering syllabus progress.
    """
    sid = attempt.student_id or settings.PROTOTYPE_STUDENT_ID

    # Idempotency check: prevent duplicate submissions of the exact same attempt ID
    if attempt.id:
        existing = db.query(QuizAttempt).filter(QuizAttempt.id == attempt.id).first()
        if existing:
            return existing

    if attempt.total_questions <= 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Total questions must be greater than zero."
        )

    if attempt.score < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Quiz score cannot be negative."
        )

    if attempt.score > attempt.total_questions:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Score ({attempt.score}) cannot exceed total questions ({attempt.total_questions})."
        )

    subject_id = attempt.subject_id
    topic_id = attempt.topic_id

    # If exam_id is supplied, validate exam and subject
    if attempt.exam_id:
        exam = db.query(Exam).filter(Exam.id == attempt.exam_id).first()
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Exam '{attempt.exam_id}' not found."
            )
        if not subject_id:
            subject_id = exam.subject_id

    # Validate topic if supplied
    if topic_id:
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic and not attempt.exam_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Topic '{topic_id}' not found."
            )
        if topic and not subject_id:
            subject_id = topic.subject_id
    if not attempt.exam_id and not subject_id and not topic_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either topic_id, subject_id, or exam_id must be provided."
        )

    trusted_score = attempt.score
    total_valid_q = attempt.total_questions

    # Backend answer-key validation: recalculate score from answer key if provided
    if attempt.answers_json:
        try:
            answers_data = json.loads(attempt.answers_json)
            if isinstance(answers_data, list) and len(answers_data) > 0:
                has_eval_keys = False
                verified_correct = 0
                for item in answers_data:
                    sel = item.get("selectedOption") if "selectedOption" in item else item.get("selected_option")
                    cor = item.get("correctOption") if "correctOption" in item else item.get("correct_answer")
                    if sel is not None and cor is not None:
                        has_eval_keys = True
                        if sel == cor:
                            verified_correct += 1
                    elif "isCorrect" in item or "is_correct" in item:
                        has_eval_keys = True
                        if item.get("isCorrect") or item.get("is_correct"):
                            verified_correct += 1

                if has_eval_keys:
                    trusted_score = float(verified_correct)
                    total_valid_q = len(answers_data)
        except Exception:
            pass

    percentage = round((trusted_score / total_valid_q) * 100, 1)

    attempt_id = attempt.id or f"attempt-{int(datetime.now().timestamp() * 1000)}-{uuid.uuid4().hex[:6]}"
    now = datetime.now(timezone.utc)

    db_attempt = QuizAttempt(
        id=attempt_id,
        student_id=sid,
        topic_id=topic_id,
        subject_id=subject_id,
        exam_id=attempt.exam_id,
        score=trusted_score,
        total_questions=total_valid_q,
        duration_seconds=attempt.duration_seconds,
        percentage=percentage,
        difficulty=attempt.difficulty,
        format=attempt.format,
        answers_json=attempt.answers_json,
        module_scope_json=attempt.module_scope_json,
        module_results_json=attempt.module_results_json,
        attempted_at=attempt.attempted_at or now
    )
    db.add(db_attempt)

    # Only update TopicProgress metrics for single-topic quizzes (never touch completion percentage!)
    if not attempt.exam_id and topic_id:
        progress = db.query(TopicProgress).filter(
            TopicProgress.student_id == sid,
            TopicProgress.topic_id == topic_id
        ).first()

        if not progress:
            progress = TopicProgress(
                student_id=sid,
                topic_id=topic_id,
                completion=0.0,
                mastery="Doing well" if percentage >= 80 else "Needs Practice",
                status="mastered" if percentage >= 80 else ("learning" if percentage >= 40 else "needs_practice"),
                quiz_attempts=1,
                average_quiz_score=percentage,
                last_studied=now
            )
            db.add(progress)
        else:
            prev_attempts = progress.quiz_attempts or 0
            new_attempts = prev_attempts + 1
            prev_avg = progress.average_quiz_score if progress.average_quiz_score is not None else percentage
            new_avg = round((prev_avg * prev_attempts + percentage) / new_attempts, 1)

            progress.quiz_attempts = new_attempts
            progress.average_quiz_score = new_avg
            progress.last_studied = now

            # Update mastery and status without touching syllabus completion
            if new_avg >= 80:
                progress.status = "mastered"
                progress.mastery = "Doing well"
            elif new_avg >= 60:
                progress.status = "learned"
                progress.mastery = "Doing well"
            elif new_avg >= 40:
                progress.status = "learning"
                progress.mastery = "Review soon"
            else:
                progress.status = "needs_practice"
                progress.mastery = "Needs Practice"

    db.commit()
    db.refresh(db_attempt)

    # If this attempt was taken for a specific exam, immediately refresh and persist the scope prediction
    if attempt.exam_id:
        try:
            from backend.app.routers.predictions import get_exam_module_prediction_endpoint
            get_exam_module_prediction_endpoint(exam_id=attempt.exam_id, student_id=sid, db=db)
        except Exception as e:
            # Non-blocking logging: quiz attempt is already committed
            pass

    return db_attempt
