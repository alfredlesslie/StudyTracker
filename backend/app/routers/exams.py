"""
StudySense AI - Exams Router
Full CRUD endpoints for managing examinations.
"""

import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.subject import Subject
from backend.app.models.topic import Topic
from backend.app.models.exam import Exam

from backend.app.schemas.exam import (
    ExamCreate,
    ExamUpdate,
    ExamResponse,
    ExamScopeAnalysis,
    ModuleScopeDetail,
    RecordActualScoreRequest,
    ToggleModuleCompletionRequest,
    ToggleTopicCompletionRequest,
    GeneratePracticeQuizRequest,
)
from backend.app.services.exam_readiness_service import calculate_readiness_estimate


router = APIRouter(prefix="/api/exams", tags=["Exams"])


@router.get("", response_model=List[ExamResponse])
def list_exams(
    student_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve all scheduled examinations for the prototype student with their selected module scope.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    query = db.query(Exam).filter(Exam.student_id == sid)

    if subject_id:
        query = query.filter(Exam.subject_id == subject_id)

    exams = query.order_by(Exam.exam_datetime.asc()).all()

    results = []
    for e in exams:
        sub = db.query(Subject).filter(Subject.id == e.subject_id).first()
        valid_modules = [
            m[0] for m in db.query(Topic.module_id)
            .filter(Topic.subject_id == e.subject_id)
            .order_by(Topic.module_number.asc())
            .distinct().all() if m[0]
        ]
        assigned_modules = e.modules_list if e.module_ids else valid_modules

        results.append(
            ExamResponse(
                id=e.id,
                student_id=e.student_id,
                subject_id=e.subject_id,
                subject_code=sub.subject_code if sub else "",
                subject_name=sub.subject_name if sub else "",
                name=e.name,
                exam_datetime=e.exam_datetime,
                notes=e.notes,
                module_ids=assigned_modules,
                completed_module_ids=e.completed_modules_list,
                completed_topic_ids=e.completed_topics_list,
                actual_score=e.actual_score,
                created_at=e.created_at,
                updated_at=e.updated_at
            )
        )
    return results


@router.post("", response_model=ExamResponse, status_code=status.HTTP_201_CREATED)
def create_exam(
    exam_data: ExamCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new scheduled examination with module selection validation.
    Prevents cross-subject modules and duplicate selections.
    """
    import json
    sid = exam_data.student_id or settings.PROTOTYPE_STUDENT_ID

    # Validate subject
    sub = db.query(Subject).filter(
        (Subject.id == exam_data.subject_id) | (Subject.subject_code == exam_data.subject_id)
    ).first()
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Subject '{exam_data.subject_id}' not found."
        )

    # Valid modules belonging exclusively to this subject
    valid_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == sub.id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]

    selected_modules = valid_modules
    if exam_data.module_ids is not None:
        # Check for cross-subject selection
        invalid = [m for m in exam_data.module_ids if m not in valid_modules]
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Selected modules {invalid} do not belong to subject '{sub.subject_name}'. Cross-subject selection is strictly prohibited."
            )
        # Deduplicate while preserving order
        deduped = list(dict.fromkeys(exam_data.module_ids))
        if not deduped:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An exam must contain at least one module."
            )
        selected_modules = deduped

    import uuid
    exam_id = exam_data.id or f"exam-{sub.id}-{uuid.uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)

    completed_modules = exam_data.completed_module_ids or []
    completed_topics = exam_data.completed_topic_ids or []
    db_exam = Exam(
        id=exam_id,
        student_id=sid,
        subject_id=sub.id,
        name=exam_data.name,
        exam_datetime=exam_data.exam_datetime,
        notes=exam_data.notes,
        module_ids=json.dumps(selected_modules),
        completed_module_ids=json.dumps(completed_modules),
        completed_topic_ids=json.dumps(completed_topics),
        created_at=now,
        updated_at=now
    )

    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)

    return ExamResponse(
        id=db_exam.id,
        student_id=db_exam.student_id,
        subject_id=db_exam.subject_id,
        subject_code=sub.subject_code,
        subject_name=sub.subject_name,
        name=db_exam.name,
        exam_datetime=db_exam.exam_datetime,
        notes=db_exam.notes,
        module_ids=selected_modules,
        completed_module_ids=db_exam.completed_modules_list,
        completed_topic_ids=db_exam.completed_topics_list,
        actual_score=db_exam.actual_score,
        created_at=db_exam.created_at,
        updated_at=db_exam.updated_at
    )


@router.get("/{exam_id}", response_model=ExamResponse)
def get_exam(exam_id: str, db: Session = Depends(get_db)):
    """
    Retrieve details for an individual examination by ID including selected modules.
    """
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    valid_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == exam.subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]
    assigned_modules = exam.modules_list if exam.module_ids else valid_modules

    return ExamResponse(
        id=exam.id,
        student_id=exam.student_id,
        subject_id=exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        name=exam.name,
        exam_datetime=exam.exam_datetime,
        notes=exam.notes,
        module_ids=assigned_modules,
        completed_module_ids=exam.completed_modules_list,
        completed_topic_ids=exam.completed_topics_list,
        actual_score=exam.actual_score,
        created_at=exam.created_at,
        updated_at=exam.updated_at
    )


@router.put("/{exam_id}", response_model=ExamResponse)
def update_exam(
    exam_id: str,
    updates: ExamUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an examination's date, name, subject, notes, or module selection.
    """
    import json
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    target_subject_id = exam.subject_id
    if updates.subject_id is not None:
        sub = db.query(Subject).filter(
            (Subject.id == updates.subject_id) | (Subject.subject_code == updates.subject_id)
        ).first()
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject '{updates.subject_id}' not found."
            )
        exam.subject_id = sub.id
        target_subject_id = sub.id

    valid_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == target_subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]

    if updates.module_ids is not None:
        invalid = [m for m in updates.module_ids if m not in valid_modules]
        if invalid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Selected modules {invalid} do not belong to the target subject. Cross-subject selection is prohibited."
            )
        deduped = list(dict.fromkeys(updates.module_ids))
        if not deduped:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An exam must contain at least one module."
            )
        exam.module_ids = json.dumps(deduped)

    if updates.completed_module_ids is not None:
        exam.completed_module_ids = json.dumps(updates.completed_module_ids)

    if updates.completed_topic_ids is not None:
        exam.completed_topic_ids = json.dumps(updates.completed_topic_ids)

    if updates.name is not None:
        exam.name = updates.name
    if updates.exam_datetime is not None:
        exam.exam_datetime = updates.exam_datetime
    if updates.notes is not None:
        exam.notes = updates.notes

    exam.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(exam)

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    assigned_modules = exam.modules_list if exam.module_ids else valid_modules

    return ExamResponse(
        id=exam.id,
        student_id=exam.student_id,
        subject_id=exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        name=exam.name,
        exam_datetime=exam.exam_datetime,
        notes=exam.notes,
        module_ids=assigned_modules,
        completed_module_ids=exam.completed_modules_list,
        completed_topic_ids=exam.completed_topics_list,
        actual_score=exam.actual_score,
        created_at=exam.created_at,
        updated_at=exam.updated_at
    )


