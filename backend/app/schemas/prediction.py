"""
StudySense AI - Prediction Schemas
Pydantic schemas for genuine ML predictions, feature inputs, and evaluation metrics.
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class DirectFeaturePredictionInput(BaseModel):
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


class DirectPredictionResponse(BaseModel):
    predictedScore: float
    model: str
    generatedAt: str
    dataStatus: str
    scoreRange: List[float]
    confidenceMargin: float
    disclaimer: str


class ExamPredictionResponse(BaseModel):
    id: str
    student_id: str
    subject_id: str
    exam_id: Optional[str] = None
    predicted_score: float
    model_version: str
    data_status: str
    score_range_min: Optional[float] = None
    score_range_max: Optional[float] = None
    confidence_margin: Optional[float] = None
    module_ids: Optional[str] = None
    module_metrics_json: Optional[str] = None
    actual_score: Optional[float] = None
    generated_at: datetime
    input_data_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class ExamModulePredictionResponse(BaseModel):
    available: bool
    exam_id: str
    exam_name: str
    subject_id: str
    subject_code: str
    subject_name: str
    selected_module_ids: List[str]
    selected_modules_count: int
    completed_module_ids: List[str] = []
    completed_modules_count: int = 0
    module_completion_percentage: float = 0.0
    predicted_score: Optional[float] = None
    prediction_status: str  # "experimental_readiness"
    model_version: str
    data_limitations_note: str
    topic_completion_percentage: float
    total_selected_topics: int
    completed_selected_topics: int
    quiz_accuracy_percentage: Optional[float] = None
    total_quiz_attempts: int
    has_quiz_data: bool
    latest_quiz_score: Optional[float] = None
    latest_quiz_percentage: Optional[float] = None
    quiz_trend: Optional[str] = None
    quiz_trend_diff: Optional[float] = None
    active_study_minutes: int
    suggested_actions: List[Dict[str, Any]]

    # Preparation-Based Readiness Fields
    estimated_score: float
    score_label: str = "Preparation-Based Estimate"
    is_experimental: bool = True
    reliability_level: str = "Moderate"
    confidence_label: Optional[str] = None
    basis_explanation: Optional[str] = None
    completed_exam_attempts: Optional[int] = 0
    assumed_inputs: List[str] = []
    actual_score: Optional[float] = None
    components: Optional[Dict[str, Any]] = None
    why_prediction_changed: Optional[str] = None



class PredictionResultResponse(BaseModel):
    available: bool
    subject_id: str
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    exam_id: Optional[str] = None
    predicted_score: Optional[float] = None
    model_version: Optional[str] = None
    data_status: str = "insufficient"
    message: Optional[str] = None
    reason: Optional[str] = None
    score_range: Optional[List[float]] = None
    confidence_margin: Optional[float] = None
    disclaimer: Optional[str] = None
    generated_at: Optional[datetime] = None
    features_used: Optional[Dict[str, Any]] = None
