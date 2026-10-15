import sqlite3

conn = sqlite3.connect('backend/studysense.db')
c = conn.cursor()

# 1. Update quiz_attempts where exam_id is not null
c.execute("SELECT COUNT(*) FROM quiz_attempts WHERE exam_id IS NOT NULL AND topic_id IS NOT NULL;")
count_to_clean = c.fetchone()[0]
print(f"Exam attempts with non-null topic_id to clean: {count_to_clean}")

c.execute("UPDATE quiz_attempts SET topic_id = NULL WHERE exam_id IS NOT NULL AND topic_id IS NOT NULL;")
conn.commit()
print("Updated successfully.")

# 2. Re-check cn-m1-t1 attempts
c.execute("SELECT id, topic_id, exam_id, score, total_questions, percentage, format, attempted_at FROM quiz_attempts WHERE topic_id = 'cn-m1-t1' ORDER BY attempted_at DESC;")
attempts = c.fetchall()
print(f"Remaining attempts for cn-m1-t1: count={len(attempts)}")
for a in attempts:
    print("  ", a)

conn.close()
