# 🗄 Ma'lumotlar Bazasi Tuzilishi

Loyiha **SQLAlchemy** (ORM) orqali ma'lumotlar bazasi bilan ishlaydi. 

## Asosiy Jadvallar (Models)

### 1. `User` (Foydalanuvchilar)
Barcha tizim foydalanuvchilari uchun asosiy jadval.
- **Ustunlar**: `id`, `email`, `password_hash`, `first_name`, `last_name`, `role` (O'yinchi, Skaut, Admin), `status`.
- **Bog'lanishlar**: Har bir User roliga qarab boshqa jadvallarga bog'lanadi (Masalan, One-to-One bilan `Player` jadvaliga).

### 2. `Player` (O'yinchilar)
O'yinchilarning jismoniy va professional ko'rsatkichlari saqlanadi.
- **Ustunlar**: `id`, `user_id` (User ga bog'langan), `age`, `height`, `weight`, `position`, `preferred_foot`, `team`.

### 3. `Scout` (Skautlar)
O'yinchilarni qidiruvchi mutaxassislar yoki tashkilot vakillari.
- **Ustunlar**: `id`, `user_id`, `organization`, `license_url`.

### 4. `GoalSubmission` / `UserVideo`
O'yinchilarning mahoratini ko'rsatuvchi videolar va yutuqlari tarixi.
- **Ustunlar**: `id`, `player_id` (Player ga bog'langan), `video_url`, `description`, `created_at`.

### 5. `CareerHistory`
O'yinchining oldingi jamoalari va yutuqlari qaydi.
- **Ustunlar**: `id`, `player_id`, `team_name`, `start_date`, `end_date`, `achievements`.

🔗 **Bog'liq hujjatlar**: [[API_Dokumentatsiya]]
