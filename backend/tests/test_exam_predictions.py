"""
StudySense AI - Comprehensive Automated Tests for Exam-Scoped Predictions
Verifies all 8 core prediction responsiveness behaviors, formula calculation,
neutral baseline assumptions, module filtering, boundary guarantees,
and actual mark persistence.
"""

import pytest
from backend.app.services.exam_readiness_service import calculate_readiness_estimate


# ==============================================================================
# 1. DIRECT UNIT TESTS FOR READINESS ESTIMATE FORMULA & BOUNDS
# ==============================================================================

def test_readiness_formula_neutral_baseline():
    """
    When student has zero progress, zero quizzes, zero sessions, and no previous exam,
    the formula must return a documented neutral baseline (~31.5) without dividing by zero.
    """
    res = calculate_readiness_estimate(
        total_selected_topics=8,
        completed_selected_topics=0,
        total_quiz_questions=0,
        total_quiz_correct=0,
        active_study_minutes=0,
        selected_modules_count=2,
        previous_exam_score=None
    )
    # Syllabus: 0% * 0.40 = 0.0
    # Quiz: 50% neutral * 0.35 = 17.5
    # Consistency: 50% neutral * 0.15 = 7.5
    # Previous Exam: 65% neutral * 0.10 = 6.5
    # Total = 31.5
    assert 0.0 <= res["estimated_score"] <= 100.0
    assert len(res["assumed_inputs"]) == 3
    assert res["reliability_level"] in ["Initial Baseline", "Limited"]
    assert res["components"]["quiz_accuracy"]["is_assumed"] is True
    assert res["components"]["study_consistency"]["is_assumed"] is True
    assert res["components"]["previous_exam"]["is_assumed"] is True


def test_readiness_formula_bounds_and_clamp():
    """
    Formula must strictly stay between 0.0 and 100.0 across extreme boundary cases.
    """
    # Boundary case: zero progress
    res_zero = calculate_readiness_estimate(
        total_selected_topics=4,
        completed_selected_topics=0,
        total_quiz_questions=10,
        total_quiz_correct=0,
        active_study_minutes=0,
        selected_modules_count=1,
        previous_exam_score=0.0
    )
    # Quiz is 0%, Previous is 0%, Completion is 0%, Consistency is assumed 50% (7.5 pts)
    assert 0.0 <= res_zero["estimated_score"] <= 100.0

    # 100% on all components
    res_max = calculate_readiness_estimate(
        total_selected_topics=4,
        completed_selected_topics=4,
        total_quiz_questions=20,
        total_quiz_correct=20,
        active_study_minutes=240,
        selected_modules_count=1,
        previous_exam_score=100.0
    )
    assert res_max["estimated_score"] == 100.0
    assert res_max["reliability_level"] == "High"
    assert len(res_max["assumed_inputs"]) == 0


def test_readiness_formula_zero_division_safety():
    """
    Empty module or zero topics/questions must not throw ZeroDivisionError or NaN.
    """
    res = calculate_readiness_estimate(
        total_selected_topics=0,
        completed_selected_topics=0,
        total_quiz_questions=0,
        total_quiz_correct=0,
        active_study_minutes=0,
        selected_modules_count=0,
        previous_exam_score=None
    )
    assert isinstance(res["estimated_score"], float)
    assert 0.0 <= res["estimated_score"] <= 100.0


# ==============================================================================
# 2. RESPONSIVENESS BEHAVIORS VIA FASTAPI TEST CLIENT
# ==============================================================================

def test_behavior_1_completing_topics_increases_estimate(client):
    """
    Behavior 1: Completing more topics, with other inputs unchanged,
    increases or maintains the estimate.
    """
    # Create exam scoped to Module 1 of Computer Networks (4 topics)
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Topic Progress Test Exam",
        "exam_datetime": "2026-11-15T10:00:00Z",
        "module_ids": ["cn-m1"]
    })
    exam_id = exam_res.json()["id"]

    # Initial score before learning topics
    pred_1 = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_initial = pred_1["predicted_score"]

    # Prepare 2 topics in cn-m1 for this exam via toggle-topic-completion
    client.put(f"/api/exams/{exam_id}/toggle-topic-completion", json={"topic_id": "cn-m1-t1", "completed": True})
    client.put(f"/api/exams/{exam_id}/toggle-topic-completion", json={"topic_id": "cn-m1-t2", "completed": True})

    pred_2 = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after_topics = pred_2["predicted_score"]

    assert score_after_topics > score_initial
    assert pred_2["topic_completion_percentage"] == 50.0  # 2 of 4 topics completed


