"""
StudySense AI - Exam Schemas
Pydantic schemas for Exam CRUD operations, scope analysis, and readiness score estimation.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class ExamBase(BaseModel):
    subject_id: str
    name: str
    exam_datetime: datetime
    notes: Optional[str] = None
    module_ids: Optional[List[str]] = None
    completed_module_ids: Optional[List[str]] = None
    completed_topic_ids: Optional[List[str]] = None
    actual_score: Optional[float] = None


class ExamCreate(ExamBase):
    id: Optional[str] = None
    student_id: Optional[str] = "student-001"


class ExamUpdate(BaseModel):
    subject_id: Optional[str] = None
    name: Optional[str] = None
    exam_datetime: Optional[datetime] = None
    notes: Optional[str] = None
    module_ids: Optional[List[str]] = None
    completed_module_ids: Optional[List[str]] = None
    completed_topic_ids: Optional[List[str]] = None
    actual_score: Optional[float] = None


class RecordActualScoreRequest(BaseModel):
    actual_score: float = Field(..., ge=0.0, le=100.0, description="Verified actual exam score (0.0 to 100.0)")


class ToggleModuleCompletionRequest(BaseModel):
    module_id: str
    completed: Optional[bool] = None  # If None, toggles current status


class ToggleTopicCompletionRequest(BaseModel):
    topic_id: str
    completed: Optional[bool] = None  # If None, toggles current status


class ModuleScopeDetail(BaseModel):
    module_id: str
    module_title: str
    module_number: int
    is_completed: bool = False
    total_topics: int
    completed_topics: int
    completion_percentage: float
    quiz_attempts: int
    total_questions: int
    correct_answers: int
    quiz_accuracy: Optional[float] = None
    has_quiz_data: bool = False
    active_study_minutes: int = 0
    completed_topic_ids: List[str] = []
    topics: List[Dict[str, Any]] = []
    incomplete_topics: List[Dict[str, Any]] = []
    weak_topics: List[Dict[str, Any]] = []


class ExamResponse(ExamBase):
    id: str
    student_id: str
    subject_code: Optional[str] = None
    subject_name: Optional[str] = None
    module_ids: List[str] = []
    completed_module_ids: List[str] = []
    completed_topic_ids: List[str] = []
    actual_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ExamScopeAnalysis(BaseModel):
    exam_id: str
    exam_name: str
    exam_datetime: datetime
    subject_id: str
    subject_code: str
    subject_name: str
    selected_module_ids: List[str]
    selected_modules_count: int
    completed_module_ids: List[str] = []
    completed_modules_count: int = 0
    module_completion_percentage: float = 0.0
    completed_topic_ids: List[str] = []
    total_subject_modules: int
    
    # Topic Completion
    total_selected_topics: int
    completed_selected_topics: int
    topic_completion_percentage: float
    
    # Quiz Performance
    total_quiz_attempts: int
    total_quiz_questions: int
    total_quiz_correct: int
    quiz_accuracy_percentage: Optional[float] = None
    has_quiz_data: bool
    latest_quiz_score: Optional[float] = None
    latest_quiz_percentage: Optional[float] = None
    quiz_trend: Optional[str] = None
    quiz_trend_diff: Optional[float] = None
    
    # Genuine Active Study Time
    active_study_minutes: int
    days_remaining: int
    
    # Readiness-Based Prediction Estimate
    predicted_score: Optional[float] = None
    estimated_score: float
    score_label: str = "Preparation-Based Estimate"
    is_experimental: bool = True
    reliability_level: str = "Moderate"  # "High" | "Moderate" | "Limited" | "Initial Baseline"
    confidence_label: Optional[str] = None
    basis_explanation: Optional[str] = None
    completed_exam_attempts: Optional[int] = 0
    assumed_inputs: List[str] = []
    actual_score: Optional[float] = None
    components: Optional[Dict[str, Any]] = None
    why_prediction_changed: Optional[str] = None

    prediction_status: str  # "experimental_readiness"
    model_version: str
    data_limitations_note: str
    
    # Module Breakdowns & Recommendations
    modules_breakdown: List[ModuleScopeDetail]
    suggested_study_actions: List[Dict[str, Any]]


class GeneratePracticeQuizRequest(BaseModel):
    count: Optional[int] = 10
    exclude_ids: Optional[str] = None
    exclude_question_ids: Optional[List[str]] = None
