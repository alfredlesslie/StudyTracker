"""
StudySense AI - Gemini AI Tutor Service
Integrates the official google-genai SDK for real server-side LLM tutoring.
Guarantees zero API key exposure to clients, strict context grounding,
prompt injection isolation, bounded history, exponential backoff retries,
automatic reliable model fallback, and clean error reporting.
"""

import os
import re
import json
import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status
from google import genai
from google.genai import types

from backend.app.config import settings
from backend.app.schemas.tutor import (
    TutorChatRequest,
    TutorChatResponse,
    TutorStatusResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
    TutorQuestionItem
)

logger = logging.getLogger("studysense.tutor")

# Models verified to be available and functional for general generative tasks
RELIABLE_FALLBACK_MODELS = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.5-flash",
    "gemini-3.8-flash"
]


def _sanitize_error_message(err: Any) -> str:
    """
    Remove any potential API key or sensitive token strings from exception messages.
    Never exposes credentials or authorization headers.
    """
    msg = str(err)
    if settings.GEMINI_API_KEY:
        msg = msg.replace(settings.GEMINI_API_KEY, "[REDACTED_API_KEY]")
    # Mask any pattern resembling Google API key (AIzaSy... or AQ....)
    msg = re.sub(r"AIzaSy[A-Za-z0-9_-]{20,}", "[REDACTED_API_KEY]", msg)
    msg = re.sub(r"AQ\.[A-Za-z0-9_-]{20,}", "[REDACTED_API_KEY]", msg)
    # Mask query parameters or authorization headers
    msg = re.sub(r"key=[^&\s'\"]+", "key=[REDACTED]", msg)
    msg = re.sub(r"Bearer\s+[^&\s'\"]+", "Bearer [REDACTED]", msg)
    return msg


def _classify_gemini_error(err: Exception) -> Tuple[int, str]:
    """
    Classifies a Gemini exception into an appropriate HTTP status code and user-friendly message.
    Distinguishes:
    - 503 / High demand (model overload)
    - 429 / Quota / Rate limits
    - 401 / 403 / Invalid API key or permission denied
    - 404 / Model not found or unsupported
    - Connection / timeout failures
    """
    code = getattr(err, "code", None)
    err_str = str(err)
    err_lower = err_str.lower()

    # 1. Invalid API Key / Permission Denied (401 / 403)
    if code in (401, 403) or "api_key_invalid" in err_lower or "permission_denied" in err_lower or "invalid api key" in err_lower:
        return (
            status.HTTP_401_UNAUTHORIZED,
            "Invalid Gemini API key or permission denied. Please verify GEMINI_API_KEY in backend/.env."
        )

    # 2. Model Overload / High Demand (503 / UNAVAILABLE)
    if code == 503 or "503" in err_str or "unavailable" in err_lower or "high demand" in err_lower or "overloaded" in err_lower:
        return (
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "The Gemini AI model is currently experiencing high global demand. Please try again in a few moments."
        )

    # 3. Rate Limit / Quota Exceeded (429 / RESOURCE_EXHAUSTED)
    if code == 429 or "429" in err_str or "resource_exhausted" in err_lower or "quota" in err_lower or "rate limit" in err_lower:
        return (
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Gemini API rate limit or quota exceeded. Please wait a moment before sending another question."
        )

    # 4. Model Not Found / Unsupported (404 / NOT_FOUND)
    if code == 404 or "not_found" in err_lower or "not found" in err_lower:
        return (
            status.HTTP_404_NOT_FOUND,
            "The requested Gemini model is not supported or not available for your API tier."
        )

    # 5. Network / Timeout
    if isinstance(err, (TimeoutError, ConnectionError)) or "timeout" in err_lower or "connection" in err_lower or "deadline" in err_lower:
        return (
            status.HTTP_504_GATEWAY_TIMEOUT,
            "Connection to Google Gemini API timed out. Please check network connectivity and try again."
        )

    # 6. Fallback General Provider Error
    clean = _sanitize_error_message(err)
    return (
        status.HTTP_502_BAD_GATEWAY,
        f"Gemini AI Tutor error: {clean}"
    )


