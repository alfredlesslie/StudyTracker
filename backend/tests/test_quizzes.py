"""
StudySense AI - Quiz Attempts Endpoint Tests
Validates recording quiz attempts and automatic updates to TopicProgress.
"""


def test_record_quiz_attempt(client):
    """
    Test POST /api/quizzes/attempts saves attempt and updates TopicProgress.
    """
    attempt_payload = {
        "topic_id": "cn-m1-t1",
        "score": 4.0,
        "total_questions": 5,
        "duration_seconds": 180,
        "difficulty": "medium",
        "format": "Quick Practice"
    }

    res = client.post("/api/quizzes/attempts", json=attempt_payload)
    assert res.status_code == 201
    data = res.json()
    assert data["score"] == 4.0
    assert data["total_questions"] == 5
    assert data["percentage"] == 80.0
    assert data["topic_id"] == "cn-m1-t1"

    # Verify history
    hist_res = client.get("/api/quizzes/history?topic_id=cn-m1-t1")
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 1

    # Verify TopicProgress was updated
    prog_res = client.get("/api/topics/cn-m1-t1/progress")
    assert prog_res.status_code == 200
    prog = prog_res.json()
    assert prog["quiz_attempts"] >= 1
    assert prog["average_quiz_score"] == 80.0


def test_invalid_quiz_scores_rejected(client):
    """
    Test that score exceeding total_questions or negative score is rejected with 422.
    """
    # Exceeding score
    res1 = client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "score": 10.0,
        "total_questions": 5
    })
    assert res1.status_code == 422

    # Negative score
    res2 = client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "score": -1.0,
        "total_questions": 5
    })
    assert res2.status_code == 422
