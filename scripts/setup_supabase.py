"""
FootballRise — Supabase (PostgreSQL) ga o'tish uchun qo'llanma
=============================================================

QADAM 1: Supabase'da bepul hisob oching
  → https://supabase.com  ga kiring
  → "New Project" bosing
  → Loyiha nomi: football_rise
  → Parol yozing va ESLAB QOLING (bu sizning DB parolingiz)

QADAM 2: Ulanish URL manzilini oling
  → Supabase dashboard → Settings → Database
  → "Connection string" bo'limida "URI" ni tanlang
  → Shunday ko'rinadi:
    postgresql://postgres:[PAROL]@db.xxxxxxxxxxxx.supabase.co:5432/postgres

QADAM 3: .env faylni yangilang
  Loyiha papkasidagi .env faylini oching va quyidagi qatorni yangilang:

  # SQLite qatorini # bilan o'chiring:
  # DATABASE_URL=sqlite:///./data/football.db

  # PostgreSQL qatorini faollashtiring:
  DATABASE_URL=postgresql://postgres:[PAROLINGIZ]@db.[SUPABASE_ID].supabase.co:5432/postgres

QADAM 4: Serverni qayta ishga tushiring
  terminal da: cd backend && uvicorn main:app --reload

  Server ishga tushganda barcha jadvallar Supabase'da avtomatik yaratiladi!
  (Base.metadata.create_all avtomatik ishlaydi)

QADAM 5: Tekshirish
  → Supabase dashboard → Table Editor
  → Barcha jadvallar (users, players, scouts...) ko'rinishi kerak

=============================================================
  Eslatma: .env faylni hech qachon GitHub'ga yuklamang!
  .gitignore ga qo'shilgan, xavfsiz.
=============================================================
"""
