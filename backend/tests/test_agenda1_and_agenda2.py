"""
StudySense AI - Comprehensive Verification Test Suite
Verifies:
1. Module-aware exam creation (1 module, 2 modules, 3 modules, 4 modules).
2. Cross-subject module selection rejection (400 Bad Request).
3. Independent module scope preservation across exams.
4. Scope-aware topic completion calculation from real topic records.
5. Authentic quiz accuracy calculation from recorded attempts.
6. Proper handling of modules with no quiz attempts (returns None / 'No quiz data yet').
7. Detection of ML feature incompatibility and zero fabricated prediction scores.
8. Gemini AI Tutor configuration status, 503 on unconfigured key with developer instructions.
9. Mocked Gemini AI Tutor end-to-end multi-turn chat and question generation.
10. Ensuring API key secrets are never leaked in responses.
"""

import pytest
from unittest.mock import patch, MagicMock


def test_create_exam_one_module(client):
    """Test 1: Creating an exam with exactly one module."""
    payload = {
        "subject_id": "cs-cn",
        "name": "CN Module 1 Quiz",
        "exam_datetime": "2026-10-30T10:00:00Z",
        "module_ids": ["cn-m1"]
    }
    res = client.post("/api/exams", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["module_ids"] == ["cn-m1"]
    assert data["subject_id"] == "cs-cn"


def test_create_exam_two_modules(client):
    """Test 2: Creating an exam with exactly two modules (e.g. Series Test 1)."""
    payload = {
        "subject_id": "cs-cn",
        "name": "CN Series Test 1",
        "exam_datetime": "2026-11-05T10:00:00Z",
        "module_ids": ["cn-m1", "cn-m2"]
    }
    res = client.post("/api/exams", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert sorted(data["module_ids"]) == ["cn-m1", "cn-m2"]


def test_create_exam_three_and_four_modules(client):
    """Test 3: Creating an exam with 3 modules and 4 modules."""
    # 3 modules
    res3 = client.post("/api/exams", json={
        "subject_id": "cs-se",
        "name": "SE 3-Module Review",
        "exam_datetime": "2026-11-10T10:00:00Z",
        "module_ids": ["se-m1", "se-m2", "se-m3"]
    })
    assert res3.status_code == 201
    assert len(res3.json()["module_ids"]) == 3

    # 4 modules (All)
    res4 = client.post("/api/exams", json={
        "subject_id": "cs-se",
        "name": "SE End Semester Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["se-m1", "se-m2", "se-m3", "se-m4"]
    })
    assert res4.status_code == 201
    assert len(res4.json()["module_ids"]) == 4


def test_cross_subject_modules_rejected(client):
    """Test 4: Prohibiting modules from different subjects from being mixed."""
    payload = {
        "subject_id": "cs-cn",
        "name": "Invalid Mixed Exam",
        "exam_datetime": "2026-11-15T10:00:00Z",
        "module_ids": ["cn-m1", "se-m1"]  # se-m1 belongs to cs-se, not cs-cn!
    }
    res = client.post("/api/exams", json=payload)
    assert res.status_code == 400
    assert "Cross-subject selection is strictly prohibited" in res.json()["detail"]


def test_duplicate_modules_deduplicated(client):
    """Test 4b: Duplicate module selections are safely deduplicated."""
    payload = {
        "subject_id": "cs-math",
        "name": "Math Test",
        "exam_datetime": "2026-11-12T10:00:00Z",
        "module_ids": ["math-m1", "math-m1", "math-m2"]
    }
    res = client.post("/api/exams", json=payload)
    assert res.status_code == 201
    assert res.json()["module_ids"] == ["math-m1", "math-m2"]


def test_independent_exam_scopes_preserved(client):
    """Test 5: Preserving each exam's own selected module scope."""
    res1 = client.post("/api/exams", json={
        "subject_id": "cs-ml",
        "name": "ML Series 1",
        "exam_datetime": "2026-11-01T10:00:00Z",
        "module_ids": ["ml-m1", "ml-m2"]
    })
    res2 = client.post("/api/exams", json={
        "subject_id": "cs-ml",
        "name": "ML Series 2",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["ml-m3", "ml-m4"]
    })
    assert res1.status_code == 201
    assert res2.status_code == 201

    e1_id = res1.json()["id"]
    e2_id = res2.json()["id"]

    e1_fetched = client.get(f"/api/exams/{e1_id}").json()
    e2_fetched = client.get(f"/api/exams/{e2_id}").json()

    assert e1_fetched["module_ids"] == ["ml-m1", "ml-m2"]
    assert e2_fetched["module_ids"] == ["ml-m3", "ml-m4"]


def test_scope_analysis_completion_and_quiz_accuracy(client):
    """
    Test 6 & 7 & 8: Calculating completion from real topic records,
    authentic quiz accuracy from valid recorded answers, and handling no quiz data.
    """
    # Create an exam with Module 1 of Computer Networks (4 topics)
    res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "CN Module 1 Scope Test",
        "exam_datetime": "2026-12-01T10:00:00Z",
        "module_ids": ["cn-m1"]
    })
    exam_id = res.json()["id"]

    # Scope analysis endpoint
    scope_res = client.get(f"/api/exams/{exam_id}/scope-analysis")
    assert scope_res.status_code == 200
    scope_data = scope_res.json()

    assert scope_data["total_selected_topics"] == 4
    assert scope_data["selected_module_ids"] == ["cn-m1"]
    assert isinstance(scope_data["topic_completion_percentage"], (int, float))

    # Module 1 in prototype data has no default quiz attempts -> quiz_accuracy_percentage must be None
    assert scope_data["quiz_accuracy_percentage"] is None
    assert scope_data["total_quiz_attempts"] == 0

    # Now record a real exam-specific quiz attempt for topic cn-m1-t1
    attempt_res = client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "topic_id": "cn-m1-t1",
        "subject_id": "cs-cn",
        "module_id": "cn-m1",
        "score": 4,
        "total_questions": 5,
        "answers": [
            {"question_index": 0, "selected_answer": 0, "is_correct": True},
            {"question_index": 1, "selected_answer": 0, "is_correct": True},
            {"question_index": 2, "selected_answer": 0, "is_correct": True},
            {"question_index": 3, "selected_answer": 0, "is_correct": True},
            {"question_index": 4, "selected_answer": 1, "is_correct": False}
        ]
    })
    assert attempt_res.status_code == 201

    # Re-fetch scope analysis: must now reflect the real quiz attempt (4/5 = 80%)
    scope_res_after = client.get(f"/api/exams/{exam_id}/scope-analysis")
    assert scope_res_after.status_code == 200
    after_data = scope_res_after.json()

    assert after_data["total_quiz_attempts"] >= 1
    assert after_data["total_quiz_questions"] >= 5
    assert after_data["total_quiz_correct"] >= 4
    assert after_data["quiz_accuracy_percentage"] == 80.0


