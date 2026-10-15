"""
Test Phase 1: Separation of Overall Syllabus Progress and Exam Preparation Progress.
Verifies all 8 Phase 1 requirements against live FastAPI test client.
"""

import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

def test_phase1_all_requirements(client):
    # 1. Mark topic complete in syllabus/learn via PUT /api/topics/{topic_id}/progress
    topic_id = "cn-m1-t1"
    res = client.put(f"/api/topics/{topic_id}/progress", json={
        "completion": 100.0,
        "status": "learned"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["completion"] == 100.0
    assert data["status"] == "learned"

    # Verify GET retrieves the same completed topic
    get_res = client.get(f"/api/topics/{topic_id}/progress")
    assert get_res.status_code == 200
    assert get_res.json()["completion"] == 100.0
    assert get_res.json()["status"] == "learned"

    # Record initial syllabus progress snapshot
    all_prog_res = client.get("/api/progress?subject_id=cs-cn")
    assert all_prog_res.status_code == 200
    initial_progress_records = {p["topic_id"]: p["completion"] for p in all_prog_res.json()}

    # 2. Create two independent exams with specific module selections
    # Exam A: Modules 3 and 4
    exam_a_payload = {
        "subject_id": "cs-cn",
        "name": "Phase 1 Test Exam A",
        "exam_datetime": "2026-11-15T10:00:00Z",
        "module_ids": ["cn-m3", "cn-m4"]
    }
    create_a = client.post("/api/exams", json=exam_a_payload)
    assert create_a.status_code == 201
    exam_a = create_a.json()
    exam_a_id = exam_a["id"]
    assert exam_a["module_ids"] == ["cn-m3", "cn-m4"]
    assert exam_a["completed_module_ids"] == []

    # Exam B: Module 2 only
    exam_b_payload = {
        "subject_id": "cs-cn",
        "name": "Phase 1 Test Exam B",
        "exam_datetime": "2026-11-25T10:00:00Z",
        "module_ids": ["cn-m2"]
    }
    create_b = client.post("/api/exams", json=exam_b_payload)
    assert create_b.status_code == 201
    exam_b = create_b.json()
    exam_b_id = exam_b["id"]
    assert exam_b["module_ids"] == ["cn-m2"]
    assert exam_b["completed_module_ids"] == []

    # 3. Mark Module 3 complete for Exam A
    toggle_res = client.put(f"/api/exams/{exam_a_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": True
    })
    assert toggle_res.status_code == 200
    exam_a_updated = toggle_res.json()
    assert "cn-m3" in exam_a_updated["completed_module_ids"]
    assert len(exam_a_updated["completed_module_ids"]) == 1

    # Verify overall syllabus progress and topics did NOT change
    all_prog_after = client.get("/api/progress?subject_id=cs-cn").json()
    after_progress_records = {p["topic_id"]: p["completion"] for p in all_prog_after}
    for tid, initial_comp in initial_progress_records.items():
        assert after_progress_records.get(tid) == initial_comp, (
            f"Topic {tid} completion changed from {initial_comp} to {after_progress_records.get(tid)} "
            "when marking an exam module complete!"
        )

    # 4. Verify Exam B remains completely unaffected
    get_b = client.get(f"/api/exams/{exam_b_id}").json()
    assert get_b["completed_module_ids"] == [], "Exam B must remain unaffected"
    assert get_b["module_ids"] == ["cn-m2"], "Exam B module selection must be preserved"

    # 5. Undo exam-specific completion on Exam A
    undo_res = client.put(f"/api/exams/{exam_a_id}/toggle-module-completion", json={
        "module_id": "cn-m3",
        "completed": False
    })
    assert undo_res.status_code == 200
    assert "cn-m3" not in undo_res.json()["completed_module_ids"]
    assert undo_res.json()["completed_module_ids"] == []

    # Verify syllabus topics STILL remain untouched
    all_prog_after_undo = client.get("/api/progress?subject_id=cs-cn").json()
    after_undo_records = {p["topic_id"]: p["completion"] for p in all_prog_after_undo}
    for tid, initial_comp in initial_progress_records.items():
        assert after_undo_records.get(tid) == initial_comp

    # 6. Verify scope preservation and cleanup
    client.delete(f"/api/exams/{exam_a_id}")
    client.delete(f"/api/exams/{exam_b_id}")
