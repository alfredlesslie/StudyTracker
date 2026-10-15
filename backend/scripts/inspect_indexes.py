import sqlite3

conn = sqlite3.connect('backend/studysense.db')
c = conn.cursor()
c.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND tbl_name='quiz_attempts';")
for idx in c.fetchall():
    print(idx)
conn.close()
