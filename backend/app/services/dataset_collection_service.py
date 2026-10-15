"""
StudySense AI - Dataset Collection & Pipeline Service
Extracts and exports genuine pre-exam preparation metrics mapped to actual exam marks.
Enforces the zero-fabrication policy: records are only marked training-ready when authentic actual exam marks are logged.
"""

import os
import json
import pandas as pd
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.models.exam import Exam
from backend.app.models.prediction import ExamPrediction
from backend.app.config import settings

PROCESSED_DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "ml",
    "data",
    "processed"
)
DATASET_PATH = os.path.join(PROCESSED_DATA_DIR, "studysense_module_exam_records.csv")


def extract_studysense_exam_records(db: Session, student_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Query all exams and associated scope preparation snapshots.
    Maps pre-exam feature snapshots to authentic recorded actual exam scores.
    """
    sid = student_id or settings.PROTOTYPE_STUDENT_ID
    exams = db.query(Exam).filter(Exam.student_id == sid).all()

    records = []
    for exam in exams:
        pred = db.query(ExamPrediction).filter(
            ExamPrediction.student_id == sid,
            ExamPrediction.exam_id == exam.id
        ).first()

        metrics = {}
        if pred and pred.module_metrics_json:
            try:
                metrics = json.loads(pred.module_metrics_json)
            except Exception:
                pass

        actual = exam.actual_score if exam.actual_score is not None else (pred.actual_score if pred else None)
        selected_mods = exam.modules_list

        rec = {
            "student_id": exam.student_id,
            "subject_id": exam.subject_id,
            "exam_id": exam.id,
            "exam_name": exam.name,
            "selected_module_ids": json.dumps(selected_mods),
            "module_count": len(selected_mods),
            "topic_completion_pct": metrics.get("topic_completion_percentage", 0.0),
            "total_selected_topics": metrics.get("total_selected_topics", 0),
            "completed_selected_topics": metrics.get("completed_selected_topics", 0),
            "quiz_accuracy_pct": metrics.get("quiz_accuracy_percentage"),
            "total_quiz_attempts": metrics.get("total_quiz_attempts", 0),
            "has_quiz_data": metrics.get("quiz_accuracy_percentage") is not None,
            "active_study_minutes": metrics.get("active_study_minutes", 0),
            "study_consistency_score": metrics.get("study_consistency_score", 50.0),
            "previous_exam_score": metrics.get("previous_exam_score"),
            "heuristic_readiness_score": pred.predicted_score if pred else None,
            "actual_exam_score": actual,
            "ground_truth_ready": actual is not None,
            "recorded_at": (pred.generated_at.isoformat() if pred and pred.generated_at else datetime.now(timezone.utc).isoformat())
        }
        records.append(rec)

    return records


def export_studysense_dataset(db: Session, student_id: Optional[str] = None) -> Dict[str, Any]:
    """
    Exports genuine StudySense student exam records to CSV for ML model training.
    """
    os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
    records = extract_studysense_exam_records(db, student_id)

    df = pd.DataFrame(records)
    df.to_csv(DATASET_PATH, index=False)

    labeled_count = int(df["ground_truth_ready"].sum()) if not df.empty else 0

    return {
        "total_records": len(df),
        "labeled_records": labeled_count,
        "csv_path": DATASET_PATH,
        "status": "ready" if labeled_count >= 20 else "collecting_data",
        "minimum_required_for_training": 20
    }