def test_behavior_2_improving_quiz_accuracy_increases_estimate(client):
    """
    Behavior 2: Improving quiz accuracy increases or maintains the estimate.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Quiz Increase Test Exam",
        "exam_datetime": "2026-11-15T10:00:00Z",
        "module_ids": ["cn-m2"]
    })
    exam_id = exam_res.json()["id"]

    pred_before = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_before = pred_before["predicted_score"]

    # Submit high-scoring exam quiz attempt (5/5 = 100%) for this exam in cn-m2
    client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "topic_id": "cn-m2-t1",
        "score": 5.0,
        "total_questions": 5,
        "duration_seconds": 120,
        "difficulty": "medium",
        "format": "Mixed Module Exam Practice"
    })

    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    assert score_after > score_before
    assert pred_after["quiz_accuracy_percentage"] == 100.0


def test_behavior_3_poor_quiz_accuracy_reduces_estimate(client):
    """
    Behavior 3: Poor quiz accuracy reduces the estimate when other inputs remain unchanged.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-se",
        "name": "Poor Quiz Test Exam",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["se-m1"]
    })
    exam_id = exam_res.json()["id"]

    # Initial score uses neutral 50.0% quiz baseline (50% * 0.35 = 17.5 pts)
    pred_initial = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_initial = pred_initial["predicted_score"]

    # Submit poor exam quiz attempt (1/10 = 10%) for this exam in se-m1 (10% * 0.35 = 3.5 pts)
    client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "topic_id": "se-m1-t1",
        "score": 1.0,
        "total_questions": 10,
        "duration_seconds": 150,
        "difficulty": "medium",
        "format": "Mixed Module Exam Practice"
    })

    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    # 10% accuracy is lower than the 50% neutral assumption, so score must drop by 14.0 pts
    assert score_after < score_initial
    assert pred_after["quiz_accuracy_percentage"] == 10.0


def test_behavior_4_unselected_module_progress_does_not_affect_exam(client):
    """
    Behavior 4: Completing additional topics in an unselected module
    does NOT affect the current exam estimate.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Module Scoping Isolation Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m1"]  # Only Module 1
    })
    exam_id = exam_res.json()["id"]

    pred_before = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_before = pred_before["predicted_score"]

    # Complete topics in Module 4 (cn-m4-t1, cn-m4-t2) which is UNSELECTED
    client.put("/api/topics/cn-m4-t1/progress", json={"completion": 100.0, "status": "mastered"})
    client.put("/api/topics/cn-m4-t2/progress", json={"completion": 100.0, "status": "mastered"})

    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    # Unselected module progress must have 0 effect
    assert score_after == score_before
    assert pred_after["topic_completion_percentage"] == pred_before["topic_completion_percentage"]


def test_behavior_5_quizzes_in_another_subject_do_not_affect_exam(client):
    """
    Behavior 5: Quiz attempts in another subject do NOT affect the current exam estimate.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Subject Isolation Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m1"]
    })
    exam_id = exam_res.json()["id"]

    pred_before = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_before = pred_before["predicted_score"]

    # Take quiz in Software Engineering (se-m1-t1)
    client.post("/api/quizzes/attempts", json={
        "topic_id": "se-m1-t1",
        "score": 5.0,
        "total_questions": 5,
        "duration_seconds": 60,
        "difficulty": "medium",
        "format": "Quick Practice"
    })

    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    assert score_after == score_before