def get_gemini_client() -> Tuple[Optional[genai.Client], Optional[str]]:
    """
    Instantiate official google-genai Client using server-side GEMINI_API_KEY.
    Returns (client, error_message).
    """
    key = (settings.GEMINI_API_KEY or "").strip()
    if not key:
        return None, "GEMINI_API_KEY is not set in backend/.env."

    try:
        client = genai.Client(api_key=key)
        return client, None
    except Exception as e:
        return None, f"Failed to initialize Gemini Client: {_sanitize_error_message(e)}"


def _execute_gemini_with_fallback_and_retry(
    client: genai.Client,
    preferred_model: str,
    contents: Any,
    config: Optional[types.GenerateContentConfig] = None,
    max_retries_per_model: int = 2,
    max_total_attempts: int = 4
) -> Tuple[types.GenerateContentResponse, str]:
    """
    Executes a Gemini API request with:
    1. Limited retries with exponential backoff for temporary errors (503 High Demand, 429 Rate Limit, timeouts).
    2. Automatic model fallback if the primary model is overloaded or unsupported.
    3. Immediate abort for non-transient errors (invalid API key / 401 / 403).
    4. Safe technical logging with zero API key exposure.
    5. Clean, descriptive HTTPExceptions when all options fail.

    Returns (response, active_model_name).
    """
    # Build candidate model list starting with preferred_model
    candidates = [preferred_model]
    for fallback in RELIABLE_FALLBACK_MODELS:
        if fallback not in candidates:
            candidates.append(fallback)

    last_error: Optional[Exception] = None
    total_attempts = 0

    for model_idx, model in enumerate(candidates):
        for attempt in range(1, max_retries_per_model + 1):
            if total_attempts >= max_total_attempts:
                break

            total_attempts += 1
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=contents,
                    config=config
                )
                if model_idx > 0:
                    logger.info("Successfully recovered using fallback Gemini model '%s'", model)
                return response, model

            except Exception as e:
                last_error = e
                status_code, user_msg = _classify_gemini_error(e)
                sanitized_msg = _sanitize_error_message(e)

                # Safe logging on backend (never exposes secrets)
                logger.warning(
                    "Gemini API call failed [model=%s, attempt=%d/%d, total=%d]: %s (%s)",
                    model,
                    attempt,
                    max_retries_per_model,
                    total_attempts,
                    type(e).__name__,
                    sanitized_msg[:160]
                )

                # Non-transient errors: abort immediately (no retries, no fallbacks)
                if status_code in (status.HTTP_401_UNAUTHORIZED, status.HTTP_400_BAD_REQUEST):
                    raise HTTPException(status_code=status_code, detail=user_msg)

                # If 404 (model unsupported), do not retry same model, immediately fall back
                if status_code == status.HTTP_404_NOT_FOUND:
                    break

                # If 429 (quota exhausted on this tier): retrying the same quota-exhausted model
                # will just fail again immediately. Advance directly to the next fallback model!
                if status_code == status.HTTP_429_TOO_MANY_REQUESTS:
                    has_more_models = model_idx < len(candidates) - 1 and total_attempts < max_total_attempts
                    if has_more_models:
                        logger.info("Model '%s' quota exhausted (429). Advancing to fallback model '%s'...", model, candidates[model_idx + 1])
                    break

                # For temporary errors (503 high demand, 504 timeout), apply exponential backoff before retrying
                if attempt < max_retries_per_model and total_attempts < max_total_attempts:
                    backoff_sec = min(3.0, 1.0 * (1.5 ** (attempt - 1)))
                    logger.info("Retrying model '%s' in %.1fs after transient error (%d)...", model, backoff_sec, status_code)
                    time.sleep(backoff_sec)
                else:
                    # Model exhausted its retries; loop will move to next candidate model in candidates list
                    has_more_models = model_idx < len(candidates) - 1 and total_attempts < max_total_attempts
                    if has_more_models:
                        logger.info("Model '%s' failed temporary error (%d). Falling back to '%s'...", model, status_code, candidates[model_idx + 1])
                    break

    # If all candidate models and retries were exhausted
    if last_error:
        status_code, user_msg = _classify_gemini_error(last_error)
        raise HTTPException(status_code=status_code, detail=user_msg)

    raise HTTPException(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        detail="All Gemini AI models are currently unavailable. Please try again shortly."
    )


