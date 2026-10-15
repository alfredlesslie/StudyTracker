"""
StudySense AI - Backend Configuration
Configures environment variables, database connections, and application settings.
"""

import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Locate project and backend root directories
BACKEND_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BACKEND_DIR.parent

# Load .env file from backend root or project root if present
load_dotenv(BACKEND_DIR / ".env")
load_dotenv(PROJECT_ROOT / ".env")

class Settings:
    PROJECT_NAME: str = "StudySense AI Backend"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Persistent Prototype Student
    PROTOTYPE_STUDENT_ID: str = os.getenv("PROTOTYPE_STUDENT_ID", "student-001")

    # Database configuration
    # Default to local SQLite database if DATABASE_URL is not set
    _db_url: str = os.getenv("DATABASE_URL", f"sqlite:///{(BACKEND_DIR / 'studysense.db').resolve().as_posix()}")
    
    # Resolve relative SQLite paths consistently to BACKEND_DIR
    if _db_url.startswith("sqlite:///./"):
        rel_path = _db_url.replace("sqlite:///./", "", 1)
        _db_url = f"sqlite:///{(BACKEND_DIR / rel_path).resolve().as_posix()}"

    # Heroku/Render compatibility fix: postgres:// -> postgresql://
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
        
    DATABASE_URL: str = _db_url


    # CORS origins
    CORS_ORIGINS: List[str] = [
        origin.strip()
        for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"
        ).split(",")
        if origin.strip()
    ]

    # Server config
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))

    # Gemini AI Tutor Configuration
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    @property
    def is_sqlite(self) -> bool:
        return self.DATABASE_URL.startswith("sqlite")



settings = Settings()