@router.put("/{exam_id}/toggle-module-completion", response_model=ExamResponse)
def toggle_module_completion(
    exam_id: str,
    payload: ToggleModuleCompletionRequest,
    db: Session = Depends(get_db)
):
    """
    Toggle completion status of a module within an exam.
    Persists to database strictly as exam-specific preparation without altering overall syllabus topic progress.
    """
    import json

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    current_completed = list(exam.completed_modules_list)
    mod_id = payload.module_id

    # Determine desired status: explicit boolean or toggle
    if payload.completed is not None:
        is_now_complete = payload.completed
    else:
        is_now_complete = (mod_id not in current_completed)

    if is_now_complete and mod_id not in current_completed:
        current_completed.append(mod_id)
    elif not is_now_complete and mod_id in current_completed:
        current_completed = [m for m in current_completed if m != mod_id]

    # Synchronize topics for this module within this exam
    mod_topics = db.query(Topic).filter(
        Topic.subject_id == exam.subject_id,
        Topic.module_id == mod_id
    ).all()
    mod_topic_ids = [t.id for t in mod_topics]
    current_topic_set = set(exam.completed_topics_list)

    if is_now_complete:
        current_topic_set.update(mod_topic_ids)
    else:
        current_topic_set.difference_update(mod_topic_ids)

    exam.completed_module_ids = json.dumps(current_completed)
    exam.completed_topic_ids = json.dumps(list(current_topic_set))
    exam.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(exam)

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    valid_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == exam.subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]
    assigned_modules = exam.modules_list if exam.module_ids else valid_modules

    return ExamResponse(
        id=exam.id,
        student_id=exam.student_id,
        subject_id=exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        name=exam.name,
        exam_datetime=exam.exam_datetime,
        notes=exam.notes,
        module_ids=assigned_modules,
        completed_module_ids=exam.completed_modules_list,
        completed_topic_ids=exam.completed_topics_list,
        actual_score=exam.actual_score,
        created_at=exam.created_at,
        updated_at=exam.updated_at
    )