def check_tutor_health() -> TutorStatusResponse:
    """
    Probe the Gemini API connectivity with a minimal prompt to verify model availability.
    Supports automatic fallback verification and never exposes credentials or fabricates responses.
    """
    client, err = get_gemini_client()
    preferred_model = settings.GEMINI_MODEL or "gemini-3.5-flash"

    if not client or err:
        return TutorStatusResponse(
            configured=False,
            model=preferred_model,
            status="missing_api_key",
            message="Gemini API key is not configured.",
            instructions="Add your Gemini API key to backend/.env: GEMINI_API_KEY=your_key_here"
        )

    try:
        response, used_model = _execute_gemini_with_fallback_and_retry(
            client=client,
            preferred_model=preferred_model,
            contents="State 'READY' in one word.",
            config=types.GenerateContentConfig(
                max_output_tokens=10,
                temperature=0.0
            ),
            max_retries_per_model=1,
            max_total_attempts=2
        )
        return TutorStatusResponse(
            configured=True,
            model=used_model,
            status="ready",
            message=f"Gemini AI Tutor is operational and connected ({used_model})."
        )
    except HTTPException as e:
        return TutorStatusResponse(
            configured=False,
            model=preferred_model,
            status="overloaded" if e.status_code == status.HTTP_503_SERVICE_UNAVAILABLE else "provider_error",
            message=e.detail,
            instructions=(
                "Please verify your API key in backend/.env."
                if e.status_code == status.HTTP_401_UNAUTHORIZED
                else "Gemini service is temporarily experiencing high load. You can retry in a few moments."
            )
        )
    except Exception as e:
        clean_err = _sanitize_error_message(e)
        return TutorStatusResponse(
            configured=False,
            model=preferred_model,
            status="provider_error",
            message=f"Gemini API connection error: {clean_err}",
            instructions="Verify your API key at https://aistudio.google.com/app/apikey."
        )


