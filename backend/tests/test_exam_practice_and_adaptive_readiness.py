"""
StudySense AI - Exam Tracking, Practice Quizzes, and Adaptive Readiness Integration Tests
Tests:
1. Create exam covering only Module 3.
2. Create exam covering Modules 3 and 4.
3. Confirm neither exam silently changes its selected scope.
4. Mark Module 3 complete for one exam and verify overall syllabus TopicProgress remains unchanged.
5. Generate mixed-module quiz and verify every question belongs strictly to selected scope.
6. Submit quiz and confirm attempt is saved exactly once, linked to exam_id.
7. Retake quiz and confirm new attempt with fresh questions is generated.
8. Confirm previous attempts remain available.
9. Verify adaptive readiness responds appropriately when accuracy improves.
10. Verify adaptive readiness responds appropriately when accuracy declines without overreacting.
11. Confirm latest quiz score and predicted exam score are displayed separately.
12. Confirm unselected module activity does not affect the prediction.
"""

import json
from datetime import datetime, timezone


def test_exam_module_selection_and_isolation(client):
    # 1. Create an exam covering only Module 3
    exam1_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "CN Module 3 Test",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    assert exam1_res.status_code == 201
    exam1 = exam1_res.json()
    assert exam1["module_ids"] == ["cn-m3"]

    # 2. Create another exam covering Modules 3 and 4
    exam2_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "CN Series 2 Exam",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    assert exam2_res.status_code == 201
    exam2 = exam2_res.json()
    assert exam2["module_ids"] == ["cn-m3", "cn-m4"]

    # 3. Confirm neither exam silently changes its selected scope
    get1 = client.get(f"/api/exams/{exam1['id']}").json()
    get2 = client.get(f"/api/exams/{exam2['id']}").json()
    assert get1["module_ids"] == ["cn-m3"]
    assert get2["module_ids"] == ["cn-m3", "cn-m4"]

    # 4. Mark Module 3 complete for exam 1 and verify overall syllabus progress remains unchanged
    # First, record baseline progress for cn-m3-t1
    prog_before = client.get("/api/progress", params={"subject_id": "cs-cn"}).json()
    t1_before = next((p for p in prog_before if p.get("topic_id") == "cn-m3-t1"), None)
    comp_before = t1_before.get("completion", 0.0) if t1_before else 0.0

    toggle_res = client.put(f"/api/exams/{exam1['id']}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })
    assert toggle_res.status_code == 200
    assert "cn-m3" in toggle_res.json()["completed_module_ids"]

    # Verify overall syllabus TopicProgress for topics in cn-m3 was NOT automatically modified
    prog_after = client.get("/api/progress", params={"subject_id": "cs-cn"}).json()
    t1_after = next((p for p in prog_after if p.get("topic_id") == "cn-m3-t1"), None)
    comp_after = t1_after.get("completion", 0.0) if t1_after else 0.0
    assert comp_after == comp_before, "Marking exam module complete must NOT mark syllabus topics complete!"

    # Undo exam-specific completion
    undo_res = client.put(f"/api/exams/{exam1['id']}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": False
    })
    assert undo_res.status_code == 200
    assert "cn-m3" not in undo_res.json()["completed_module_ids"]


def test_mixed_module_practice_quiz_generation(client):
    # Create exam covering Modules 3 and 4 of Computer Networks
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Mixed Practice Test Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    exam_id = exam_res.json()["id"]

    # 5. Generate a practice quiz and verify every question belongs to selected scope
    quiz_res = client.post(f"/api/exams/{exam_id}/practice-quiz/generate?count=10")
    assert quiz_res.status_code == 200
    quiz_data = quiz_res.json()

    assert quiz_data["exam_id"] == exam_id
    assert quiz_data["total_questions"] == 10
    assert len(quiz_data["questions"]) == 10

    # Ensure every single question has module_id in ["cn-m3", "cn-m4"]
    for q in quiz_data["questions"]:
        assert q["module_id"] in ["cn-m3", "cn-m4"]
        assert q["module_id"] not in ["cn-m1", "cn-m2"]
        assert "question" in q and len(q["question"]) > 5
        assert len(q["options"]) >= 2
        assert 0 <= q["correct_answer"] < len(q["options"])
        assert "explanation" in q
        assert "topic_id" in q

    # Check both Module 3 and Module 4 are represented in questions
    modules_present = set(q["module_id"] for q in quiz_data["questions"])
    assert "cn-m3" in modules_present
    assert "cn-m4" in modules_present


