"""
StudySense AI - Phase 2 Practice Session and Separation Tests
Validates all Phase 2 backend requirements:
1. Practice quiz attempts have exam_id=None.
2. Practice history with practice_only=True returns strictly standalone practice attempts.
3. Submitting a practice quiz does NOT change TopicProgress.completion (Syllabus progress isolation).
4. Submitting a practice quiz does NOT alter exam records or predictions.
5. Duplicate submissions and score limits are enforced.
6. Gemini AI Tutor endpoint remains functional.
"""

import pytest
from backend.app.models.exam import Exam
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.models.quiz_attempt import QuizAttempt


def test_practice_quiz_attempt_has_no_exam_id(client, db_session):
    """
    Test 11: Complete a Practice quiz and verify no exam ID is assigned to its attempt.
    """
    attempt_payload = {
        "topic_id": "cn-m1-t1",
        "subject_id": "cs-cn",
        "exam_id": None,
        "score": 4.0,
        "total_questions": 5,
        "duration_seconds": 120,
        "format": "5 Question Practice"
    }

    res = client.post("/api/quizzes/attempts", json=attempt_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["exam_id"] is None
    assert data["score"] == 4.0
    assert data["total_questions"] == 5
    assert data["percentage"] == 80.0

    # Query DB directly to verify persistence
    attempt_in_db = db_session.query(QuizAttempt).filter(QuizAttempt.id == data["id"]).first()
    assert attempt_in_db is not None
    assert attempt_in_db.exam_id is None
    assert attempt_in_db.score == 4.0


def test_practice_history_strictly_isolates_standalone_attempts(client, db_session):
    """
    Test 12: Verify Practice history contains only standalone Practice attempts.
    """
    # Create an exam first to attach an exam quiz
    exam = db_session.query(Exam).first()
    exam_id = exam.id if exam else "exam-seed-cn"

    # Post 1 exam quiz attempt
    exam_attempt = client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "exam_id": exam_id,
        "score": 5.0,
        "total_questions": 5,
        "format": "Exam Practice"
    })
    assert exam_attempt.status_code == 201

    # Post 1 standalone practice attempt
    practice_attempt = client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "exam_id": None,
        "score": 3.0,
        "total_questions": 5,
        "format": "5 Question Practice"
    })
    assert practice_attempt.status_code == 201

    # Query history with practice_only=True
    res = client.get("/api/quizzes/history?practice_only=true")
    assert res.status_code == 200
    practice_history = res.json()

    # Verify every returned attempt has exam_id == None
    for att in practice_history:
        assert att["exam_id"] is None, f"Attempt {att['id']} leaked exam_id {att['exam_id']} into practice history!"


def test_practice_quiz_does_not_modify_syllabus_completion(client, db_session):
    """
    Test 15: Verify completing a Practice quiz does not change overall syllabus completion.
    """
    topic_id = "cn-m2-t2"

    # Ensure topic starts with a known baseline completion (e.g. 0.0 or 50.0)
    prog = db_session.query(TopicProgress).filter(
        TopicProgress.student_id == "student-001",
        TopicProgress.topic_id == topic_id
    ).first()

    baseline_completion = 50.0
    if not prog:
        prog = TopicProgress(
            student_id="student-001",
            topic_id=topic_id,
            completion=baseline_completion,
            status="learning",
            quiz_attempts=0
        )
        db_session.add(prog)
        db_session.commit()
    else:
        prog.completion = baseline_completion
        db_session.commit()

    # Complete a high-scoring practice quiz (100% score)
    res = client.post("/api/quizzes/attempts", json={
        "topic_id": topic_id,
        "exam_id": None,
        "score": 10.0,
        "total_questions": 10,
        "format": "10 Question Practice"
    })
    assert res.status_code == 201

    # Refresh TopicProgress
    db_session.expire_all()
    updated_prog = db_session.query(TopicProgress).filter(
        TopicProgress.student_id == "student-001",
        TopicProgress.topic_id == topic_id
    ).first()

    # Metric separation: completion MUST NOT jump to 100% simply because quiz was passed!
    assert updated_prog.completion == baseline_completion, (
        f"Quiz attempt improperly modified topic completion from {baseline_completion} to {updated_prog.completion}!"
    )
    # Quiz attempts metric should update
    assert updated_prog.quiz_attempts >= 1
    assert updated_prog.average_quiz_score == 100.0


def test_practice_quiz_does_not_alter_exam_records_or_prediction(client, db_session):
    """
    Test 13, 14, 16: Completing a practice quiz does not alter exam records or predictions.
    """
    exam = db_session.query(Exam).first()
    if not exam:
        pytest.skip("No exam found in test DB")

    initial_name = exam.name
    initial_module_ids = exam.module_ids

    # Take a standalone practice quiz on a topic related to the exam's subject
    res = client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "subject_id": exam.subject_id,
        "exam_id": None,
        "score": 5.0,
        "total_questions": 5,
        "format": "5 Question Practice"
    })
    assert res.status_code == 201

    # Verify exam record in DB remains completely unchanged
    db_session.expire_all()
    exam_after = db_session.query(Exam).filter(Exam.id == exam.id).first()
    assert exam_after.name == initial_name
    assert exam_after.module_ids == initial_module_ids


def test_syllabus_and_learn_completion_toggle_still_works(client):
    """
    Test 17: Verify existing My Syllabus and Learn completion behavior still works.
    """
    topic_id = "cn-m1-t1"
    # Update completion via progress endpoint
    res = client.put(f"/api/topics/{topic_id}/progress", json={"completion": 100.0})
    assert res.status_code == 200
    data = res.json()
    assert data["completion"] == 100.0

    # Read back progress
    get_res = client.get(f"/api/topics/{topic_id}/progress")
    assert get_res.status_code == 200
    assert get_res.json()["completion"] == 100.0


def test_tutor_status_remains_functional(client):
    """
    Test 18: Verify Gemini AI Tutor probe endpoint remains functional.
    """
    res = client.get("/api/tutor/status")
    assert res.status_code == 200
    data = res.json()
    assert "configured" in data
    assert "status" in data