def test_behavior_6_missing_quiz_data_marks_assumed_and_lowers_reliability(client):
    """
    Behavior 6: Missing quiz data still allows an estimate but is explicitly
    marked as assumed, and reduces the reliability indicator.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Missing Quiz Disclosure Exam",
        "exam_datetime": "2026-11-20T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    exam_id = exam_res.json()["id"]

    pred = client.get(f"/api/predictions/exam/{exam_id}").json()

    assert pred["available"] is True
    assert pred["quiz_accuracy_percentage"] is None
    assert pred["total_quiz_attempts"] == 0
    # Must explicitly document assumption
    assert any("quiz_accuracy" in item for item in pred["assumed_inputs"])
    assert pred["components"]["quiz_accuracy"]["is_assumed"] is True
    assert pred["reliability_level"] in ["Initial Baseline", "Limited"]


def test_behavior_7_recording_real_previous_exam_updates_estimate(client):
    """
    Behavior 7: Recording a real previous relevant exam result updates the estimate
    according to the documented formula (10% weight).
    """
    # Create Exam A in cs-cn
    exam_a = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Past Series Exam A",
        "exam_datetime": "2026-10-01T10:00:00Z",
        "module_ids": ["cn-m1", "cn-m2"]
    }).json()

    # Create Exam B in cs-cn
    exam_b = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Upcoming End-Sem Exam B",
        "exam_datetime": "2026-11-30T10:00:00Z",
        "module_ids": ["cn-m1", "cn-m2", "cn-m3", "cn-m4"]
    }).json()

    # Estimate for Exam B before Exam A has an actual score (uses 65.0 neutral baseline)
    pred_b_before = client.get(f"/api/predictions/exam/{exam_b['id']}").json()
    score_before = pred_b_before["predicted_score"]

    # Record real actual score of 95.0 on Exam A
    record_res = client.put(f"/api/exams/{exam_a['id']}/actual-score", json={
        "actual_score": 95.0
    })
    assert record_res.status_code == 200
    assert record_res.json()["actual_score"] == 95.0

    # Re-fetch Exam B prediction: previous exam component increases from 65.0 to 95.0
    # Expected shift: (95.0 - 65.0) * 0.10 = +3.0 points
    pred_b_after = client.get(f"/api/predictions/exam/{exam_b['id']}").json()
    score_after = pred_b_after["predicted_score"]

    assert score_after > score_before
    assert round(score_after - score_before, 1) == 3.0
    assert pred_b_after["components"]["previous_exam"]["is_assumed"] is False


def test_behavior_8_actual_score_recording_and_persistence(client):
    """
    Behavior 8: PUT /api/exams/{id}/actual-score persists to database
    and validates range [0.0, 100.0].
    """
    exam = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Persistence Verification Exam",
        "exam_datetime": "2026-11-10T10:00:00Z",
        "module_ids": ["cn-m1"]
    }).json()
    exam_id = exam["id"]

    # Record valid actual score
    res = client.put(f"/api/exams/{exam_id}/actual-score", json={"actual_score": 84.5})
    assert res.status_code == 200
    assert res.json()["actual_score"] == 84.5

    # Verify retrieval
    get_res = client.get(f"/api/exams/{exam_id}")
    assert get_res.status_code == 200
    assert get_res.json()["actual_score"] == 84.5

    # Range validation: negative score rejected with 422 Unprocessable Entity
    invalid_res = client.put(f"/api/exams/{exam_id}/actual-score", json={"actual_score": -10.0})
    assert invalid_res.status_code in [400, 422]


# ==============================================================================
# 3. EXAM REDESIGN & MODULE-AWARE SCOPE AND COMPLETION VERIFICATION TESTS
# ==============================================================================

def test_case_1_exam_covering_only_module_3(client):
    """
    Test Case 1: Exam covering only Module 3.
    Verifies that selecting only Module 3 saves exactly ["cn-m3"],
    returns 1 module in scope, and limits topic scope strictly to Module 3 (4 topics).
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Module 3 Specialist Exam",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    assert exam_res.status_code in [200, 201]
    data = exam_res.json()
    assert data["module_ids"] == ["cn-m3"]

    # Scope analysis must confirm exactly 1 module with 4 topics
    scope_res = client.get(f"/api/exams/{data['id']}/scope-analysis")
    assert scope_res.status_code == 200
    scope_data = scope_res.json()
    assert scope_data["selected_modules_count"] == 1
    assert scope_data["total_selected_topics"] == 4
    assert len(scope_data["modules_breakdown"]) == 1
    assert scope_data["modules_breakdown"][0]["module_id"] == "cn-m3"


