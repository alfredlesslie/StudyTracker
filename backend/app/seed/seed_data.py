"""
StudySense AI - Database Seeder
Idempotent seeding script for persistent prototype student, 4 subjects, 16 modules, and 64 topics.
Guarantees zero duplicate entries when run multiple times.
"""

import json
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.student import Student
from backend.app.models.subject import Subject, Module
from backend.app.models.topic import Topic
from backend.app.models.progress import TopicProgress
from backend.app.models.exam import Exam

SEED_DATA_FILE = Path(__file__).resolve().parent / "syllabus_data.json"


def seed_database(db: Session) -> dict:
    """
    Seeds the database idempotently.
    Returns summary of created or verified entities.
    """
    summary = {
        "students": 0,
        "subjects": 0,
        "modules": 0,
        "topics": 0,
        "progress_records": 0,
        "exams": 0,
    }

    # 1. Seed or verify persistent prototype student
    student_id = settings.PROTOTYPE_STUDENT_ID
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        student = Student(id=student_id)
        db.add(student)
        db.flush()
        summary["students"] += 1
    else:
        summary["students"] = 1

    # Load syllabus data
    if not SEED_DATA_FILE.exists():
        raise FileNotFoundError(f"Syllabus data file not found at: {SEED_DATA_FILE}")

    with open(SEED_DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 2. Seed 4 Subjects
    for s_data in data.get("subjects", []):
        existing = db.query(Subject).filter(
            (Subject.id == s_data["id"]) | (Subject.subject_code == s_data["code"])
        ).first()

        if not existing:
            subject = Subject(
                id=s_data["id"],
                subject_code=s_data["code"],
                subject_name=s_data["name"],
                semester=s_data.get("semester", "Semester V"),
                credits=s_data.get("credits", 4),
                description=s_data.get("description"),
                color=s_data.get("color"),
                icon=s_data.get("icon")
            )
            db.add(subject)
            db.flush()
            summary["subjects"] += 1
        else:
            summary["subjects"] += 1

    # 3. Seed 16 Modules
    for m_data in data.get("modules", []):
        existing_mod = db.query(Module).filter(Module.id == m_data["id"]).first()
        if not existing_mod:
            module = Module(
                id=m_data["id"],
                subject_id=m_data["subjectId"],
                order=m_data.get("order", 1),
                title=m_data.get("title", f"Module {m_data.get('order', 1)}"),
                description=m_data.get("description")
            )
            db.add(module)
            db.flush()
            summary["modules"] += 1
        else:
            summary["modules"] += 1

    # 4. Seed 64 Topics & TopicProgress records
    for t_data in data.get("topics", []):
        topic_id = t_data["id"]
        existing_topic = db.query(Topic).filter(Topic.id == topic_id).first()

        # Parse module number from moduleId (e.g. cn-m1 -> 1)
        mod_num = 1
        mod_id = t_data.get("moduleId")
        if mod_id and "m" in mod_id:
            try:
                mod_num = int(mod_id.split("m")[-1])
            except ValueError:
                mod_num = 1

        if not existing_topic:
            topic = Topic(
                id=topic_id,
                subject_id=t_data.get("subjectId"),
                module_number=mod_num,
                module_id=mod_id,
                title=t_data["title"],
                difficulty=t_data.get("difficulty", "medium"),
                estimated_minutes=t_data.get("estimatedMinutes", 30),
                explanation=t_data.get("explanation"),
                why_it_matters=t_data.get("whyItMatters"),
                exam_focus=t_data.get("examFocus")
            )
            db.add(topic)
            db.flush()
            summary["topics"] += 1
        else:
            summary["topics"] += 1

        # Check TopicProgress record for prototype student
        existing_progress = db.query(TopicProgress).filter(
            TopicProgress.student_id == student_id,
            TopicProgress.topic_id == topic_id
        ).first()

        if not existing_progress:
            # Check if t_data had initial progress values
            completion = float(t_data.get("completion") or 0.0)
            avg_quiz = float(t_data["averageQuizScore"]) if t_data.get("averageQuizScore") is not None else None
            attempts = int(t_data.get("quizAttempts") or 0)
            status = t_data.get("status") or ("completed" if completion >= 80 else "not_started")
            mastery = str(t_data.get("mastery") or "not_started")

            progress = TopicProgress(
                student_id=student_id,
                topic_id=topic_id,
                completion=completion,
                mastery=mastery,
                status=status,
                quiz_attempts=attempts,
                average_quiz_score=avg_quiz
            )
            db.add(progress)
            summary["progress_records"] += 1
        else:
            summary["progress_records"] += 1

    # 5. Seed default upcoming exams if no exams exist yet
    exam_count = db.query(Exam).filter(Exam.student_id == student_id).count()
    if exam_count == 0:
        for s_data in data.get("subjects", []):
            exam_date_str = s_data.get("examDate", "2026-11-20")
            try:
                exam_dt = datetime.fromisoformat(exam_date_str).replace(tzinfo=timezone.utc)
            except Exception:
                exam_dt = datetime(2026, 11, 20, 10, 0, 0, tzinfo=timezone.utc)

            new_exam = Exam(
                id=f"exam-{s_data['id']}-sem5",
                student_id=student_id,
                subject_id=s_data["id"],
                name=f"{s_data['name']} End-Semester Exam",
                exam_datetime=exam_dt,
                notes=f"Comprehensive Semester V university examination for {s_data['code']}."
            )
            db.add(new_exam)
            summary["exams"] += 1
    else:
        summary["exams"] = exam_count

    db.commit()
    return summary


if __name__ == "__main__":
    from backend.app.database import SessionLocal, init_db
    init_db()
    db = SessionLocal()
    try:
        res = seed_database(db)
        print("Database seeded successfully:", res)
    finally:
        db.close()