def test_quiz_submission_retakes_and_adaptive_readiness(client):
    # Create exam covering Modules 3 and 4
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Adaptive Readiness Test Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    exam_id = exam_res.json()["id"]

    # Initial scope analysis before any quiz
    analysis0 = client.get(f"/api/predictions/exam/{exam_id}").json()
    initial_score = analysis0["estimated_score"]
    assert analysis0["has_quiz_data"] is False
    assert analysis0["total_quiz_attempts"] == 0

    # 6. Submit Quiz Attempt 1 (Score: 6/10 = 60%)
    attempt1_res = client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "score": 6.0,
        "total_questions": 10,
        "duration_seconds": 180,
        "percentage": 60.0,
        "format": "Mixed Module Exam Practice",
        "module_scope_json": json.dumps(["cn-m3", "cn-m4"]),
        "module_results_json": json.dumps({"cn-m3": {"score": 3, "total": 5}, "cn-m4": {"score": 3, "total": 5}})
    })
    assert attempt1_res.status_code == 201
    attempt1 = attempt1_res.json()
    assert attempt1["exam_id"] == exam_id

    # Verify scope analysis after Attempt 1
    analysis1 = client.get(f"/api/predictions/exam/{exam_id}").json()
    assert analysis1["has_quiz_data"] is True
    assert analysis1["total_quiz_attempts"] == 1
    assert analysis1["latest_quiz_percentage"] == 60.0
    score1 = analysis1["estimated_score"]

    # 7. Retake Quiz: Generate fresh questions excluding attempt 1 question IDs
    dummy_excluded_ids = "gen-q-1,gen-q-2,gen-q-3"
    quiz2_res = client.post(f"/api/exams/{exam_id}/practice-quiz/generate?count=10&exclude_ids={dummy_excluded_ids}")
    assert quiz2_res.status_code == 200
    quiz2_questions = quiz2_res.json()["questions"]
    for q in quiz2_questions:
        assert q["id"] not in dummy_excluded_ids.split(",")

    # Submit Quiz Attempt 2 with IMPROVED accuracy (Score: 9/10 = 90%)
    attempt2_res = client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "score": 9.0,
        "total_questions": 10,
        "duration_seconds": 210,
        "percentage": 90.0,
        "format": "Mixed Module Exam Practice",
        "module_scope_json": json.dumps(["cn-m3", "cn-m4"]),
        "module_results_json": json.dumps({"cn-m3": {"score": 5, "total": 5}, "cn-m4": {"score": 4, "total": 5}})
    })
    assert attempt2_res.status_code == 201

    # 8. Confirm previous attempts remain available
    history_res = client.get(f"/api/quizzes/history?exam_id={exam_id}")
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 2
    assert any(h["id"] == attempt1["id"] for h in history)

    # 9. Improve performance on fresh quiz questions: verify readiness estimate generally improves
    analysis2 = client.get(f"/api/predictions/exam/{exam_id}").json()
    assert analysis2["total_quiz_attempts"] == 2
    assert analysis2["latest_quiz_percentage"] == 90.0
    assert analysis2["quiz_trend"] == "improving"
    score2 = analysis2["estimated_score"]
    assert score2 > score1, f"Readiness should improve from {score1} to {score2} when quiz accuracy rose from 60% to 90%!"
    assert "improved from 60% to 90%" in analysis2["why_prediction_changed"]

    # 10. Perform worse on Attempt 3 (Score: 7/10 = 70%): verify estimate reflects changed evidence without overreacting
    attempt3_res = client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "score": 7.0,
        "total_questions": 10,
        "duration_seconds": 190,
        "percentage": 70.0,
        "format": "Mixed Module Exam Practice",
        "module_scope_json": json.dumps(["cn-m3", "cn-m4"])
    })
    assert attempt3_res.status_code == 201

    analysis3 = client.get(f"/api/predictions/exam/{exam_id}").json()
    assert analysis3["total_quiz_attempts"] == 3
    assert analysis3["latest_quiz_percentage"] == 70.0
    assert analysis3["quiz_trend"] == "declining"
    score3 = analysis3["estimated_score"]
    assert score3 < score2, f"Readiness should decline from {score2} to {score3} when latest quiz fell to 70%!"
    # Verify exponential smoothing damped the drop (did not plunge straight to zero or extreme)
    assert score3 >= 40.0
    assert score3 > score1, "Attempt 3 (70%) with previous 90% should still exceed Attempt 1 (60%)"

    # 11. Confirm latest quiz score and predicted exam score are displayed separately
    assert analysis3["latest_quiz_percentage"] == 70.0
    assert analysis3["estimated_score"] == score3
    assert analysis3["latest_quiz_percentage"] != analysis3["estimated_score"]

    # 12. Confirm unselected module activity does not affect the prediction
    # Activity in cn-m1 (not in this exam's scope)
    client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "subject_id": "cs-cn",
        "score": 10.0,
        "total_questions": 10,
        "percentage": 100.0
    })
    analysis4 = client.get(f"/api/predictions/exam/{exam_id}").json()
    assert analysis4["estimated_score"] == score3, "Activity in unselected module 1 must not affect exam prediction for modules 3 and 4!"