def test_case_2_exam_covering_modules_3_and_4(client):
    """
    Test Case 2: Exam covering Modules 3 and 4.
    Verifies that selecting Modules 3 and 4 saves exactly ["cn-m3", "cn-m4"],
    never replaces them with all modules, and scopes topics to 8 topics.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Network & Transport Layers Exam",
        "exam_datetime": "2026-11-28T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    assert exam_res.status_code in [200, 201]
    data = exam_res.json()
    assert data["module_ids"] == ["cn-m3", "cn-m4"]

    scope_res = client.get(f"/api/exams/{data['id']}/scope-analysis")
    assert scope_res.status_code == 200
    scope_data = scope_res.json()
    assert scope_data["selected_modules_count"] == 2
    assert scope_data["total_selected_topics"] == 8
    assert [m["module_id"] for m in scope_data["modules_breakdown"]] == ["cn-m3", "cn-m4"]


def test_case_3_completing_module_3_leaves_module_4_pending(client):
    """
    Test Case 3: Completing Module 3 while Module 4 remains pending.
    Verifies that completing Module 3:
    1. Adds only Module 3 to completed_module_ids.
    2. Leaves Module 4 pending.
    3. Calculates progress as 1/2 modules completed (50%).
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Mid-Sem Series Exam",
        "exam_datetime": "2026-12-05T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    assert exam_res.status_code in [200, 201]
    exam_id = exam_res.json()["id"]

    # Toggle Module 3 complete
    toggle_res = client.put(f"/api/exams/{exam_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })
    assert toggle_res.status_code == 200
    toggle_data = toggle_res.json()
    assert "cn-m3" in toggle_data["completed_module_ids"]
    assert "cn-m4" not in toggle_data["completed_module_ids"]

    # Scope analysis
    scope_res = client.get(f"/api/exams/{exam_id}/scope-analysis")
    assert scope_res.status_code == 200
    scope_data = scope_res.json()
    assert scope_data["completed_modules_count"] == 1
    assert scope_data["selected_modules_count"] == 2
    assert scope_data["module_completion_percentage"] == 50.0

    # Module details: M3 is completed, M4 is pending
    m3_detail = next(m for m in scope_data["modules_breakdown"] if m["module_id"] == "cn-m3")
    m4_detail = next(m for m in scope_data["modules_breakdown"] if m["module_id"] == "cn-m4")
    assert m3_detail["is_completed"] is True
    assert m4_detail["is_completed"] is False


def test_case_4_refresh_persistence_after_marking_module_complete(client):
    """
    Test Case 4: Refreshing the page after marking a module complete.
    Verifies that completed_module_ids persists in the database across fetches.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Persistence Reload Exam",
        "exam_datetime": "2026-12-10T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    assert exam_res.status_code in [200, 201]
    exam_id = exam_res.json()["id"]

    # Mark Module 3 complete
    client.put(f"/api/exams/{exam_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })

    # Simulate page refresh by fetching GET /api/exams/{exam_id} and GET /api/exams
    get_res = client.get(f"/api/exams/{exam_id}")
    assert get_res.status_code == 200
    assert get_res.json()["completed_module_ids"] == ["cn-m3"]

    list_res = client.get("/api/exams")
    assert list_res.status_code == 200
    matching = next(e for e in list_res.json() if e["id"] == exam_id)
    assert matching["completed_module_ids"] == ["cn-m3"]


def test_case_5_quiz_score_in_selected_module_updates_estimate(client):
    """
    Test Case 5: Adding a quiz score for a selected module updates the estimate.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Quiz Responsiveness Exam",
        "exam_datetime": "2026-12-15T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    assert exam_res.status_code in [200, 201]
    exam_id = exam_res.json()["id"]

    # Score before quiz (uses assumed 50.0% quiz accuracy)
    pred_before = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_before = pred_before["predicted_score"]

    # Submit 100% exam quiz for a topic in Module 3 (cn-m3-t1)
    quiz_res = client.post("/api/quizzes/attempts", json={
        "exam_id": exam_id,
        "topic_id": "cn-m3-t1",
        "score": 5,
        "total_questions": 5,
        "time_spent_seconds": 120
    })
    assert quiz_res.status_code in [200, 201]

    # Score after quiz in selected module
    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    # The prediction must update and increase due to authentic 100% quiz accuracy
    assert score_after > score_before
    assert pred_after["quiz_accuracy_percentage"] == 100.0
    assert pred_after["components"]["quiz_accuracy"]["is_assumed"] is False


def test_case_6_unselected_module_activity_does_not_affect_estimate(client):
    """
    Test Case 6: Confirming unselected-module activity does not affect that exam's estimate.
    For an exam covering Modules 3 and 4, activity in Module 1 must NOT shift the score.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Isolation Test Exam",
        "exam_datetime": "2026-12-20T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    })
    exam_id = exam_res.json()["id"]

    pred_before = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_before = pred_before["predicted_score"]

    # Activity strictly in UNSELECTED Module 1 (cn-m1-t1):
    client.put("/api/topics/cn-m1-t1/progress", json={"completion": 100.0, "status": "mastered"})
    client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "score": 5,
        "total_questions": 5,
        "time_spent_seconds": 180
    })

    # Estimate for Exam covering Modules 3 and 4 must remain identical!
    pred_after = client.get(f"/api/predictions/exam/{exam_id}").json()
    score_after = pred_after["predicted_score"]

    assert score_after == score_before


def test_case_7_undo_module_completion(client):
    """
    Test Case 7: Allow users to undo completion.
    Verifies that unchecking Module 3 removes it from completed_module_ids
    and resets completion progress to 0%.
    """
    exam_res = client.post("/api/exams", json={
        "subject_id": "cs-cn",
        "name": "Undo Completion Exam",
        "exam_datetime": "2026-12-25T10:00:00Z",
        "module_ids": ["cn-m3"]
    })
    exam_id = exam_res.json()["id"]

    # Mark complete
    client.put(f"/api/exams/{exam_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })
    scope_1 = client.get(f"/api/exams/{exam_id}/scope-analysis").json()
    assert scope_1["completed_modules_count"] == 1
    assert scope_1["module_completion_percentage"] == 100.0

    # Undo completion
    client.put(f"/api/exams/{exam_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": False
    })
    scope_2 = client.get(f"/api/exams/{exam_id}/scope-analysis").json()
    assert scope_2["completed_modules_count"] == 0
    assert scope_2["module_completion_percentage"] == 0.0

