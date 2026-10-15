"""
StudySense AI - Health and Syllabus Endpoint Tests
Validates system status, database connection, and retrieval of all 4 subjects and 64 topics.
"""


def test_health_endpoint(client):
    """
    Test GET /health returns status ok, connected database, and ML pipeline status.
    """
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    assert "modelLoaded" in data
    assert data["target"] == "finalExamScore"


def test_student_endpoint(client):
    """
    Test GET /api/student returns persistent prototype student.
    """
    response = client.get("/api/student")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "student-001"
    assert "created_at" in data


def test_subjects_retrieval(client):
    """
    Test GET /api/subjects returns all 4 Semester V subjects.
    """
    response = client.get("/api/subjects")
    assert response.status_code == 200
    subjects = response.json()
    assert len(subjects) == 4

    codes = {s["subject_code"] for s in subjects}
    expected_codes = {"24CST501", "24CST502", "24CST503", "24CSR504"}
    assert codes == expected_codes

    names = {s["subject_name"] for s in subjects}
    assert "Computer Networks" in names
    assert "Software Engineering" in names
    assert "Advanced Mathematics for Data Science" in names
    assert "Machine Learning" in names


def test_subject_topics_retrieval(client):
    """
    Test GET /api/subjects/{id}/topics returns all 16 topics for a subject.
    Total across 4 subjects equals 64 prototype topics.
    """
    total_topics_count = 0
    subjects = client.get("/api/subjects").json()

    for s in subjects:
        res = client.get(f"/api/subjects/{s['id']}/topics")
        assert res.status_code == 200
        topics = res.json()
        assert len(topics) == 16, f"Subject {s['id']} should have 16 topics, got {len(topics)}"
        total_topics_count += len(topics)

    assert total_topics_count == 64


def test_single_topic_retrieval(client):
    """
    Test GET /api/topics/{topic_id} returns specific topic details.
    """
    response = client.get("/api/topics/cn-m1-t1")
    assert response.status_code == 200
    topic = response.json()
    assert topic["id"] == "cn-m1-t1"
    assert topic["title"] == "OSI and TCP/IP Reference Models"
    assert topic["module_number"] == 1
    assert topic["estimated_minutes"] == 45
    assert topic["difficulty"] == "medium"
