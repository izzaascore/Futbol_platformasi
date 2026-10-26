# ⚽ FUTURO — O'zbekiston Yoshlar Futboli & Skauting Ekosistemasi

> **"Kelajaging o'z qo'lingda"** — O'zbekistondagi yosh futbolchilarni professional skautlar, klublar va akademiyalar bilan bog'lovchi yagona milliy platforma.

---

## 🏛️ Loyiha Arxitekturasi

Platforma 3 ta asosiy mustaqil va o'zaro bog'langan qismdan iborat:

1. **Frontend (`frontend/`)**:
   - **Texnologiyalar**: React 19, Vite 6, Tailwind CSS v4, Framer Motion, Lucide Icons, Leaflet (interaktiv xaritalar).
   - **Dizayn uslubi**: Dark Luxury (obsidian qora `#030303`, Montserrat + Inter tipografiyasi, stadion chiroqlari nuri, oq neon yorug'lik effektlari).
   - **Joylashuv**: Vercel (`https://futbol-platformasi-alpha.vercel.app`).

2. **Backend (`backend/`)**:
   - **Texnologiyalar**: Python 3.11+, FastAPI, SQLAlchemy, Pydantic v2, PostgreSQL / SQLite, JWT, bcrypt.
   - **Xavfsizlik**: RBAC (Admin, Scout, Player rollari), CSRF / IDOR tekshiruvlari, IP Rate Limiter, Telegram HMAC-SHA256 kriptografik tekshiruvi.
   - **Joylashuv**: Railway (`https://web-production-dc0f4.up.railway.app`).

3. **Telegram Mini App Bot (`bot/`)**:
   - **Texnologiyalar**: Aiogram 3.x, TMA (Telegram Mini App) integratsiyasi, tezkor bir bosishda tizimga kirish (Seamless WebApp Auth).

---

## 🔒 Xavfsizlik va Himoya Tizimi (Security Hardening)

- **Orqa eshiksiz (No Backdoor)**: Barcha statik login parollar butunlay olib tashlangan. Faqat bcrypt hash va JWT orqali autentifikatsiya.
- **Rol eskalatsiyasidan himoya**: Ommaviy ro'yxatdan o'tishda faqat `player` yoki `scout` rollari ruxsat etiladi. `admin` rolini faqat mavjud tizim ma'muri berishi mumkin.
- **Himoyalangan Endpointlar**: Gollar kiritish, o'yin natijalarini o'zgartirish, turnirlar va maydonlar yaratish faqat admin / vakolatli xodimlar uchun cheklangan.
- **Rate Limiting & Proxy IP**: Railway va Vercel proksi serverlari orqasida `X-Forwarded-For` sarlavhasidan real foydalanuvchi IP manzili aniqlanadi.

---

## 🚀 Ishga Tushirish (Local Development)

### 1. Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend:
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Muhim Muhit O'zgaruvchilari (`.env`)

```env
SECRET_KEY=kriptografik_kuchli_maxfiy_kalit
ENVIRONMENT=production
DATABASE_URL=postgresql://user:pass@host:5432/futuro_db
BOT_TOKEN=telegram_bot_token_bu_yerda
ADMIN_USERNAME=erkin_master
ADMIN_PASSKEY=kuchli_admin_paroli
```

---

## 📄 Litsenziya va Mualliflik
© 2026 Futuro. Barcha huquqlar himoyalangan. Chempionlar uchun yaratilgan • O'zbekistonda ishlab chiqilgan.
