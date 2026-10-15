"""
StudySense AI - Health Schema
Schema for system, database, and ML health status.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str = "ok"
    version: str = "1.0.0"
    database: str = "connected"
    environment: str = "development"
    modelLoaded: bool = False
    modelName: Optional[str] = "Linear Regression"
    modelVersion: Optional[str] = "v1.0"
    metrics: Optional[Dict[str, Any]] = None
    baseline: Optional[Dict[str, Any]] = None
