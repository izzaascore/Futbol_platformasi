# ⚽ FootballRise Platform

O'zbekiston yosh futbol iqtidorlarini kashf etish, statistikasini yuritish va skautlar bilan bog'lash uchun mo'ljallangan zamonaviy platforma.

---

## 📁 Loyiha Strukturasi (Yangi Standart)

```text
football_platform/
├── backend/                  📁 Barcha backend (FastAPI) kodi
│   ├── app/
│   │   ├── api/             # API marshrutlari (auth.py, players.py, matches.py, tournaments.py, scouts.py, shop.py, community.py)
│   │   ├── core/            # database.py, security.py (ulanish va xavfsizlik)
│   │   ├── models/          # models.py (baza jadvallari)
│   │   ├── schemas/         # schemas.py (Pydantic turlari)
│   │   └── services/        # ai_assistant.py (ai_concierge o'rniga aniq nom)
│   ├── main.py              # Serverni ishga tushiruvchi qisqa, toza fayl
│   └── requirements.txt
├── bot/                     📁 Telegram bot alohida modulda
│   └── bot.py               # Telegram bot va Mini App integratsiyasi
├── frontend/                📁 React ilovasi (o'z joyida toza turibdi)
├── data/                    📁 Ma'lumotlar bazasi va fayllar
│   ├── football.db
│   └── backups/             # football.db.bak zaxiralari
├── scripts/                 📁 Yordamchi va sinov skriptlari (alohida)
│   ├── monitor.py           # (self_healing_monitor o'rniga aniq nom)
│   ├── load_test.py         # Nagruzka testi
│   ├── setup_supabase.py    # Baza sozlash skripti (SUPABASE_SETUP.py o'rniga)
│   └── doc_sync.py          # Hujjat sinxronlash (sync_watcher o'rniga)
├── uploads/                 📁 Yuklangan media va video fayllar
├── logs/                    📁 Tizim xatolik jurnallari
├── docs/                    📁 Loyiha hujjatlari
├── start.bat                ⚙️ Hammasini bir bosishda yoqish
├── stop_servers.bat         ⚙️ Hammasini to'xtatish
├── .env                     ⚙️ Maxfiy kalitlar va sozlamalar
└── README.md                📄 Loyiha haqida yo'riqnoma
```

---

## 🏗️ Arxitektura va Texnologiyalar

- **Backend**: Python 3.11+, FastAPI (modulli APIRouter), SQLAlchemy, SQLite / PostgreSQL, Pydantic v2, Python-Jose (JWT), Passlib / Bcrypt
- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide React, React Router v7
- **Telegram Bot**: Python, Aiogram v3, HTTPX (Asinxron integratsiya)
- **Monitoring & Self-Healing**: Abdulbosit Core (`scripts/monitor.py`) va Obsidian Sync Watcher (`scripts/doc_sync.py`)

---

## 🚀 Ishga Tushirish

### 1. Bir bosishda ishga tushirish (Windows)
Loyiha ildizidagi `start.bat` faylini ikki marta bosing:
- Backend server va Self-Healing monitor (`scripts/monitor.py`)
- Telegram bot (`bot/bot.py`)
- Frontend dasturi (http://localhost:5173)
- Obsidian file watcher (`scripts/doc_sync.py`)

To'xtatish uchun: `stop_servers.bat` faylini ishga tushiring.

### 2. Alohida qismlarni ishga tushirish:
```bash
# Backend
cd backend
uvicorn main:app --reload --port 8000

# Telegram Bot
python bot/bot.py

# Frontend
cd frontend
npm run dev

# Self-Healing Monitor
python scripts/monitor.py
```

---

## 👥 AI Crew Standartlari (The Elite 5)
Loyiha boshqaruv qoidalari va rollar bo'yicha batafsil ma'lumot: `AGENTS.md`