def _build_system_instruction(context) -> str:
    """
    Constructs isolated system instructions with strict grounding and prompt-injection safety.
    """
    base_instructions = (
        "You are the StudySense AI Tutor, a patient, pedagogically rigorous university teaching assistant "
        "supporting engineering students (KTU Semester V B.Tech curriculum).\n\n"
        "TEACHING PRINCIPLES:\n"
        "1. Explain clearly with conceptual depth, practical intuition, and academic rigor.\n"
        "2. Break down complex multi-stage concepts into step-by-step numbered points.\n"
        "3. Provide realistic engineering analogies and concrete examples.\n"
        "4. Include clean formulas and code blocks (with syntax highlighting) where relevant.\n"
        "5. Support Malayalam explanations when requested, maintaining proper technical terms.\n"
        "6. If the student made a mistake in a quiz, diagnose why their choice was incorrect and teach them how to remember the correct principle.\n"
        "7. Format responses using clean GitHub-style Markdown: clear headings, bullet points, bold key definitions.\n"
        "8. Ground your explanations in the provided topic content and syllabus. If an inquiry falls outside the syllabus notes, answer from verified computer science knowledge while distinguishing it from syllabus requirements.\n"
        "9. Never fabricate facts, citations, or formulas. Acknowledge uncertainty clearly if applicable.\n"
        "10. End your explanation with a brief concept-check guiding question to reinforce understanding."
    )

    if not context:
        return base_instructions

    # Build syllabus grounding context
    grounding = "\n\nACADEMIC TOPIC CONTEXT:\n"
    if context.subject_code or context.subject_name:
        grounding += f"- Subject: {context.subject_code or ''} {context.subject_name or ''}\n"
    if context.module_title:
        grounding += f"- Module: {context.module_title}\n"
    if context.topic_title:
        grounding += f"- Topic: {context.topic_title}\n"
    if context.topic_explanation:
        grounding += f"- Topic Summary Notes:\n<<<SYLLABUS_CONTENT\n{context.topic_explanation}\nSYLLABUS_CONTENT>>>\n"
    if context.exam_focus:
        grounding += f"- University Exam Focus:\n{context.exam_focus}\n"

    # Quiz mistake context
    if context.question_text and context.student_answer:
        grounding += (
            f"\nQUIZ MISTAKE DIAGNOSTIC CONTEXT:\n"
            f"- Question: {context.question_text}\n"
            f"- Student's Selected Answer (Incorrect): {context.student_answer}\n"
            f"- Correct Answer: {context.correct_answer or 'See syllabus'}\n"
            f"- Official Explanation: {context.question_explanation or ''}\n"
            f"Explain kindly why the student's selected answer is wrong, why the correct answer is right, and an intuitive memory trick."
        )

    # Action mode guidance
    mode = context.action_mode or ""
    if mode == "simple":
        grounding += "\nREQUESTED FORMAT: Simple beginner-friendly explanation with a real-world analogy."
    elif mode == "step_by_step":
        grounding += "\nREQUESTED FORMAT: Sequential step-by-step algorithmic breakdown with numbered steps."
    elif mode == "example":
        grounding += "\nREQUESTED FORMAT: Concrete real-life engineering case study / walkthrough."
    elif mode == "malayalam":
        grounding += "\nREQUESTED FORMAT: Explain fully in clear, natural Malayalam (മലയാളം) with English technical terms."
    elif mode == "exam_prep":
        grounding += "\nREQUESTED FORMAT: University exam format (Definition, Key working points, Architectural diagram/formula, Common examiner pitfalls)."
    elif mode == "summary":
        grounding += "\nREQUESTED FORMAT: High-yield revision summary with top key takeaways."

    return base_instructions + grounding


def generate_tutor_reply(request: TutorChatRequest) -> TutorChatResponse:
    """
    Executes a real server-side multi-turn conversation with Gemini.
    Incorporates limited retries with exponential backoff and reliable model fallback.
    """
    client, err = get_gemini_client()
    preferred_model = settings.GEMINI_MODEL or "gemini-3.5-flash"

    if not client or err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "Gemini AI Tutor is not configured. Please add your GEMINI_API_KEY to "
                "backend/.env (get a free key at https://aistudio.google.com/app/apikey)."
            )
        )

    system_instruction = _build_system_instruction(request.context)

    # Format bounded conversation turns (last 6 turns max)
    bounded_history = request.history[-6:] if request.history else []
    contents = []

    for turn in bounded_history:
        role = "user" if turn.role.lower() in ["user", "student"] else "model"
        contents.append(
            types.Content(
                role=role,
                parts=[types.Part.from_text(text=turn.content[:3000])]
            )
        )

    # Add the current user message
    contents.append(
        types.Content(
            role="user",
            parts=[types.Part.from_text(text=request.message[:2500])]
        )
    )

    # Execute with retry and fallback
    response, used_model = _execute_gemini_with_fallback_and_retry(
        client=client,
        preferred_model=preferred_model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.7,
            max_output_tokens=2048,
        )
    )

    reply_text = getattr(response, "text", None)
    if not reply_text and hasattr(response, "candidates") and response.candidates:
        first_candidate = response.candidates[0]
        if hasattr(first_candidate, "content") and first_candidate.content and hasattr(first_candidate.content, "parts"):
            parts_text = [p.text for p in first_candidate.content.parts if getattr(p, "text", None)]
            if parts_text:
                reply_text = "".join(parts_text)

    reply_text = reply_text or "I reviewed your question, but could not produce a response. Please rephrase."
    now_str = datetime.now().strftime("%I:%M %p")

    # Dynamic context-aware suggestions
    suggestions = [
        "Explain step by step",
        "Give me a real-life example",
        "Prepare an exam answer",
        "Explain in Malayalam",
        "Quiz me on this topic"
    ]

    return TutorChatResponse(
        reply=reply_text,
        model=used_model,
        timestamp=now_str,
        suggestions=suggestions,
        context_grounded=bool(request.context and request.context.topic_title)
    )


