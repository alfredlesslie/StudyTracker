"""
StudySense AI - Predictions Endpoint Tests
Validates strict data sufficiency handling, genuine ML predictions, and direct inference preservation.
"""


def test_insufficient_data_returns_clear_response(client):
    """
    Test that when a subject has no study time and no quiz records,
    the endpoint returns an insufficient-data status and NEVER invents a score.
    """
    # Computer Networks has no logged study sessions or quizzes in fresh test DB
    res = client.get("/api/predictions/subject/cs-cn")
    assert res.status_code == 200
    data = res.json()
    assert data["available"] is False
    assert data["data_status"] == "insufficient"
    assert data["predicted_score"] is None
    assert "Not enough study data yet" in data["message"]

    # Verify NO prediction was saved to database
    history_res = client.get("/api/predictions?subject_id=cs-cn")
    assert history_res.status_code == 200
    assert len(history_res.json()) == 0


def test_genuine_prediction_generated_when_data_exists(client):
    """
    Test that once genuine student activity (study sessions & quizzes) is logged,
    a genuine ML score is predicted by the server-side model and saved to the database.
    """
    # 1. Log study sessions
    client.post("/api/study-sessions", json={
        "subject_id": "cs-cn",
        "topic_id": "cn-m1-t1",
        "activity_type": "learn",
        "active_duration_seconds": 2400,  # 40 mins
        "completed": True
    })

    client.post("/api/study-sessions", json={
        "subject_id": "cs-cn",
        "topic_id": "cn-m1-t2",
        "activity_type": "practice",
        "active_duration_seconds": 1800,  # 30 mins
        "completed": True
    })

    # 2. Log quiz attempt
    client.post("/api/quizzes/attempts", json={
        "topic_id": "cn-m1-t1",
        "score": 4.0,
        "total_questions": 5,
        "percentage": 80.0
    })

    # 3. Request subject prediction
    res = client.get("/api/predictions/subject/cs-cn")
    assert res.status_code == 200
    data = res.json()

    assert data["available"] is True
    assert data["data_status"] in ["good", "limited"]
    assert data["predicted_score"] is not None
    assert 0.0 <= data["predicted_score"] <= 100.0
    assert data["confidence_margin"] is not None
    assert len(data["score_range"]) == 2

    # 4. Verify prediction was stored in the database
    history_res = client.get("/api/predictions?subject_id=cs-cn")
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) == 1
    assert history[0]["predicted_score"] == data["predicted_score"]


def test_direct_predict_endpoint_contract(client):
    """
    Test POST /predict preserves the microservice contract from Prompt 9.
    """
    sample_input = {
        "subjectId": "cs-cn",
        "subject": "mathematics",
        "studyDays": 4,
        "totalStudyMinutes": 320,
        "learnMinutes": 120,
        "aiTutorMinutes": 60,
        "practiceMinutes": 80,
        "focusMinutes": 60,
        "averageQuizScore": 78.5,
        "previousScore": 75.0,
        "quizAttempts": 3,
        "topicsCompleted": 6,
        "totalTopics": 16,
        "topicCompletionRate": 0.375,
        "averageTopicMastery": 70.0,
        "revisionCount": 1,
        "averageConfidence": 4.0,
        "missedSessions": 0,
        "daysSinceLastStudy": 1,
        "examDaysRemaining": 10,
        "subjectDifficulty": 3.8
    }

    res = client.post("/predict", json=sample_input)
    assert res.status_code == 200
    data = res.json()
    assert "predictedScore" in data
    assert "model" in data
    assert "scoreRange" in data
    assert "confidenceMargin" in data
    assert 0.0 <= data["predictedScore"] <= 100.0