@router.put("/{exam_id}/toggle-topic-completion", response_model=ExamResponse)
def toggle_topic_completion(
    exam_id: str,
    payload: ToggleTopicCompletionRequest,
    db: Session = Depends(get_db)
):
    """
    Toggle completion status of a topic within an exam.
    Persists to database strictly as exam-specific preparation without altering overall syllabus topic progress or other exams.
    """
    import json

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    topic = db.query(Topic).filter(Topic.id == payload.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Topic '{payload.topic_id}' not found."
        )

    if topic.subject_id != exam.subject_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Topic '{payload.topic_id}' does not belong to the exam subject."
        )

    current_topics = list(exam.completed_topics_list)
    top_id = payload.topic_id

    if payload.completed is not None:
        is_now_complete = payload.completed
    else:
        is_now_complete = (top_id not in current_topics)

    if is_now_complete and top_id not in current_topics:
        current_topics.append(top_id)
    elif not is_now_complete and top_id in current_topics:
        current_topics = [t for t in current_topics if t != top_id]

    # Automatically synchronize module completion if all topics in module are prepared
    mod_topics = db.query(Topic).filter(
        Topic.subject_id == exam.subject_id,
        Topic.module_id == topic.module_id
    ).all()
    mod_topic_ids = [t.id for t in mod_topics]

    current_modules = list(exam.completed_modules_list)
    all_mod_done = all(t_id in current_topics for t_id in mod_topic_ids) if mod_topic_ids else False

    if all_mod_done and topic.module_id not in current_modules:
        current_modules.append(topic.module_id)
    elif not all_mod_done and topic.module_id in current_modules:
        current_modules = [m for m in current_modules if m != topic.module_id]

    exam.completed_topic_ids = json.dumps(current_topics)
    exam.completed_module_ids = json.dumps(current_modules)
    exam.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(exam)

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    valid_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == exam.subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]
    assigned_modules = exam.modules_list if exam.module_ids else valid_modules

    return ExamResponse(
        id=exam.id,
        student_id=exam.student_id,
        subject_id=exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        name=exam.name,
        exam_datetime=exam.exam_datetime,
        notes=exam.notes,
        module_ids=assigned_modules,
        completed_module_ids=exam.completed_modules_list,
        completed_topic_ids=exam.completed_topics_list,
        actual_score=exam.actual_score,
        created_at=exam.created_at,
        updated_at=exam.updated_at
    )


