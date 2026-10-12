# 🔌 API Dokumentatsiya

Ushbu hujjat loyihadagi asosiy backend marshrutlari (endpoints) haqida ma'lumot beradi. Tizim **FastAPI** da yozilgan.

## 1. Autentifikatsiya va Foydalanuvchilar (`/api/auth`)
- `POST /api/auth/register` - Yangi foydalanuvchini (O'yinchi yoki Skaut) ro'yxatdan o'tkazish.
- `POST /api/auth/login` - Tizimga kirish va JWT tokenni olish.
- `GET /api/auth/me` - Hozirgi avtorizatsiyadan o'tgan foydalanuvchi ma'lumotlarini olish.

## 2. O'yinchilar (`/api/players`)
- `GET /api/players` - Barcha o'yinchilar ro'yxatini va ularning ma'lumotlarini olish.
- `GET /api/players/{id}` - Muayyan o'yinchining to'liq profilini ko'rish.

## 3. Videolar va Yutuqlar
- `POST /api/videos/upload` - O'yinchi tomonidan yangi video yuklash.
- `GET /api/videos` - Yuklangan videolarni ro'yxatini ko'rish (Skautlar va Adminlar uchun).

## 4. Admin Paneli (`/api/admin`)
- `GET /api/admin/pending-scouts` - Tasdiqlanmagan skautlarni ko'rish.
- `POST /api/admin/approve-scout/{id}` - Skautni tasdiqlash va faollashtirish (`PENDING` -> `ACTIVE`).

*Batafsil ma'lumot va barcha marshrutlarni to'liq ro'yxatini ishga tushirilgan serveringizda [http://localhost:8000/docs](http://localhost:8000/docs) (Swagger UI) manzilidan ko'rishingiz mumkin.*

🔗 **Bog'liq hujjatlar**: [[README]], [[Malumotlar_Bazasi]]
