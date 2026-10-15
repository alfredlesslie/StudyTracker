"""
StudySense AI - Database Connection & Session Management
Configurable SQLAlchemy engine and session factory supporting PostgreSQL and SQLite.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from backend.app.config import settings

# Engine configuration based on database dialect
connect_args = {}
engine_kwargs = {}

if settings.is_sqlite:
    connect_args["check_same_thread"] = False
else:
    # Production PostgreSQL pool configuration
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    FastAPI dependency that yields a SQLAlchemy database session,
    ensuring graceful cleanup and rollback on unhandled exceptions.
    """
    db: Session = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def init_db():
    """
    Initialize database schema by creating all registered tables,
    and safely migrate missing columns for exams and exam_predictions.
    """
    # Import all models so that Base.metadata has all table definitions
    import backend.app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)

    # Safe additive schema migration
    try:
        from sqlalchemy import inspect, text
        inspector = inspect(engine)
        
        # 1. Migrate exams table: module_ids, completed_module_ids, completed_topic_ids
        if "exams" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("exams")]
            with engine.begin() as conn:
                if "module_ids" not in columns:
                    conn.execute(text("ALTER TABLE exams ADD COLUMN module_ids TEXT"))
                if "completed_module_ids" not in columns:
                    conn.execute(text("ALTER TABLE exams ADD COLUMN completed_module_ids TEXT"))
                if "completed_topic_ids" not in columns:
                    conn.execute(text("ALTER TABLE exams ADD COLUMN completed_topic_ids TEXT"))

        # 2. Migrate exam_predictions table: module_ids, module_metrics_json, actual_score
        if "exam_predictions" in inspector.get_table_names():
            pred_cols = [c["name"] for c in inspector.get_columns("exam_predictions")]
            with engine.begin() as conn:
                if "module_ids" not in pred_cols:
                    conn.execute(text("ALTER TABLE exam_predictions ADD COLUMN module_ids TEXT"))
                if "module_metrics_json" not in pred_cols:
                    conn.execute(text("ALTER TABLE exam_predictions ADD COLUMN module_metrics_json TEXT"))
                if "actual_score" not in pred_cols:
                    conn.execute(text("ALTER TABLE exam_predictions ADD COLUMN actual_score FLOAT"))
    except Exception as e:
        print(f"[Warning] Safe schema column check encountered issue: {e}")

