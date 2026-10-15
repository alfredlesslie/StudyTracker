"""
StudySense AI - Student Router
Handles student identity management for the single-student prototype.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.student import Student
from backend.app.schemas.student import StudentResponse

router = APIRouter(prefix="/api/student", tags=["Student"])


@router.get("", response_model=StudentResponse)
def get_or_create_student(db: Session = Depends(get_db)):
    """
    Retrieve or initialize the persistent prototype student.
    Does not require authentication screens in prototype stage.
    """
    student_id = settings.PROTOTYPE_STUDENT_ID
    student = db.query(Student).filter(Student.id == student_id).first()

    if not student:
        student = Student(id=student_id)
        db.add(student)
        db.commit()
        db.refresh(student)

    return student