def _robust_parse_json(text: str) -> Any:
    """
    Robust JSON parser handling Markdown fences, whitespace, and truncated arrays gracefully.
    """
    cleaned = (text or "").strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    match = re.search(r"\[\s*\{.*\}\s*\]", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass

    last_brace = cleaned.rfind("}")
    if last_brace != -1:
        first_bracket = cleaned.find("[")
        start = first_bracket if first_bracket != -1 else 0
        salvaged = cleaned[start:last_brace + 1].strip()
        if not salvaged.endswith("]"):
            salvaged += "\n]"
        try:
            return json.loads(salvaged)
        except Exception:
            pass

    return json.loads(cleaned)


def _normalize_question_key(text: str) -> str:
    """Creates a normalized alphanumeric key for deduplication."""
    return re.sub(r"[^a-z0-9]", "", (text or "").lower())


def _validate_raw_question_item(
    raw: Any,
    topic_id: str,
    subject_id: str,
    module_id: str,
    title: str,
    difficulty: str,
    marks: int,
    seen_keys: set
) -> Optional[TutorQuestionItem]:
    """
    Validates that a raw item has:
    - Non-empty, distinct question text (>= 8 chars)
    - Exactly 4 non-empty, distinct options
    - Exactly 1 valid correct_answer (index 0..3)
    - Non-empty explanation
    """
    if not isinstance(raw, dict):
        return None

    # 1. Question text
    q_text = str(raw.get("question") or "").strip()
    if len(q_text) < 8:
        return None

    norm_key = _normalize_question_key(q_text)
    if not norm_key or norm_key in seen_keys:
        return None

    # 2. Options (must be 4 distinct non-empty strings)
    raw_opts = raw.get("options")
    if not isinstance(raw_opts, list):
        return None
    cleaned_opts = [str(o).strip() for o in raw_opts if str(o).strip()]
    if len(cleaned_opts) < 4:
        return None
    opts = cleaned_opts[:4]
    if len(set(opts)) != 4:
        return None

    # 3. Correct answer (must resolve to an integer in 0..3)
    ca_val = raw.get("correct_answer")
    if ca_val is None:
        ca_val = raw.get("correctAnswer")

    ca_idx = None
    if isinstance(ca_val, int) and 0 <= ca_val <= 3:
        ca_idx = ca_val
    elif isinstance(ca_val, str):
        ca_str = ca_val.strip()
        if ca_str.isdigit() and 0 <= int(ca_str) <= 3:
            ca_idx = int(ca_str)
        elif ca_str.upper() in ["A", "B", "C", "D"]:
            ca_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ca_str.upper()]
        elif ca_str.upper().startswith("OPTION ") and ca_str.upper()[-1] in ["A", "B", "C", "D"]:
            ca_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ca_str.upper()[-1]]
        else:
            for i, opt in enumerate(opts):
                if opt.lower() == ca_str.lower():
                    ca_idx = i
                    break

    if ca_idx is None or not (0 <= ca_idx <= 3):
        return None

    # 4. Explanation
    explanation = str(raw.get("explanation") or "").strip()
    if len(explanation) < 5:
        explanation = f"Option {chr(65 + ca_idx)} ('{opts[ca_idx]}') is correct for {title} according to KTU curriculum principles."

    seen_keys.add(norm_key)
    item_id = f"gemini-q-{topic_id}-{int(datetime.now().timestamp())}-{len(seen_keys)}"

    return TutorQuestionItem(
        id=item_id,
        topic_id=topic_id,
        subject_id=subject_id,
        module_id=module_id,
        question=q_text,
        type="multiple_choice",
        marks=marks,
        options=opts,
        correct_answer=ca_idx,
        explanation=explanation,
        difficulty=difficulty,
        source="gemini_ai"
    )


