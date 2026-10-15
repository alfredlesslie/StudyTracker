"""
StudySense AI - Machine Learning Prediction API
FastAPI microservice exposing /health and /predict endpoints for the React frontend.
"""

import os
import sys
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Ensure imports work from ml root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from src.predict import predict_exam_score, get_model

app = FastAPI(
    title="StudySense AI - Exam Score Prediction API",
    description="Supervised regression service predicting subject-wise student exam performance.",
    version="1.0.0"
)

# Enable CORS for React frontend (Vite default localhost:5173 and others)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudentFeatureInput(BaseModel):
    subjectId: Optional[str] = "cs-cn"
    subject: Optional[str] = "mathematics"
    studyDays: Optional[int] = 3
    totalStudyMinutes: Optional[int] = 180
    learnMinutes: Optional[int] = 60
    aiTutorMinutes: Optional[int] = 30
    practiceMinutes: Optional[int] = 45
    focusMinutes: Optional[int] = 45
    averageQuizScore: Optional[float] = None
    previousScore: Optional[float] = None
    quizAttempts: Optional[int] = 2
    topicsCompleted: Optional[int] = 8
    totalTopics: Optional[int] = 16
    topicCompletionRate: Optional[float] = 0.5
    averageTopicMastery: Optional[float] = 65.0
    revisionCount: Optional[int] = 1
    averageConfidence: Optional[float] = 3.5
    missedSessions: Optional[int] = 0
    daysSinceLastStudy: Optional[int] = 2
    examDaysRemaining: Optional[int] = 7
    subjectDifficulty: Optional[float] = 3.8
    extraSupport: Optional[str] = "no"
    studyConsistency: Optional[float] = 0.8


class PredictionResponse(BaseModel):
    predictedScore: float
    model: str
    generatedAt: str
    dataStatus: str
    scoreRange: List[float]
    confidenceMargin: float
    disclaimer: str


@app.get("/health")
def health_check():
    """
    Health / Status Endpoint.
    Allows React frontend to detect if the Python ML microservice is running.
    """
    try:
        pipeline, metadata = get_model()
        return {
            "status": "ok",
            "modelLoaded": True,
            "modelName": metadata.get("modelName", "Linear Regression") if metadata else "Linear Regression",
            "modelVersion": metadata.get("modelVersion", "v1.0") if metadata else "v1.0",
            "datasetName": metadata.get("dataset", {}).get("name", "UCI Benchmark") if metadata else "UCI Benchmark",
            "datasetVersion": metadata.get("datasetVersion", "2008.1") if metadata else "2008.1",
            "featureCount": len(metadata.get("features", {}).get("transformed", [])) if metadata else 11,
            "evaluationAvailable": True,
            "target": "finalExamScore",
            "metrics": metadata.get("metrics", {}) if metadata else {},
            "baseline": metadata.get("baseline", {}) if metadata else {},
            "allModelsComparison": metadata.get("allModelsComparison", {}) if metadata else {},
            "subjectPerformance": metadata.get("subjectPerformance", []) if metadata else [],
            "errorAnalysis": metadata.get("errorAnalysis", {}) if metadata else {},
            "topFeatures": metadata.get("topFeatures", []) if metadata else []
        }
    except Exception as e:
        return {
            "status": "degraded",
            "modelLoaded": False,
            "error": str(e)
        }


@app.post("/predict", response_model=PredictionResponse)
def predict(input_data: StudentFeatureInput):
    """
    Predict final exam score from student behavioral features.
    """
    try:
        data_dict = input_data.model_dump()
        result = predict_exam_score(data_dict)

        return PredictionResponse(
            predictedScore=result["predictedScore"],
            model=result["model"],
            generatedAt=result.get("generatedAt", "now"),
            dataStatus=result.get("dataStatus", "good"),
            scoreRange=result["scoreRange"],
            confidenceMargin=result["rmseMargin"],
            disclaimer="This is an estimate based on your available study data, not a guaranteed score."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    print("Starting StudySense AI ML Service on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
