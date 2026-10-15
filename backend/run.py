"""
StudySense AI - Backend Runner Script
Run this file to launch the backend server:
    python backend/run.py
"""

import sys
import os
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

import uvicorn
from backend.app.config import settings

if __name__ == "__main__":
    print(f"=== StudySense AI Backend Server ===")
    print(f"Server URL:     http://{settings.HOST}:{settings.PORT}")
    print(f"Swagger Docs:   http://{settings.HOST}:{settings.PORT}/docs")
    print(f"ReDoc Docs:     http://{settings.HOST}:{settings.PORT}/redoc")
    print(f"Database:       {settings.DATABASE_URL}")
    print(f"Student ID:     {settings.PROTOTYPE_STUDENT_ID}")
    print("====================================")
    uvicorn.run("backend.app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
