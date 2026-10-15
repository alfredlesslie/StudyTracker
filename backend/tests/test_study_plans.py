"""
StudySense AI - StudyPlans CRUD Tests
Validates Create, Read, Update, and Delete operations for study plans and scheduled plan items.
"""


def test_study_plan_crud_lifecycle(client):
    """
    Test full CRUD lifecycle for study plans and nested items.
    """
    # 1. Create Plan with items
    plan_payload = {
        "title": "Semester V Weekend Revision Plan",
        "items": [
            {
                "topic_id": "cn-m1-t1",
                "planned_datetime": "2026-10-18T09:00:00Z",
                "planned_duration_minutes": 45,
                "status": "pending",
                "notes": "Revise OSI layer mapping"
            },
            {
                "topic_id": "cn-m1-t2",
                "planned_datetime": "2026-10-18T10:00:00Z",
                "planned_duration_minutes": 30,
                "status": "pending",
                "notes": "Physical topologies"
            }
        ]
    }

    create_res = client.post("/api/study-plans", json=plan_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    plan_id = created["id"]
    assert created["title"] == "Semester V Weekend Revision Plan"
    assert len(created["items"]) == 2

    # 2. Read Single Plan
    get_res = client.get(f"/api/study-plans/{plan_id}")
    assert get_res.status_code == 200
    assert get_res.json()["title"] == "Semester V Weekend Revision Plan"

    # 3. Read All Plans
    list_res = client.get("/api/study-plans")
    assert list_res.status_code == 200
    all_plans = list_res.json()
    assert any(p["id"] == plan_id for p in all_plans)

    # 4. Update Plan
    update_payload = {
        "title": "Updated Weekend Revision Plan"
    }
    update_res = client.put(f"/api/study-plans/{plan_id}", json=update_payload)
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated Weekend Revision Plan"

    # 5. Delete Plan
    delete_res = client.delete(f"/api/study-plans/{plan_id}")
    assert delete_res.status_code == 204

    # 6. Verify Deletion
    verify_res = client.get(f"/api/study-plans/{plan_id}")
    assert verify_res.status_code == 404


def test_invalid_plan_duration_rejected(client):
    """
    Test planned_duration_minutes <= 0 is rejected with 422.
    """
    invalid_plan = {
        "title": "Invalid Plan",
        "items": [
            {
                "topic_id": "cn-m1-t1",
                "planned_datetime": "2026-10-18T09:00:00Z",
                "planned_duration_minutes": 0,
                "status": "pending"
            }
        ]
    }
    res = client.post("/api/study-plans", json=invalid_plan)
    assert res.status_code == 422
