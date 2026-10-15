"""
StudySense AI - Exams CRUD Tests
Validates Create, Read, Update, and Delete operations for examinations.
"""


def test_exam_crud_lifecycle(client):
    """
    Test full CRUD lifecycle for exams.
    """
    # 1. Create
    exam_payload = {
        "subject_id": "cs-cn",
        "name": "Computer Networks Midterm",
        "exam_datetime": "2026-10-25T10:00:00Z",
        "notes": "Covers Modules 1 and 2"
    }

    create_res = client.post("/api/exams", json=exam_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    exam_id = created["id"]
    assert created["name"] == "Computer Networks Midterm"
    assert created["subject_code"] == "24CST501"

    # 2. Read Single
    get_res = client.get(f"/api/exams/{exam_id}")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Computer Networks Midterm"

    # 3. Read List
    list_res = client.get("/api/exams")
    assert list_res.status_code == 200
    all_exams = list_res.json()
    assert any(e["id"] == exam_id for e in all_exams)

    # 4. Update
    update_payload = {
        "name": "Computer Networks Midterm - Rescheduled",
        "notes": "Added transport layer questions"
    }
    update_res = client.put(f"/api/exams/{exam_id}", json=update_payload)
    assert update_res.status_code == 200
    updated = update_res.json()
    assert updated["name"] == "Computer Networks Midterm - Rescheduled"
    assert updated["notes"] == "Added transport layer questions"

    # 5. Delete
    delete_res = client.delete(f"/api/exams/{exam_id}")
    assert delete_res.status_code == 204

    # 6. Verify Deleted
    verify_res = client.get(f"/api/exams/{exam_id}")
    assert verify_res.status_code == 404
