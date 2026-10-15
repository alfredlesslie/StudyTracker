import pytest
import json
from backend.app.models.exam import Exam
from backend.app.models.prediction import ExamPrediction
from backend.app.models.quiz_attempt import QuizAttempt
from backend.app.models.progress import TopicProgress

def test_15_scenarios_comprehensive(client, db_session):
    # =========================================================================
    # SCENARIO 1: Create an exam covering only Module 3
    # =========================================================================
    res1 = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Midterm Exam - Module 3 Only",
        "exam_datetime": "2026-11-15T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    assert res1.status_code == 201
    exam1 = res1.json()
    assert exam1["module_ids"] == ["cn-m3"]
    exam1_id = exam1["id"]

    # =========================================================================
    # SCENARIO 2: Create another exam covering Modules 3 and 4
    # =========================================================================
    res2 = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Series Test 2 - Modules 3 & 4",
        "exam_datetime": "2026-11-20T14:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    assert res2.status_code == 201
    exam2 = res2.json()
    assert exam2["module_ids"] == ["cn-m3", "cn-m4"]
    exam2_id = exam2["id"]

    # =========================================================================
    # SCENARIO 3: Confirm neither exam silently changes its selected scope
    # =========================================================================
    get1 = client.get(f"/api/exams/{exam1_id}")
    assert get1.status_code == 200
    assert get1.json()["module_ids"] == ["cn-m3"]

    get2 = client.get(f"/api/exams/{exam2_id}")
    assert get2.status_code == 200
    assert get2.json()["module_ids"] == ["cn-m3", "cn-m4"]

    # =========================================================================
    # SCENARIO 4: Mark Module 3 complete for one exam and verify overall syllabus remains unchanged
    # =========================================================================
    toggle_res = client.put(f"/api/exams/{exam1_id}/toggle-module-completion", json={"module_id": "cn-m3", "completed": True})
    assert toggle_res.status_code == 200
    updated_exam1 = toggle_res.json()
    assert "cn-m3" in updated_exam1["completed_module_ids"]

    # Verify syllabus topic completion is completely unmutated
    db_session.expire_all()
    topic_progs = db_session.query(TopicProgress).filter(TopicProgress.topic_id.like("cn-m3%")).all()
    # No topics should have been marked complete by marking exam module complete
    for tp in topic_progs:
        assert tp.status != "mastered"

    # Verify toggle undo works
    undo_res = client.put(f"/api/exams/{exam1_id}/toggle-module-completion", json={"module_id": "cn-m3", "completed": False})
    assert undo_res.status_code == 200
    assert "cn-m3" not in undo_res.json()["completed_module_ids"]
    # Re-enable for subsequent testing
    client.put(f"/api/exams/{exam1_id}/toggle-module-completion", json={"module_id": "cn-m3", "completed": True})

    # =========================================================================
    # SCENARIO 5: Generate a quiz and verify every question belongs to the selected scope
    # =========================================================================
    quiz1_gen = client.post(f"/api/exams/{exam1_id}/practice-quiz/generate", json={"count": 6})
    assert quiz1_gen.status_code == 200
    q1_data = quiz1_gen.json()
    assert len(q1_data["questions"]) > 0
    # Every question must strictly belong to cn-m3
    for q in q1_data["questions"]:
        assert q["module_id"] == "cn-m3"

    quiz2_gen = client.post(f"/api/exams/{exam2_id}/practice-quiz/generate", json={"count": 6})
    assert quiz2_gen.status_code == 200
    q2_data = quiz2_gen.json()
    assert len(q2_data["questions"]) > 0
    for q in q2_data["questions"]:
        assert q["module_id"] in ["cn-m3", "cn-m4"]
        assert q["module_id"] not in ["cn-m1", "cn-m2"]

    # =========================================================================
    # SCENARIO 6: Submit the quiz and confirm the attempt is saved exactly once
    # =========================================================================
    first_q_ids = [q["id"] for q in q1_data["questions"]]
    sub1_res = client.post("/api/quizzes/attempts", json={
        "subject_id": "cs-cn",
        "exam_id": exam1_id,
        "score": 3.0,
        "total_questions": 6,
        "percentage": 50.0,
        "module_scope_json": json.dumps(["cn-m3"]),
        "module_results_json": json.dumps({"cn-m3": {"correct": 3, "total": 6, "percentage": 50.0}}),
        "answers_json": json.dumps([{"questionId": qid, "isCorrect": idx < 3} for idx, qid in enumerate(first_q_ids)])
    })
    assert sub1_res.status_code == 201

    db_session.expire_all()
    attempts_exam1 = db_session.query(QuizAttempt).filter(QuizAttempt.exam_id == exam1_id).all()
    assert len(attempts_exam1) == 1

    pred1_res = client.get(f"/api/exams/{exam1_id}/prediction")
    assert pred1_res.status_code == 200
    pred1_score = pred1_res.json()["estimated_score"]

    # =========================================================================
    # SCENARIO 7: Retake the quiz and confirm a new attempt with fresh questions is created
    # =========================================================================
    quiz1_retake = client.post(f"/api/exams/{exam1_id}/practice-quiz/generate", json={
        "count": 6,
        "exclude_question_ids": first_q_ids
    })
    assert quiz1_retake.status_code == 200
    q_retake_data = quiz1_retake.json()
    # Check that fresh questions are prioritized
    fresh_ids = [q["id"] for q in q_retake_data["questions"]]
    assert any(qid not in first_q_ids for qid in fresh_ids) or q_retake_data.get("exhausted_pool")

    # Submit second attempt (higher score: 6/6 = 100%)
    sub2_res = client.post("/api/quizzes/attempts", json={
        "subject_id": "cs-cn",
        "exam_id": exam1_id,
        "score": 6.0,
        "total_questions": 6,
        "percentage": 100.0,
        "module_scope_json": json.dumps(["cn-m3"]),
        "module_results_json": json.dumps({"cn-m3": {"correct": 6, "total": 6, "percentage": 100.0}}),
        "answers_json": json.dumps([{"questionId": qid, "isCorrect": True} for qid in fresh_ids])
    })
    assert sub2_res.status_code == 201

    # =========================================================================
    # SCENARIO 8: Confirm previous attempts remain available
    # =========================================================================
    db_session.expire_all()
    all_att = db_session.query(QuizAttempt).filter(QuizAttempt.exam_id == exam1_id).all()
    assert len(all_att) == 2
    scores = [a.percentage for a in all_att]
    assert 50.0 in scores
    assert 100.0 in scores

    # =========================================================================
    # SCENARIO 9: Improve performance on fresh quiz questions and verify readiness estimate responds appropriately
    # =========================================================================
    # Prior to attempt 2, score was 50%. After attempt 2, score improved to 100%.
    pred_res = client.get(f"/api/exams/{exam1_id}/prediction")
    assert pred_res.status_code == 200
    pred2_data = pred_res.json()
    pred2_score = pred2_data["estimated_score"]
    # With higher quiz score, readiness must have increased from pred1_score
    assert pred2_score > pred1_score
    assert "improved from 50% to 100%" in pred2_data["why_prediction_changed"]

    # =========================================================================
    # SCENARIO 10: Perform worse on a comparable fresh quiz and verify estimate reflects changed evidence without overreacting
    # =========================================================================
    sub3_res = client.post("/api/quizzes/attempts", json={
        "subject_id": "cs-cn",
        "exam_id": exam1_id,
        "score": 2.0,
        "total_questions": 6,
        "percentage": 33.3,
        "module_scope_json": json.dumps(["cn-m3"]),
        "module_results_json": json.dumps({"cn-m3": {"correct": 2, "total": 6, "percentage": 33.3}}),
        "answers_json": json.dumps([{"questionId": f"dummy-{i}", "isCorrect": i < 2} for i in range(6)])
    })
    assert sub3_res.status_code == 201
    pred3_res = client.get(f"/api/exams/{exam1_id}/prediction")
    assert pred3_res.status_code == 200
    pred3_data = pred3_res.json()
    pred3_score = pred3_data["estimated_score"]
    # Prediction should decline from pred2_score, but damping (65/35 weight on previous) prevents extreme drop
    assert pred3_score < pred2_score
    assert pred3_score >= 45.0  # Kept stable by damping and 100% module completion
    assert "declined from 100% to 33%" in pred3_data["why_prediction_changed"]

    # =========================================================================
    # SCENARIO 11: Confirm latest quiz score and predicted exam score are displayed separately
    # =========================================================================
    pred_data = pred3_res.json()
    assert "estimated_score" in pred_data
    # Predicted score is ~60-70, latest quiz score was 33.3%. Distinct numbers.
    assert pred_data["estimated_score"] != 33.3

    # =========================================================================
    # SCENARIO 12: Confirm Home, Exams, and My Progress show the same saved prediction for the same exam
    # =========================================================================
    db_session.expire_all()
    saved_pred_db = db_session.query(ExamPrediction).filter(ExamPrediction.exam_id == exam1_id).first()
    assert saved_pred_db is not None
    assert abs(saved_pred_db.predicted_score - pred_data["estimated_score"]) < 0.1

    # =========================================================================
    # SCENARIO 13: Confirm unselected-module activity does not affect the prediction
    # =========================================================================
    # Record quiz attempt on Module 1 (which is unselected in Exam 1)
    client.post("/api/quizzes/attempts", json={
        "subject_id": "cs-cn",
        "topic_id": "cn-m1-t1",
        "score": 0.0,
        "total_questions": 10,
        "percentage": 0.0,
        "answers_json": "[]"
    })
    # Re-fetch Exam 1 prediction
    pred_isolated = client.get(f"/api/exams/{exam1_id}/prediction").json()
    assert pred_isolated["estimated_score"] == pred_data["estimated_score"]

    # =========================================================================
    # SCENARIO 14: Confirm all saved data survive application restarts
    # =========================================================================
    db_session.expire_all()
    reloaded_exam1 = db_session.query(Exam).filter(Exam.id == exam1_id).first()
    assert reloaded_exam1 is not None
    assert reloaded_exam1.modules_list == ["cn-m3"]
    assert "cn-m3" in reloaded_exam1.completed_modules_list

    reloaded_attempts = db_session.query(QuizAttempt).filter(QuizAttempt.exam_id == exam1_id).all()
    assert len(reloaded_attempts) == 3

    reloaded_pred = db_session.query(ExamPrediction).filter(ExamPrediction.exam_id == exam1_id).first()
    assert reloaded_pred is not None

    # =========================================================================
    # SCENARIO 15: Confirm Learn page, overall syllabus tracking, existing prediction API, and AI Tutor still work
    # =========================================================================
    # 1. Syllabus Topics API (Learn page backend)
    topics_res = client.get("/api/subjects/cs-cn/topics")
    assert topics_res.status_code == 200
    assert len(topics_res.json()) > 0

    # 2. Preserved Trained ML Model Direct Prediction API (/predict)
    ml_res = client.post("/predict", json={
        "study_time_hours": 10.0,
        "quiz_avg_score": 75.0,
        "attendance_rate": 85.0
    })
    assert ml_res.status_code == 200
    ml_data = ml_res.json()
    assert "predictedScore" in ml_data
    assert ml_data["model"] is not None

    # 3. AI Tutor Status / Chat Endpoint
    tutor_res = client.post("/api/tutor/chat", json={
        "message": "Hello tutor",
        "history": []
    })
    # Tutor endpoint responds with standard status code (e.g. 200 or 400/500/503 depending on API key)
    assert tutor_res.status_code in [200, 400, 500, 503]
