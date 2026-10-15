import sqlite3

conn = sqlite3.connect('backend/studysense.db')
c = conn.cursor()
c.execute("PRAGMA table_info(quiz_attempts);")
for col in c.fetchall():
    print(col)
c.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='quiz_attempts';")
print(c.fetchone()[0])
conn.close()
