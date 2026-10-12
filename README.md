# ⚽ FootballRise Platform

O'zbekiston yosh futbol iqtidorlarini kashf etish, statistikasini yuritish va skautlar bilan bog'lash uchun mo'ljallangan zamonaviy platforma.

---

## 🏗️ Arxitektura va Texnologiyalar

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, SQLite (yoki PostgreSQL), Pydantic v2, Python-Jose (JWT), Passlib (Bcrypt)
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React, React Router v7
- **Telegram Bot**: Python, Aiogram v3, HTTPX (Asinxron integratsiya)
- **Monitoring & Self-Healing**: Abdulbosit Core (`self_healing_monitor.py`) va Obsidian Sync Watcher (`sync_watcher.py`)

---

## 🚀 O'rnatish va Ishga Tushirish

### 1. Backend sozlash
```bash
# Virtual muhitni faollashtirish
.venv\Scripts\activate

# Kutubxonalarni o'rnatish
pip install -r requirements.txt
```

### 2. Frontend sozlash
```bash
cd frontend
npm install
npm run dev
```

### 3. Telegram Bot va Mini App (TMA) sozlash
1. Telegram Bot tokenini kiriting (`BOT_TOKEN`).
2. Agar Mini App ni testing qilmoqchi bo'lsangiz:
   - Lokal sinov uchun `WEBAPP_URL=http://localhost:5173` yoki `ngrok http 5173` orqali berilgan HTTPS linkni ishlating (Telegram WebApp uchun HTTPS kerak).
   - Bot ishga tushganda avtomatik ravishda chap burchakda **"Ilova" (MenuButton)** tugmasini o'rnatadi.
```bash
python bot.py
```

### 4. Barcha tizimlarni birdan ishga tushirish (Windows)
Loyiha ildizidagi `start.bat` faylini ikki marta bosing:
- Backend server va Self-Healing monitor
- Telegram bot
- Frontend dasturi (http://localhost:5173)
- Obsidian file watcher

To'xtatish uchun: `stop_servers.bat` faylini ishga tushiring.

---

## 🔑 Asosiy API Marshrutlari

| Metod | Marshrut | Tavsif | Ruxsat |
|---|---|---|---|
| `GET` | `/` | API holati (Health check) | Ochiq |
| `POST` | `/api/auth/register` | Yangi foydalanuvchi ro'yxatdan o'tishi | Ochiq |
| `POST` | `/api/auth/login` | Tizimga kirish va JWT token olish | Ochiq |
| `POST` | `/admin/login` | Maxsus Admin kirishi | Admin |
| `GET` | `/players` | Barcha futbolchilar ro'yxati va filtrlari | Ochiq |
| `POST` | `/players` | Yangi futbolchi yaratish | Ochiq |
| `POST` | `/players/{id}/submit-goal` | Gol videosini yuborish (Bot/Web) | Ochiq |
| `GET` | `/tournaments` | Turnirlar ro'yxati | Ochiq |
| `GET` | `/matches` | Jonli va rejalashtirilgan o'yinlar | Ochiq |
| `GET` | `/api/admin/submissions` | Tasdiqlanmagan videolar navbati | Admin |
| `POST` | `/api/admin/submissions/{id}/approve` | Videoni tasdiqlash | Admin |

Hujjatlar (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 👥 AI Crew Standartlari (The Elite 5)
Loyiha boshqaruv qoidalari va rollar bo'yicha batafsil ma'lumot: `AGENTS.md`
