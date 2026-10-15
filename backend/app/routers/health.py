"""
StudySense AI - Health Router
Provides health and connectivity status for API, database, and ML pipeline.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.services.ml_service import get_ml_metadata

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint reporting API status, database connectivity, and ML model status.
    """
    # 1. Test database connectivity
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"error: {str(e)}"

    # 2. Check ML model pipeline
    ml_loaded, ml_meta = get_ml_metadata()

    return {
        "status": "ok" if db_status == "connected" else "degraded",
        "version": settings.VERSION,
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "modelLoaded": ml_loaded,
        "modelName": ml_meta.get("modelName", "Linear Regression") if ml_loaded else None,
        "modelVersion": ml_meta.get("modelVersion", "v1.0") if ml_loaded else None,
        "metrics": ml_meta.get("metrics", {}) if ml_loaded else {},
        "baseline": ml_meta.get("baseline", {}) if ml_loaded else {},
        "target": "finalExamScore"
    }
