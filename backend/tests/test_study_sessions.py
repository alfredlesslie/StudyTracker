"""
StudySense AI - StudySessions Endpoint Tests
Validates logging, retrieval, and aggregation of study sessions.
"""


def test_create_and_list_study_session(client):
    """
    Test POST /api/study-sessions logs a session and GET /api/study-sessions retrieves it.
    """
    payload = {
        "topic_id": "cn-m1-t1",
        "subject_id": "cs-cn",
        "activity_type": "learn",
        "active_duration_seconds": 1800,  # 30 minutes
        "completed": True,
        "confidence": "confident",
        "difficulty": "medium",
        "notes": "Reviewed OSI layers"
    }

    create_res = client.post("/api/study-sessions", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["activity_type"] == "learn"
    assert created["active_duration_seconds"] == 1800
    assert created["topic_id"] == "cn-m1-t1"

    # List sessions
    list_res = client.get("/api/study-sessions?subject_id=cs-cn")
    assert list_res.status_code == 200
    sessions = list_res.json()
    assert len(sessions) >= 1
    assert any(s["id"] == created["id"] for s in sessions)


def test_study_sessions_summary(client):
    """
    Test GET /api/study-sessions/summary aggregates active study minutes and modalities.
    """
    # Create distinct sessions
    client.post("/api/study-sessions", json={
        "subject_id": "cs-cn",
        "activity_type": "learn",
        "active_duration_seconds": 1200,  # 20 mins
        "completed": True
    })

    client.post("/api/study-sessions", json={
        "subject_id": "cs-cn",
        "activity_type": "practice",
        "active_duration_seconds": 600,  # 10 mins
        "completed": True
    })

    summary_res = client.get("/api/study-sessions/summary")
    assert summary_res.status_code == 200
    summary = summary_res.json()
    assert summary["total_active_seconds"] >= 1800
    assert summary["total_active_minutes"] >= 30
    assert summary["by_activity_type"].get("learn", 0) >= 20
    assert summary["by_activity_type"].get("practice", 0) >= 10


def test_negative_duration_rejected(client):
    """
    Test that negative active duration seconds is rejected with 422.
    """
    invalid_payload = {
        "activity_type": "focus",
        "active_duration_seconds": -500,
        "completed": True
    }
    response = client.post("/api/study-sessions", json=invalid_payload)
    assert response.status_code == 422