def generate_practice_questions_gemini(
    request: GenerateQuestionsRequest,
    topic_data: Dict[str, Any]
) -> GenerateQuestionsResponse:
    """
    Generates structured practice quiz questions using Gemini structured prompting.
    Validates question text, 4 options, exact correct answer index, explanation, and avoids duplicates.
    Provides a bounded single-retry repair if the model returns fewer valid questions than requested.
    """
    client, err = get_gemini_client()
    preferred_model = settings.GEMINI_MODEL or "gemini-3.5-flash"

    if not client or err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gemini AI Tutor is not configured. Please set GEMINI_API_KEY in backend/.env."
        )

    target_count = min(10, max(1, request.count))
    title = topic_data.get("title", "Topic")
    explanation = topic_data.get("explanation", "")
    exam_focus = topic_data.get("exam_focus", "")
    difficulty = topic_data.get("difficulty", "medium")
    subject_id = request.subject_id or topic_data.get("subject_id", "")
    module_id = request.module_id or topic_data.get("module_id", "")

    marks = 1
    if "3 Mark" in request.format: marks = 3
    elif "5 Mark" in request.format: marks = 5
    elif "10 Mark" in request.format: marks = 10

    base_prompt = (
        f"Generate {target_count} high-quality university exam practice multiple-choice questions "
        f"for the computer science topic: '{title}'.\n"
        f"Topic Summary: {explanation}\n"
        f"Exam Focus: {exam_focus}\n"
        f"Format: {request.format} ({difficulty} difficulty).\n\n"
        "Requirements:\n"
        "- Each question must be distinct and conceptual.\n"
        "- Each question must have exactly 4 plausible, non-overlapping answer options.\n"
        "- Exactly one option is correct (correct_answer: index 0 to 3).\n"
        "- Include a concise explanation of why the correct option is right and others are incorrect.\n\n"
        "Return STRICTLY a JSON array of objects with the exact schema:\n"
        "[\n"
        "  {\n"
        '    "question": "Clear question text",\n'
        '    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        '    "correct_answer": 0,\n'
        '    "explanation": "Detailed explanation of why this option is correct"\n'
        "  }\n"
        "]\n"
        "Do not wrap in markdown quotes. Return raw JSON only."
    )

    seen_keys = set()
    valid_items: List[TutorQuestionItem] = []
    last_used_model = preferred_model

    try:
        response, used_model = _execute_gemini_with_fallback_and_retry(
            client=client,
            preferred_model=preferred_model,
            contents=base_prompt,
            config=types.GenerateContentConfig(
                temperature=0.3,
                max_output_tokens=4096,
                response_mime_type="application/json"
            )
        )
        last_used_model = used_model

        parsed = _robust_parse_json(response.text or "")
        if not isinstance(parsed, list):
            parsed = [parsed]

        for raw_item in parsed:
            validated = _validate_raw_question_item(
                raw=raw_item,
                topic_id=request.topic_id,
                subject_id=subject_id,
                module_id=module_id,
                title=title,
                difficulty=difficulty,
                marks=marks,
                seen_keys=seen_keys
            )
            if validated:
                valid_items.append(validated)
                if len(valid_items) >= target_count:
                    break

        # Bounded single-retry repair if valid count is less than target
        if len(valid_items) < target_count:
            needed = target_count - len(valid_items)
            existing_questions_summary = "; ".join([q.question[:60] for q in valid_items])
            repair_prompt = (
                f"Generate {needed} additional distinct multiple-choice questions for '{title}'.\n"
                f"Topic Summary: {explanation}\n"
                f"Do NOT duplicate these existing questions: {existing_questions_summary}\n\n"
                "Return STRICTLY a JSON array of objects with the exact schema:\n"
                "[\n"
                "  {\n"
                '    "question": "Clear question text",\n'
                '    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
                '    "correct_answer": 0,\n'
                '    "explanation": "Detailed explanation"\n'
                "  }\n"
                "]"
            )
            try:
                repair_response, rep_model = _execute_gemini_with_fallback_and_retry(
                    client=client,
                    preferred_model=preferred_model,
                    contents=repair_prompt,
                    config=types.GenerateContentConfig(
                        temperature=0.4,
                        max_output_tokens=2048,
                        response_mime_type="application/json"
                    )
                )
                last_used_model = rep_model
                repair_parsed = _robust_parse_json(repair_response.text or "")
                if not isinstance(repair_parsed, list):
                    repair_parsed = [repair_parsed]

                for raw_item in repair_parsed:
                    validated = _validate_raw_question_item(
                        raw=raw_item,
                        topic_id=request.topic_id,
                        subject_id=subject_id,
                        module_id=module_id,
                        title=title,
                        difficulty=difficulty,
                        marks=marks,
                        seen_keys=seen_keys
                    )
                    if validated:
                        valid_items.append(validated)
                        if len(valid_items) >= target_count:
                            break
            except Exception:
                # If repair request fails, continue with whatever valid questions were parsed
                pass

        if not valid_items:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unable to generate valid practice questions for '{title}'. Please retry."
            )

        return GenerateQuestionsResponse(
            questions=valid_items[:target_count],
            model=last_used_model,
            topic_id=request.topic_id
        )

    except HTTPException:
        raise
    except Exception as e:
        clean_err = _sanitize_error_message(e)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Question generation failed: {clean_err}"
        )


