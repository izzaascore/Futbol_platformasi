import sqlite3

conn = sqlite3.connect('data/football.db')
cursor = conn.cursor()
tables = [r[0] for r in cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()]
print('Tables:', tables)
for t in tables:
    count = cursor.execute(f"SELECT count(*) FROM {t}").fetchone()[0]
    print(f"\nTable '{t}': {count} rows")
    if count > 0:
        cursor.execute(f"SELECT * FROM {t} LIMIT 10")
        col_names = [d[0] for d in cursor.description]
        print("  Cols:", col_names)
        for r in cursor.fetchall():
            print("   ", r)
conn.close()
