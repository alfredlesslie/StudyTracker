"""
StudySense AI - Standalone Prediction Engine
Loads the trained best model pipeline and generates exam score predictions.
"""

import os
import sys
import json
import joblib
import pandas as pd
import numpy as np

# Path definitions
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODELS_DIR, "best_model.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

# Global pipeline cache
_cached_pipeline = None
_cached_metadata = None


def get_model():
    """
    Load or retrieve cached model pipeline.
    """
    global _cached_pipeline, _cached_metadata
    if _cached_pipeline is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Trained model not found at: {MODEL_PATH}. Run python ml/src/train.py first.")
        _cached_pipeline = joblib.load(MODEL_PATH)
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _cached_metadata = json.load(f)
    return _cached_pipeline, _cached_metadata


def predict_exam_score(feature_dict):
    """
    Predict final exam score from an input feature dictionary.
    
    Args:
        feature_dict (dict): Feature inputs from StudySense AI pipeline
        
    Returns:
        dict: {
            predictedScore: float (rounded to 1 decimal place, 0-100),
            rawScore: float,
            model: str,
            rmseMargin: float
        }
    """
    pipeline, metadata = get_model()

    # Map input feature names if StudySense AI naming differs
    row = {
        "subject": feature_dict.get("subject", "mathematics"),
        "studyDays": feature_dict.get("studyDays", 3),
        "totalStudyMinutes": feature_dict.get("totalStudyMinutes", 210),
        "averageQuizScore": feature_dict.get("averageQuizScore", 70.0),
        "previousScore": feature_dict.get("previousScore", feature_dict.get("averageQuizScore", 70.0)),
        "missedSessions": feature_dict.get("missedSessions", 0),
        "failures": feature_dict.get("failures", 0),
        "extraSupport": feature_dict.get("extraSupport", "no"),
        "studyConsistency": feature_dict.get("studyConsistency", 0.85)
    }

    # If previousScore is None or missing, impute with averageQuizScore or median prior
    if row["previousScore"] is None:
        row["previousScore"] = row["averageQuizScore"] if row["averageQuizScore"] is not None else 65.0
    if row["averageQuizScore"] is None:
        row["averageQuizScore"] = 65.0

    df_single = pd.DataFrame([row])

    # Predict using the complete end-to-end Pipeline
    raw_pred = float(pipeline.predict(df_single)[0])

    # Determine Data Quality / Availability Status
    has_study_time = feature_dict.get("totalStudyMinutes", 0) > 0 or feature_dict.get("studyDays", 0) > 0
    has_academic_signal = feature_dict.get("averageQuizScore") is not None or feature_dict.get("previousScore") is not None

    if has_study_time and has_academic_signal:
        data_status = "good"
    elif has_study_time or has_academic_signal:
        data_status = "limited"
    else:
        data_status = "insufficient"

    # Realistic academic score boundary [0, 100]
    bounded_score = round(max(0.0, min(100.0, raw_pred)), 1)

    rmse = metadata["metrics"]["testRmse"] if metadata else 8.3

    return {
        "predictedScore": bounded_score,
        "rawScore": round(raw_pred, 2),
        "model": metadata.get("modelName", "Linear Regression") if metadata else "Linear Regression",
        "dataStatus": data_status,
        "generatedAt": pd.Timestamp.now(tz="UTC").isoformat(),
        "rmseMargin": round(rmse, 1),
        "scoreRange": [
            max(0.0, round(bounded_score - rmse, 1)),
            min(100.0, round(bounded_score + rmse, 1))
        ]
    }


if __name__ == "__main__":
    print("=== Testing Standalone Prediction Script ===")
    sample_input = {
        "subject": "mathematics",
        "studyDays": 5,
        "totalStudyMinutes": 450,
        "averageQuizScore": 82.0,
        "previousScore": 78.0,
        "missedSessions": 1,
        "extraSupport": "yes",
        "studyConsistency": 0.92
    }
    
    result = predict_exam_score(sample_input)
    print("\nSample Input:", json.dumps(sample_input, indent=2))
    print("\nPrediction Result:", json.dumps(result, indent=2))