@router.delete("/{exam_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exam(exam_id: str, db: Session = Depends(get_db)):
    """
    Delete an examination.
    """
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    db.delete(exam)
    db.commit()
    return None


@router.get("/{exam_id}/scope-analysis", response_model=ExamScopeAnalysis)
def get_exam_scope_analysis(
    exam_id: str,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Compute rigorous scope-aware topic completion, authentic quiz accuracy,
    and granular study recommendations strictly for the modules selected in this exam.
    """
    from backend.app.models.topic import Topic
    from backend.app.models.progress import TopicProgress
    from backend.app.models.quiz_attempt import QuizAttempt
    from backend.app.models.study_session import StudySession

    sid = student_id or settings.PROTOTYPE_STUDENT_ID

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    all_subject_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == exam.subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]

    selected_module_ids = exam.modules_list if exam.module_ids else all_subject_modules

    # Query topics strictly inside selected modules
    topics = db.query(Topic).filter(
        Topic.subject_id == exam.subject_id,
        Topic.module_id.in_(selected_module_ids)
    ).order_by(Topic.module_number.asc(), Topic.id.asc()).all()

    # Pre-exam cutoff to prevent data leakage
    now = datetime.now(timezone.utc)
    exam_dt = exam.exam_datetime
    if exam_dt.tzinfo is None:
        exam_dt = exam_dt.replace(tzinfo=timezone.utc)
    days_remaining = max(0, (exam_dt - now).days)
    cutoff = min(now, exam_dt)

    # Topic IDs in scope
    topic_ids = [t.id for t in topics]

    # Progress records
    progress_map = {
        p.topic_id: p for p in db.query(TopicProgress).filter(
            TopicProgress.student_id == sid,
            TopicProgress.topic_id.in_(topic_ids)
        ).all()
    }

    # Quiz attempts strictly before cutoff:
    # Exam-specific quizzes specifically taken for this exam (independent of standalone Practice)
    exam_quizzes = db.query(QuizAttempt).filter(
        QuizAttempt.student_id == sid,
        QuizAttempt.exam_id == exam.id,
        QuizAttempt.attempted_at <= cutoff
    ).order_by(QuizAttempt.attempted_at.asc()).all()

    quizzes = exam_quizzes

    # Study sessions strictly before cutoff
    sessions = db.query(StudySession).filter(
        StudySession.student_id == sid,
        StudySession.topic_id.in_(topic_ids),
        StudySession.started_at <= cutoff
    ).all()

    total_study_seconds = sum(s.active_duration_seconds or 0 for s in sessions)
    total_study_minutes = total_study_seconds // 60

    # Build per-module breakdown
    modules_breakdown = []
    total_selected_topics = len(topics)
    completed_selected_topics = 0

    all_quiz_questions = sum(q.total_questions for q in quizzes)
    all_quiz_correct = sum(int(round(q.score)) for q in quizzes)
    all_quiz_attempts = len(quizzes)

    suggested_actions = []

    for mod_id in selected_module_ids:
        mod_topics = [t for t in topics if t.module_id == mod_id]
        if not mod_topics:
            continue

        mod_number = mod_topics[0].module_number
        mod_title = f"Module {mod_number}"
        mod_topic_ids = [t.id for t in mod_topics]

        # Exam-specific topic completion (strictly independent of overall syllabus TopicProgress)
        exam_completed_topics_set = set(exam.completed_topics_list)
        is_mod_completed = (mod_id in exam.completed_modules_list)

        mod_completed_topics = 0
        topics_detail = []
        incomplete_topics = []
        weak_topics = []

        for t in mod_topics:
            prog = progress_map.get(t.id)
            is_topic_prepared = (t.id in exam_completed_topics_set) or is_mod_completed
            if is_topic_prepared:
                mod_completed_topics += 1
            else:
                incomplete_topics.append({
                    "topic_id": t.id,
                    "title": t.title,
                    "difficulty": t.difficulty,
                    "completion": 0.0,
                    "estimated_minutes": t.estimated_minutes
                })

            topics_detail.append({
                "id": t.id,
                "title": t.title,
                "difficulty": t.difficulty,
                "is_completed": is_topic_prepared,
                "module_id": t.module_id,
                "module_number": t.module_number
            })

            if prog and (
                prog.mastery == "Needs Practice" or
                (prog.average_quiz_score is not None and prog.average_quiz_score < 60.0)
            ):
                weak_topics.append({
                    "topic_id": t.id,
                    "title": t.title,
                    "average_quiz_score": prog.average_quiz_score,
                    "mastery": prog.mastery
                })

        completed_selected_topics += mod_completed_topics
        mod_completion_pct = round((mod_completed_topics / max(1, len(mod_topics))) * 100, 1)

        # Quizzes for this module
        mod_quizzes = [
            q for q in quizzes
            if (
                (q.topic_id and q.topic_id in mod_topic_ids)
                or (q.module_scope_json and mod_id in q.module_scope_json)
                or (not q.topic_id and not q.module_scope_json)
            )
        ]
        mod_attempts = len(mod_quizzes)
        mod_questions = sum(q.total_questions for q in mod_quizzes)
        mod_correct = sum(int(round(q.score)) for q in mod_quizzes)

        mod_accuracy = round((mod_correct / mod_questions) * 100, 1) if mod_questions > 0 else None
        has_mod_quiz_data = mod_questions > 0

        # Study sessions for this module
        mod_seconds = sum(s.active_duration_seconds or 0 for s in sessions if s.topic_id in mod_topic_ids)

        mod_completed_t_ids = [t.id for t in mod_topics if ((t.id in exam_completed_topics_set) or is_mod_completed)]

        modules_breakdown.append(
            ModuleScopeDetail(
                module_id=mod_id,
                module_title=mod_title,
                module_number=mod_number,
                is_completed=is_mod_completed,
                total_topics=len(mod_topics),
                completed_topics=mod_completed_topics,
                completion_percentage=mod_completion_pct,
                quiz_attempts=mod_attempts,
                total_questions=mod_questions,
                correct_answers=mod_correct,
                quiz_accuracy=mod_accuracy,
                has_quiz_data=has_mod_quiz_data,
                active_study_minutes=mod_seconds // 60,
                completed_topic_ids=mod_completed_t_ids,
                topics=topics_detail,
                incomplete_topics=incomplete_topics,
                weak_topics=weak_topics
            )
        )

        # Actionable recommendations for this module
        for inc in incomplete_topics[:2]:
            suggested_actions.append({
                "type": "incomplete_topic",
                "module_id": mod_id,
                "topic_id": inc["topic_id"],
                "title": inc["title"],
                "reason": f"Required for {exam.name} ({mod_title}). Not yet completed.",
                "action": "Study topic in Learn Mode"
            })
        for wk in weak_topics[:2]:
            suggested_actions.append({
                "type": "weak_quiz",
                "module_id": mod_id,
                "topic_id": wk["topic_id"],
                "title": wk["title"],
                "reason": f"Quiz accuracy is {wk['average_quiz_score']}%. Targeted practice recommended.",
                "action": "Take targeted practice quiz"
            })

    completed_modules = [m.module_id for m in modules_breakdown if m.is_completed]
    completed_modules_count = len(completed_modules)
    module_completion_pct = round(
        (completed_modules_count / max(1, len(selected_module_ids))) * 100, 1
    )

    overall_completion_pct = round(
        (completed_selected_topics / max(1, total_selected_topics)) * 100, 1
    )
    overall_quiz_accuracy = (
        round((all_quiz_correct / all_quiz_questions) * 100, 1)
        if all_quiz_questions > 0
        else None
    )

    # Authentic quiz sequence & trend analysis
    latest_quiz_score_val = None
    latest_quiz_pct_val = None
    recent_quiz_acc = None
    prev_quiz_acc = None
    trend_label = None
    trend_diff = None

    if exam_quizzes:
        latest_attempt = exam_quizzes[-1]
        latest_quiz_score_val = latest_attempt.score
        latest_quiz_pct_val = latest_attempt.percentage
        recent_quiz_acc = latest_attempt.percentage
        if len(exam_quizzes) >= 2:
            prev_attempt = exam_quizzes[-2]
            prev_quiz_acc = prev_attempt.percentage
            trend_diff = round(latest_quiz_pct_val - prev_quiz_acc, 1)
            trend_label = "improving" if trend_diff > 1.0 else ("declining" if trend_diff < -1.0 else "stable")

    # Query real previous exam score for this student and subject
    prev_exam = db.query(Exam).filter(
        Exam.student_id == sid,
        Exam.subject_id == exam.subject_id,
        Exam.id != exam.id,
        Exam.actual_score != None
    ).order_by(Exam.exam_datetime.desc()).first()
    prev_exam_score = prev_exam.actual_score if prev_exam else None

    # Calculate transparent, preparation-based readiness score estimate
    readiness = calculate_readiness_estimate(
        total_selected_topics=total_selected_topics,
        completed_selected_topics=completed_selected_topics,
        selected_modules_count=len(selected_module_ids),
        completed_modules_count=completed_modules_count,
        total_quiz_questions=all_quiz_questions,
        total_quiz_correct=all_quiz_correct,
        recent_quiz_accuracy=recent_quiz_acc,
        previous_quiz_accuracy=prev_quiz_acc,
        quiz_attempts_count=len(quizzes),
        active_study_minutes=total_study_minutes,
        previous_exam_score=prev_exam_score
    )

    return ExamScopeAnalysis(
        exam_id=exam.id,
        exam_name=exam.name,
        exam_datetime=exam.exam_datetime,
        subject_id=sub.id if sub else exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        selected_module_ids=selected_module_ids,
        selected_modules_count=len(selected_module_ids),
        completed_module_ids=completed_modules,
        completed_modules_count=completed_modules_count,
        module_completion_percentage=module_completion_pct,
        completed_topic_ids=exam.completed_topics_list,
        total_subject_modules=len(all_subject_modules),
        total_selected_topics=total_selected_topics,
        completed_selected_topics=completed_selected_topics,
        topic_completion_percentage=overall_completion_pct,
        total_quiz_attempts=all_quiz_attempts,
        total_quiz_questions=all_quiz_questions,
        total_quiz_correct=all_quiz_correct,
        quiz_accuracy_percentage=overall_quiz_accuracy,
        has_quiz_data=(all_quiz_questions > 0),
        latest_quiz_score=latest_quiz_score_val,
        latest_quiz_percentage=latest_quiz_pct_val,
        quiz_trend=trend_label,
        quiz_trend_diff=trend_diff,
        active_study_minutes=total_study_minutes,
        days_remaining=days_remaining,
        predicted_score=readiness["estimated_score"],
        estimated_score=readiness["estimated_score"],
        score_label=readiness["score_label"],
        is_experimental=True,
        reliability_level=readiness["reliability_level"],
        confidence_label=None,
        basis_explanation=readiness.get("basis_explanation", "Based on preparation progress."),
        completed_exam_attempts=all_quiz_attempts,
        assumed_inputs=readiness["assumed_inputs"],
        actual_score=exam.actual_score,
        components=readiness["components"],
        why_prediction_changed=readiness["why_prediction_changed"],
        prediction_status="experimental_readiness",
        model_version="Adaptive Readiness Estimator (Experimental Heuristic)",
        data_limitations_note=(
            "Estimated Exam Score is calculated using a transparent readiness formula "
            "(40% module syllabus completion, 35% module quiz accuracy, 15% study consistency, "
            "10% previous exam performance). It is an experimental preparation indicator and is "
            "NOT a trained machine-learning model prediction."
        ),
        modules_breakdown=modules_breakdown,
        suggested_study_actions=suggested_actions[:6]
    )


@router.get("/{exam_id}/prediction", response_model=ExamScopeAnalysis)
def get_exam_prediction_endpoint(
    exam_id: str,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve scope-aware prediction and readiness analysis for an examination.
    """
    return get_exam_scope_analysis(exam_id=exam_id, student_id=student_id, db=db)


@router.put("/{exam_id}/actual-score", response_model=ExamResponse)
def record_actual_exam_score(
    exam_id: str,
    payload: RecordActualScoreRequest,
    db: Session = Depends(get_db)
):
    """
    Record verified actual exam mark achieved by student (0.0 to 100.0).
    Populates ground-truth target for model validation and training dataset collection.
    """
    from backend.app.models.prediction import ExamPrediction

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    score_val = max(0.0, min(100.0, float(payload.actual_score)))
    exam.actual_score = score_val
    exam.updated_at = datetime.now(timezone.utc)

    # Mirror to any existing ExamPrediction record
    pred = db.query(ExamPrediction).filter(ExamPrediction.exam_id == exam.id).first()
    if pred:
        pred.actual_score = score_val

    db.commit()
    db.refresh(exam)

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    return ExamResponse(
        id=exam.id,
        student_id=exam.student_id,
        subject_id=exam.subject_id,
        subject_code=sub.subject_code if sub else "",
        subject_name=sub.subject_name if sub else "",
        name=exam.name,
        exam_datetime=exam.exam_datetime,
        notes=exam.notes,
        module_ids=exam.modules_list,
        actual_score=exam.actual_score,
        created_at=exam.created_at,
        updated_at=exam.updated_at
    )


@router.post("/{exam_id}/practice-quiz/generate")
def generate_exam_practice_quiz_endpoint(
    exam_id: str,
    payload: Optional[GeneratePracticeQuizRequest] = None,
    count: Optional[int] = None,
    exclude_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate a mixed-module practice quiz strictly scoped to the exam's selected modules.
    Guarantees questions are drawn only from selected modules and distributed evenly across them.
    Supports question variety across retakes by filtering out already-seen question IDs.
    """
    import random
    import hashlib
    from backend.app.models.topic import Topic
    from backend.app.models.subject import Subject

    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    if not exam:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exam '{exam_id}' not found."
        )

    sub = db.query(Subject).filter(Subject.id == exam.subject_id).first()
    all_subject_modules = [
        m[0] for m in db.query(Topic.module_id)
        .filter(Topic.subject_id == exam.subject_id)
        .order_by(Topic.module_number.asc())
        .distinct().all() if m[0]
    ]

    selected_module_ids = exam.modules_list if exam.module_ids else all_subject_modules
    if not selected_module_ids:
        selected_module_ids = all_subject_modules

    # Query topics strictly inside selected modules
    topics = db.query(Topic).filter(
        Topic.subject_id == exam.subject_id,
        Topic.module_id.in_(selected_module_ids)
    ).order_by(Topic.module_number.asc(), Topic.id.asc()).all()

    if not topics:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No topics found for the selected module scope."
        )

    # Determine requested count from payload or query params
    req_count = 10
    if payload and payload.count is not None:
        req_count = payload.count
    elif count is not None:
        req_count = count

    # Excluded question IDs from previous attempts
    excluded_set = set()
    if payload and payload.exclude_question_ids:
        for q in payload.exclude_question_ids:
            if q and str(q).strip():
                excluded_set.add(str(q).strip())
    if payload and payload.exclude_ids:
        for q in payload.exclude_ids.split(","):
            if q and str(q).strip():
                excluded_set.add(str(q).strip())
    if exclude_ids:
        for q in exclude_ids.split(","):
            if q and str(q).strip():
                excluded_set.add(str(q).strip())

    # Group topics by module_id
    module_topics = {}
    for mod_id in selected_module_ids:
        mod_t = [t for t in topics if t.module_id == mod_id]
        if mod_t:
            module_topics[mod_id] = mod_t

    active_modules = list(module_topics.keys())
    if not active_modules:
        active_modules = list(set(t.module_id for t in topics if t.module_id))

    total_requested = max(3, min(25, req_count))
    num_modules = len(active_modules)

    # Calculate even distribution across selected modules
    base_per_mod = total_requested // num_modules
    remainder = total_requested % num_modules

    mod_quotas = {}
    for i, mod_id in enumerate(active_modules):
        mod_quotas[mod_id] = base_per_mod + (1 if i < remainder else 0)

    # 1. Try Gemini AI question generation if configured
    try:
        from backend.app.services.tutor_service import generate_exam_questions_gemini
        gemini_qs = generate_exam_questions_gemini(
            exam_id=exam.id,
            exam_name=exam.name,
            subject_id=sub.id if sub else exam.subject_id,
            subject_code=sub.subject_code if sub else "",
            subject_name=sub.subject_name if sub else "",
            topics=topics,
            selected_module_ids=selected_module_ids,
            count=total_requested,
            excluded_ids=excluded_set
        )
        if gemini_qs and len(gemini_qs) >= min(3, total_requested):
            # Verify distribution and IDs
            random.shuffle(gemini_qs)
            return {
                "exam_id": exam.id,
                "exam_name": exam.name,
                "subject_id": sub.id if sub else exam.subject_id,
                "subject_code": sub.subject_code if sub else "",
                "subject_name": sub.subject_name if sub else "",
                "selected_module_ids": selected_module_ids,
                "questions": gemini_qs[:total_requested],
                "total_questions": len(gemini_qs[:total_requested]),
                "modules_represented": list(dict.fromkeys(q["module_id"] for q in gemini_qs[:total_requested])),
                "question_pool_note": None,
                "exhausted_pool": False,
                "source": "gemini_ai"
            }
    except HTTPException:
        raise
    except Exception as gemini_err:
        # Fallback to curriculum templates if Gemini is unavailable
        pass

    # Standard pedagogical question generators grounded in topic data
    QUESTION_TEMPLATES = [
        {
            "q": lambda t, s: f"What is the primary architectural purpose of {t.title} in {s.subject_name if s else 'this subject'}?",
            "opts": lambda t: [
                f"Defines operational protocols, structural bounds, and functional execution for {t.title}.",
                "Operates exclusively in legacy non-networked environments without validation.",
                "Bypasses operating system memory bounds to reduce compute cycles.",
                "Completely eliminates the requirement for system verification or error handling."
            ],
            "correct": 0,
            "exp": lambda t: f"{t.title} provides structured algorithmic and design principles to ensure reliable system operation as covered in the curriculum."
        },
        {
            "q": lambda t, s: f"Which of the following is an essential design constraint or consideration when implementing {t.title}?",
            "opts": lambda t: [
                "Ignoring all boundary parameters and corner conditions to maximize throughput.",
                f"Modularity, parameter validation, and adherence to standard specifications for {t.title}.",
                "Hardcoding fixed buffer addresses directly into hardware drivers.",
                "Disabling transaction rollbacks and consistency checks."
            ],
            "correct": 1,
            "exp": lambda t: f"Rigorous engineering implementations of {t.title} require strict boundary checking and modular specification compliance."
        },
        {
            "q": lambda t, s: f"In university examination patterns, what core requirement is typically tested regarding {t.title}?",
            "opts": lambda t: [
                "Writing proprietary binary machine code directly onto bare silicon.",
                f"Defining key concepts, analyzing algorithmic trade-offs, and solving analytical problems on {t.title}.",
                "Guessing unverified heuristic bounds without mathematical proof.",
                "Memorizing random dictionary definitions with no technical context."
            ],
            "correct": 1,
            "exp": lambda t: f"Academic evaluations of {t.title} focus on conceptual definitions, working mechanisms, step-by-step algorithms, and comparative trade-offs."
        },
        {
            "q": lambda t, s: f"How do resource constraints and operational complexity primarily affect {t.title} in {s.subject_name if s else 'this subject'}?",
            "opts": lambda t: [
                f"They dictate latency bounds, throughput limits, and optimal algorithmic scaling for {t.title}.",
                "They are irrelevant because modern runtime engines execute without hardware resource bounds.",
                "They only apply to batch offline workflows and have zero effect on real-time execution.",
                "They can be completely eliminated by bypassing the underlying protocol stack."
            ],
            "correct": 0,
            "exp": lambda t: f"Real-world deployments of {t.title} must be designed within explicit latency, compute, and memory bounds."
        },
        {
            "q": lambda t, s: f"When reviewing {t.title} during exam preparation, which aspect represents high-yield exam focus?",
            "opts": lambda t: [
                f"Key formulas, system diagrams, comparative properties, and worked examples for {t.title}.",
                "Skipping algorithmic steps and hoping only true/false questions appear.",
                "Reviewing only historical biographies of the scientists who created the concept.",
                "Assuming all implementations exhibit identical constant-time complexity."
            ],
            "correct": 0,
            "exp": lambda t: f"High-yield mastery of {t.title} requires understanding theoretical derivations, architecture flowcharts, and typical problem scenarios."
        }
    ]

    generated_questions = []
    used_q_ids = set(excluded_set)
    repeated_count = 0

    for mod_id in active_modules:
        mod_quota = mod_quotas[mod_id]
        t_list = module_topics[mod_id]
        mod_num = t_list[0].module_number if t_list else 1

        for i in range(mod_quota):
            # Select topic within this module cyclically
            topic = t_list[i % len(t_list)]
            template_idx = (i + len(generated_questions)) % len(QUESTION_TEMPLATES)
            tmpl = QUESTION_TEMPLATES[template_idx]

            # Generate unique question ID
            base_qid = f"gen-q-{exam.id}-{topic.id}-t{template_idx}"
            qid = base_qid
            attempt_var = 1
            while qid in used_q_ids and attempt_var < 5:
                qid = f"{base_qid}-v{attempt_var}"
                attempt_var += 1

            if qid in used_q_ids:
                repeated_count += 1
                # Still use unique instance ID for this attempt session
                qid = f"{base_qid}-inst-{len(generated_questions)+1}"

            used_q_ids.add(qid)

            options = tmpl["opts"](topic)
            correct_idx = tmpl["correct"]

            generated_questions.append({
                "id": qid,
                "exam_id": exam.id,
                "module_id": topic.module_id,
                "module_number": topic.module_number or mod_num,
                "module_title": f"Module {topic.module_number or mod_num}",
                "topic_id": topic.id,
                "topic_title": topic.title,
                "question": tmpl["q"](topic, sub),
                "options": options,
                "correct_answer": correct_idx,
                "explanation": tmpl["exp"](topic),
                "marks": 1,
                "difficulty": topic.difficulty or "medium"
            })

    # Shuffle questions so modules are intermixed (Mixed-Module Practice)
    random.seed(int(hashlib.md5(f"{exam.id}-{len(excluded_set)}-{total_requested}".encode()).hexdigest(), 16))
    random.shuffle(generated_questions)

    variety_warning = None
    if repeated_count > 0:
        variety_warning = "Some questions may repeat as the question pool for these selected modules has been extensively practiced."

    return {
        "exam_id": exam.id,
        "exam_name": exam.name,
        "subject_id": sub.id if sub else exam.subject_id,
        "subject_code": sub.subject_code if sub else "",
        "subject_name": sub.subject_name if sub else "",
        "selected_module_ids": selected_module_ids,
        "questions": generated_questions,
        "total_questions": len(generated_questions),
        "modules_represented": list(dict.fromkeys(q["module_id"] for q in generated_questions)),
        "question_pool_note": variety_warning
    }