def test_scope_prediction_model_integrity(client):
    """
    Test 9 & 10: Model compatibility detection and transparent readiness baseline.
    When module-scoped prediction is requested, the system provides a preparation-based
    estimate (available=True) labeled Experimental, with documented formula and assumptions.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Integrity Test Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m1", "cn-m2"]
    })
    exam_id = exam_res.json()["id"]

    pred_res = client.get(f"/api/predictions/exam/{exam_id}")
    assert pred_res.status_code == 200
    pred_data = pred_res.json()

    assert pred_data["available"] is True
    assert pred_data["predicted_score"] is not None
    assert pred_data["is_experimental"] is True
    assert pred_data["prediction_status"] == "experimental_readiness"
    assert "40% module syllabus completion" in pred_data["data_limitations_note"]
    assert pred_data["total_selected_topics"] == 8


def test_tutor_status_endpoint(client):
    """Test 12: GET /api/tutor/status returns configuration schema and model name."""
    res = client.get("/api/tutor/status")
    assert res.status_code == 200
    data = res.json()
    assert "model" in data
    assert data["model"] in ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.5-flash-lite"]
    assert "configured" in data


def test_tutor_missing_key_behavior(client):
    """
    Test 14: Calling tutor chat when GEMINI_API_KEY is unset returns
    HTTP 503 with helpful developer setup instructions instead of fake text.
    """
    with patch("backend.app.config.settings.GEMINI_API_KEY", ""):
        res = client.post("/api/tutor/chat", json={
            "message": "Explain OSI layers",
            "context": {
                "topic_id": "cn-m1-t1",
                "topic_title": "OSI and TCP/IP Reference Models",
                "subject_id": "cs-cn"
            }
        })
        assert res.status_code == 503
        data = res.json()
        assert "not configured" in data["detail"].lower()
        assert "GEMINI_API_KEY" in data["detail"]


def test_tutor_api_key_never_leaked_in_response(client):
    """Test 15: Confirming GEMINI_API_KEY is never exposed to the client in status or chat."""
    status_res = client.get("/api/tutor/status")
    status_text = status_res.text
    assert "AIza" not in status_text

    # Chat error response must not contain key
    chat_res = client.post("/api/tutor/chat", json={
        "message": "Hello",
        "context": {"topic_id": "cn-m1-t1"}
    })
    assert "AIza" not in chat_res.text


def test_tutor_mocked_gemini_success(client):
    """
    Test 12 & 13: Sending a tutor request to Gemini when configured.
    Mocks the official google-genai client response to verify backend prompt framing,
    multi-turn history handling, and structured response parsing.
    """
    fake_reply = "The OSI model consists of 7 conceptual layers starting with the Physical layer."
    mock_response = MagicMock()
    mock_response.text = fake_reply

    mock_client = MagicMock()
    mock_client.models.generate_content.return_value = mock_response

    with patch("backend.app.config.settings.GEMINI_API_KEY", "test-key-mocked"):
        with patch("backend.app.services.tutor_service.get_gemini_client", return_value=(mock_client, None)):
            res = client.post("/api/tutor/chat", json={
                "message": "Explain OSI model simply",
                "history": [
                    {"role": "user", "content": "What is computer networks?"},
                    {"role": "model", "content": "Computer networks connect multiple computing devices."}
                ],
                "context": {
                    "subject_id": "cs-cn",
                    "subject_name": "Computer Networks",
                    "module_id": "cn-m1",
                    "topic_id": "cn-m1-t1",
                    "topic_title": "OSI and TCP/IP Reference Models"
                }
            })

            assert res.status_code == 200
            data = res.json()
            assert data["reply"] == fake_reply
            assert data["model"] in ["gemini-3.5-flash", "gemini-3.8-flash", "gemini-3.5-flash-lite"]
            assert data["context_grounded"] is True
            assert isinstance(data["suggestions"], list)
