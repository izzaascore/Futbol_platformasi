# Football Platform - Obsidian Sync

Bu papka loyiha darsliklari, tizim arxitekturasi, eslatmalar va hujjatlarni Obsidian'da yuritish uchun mo'ljallangan.

## 📂 Loyiha Tuzilishi

Loyiha quyidagi asosiy qismlardan tashkil topgan:

- `main.py`: FastAPI dasturining asosiy kirish nuqtasi, API endpointlari (masalan, `/api/auth/register`, `/api/players` va h.k.).
- `models.py`: SQLAlchemy yordamida yozilgan ma'lumotlar bazasi modellari (User, Player, Scout, GoalSubmission va boshqalar).
- `schemas.py`: Pydantic modellari. Kiruvchi va chiquvchi ma'lumotlarni formati va ularni tekshirish (validation) uchun ishlatiladi.
- `security.py`: Xavfsizlik va avtorizatsiya. JWT tokenlar yaratish/tekshirish, parollarni xeshlash, hamda RBAC (rolga asoslangan boshqaruv).
- `database.py`: Ma'lumotlar bazasi ulanish sozlamalari va sessiyalar boshqaruvi.
- `frontend/`: ReactJS yordamida qurilgan mijoz tomonidagi ilova (UI).

## 👥 Rollar va Huquqlar (RBAC)

Tizimda asosan quyidagi rollar qo'llaniladi (ko'pincha `UserRole` enum orqali):

1. **Player (O'yinchi)**: O'z profilini yaratish, jismoniy holati va pozitsiyasini kiritish, o'z videolarini yuklash.
2. **Scout (Skaut)**: O'yinchilarni qidirish, profillar va videolarni baholash. Skautlar odatda ro'yxatdan o'tganda `PENDING` holatda bo'ladi va admin tasdig'ini kutadi.
3. **Admin**: Tizimni to'liq nazorat qilish, rollarni tasdiqlash, ruxsatlarni sozlash va umumiy boshqaruv.

*Huquqlarni tekshirish FastAPI'da `Depends(RequireRole([...]))` tarzida marshrutlarda amalga oshiriladi.*

## 🔒 Xavfsizlik Qoidalari

- **JWT (JSON Web Token)**: Auth jarayonlari JWT asosida ishlaydi. Login qilingandan so'ng qaytarilgan tokenni har bir xavfsiz so'rovning (Header) `Authorization` qismida yuborish shart.
- **Parollar (Hashing)**: Parollar bazada ochiq ko'rinishda saqlanmaydi. Ular `security.py` dagi maxsus xesh funksiyalari (masalan, bcrypt) yordamida xeshlanadi. 
- **Rolga asoslangan ruxsat (RBAC)**: Endpointlar foydalanuvchi roliga qarab cheklangan, tizimdagi ruxsatsiz urinishlar FastAPI `HTTPException` orqali to'xtatiladi.
- **CORS va Xavfsiz marshrutlash**: `main.py` da frontend domenlarga ruxsat berilgan bo'lib, noqonuniy uchinchi tomon so'rovlari CORS vositasida cheklanadi.
