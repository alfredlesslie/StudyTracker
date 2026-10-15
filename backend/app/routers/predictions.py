"""
StudySense AI - Predictions Router
Provides ML score predictions, authentic historical prediction retrieval,
and direct feature prediction preserving existing API contracts.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.prediction import ExamPrediction
from backend.app.schemas.prediction import (
    ExamPredictionResponse,
    PredictionResultResponse,
    DirectFeaturePredictionInput,
    DirectPredictionResponse,
    ExamModulePredictionResponse,
)

from backend.app.services.ml_service import generate_subject_prediction
from ml.src.predict import predict_exam_score

router = APIRouter(tags=["Predictions"])


@router.get("/api/predictions", response_model=List[ExamPredictionResponse])
def get_prediction_history(
    student_id: Optional[str] = None,
    subject_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve stored genuine ML predictions.
    Contains only real model inferences, never fake sample data.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    query = db.query(ExamPrediction).filter(ExamPrediction.student_id == sid)

    if subject_id:
        query = query.filter(ExamPrediction.subject_id == subject_id)

    return query.order_by(ExamPrediction.generated_at.desc()).all()


@router.get("/api/predictions/subject/{subject_id}", response_model=PredictionResultResponse)
def get_subject_prediction_endpoint(
    subject_id: str,
    exam_id: Optional[str] = Query(None, description="Optional target exam ID"),
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Generate or retrieve a genuine ML prediction for a specific subject based on actual student activity.
    If study data is insufficient, returns a clear insufficient-data status without fabricating a score.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID

    result = generate_subject_prediction(
        db=db,
        student_id=sid,
        subject_id=subject_id,
        exam_id=exam_id
    )

    return result


@router.get("/api/predictions/exam/{exam_id}", response_model=ExamModulePredictionResponse)
def get_exam_module_prediction_endpoint(
    exam_id: str,
    student_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retrieve genuine scope-aware prediction and performance statistics for a specific examination.
    Uses only the modules selected for this exam.
    Persists audit snapshot in ExamPrediction for post-exam comparison.
    """
    import json
    from datetime import datetime, timezone
    from backend.app.routers.exams import get_exam_scope_analysis

    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    analysis = get_exam_scope_analysis(exam_id=exam_id, student_id=sid, db=db)

    # Persist or update scope snapshot record in ExamPrediction
    try:
        now = datetime.now(timezone.utc)
        existing_pred = db.query(ExamPrediction).filter(
            ExamPrediction.student_id == sid,
            ExamPrediction.exam_id == exam_id
        ).first()

        metrics_data = {
            "topic_completion_percentage": analysis.topic_completion_percentage,
            "quiz_accuracy_percentage": analysis.quiz_accuracy_percentage,
            "total_quiz_attempts": analysis.total_quiz_attempts,
            "total_selected_topics": analysis.total_selected_topics,
            "completed_selected_topics": analysis.completed_selected_topics,
            "active_study_minutes": analysis.active_study_minutes,
            "estimated_score": analysis.estimated_score,
            "reliability_level": analysis.reliability_level,
            "assumed_inputs": analysis.assumed_inputs,
            "components": analysis.components,
            "modules": [m.model_dump() for m in analysis.modules_breakdown]
        }

        if existing_pred:
            existing_pred.predicted_score = analysis.estimated_score
            existing_pred.module_ids = json.dumps(analysis.selected_module_ids)
            existing_pred.module_metrics_json = json.dumps(metrics_data)
            existing_pred.data_status = analysis.reliability_level.lower()
            existing_pred.actual_score = analysis.actual_score
            existing_pred.generated_at = now
            existing_pred.input_data_timestamp = now
        else:
            new_pred = ExamPrediction(
                student_id=sid,
                subject_id=analysis.subject_id,
                exam_id=exam_id,
                predicted_score=analysis.estimated_score,
                model_version=analysis.model_version,
                data_status=analysis.reliability_level.lower(),
                module_ids=json.dumps(analysis.selected_module_ids),
                module_metrics_json=json.dumps(metrics_data),
                actual_score=analysis.actual_score,
                generated_at=now,
                input_data_timestamp=now
            )
            db.add(new_pred)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[Warning] Could not persist exam prediction scope snapshot: {e}")

    return ExamModulePredictionResponse(
        available=True,
        exam_id=analysis.exam_id,
        exam_name=analysis.exam_name,
        subject_id=analysis.subject_id,
        subject_code=analysis.subject_code,
        subject_name=analysis.subject_name,
        selected_module_ids=analysis.selected_module_ids,
        selected_modules_count=analysis.selected_modules_count,
        completed_module_ids=analysis.completed_module_ids,
        completed_modules_count=analysis.completed_modules_count,
        module_completion_percentage=analysis.module_completion_percentage,
        predicted_score=analysis.estimated_score,
        estimated_score=analysis.estimated_score,
        score_label=analysis.score_label,
        is_experimental=analysis.is_experimental,
        reliability_level=analysis.reliability_level,
        confidence_label=analysis.confidence_label,
        basis_explanation=getattr(analysis, "basis_explanation", None),
        completed_exam_attempts=analysis.completed_exam_attempts,
        assumed_inputs=analysis.assumed_inputs,
        actual_score=analysis.actual_score,
        components=analysis.components,
        prediction_status=analysis.prediction_status,
        model_version=analysis.model_version,
        data_limitations_note=analysis.data_limitations_note,
        topic_completion_percentage=analysis.topic_completion_percentage,
        total_selected_topics=analysis.total_selected_topics,
        completed_selected_topics=analysis.completed_selected_topics,
        quiz_accuracy_percentage=analysis.quiz_accuracy_percentage,
        total_quiz_attempts=analysis.total_quiz_attempts,
        has_quiz_data=analysis.has_quiz_data,
        latest_quiz_score=analysis.latest_quiz_score,
        latest_quiz_percentage=analysis.latest_quiz_percentage,
        quiz_trend=analysis.quiz_trend,
        quiz_trend_diff=analysis.quiz_trend_diff,
        why_prediction_changed=analysis.why_prediction_changed,
        active_study_minutes=analysis.active_study_minutes,
        suggested_actions=analysis.suggested_study_actions
    )



@router.post("/predict", response_model=DirectPredictionResponse)
def predict_direct(input_data: DirectFeaturePredictionInput):
    """
    Preserved ML prediction endpoint matching the Prompt 9 microservice contract.
    Accepts raw student feature vector and executes trained pipeline inference on the server.
    """
    try:
        data_dict = input_data.model_dump()
        result = predict_exam_score(data_dict)

        return DirectPredictionResponse(
            predictedScore=result["predictedScore"],
            model=result["model"],
            generatedAt=result.get("generatedAt", "now"),
            dataStatus=result.get("dataStatus", "good"),
            scoreRange=result["scoreRange"],
            confidenceMargin=result["rmseMargin"],
            disclaimer="This is an estimate based on your available study data, not a guaranteed score."
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction error: {str(e)}"
        )
