import sqlite3

conn = sqlite3.connect('data/football.db')
cursor = conn.cursor()

print("--- 1. REAL USERS PRESERVATION CHECK ---")
cursor.execute("SELECT id, first_name, last_name, email FROM users")
real_users = cursor.fetchall()
print(f"Preserving {len(real_users)} real user(s):", real_users)

cursor.execute("SELECT id, full_name, goals_verified, position FROM players")
real_players = cursor.fetchall()
print(f"Preserving {len(real_players)} real player(s):", real_players)

print("\n--- 2. PURGING SHOP TABLES & MOCK DATA ---")
shop_tables = ['products', 'shop_orders', 'shop_notifications', 'shop_notify']
for t in shop_tables:
    cursor.execute(f"DROP TABLE IF EXISTS {t}")
    print(f"Dropped obsolete shop table '{t}'")

print("\n--- 3. ADDING COLUMNS IF MISSING ---")
# Check user_videos columns
cursor.execute("PRAGMA table_info(user_videos)")
uv_cols = [c[1] for c in cursor.fetchall()]
if "title" not in uv_cols:
    cursor.execute("ALTER TABLE user_videos ADD COLUMN title VARCHAR(255)")
    print("Added 'title' column to user_videos")
if "duration" not in uv_cols:
    cursor.execute("ALTER TABLE user_videos ADD COLUMN duration VARCHAR(50) DEFAULT '00:00'")
    print("Added 'duration' column to user_videos")

# Check players columns
cursor.execute("PRAGMA table_info(players)")
p_cols = [c[1] for c in cursor.fetchall()]
if "photo_url" not in p_cols:
    cursor.execute("ALTER TABLE players ADD COLUMN photo_url VARCHAR(255)")
    print("Added 'photo_url' column to players")

conn.commit()
conn.close()
print("\nDatabase cleanup & migration completed successfully!")
