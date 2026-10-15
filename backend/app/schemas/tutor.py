"""
StudySense AI - Gemini AI Tutor Schemas
Defines request and response schemas for real server-side LLM tutoring.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'model' / 'assistant'")
    content: str = Field(..., max_length=4000, description="Message text content")


class TutorContext(BaseModel):
    subject_id: Optional[str] = None
    subject_name: Optional[str] = None
    subject_code: Optional[str] = None
    module_id: Optional[str] = None
    module_title: Optional[str] = None
    topic_id: Optional[str] = None
    topic_title: Optional[str] = None
    topic_explanation: Optional[str] = None
    exam_focus: Optional[str] = None
    
    # Quiz context for mistake diagnosis
    question_text: Optional[str] = None
    student_answer: Optional[str] = None
    correct_answer: Optional[str] = None
    question_explanation: Optional[str] = None
    
    # Mode flag
    action_mode: Optional[str] = None  # "simple", "step_by_step", "example", "malayalam", "exam_prep", "summary", "mistake_diagnosis"


class TutorChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2500, description="Student's prompt or question")
    history: List[ChatMessage] = Field(default_factory=list, description="Recent conversation turns (bounded)")
    context: Optional[TutorContext] = None


class TutorChatResponse(BaseModel):
    reply: str
    model: str
    timestamp: str
    suggestions: List[str] = []
    context_grounded: bool = True


class TutorStatusResponse(BaseModel):
    configured: bool
    model: str
    status: str  # "ready", "missing_api_key", "provider_error"
    message: str
    instructions: Optional[str] = None


class TutorQuestionItem(BaseModel):
    id: str
    topic_id: str
    subject_id: str
    module_id: str
    question: str
    type: str = "multiple_choice"
    marks: int = 1
    options: List[str]
    correct_answer: int
    explanation: str
    difficulty: str = "medium"
    source: str = "gemini_ai"


class GenerateQuestionsRequest(BaseModel):
    topic_id: str
    subject_id: Optional[str] = None
    module_id: Optional[str] = None
    count: int = Field(default=5, ge=1, le=10)
    format: str = "Quick Practice"  # "3 Mark Practice", "5 Mark Practice", "10 Mark Practice"


class GenerateQuestionsResponse(BaseModel):
    questions: List[TutorQuestionItem]
    model: str
    topic_id: str