def generate_exam_questions_gemini(
    exam_id: str,
    exam_name: str,
    subject_id: str,
    subject_code: str,
    subject_name: str,
    topics: List[Any],
    selected_module_ids: List[str],
    count: int = 10,
    excluded_ids: Optional[set] = None
) -> List[Dict[str, Any]]:
    """
    Generates academic multiple-choice examination questions using the Gemini API.
    Scoped strictly to the exam's subject and selected modules.
    Validates exactly 4 distinct options, exactly 1 correct answer (0..3), and explanations.
    Returns a list of validated question dicts.
    """
    client, err = get_gemini_client()
    if not client or err:
        return []

    preferred_model = settings.GEMINI_MODEL or "gemini-3.5-flash-lite"
    target_count = min(20, max(3, count))
    seen_keys = set()
    excluded_set = excluded_ids or set()

    # Build topic lookup and summary
    topic_map = {t.id: t for t in topics}
    module_to_topics = {}
    for t in topics:
        if t.module_id in selected_module_ids:
            module_to_topics.setdefault(t.module_id, []).append(t)

    topics_summary_lines = []
    for mod_id in selected_module_ids:
        mod_topics = module_to_topics.get(mod_id, [])
        for t in mod_topics[:6]:
            t_exp = getattr(t, "explanation", "") or getattr(t, "description", "") or ""
            t_foc = getattr(t, "exam_focus", "") or ""
            topics_summary_lines.append(
                f"- [Module ID: {mod_id}] Topic ID: {t.id} | Title: '{t.title}' | Summary: {t_exp[:120]} | Exam Focus: {t_foc[:80]}"
            )

    topics_context = "\n".join(topics_summary_lines)

    prompt = (
        f"You are a university professor creating an academic exam paper for:\n"
        f"Subject: {subject_code} - {subject_name}\n"
        f"Exam Title: {exam_name}\n"
        f"Selected Modules Scope: {', '.join(selected_module_ids)}\n\n"
        f"Syllabus Topics Covered in Scope:\n{topics_context}\n\n"
        f"Task: Generate exactly {target_count} rigorous university-level multiple-choice exam questions.\n"
        f"Strict Requirements:\n"
        f"1. Ground all questions directly in the syllabus topics provided above.\n"
        f"2. Distribute questions evenly across the selected modules: {', '.join(selected_module_ids)}.\n"
        f"3. Every question must have EXACTLY 4 plausible, technically sound options (A, B, C, D).\n"
        f"4. EXACTLY ONE option is correct (correct_answer: index 0, 1, 2, or 3).\n"
        f"5. Include a clear technical explanation justifying the correct option and correcting misconceptions.\n"
        f"6. Do not generate generic, repeated, or trivial questions.\n\n"
        f"Return STRICTLY a JSON array of objects with the exact schema:\n"
        f"[\n"
        f"  {{\n"
        f'    "module_id": "module id from selected list",\n'
        f'    "topic_id": "topic id from list",\n'
        f'    "question": "Rigorous academic question text",\n'
        f'    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        f'    "correct_answer": 0,\n'
        f'    "explanation": "Detailed explanation of correct answer"\n'
        f"  }}\n"
        f"]\n"
        f"Do not include markdown code blocks. Output raw JSON only."
    )

    valid_questions = []

    try:
        response, used_model = _execute_gemini_with_fallback_and_retry(
            client=client,
            preferred_model=preferred_model,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0.35,
                max_output_tokens=4096,
                response_mime_type="application/json"
            )
        )

        parsed = _robust_parse_json(response.text or "")
        if not isinstance(parsed, list):
            parsed = [parsed]

        for i, raw in enumerate(parsed):
            if not isinstance(raw, dict):
                continue

            q_text = str(raw.get("question") or "").strip()
            if len(q_text) < 10:
                continue

            norm_key = _normalize_question_key(q_text)
            if not norm_key or norm_key in seen_keys:
                continue

            # Options validation: strictly 4 distinct options
            raw_opts = raw.get("options")
            if not isinstance(raw_opts, list):
                continue
            opts = [str(o).strip() for o in raw_opts if str(o).strip()]
            if len(opts) < 4:
                continue
            opts = opts[:4]
            if len(set(opts)) != 4:
                continue

            # Correct answer validation (0..3)
            ca_val = raw.get("correct_answer")
            if ca_val is None:
                ca_val = raw.get("correctAnswer")

            ca_idx = None
            if isinstance(ca_val, int) and 0 <= ca_val <= 3:
                ca_idx = ca_val
            elif isinstance(ca_val, str):
                ca_str = ca_val.strip()
                if ca_str.isdigit() and 0 <= int(ca_str) <= 3:
                    ca_idx = int(ca_str)
                elif ca_str.upper() in ["A", "B", "C", "D"]:
                    ca_idx = {"A": 0, "B": 1, "C": 2, "D": 3}[ca_str.upper()]

            if ca_idx is None or not (0 <= ca_idx <= 3):
                continue

            explanation = str(raw.get("explanation") or "").strip()
            if len(explanation) < 8:
                explanation = f"Option {chr(65 + ca_idx)} is the correct answer according to university syllabus standards."

            # Determine module_id and topic_id
            m_id = str(raw.get("module_id") or "").strip()
            t_id = str(raw.get("topic_id") or "").strip()

            if m_id not in selected_module_ids:
                # Assign to topic's module if known, or round-robin across selected modules
                if t_id in topic_map:
                    m_id = topic_map[t_id].module_id
                else:
                    m_id = selected_module_ids[len(valid_questions) % len(selected_module_ids)]

            t_obj = topic_map.get(t_id)
            if not t_obj:
                mod_topics = module_to_topics.get(m_id, topics)
                t_obj = mod_topics[len(valid_questions) % len(mod_topics)] if mod_topics else None

            topic_title = t_obj.title if t_obj else "Exam Topic"
            topic_id = t_obj.id if t_obj else f"{m_id}-t1"
            mod_num = getattr(t_obj, "module_number", None) or (m_id.split("-m")[1] if "-m" in m_id else "1")

            import uuid
            seen_keys.add(norm_key)
            qid = f"gemini-exam-{exam_id}-{topic_id}-{uuid.uuid4().hex[:6]}"

            valid_questions.append({
                "id": qid,
                "exam_id": exam_id,
                "module_id": m_id,
                "module_number": int(mod_num) if str(mod_num).isdigit() else 1,
                "module_title": f"Module {mod_num}",
                "topic_id": topic_id,
                "topic_title": topic_title,
                "question": q_text,
                "options": opts,
                "correct_answer": ca_idx,
                "explanation": explanation,
                "marks": 1,
                "difficulty": getattr(t_obj, "difficulty", "medium") or "medium",
                "source": "gemini_ai"
            })

            if len(valid_questions) >= target_count:
                break

        return valid_questions

    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Gemini exam question generation failed: {_sanitize_error_message(e)}")
        return []

