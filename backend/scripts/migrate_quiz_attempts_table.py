import sqlite3
import shutil
import os

db_path = "backend/studysense.db"
backup_path = "backend/studysense.db.bak"

# 1. Create a backup
if not os.path.exists(backup_path):
    shutil.copy2(db_path, backup_path)
    print(f"Backup created at {backup_path}")
else:
    print(f"Backup already exists at {backup_path}")

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Turn foreign keys off during table recreation
c.execute("PRAGMA foreign_keys = OFF;")
c.execute("BEGIN TRANSACTION;")

# Create new table with topic_id nullable
c.execute("""
CREATE TABLE quiz_attempts_new (
	id VARCHAR(64) NOT NULL, 
	student_id VARCHAR(64) NOT NULL, 
	topic_id VARCHAR(64), 
	subject_id VARCHAR(64), 
	score FLOAT NOT NULL, 
	total_questions INTEGER NOT NULL, 
	duration_seconds INTEGER NOT NULL, 
	percentage FLOAT NOT NULL, 
	difficulty VARCHAR(32), 
	format VARCHAR(64), 
	answers_json TEXT, 
	attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
	exam_id TEXT, 
	module_scope_json TEXT, 
	module_results_json TEXT, 
	PRIMARY KEY (id), 
	CONSTRAINT ck_quiz_score_non_negative CHECK (score >= 0.0), 
	CONSTRAINT ck_quiz_total_questions_positive CHECK (total_questions > 0), 
	CONSTRAINT ck_quiz_duration_non_negative CHECK (duration_seconds >= 0), 
	CONSTRAINT ck_quiz_percentage_range CHECK (percentage >= 0.0 AND percentage <= 100.0), 
	FOREIGN KEY(student_id) REFERENCES students (id) ON DELETE CASCADE, 
	FOREIGN KEY(topic_id) REFERENCES topics (id) ON DELETE CASCADE, 
	FOREIGN KEY(subject_id) REFERENCES subjects (id) ON DELETE SET NULL
);
""")

# Copy data over, setting topic_id = NULL if exam_id is not null
c.execute("""
INSERT INTO quiz_attempts_new (
    id, student_id, topic_id, subject_id, score, total_questions, duration_seconds,
    percentage, difficulty, format, answers_json, attempted_at, exam_id,
    module_scope_json, module_results_json
)
SELECT 
    id, student_id, 
    CASE WHEN exam_id IS NOT NULL THEN NULL ELSE topic_id END,
    subject_id, score, total_questions, duration_seconds,
    percentage, difficulty, format, answers_json, attempted_at, exam_id,
    module_scope_json, module_results_json
FROM quiz_attempts;
""")

# Drop old table and rename new table
c.execute("DROP TABLE quiz_attempts;")
c.execute("ALTER TABLE quiz_attempts_new RENAME TO quiz_attempts;")

# Recreate indexes
c.execute("CREATE INDEX ix_quiz_attempts_subject_id ON quiz_attempts (subject_id);")
c.execute("CREATE INDEX ix_quiz_attempts_attempted_at ON quiz_attempts (attempted_at);")
c.execute("CREATE INDEX ix_quiz_attempts_student_id ON quiz_attempts (student_id);")
c.execute("CREATE INDEX ix_quiz_attempts_topic_id ON quiz_attempts (topic_id);")

conn.commit()
c.execute("PRAGMA foreign_keys = ON;")

# Verify
c.execute("PRAGMA table_info(quiz_attempts);")
print("New schema for quiz_attempts:")
for col in c.fetchall():
    print("  ", col)

c.execute("SELECT COUNT(*), exam_id IS NOT NULL, topic_id IS NOT NULL FROM quiz_attempts GROUP BY exam_id IS NOT NULL, topic_id IS NOT NULL;")
print("Verification grouped counts (count, has_exam, has_topic):", c.fetchall())

c.execute("SELECT COUNT(*) FROM quiz_attempts WHERE topic_id = 'cn-m1-t1';")
print("Remaining attempts for cn-m1-t1:", c.fetchone()[0])

conn.close()
print("Migration completed successfully.")
