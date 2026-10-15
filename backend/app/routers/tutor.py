"""
StudySense AI - Gemini AI Tutor Router
Provides endpoints for conversational tutoring, status probing, and question generation.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.topic import Topic
from backend.app.schemas.tutor import (
    TutorChatRequest,
    TutorChatResponse,
    TutorStatusResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
)
from backend.app.services.tutor_service import (
    check_tutor_health,
    generate_tutor_reply,
    generate_practice_questions_gemini,
)

router = APIRouter(prefix="/api/tutor", tags=["AI Tutor"])


@router.get("/status", response_model=TutorStatusResponse)
def get_tutor_status():
    """
    Probe Gemini AI configuration and model connectivity.
    Never exposes API keys. Returns clear instructions if unconfigured.
    """
    return check_tutor_health()


@router.post("/chat", response_model=TutorChatResponse)
def chat_with_tutor(request: TutorChatRequest):
    """
    Conduct a real conversational turn with the Gemini AI Tutor.
    Context-aware, bounded, grounded in syllabus, and pedagogically structured.
    """
    return generate_tutor_reply(request)


@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate_questions_endpoint(
    request: GenerateQuestionsRequest,
    db: Session = Depends(get_db)
):
    """
    Generate authentic practice quiz questions using Gemini grounded in topic syllabus notes.
    """
    topic = db.query(Topic).filter(Topic.id == request.topic_id).first()
    topic_data = {}
    if topic:
        topic_data = {
            "title": topic.title,
            "explanation": topic.explanation or "",
            "exam_focus": topic.exam_focus or "",
            "difficulty": topic.difficulty or "medium",
            "subject_id": topic.subject_id,
            "module_id": topic.module_id or ""
        }
    else:
        topic_data = {
            "title": request.topic_id,
            "subject_id": request.subject_id or "",
            "module_id": request.module_id or ""
        }

    return generate_practice_questions_gemini(request, topic_data)
