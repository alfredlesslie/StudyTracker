"""
StudySense AI - Progress Endpoint Tests
Validates retrieval and updates for topic progress records.
"""


def test_get_all_progress(client):
    """
    Test GET /api/progress returns progress records for the prototype student.
    """
    response = client.get("/api/progress")
    assert response.status_code == 200
    records = response.json()
    assert len(records) == 64  # 64 seeded topic progress records


def test_get_single_topic_progress(client):
    """
    Test GET /api/topics/{topic_id}/progress returns topic progress.
    """
    response = client.get("/api/topics/cn-m1-t1/progress")
    assert response.status_code == 200
    data = response.json()
    assert data["topic_id"] == "cn-m1-t1"
    assert "completion" in data
    assert "mastery" in data
    assert "status" in data


def test_update_topic_progress(client):
    """
    Test PUT /api/topics/{topic_id}/progress updates completion and mastery metrics.
    """
    update_payload = {
        "completion": 85.0,
        "mastery": "Doing well",
        "status": "mastered",
        "quiz_attempts": 3,
        "average_quiz_score": 88.5
    }

    response = client.put("/api/topics/cn-m1-t1/progress", json=update_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["completion"] == 85.0
    assert data["mastery"] == "Doing well"
    assert data["status"] == "mastered"
    assert data["quiz_attempts"] == 3
    assert data["average_quiz_score"] == 88.5

    # Verify retrieval reflects update
    check_res = client.get("/api/topics/cn-m1-t1/progress")
    assert check_res.status_code == 200
    assert check_res.json()["completion"] == 85.0


def test_update_topic_progress_validation(client):
    """
    Test invalid completion (> 100 or < 0) is rejected with 422.
    """
    invalid_payload = {"completion": 150.0}
    response = client.put("/api/topics/cn-m1-t1/progress", json=invalid_payload)
    assert response.status_code == 422

    negative_payload = {"completion": -10.0}
    response = client.put("/api/topics/cn-m1-t1/progress", json=negative_payload)
    assert response.status_code == 422
