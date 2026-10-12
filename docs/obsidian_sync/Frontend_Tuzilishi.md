# 💻 Frontend Tuzilishi (React)

Loyiha frontend qismi **ReactJS** va zamonaviy komponentlar asosida qurilgan.

## Papkalar Arxitekturasi
- `/src/components/`: Kichik, qayta ishlatiladigan UI elementlar (Button, Input, Navbar, Sidebar). `ProtectedRoute.jsx` - himoyalangan sahifalar uchun yo'naltiruvchi.
- `/src/pages/`: Asosiy sahifalar.
- `/src/layouts/`: Umumiy ko'rinish shablonlari (masalan, `AdminLayout.jsx` - admin panelning doimiy yon menyusi bilan ko'rinishi).
- `/src/context/` yoki `/src/store/`: Global holatlarni (state) boshqarish (masalan, foydalanuvchi ma'lumotlari).

## Asosiy Sahifalar (`pages/`)

1. **`AdminPage.jsx`**: Admin dashboard'i. Foydalanuvchilarni va skautlarni boshqarish.
2. **`PlayersPage.jsx`**: Skautlar va foydalanuvchilar uchun o'yinchilar ro'yxatini qidirish va filtrlash sahifasi.
3. **`ProfilePage.jsx`**: Foydalanuvchining shaxsiy profili (ma'lumotlarni tahrirlash, videolarini ko'rish).
4. **`RankingsPage.jsx`**: O'yinchilar reytingi va peshqadamlar jadvali.
5. **`player/PlayerDashboard.jsx`**: O'yinchi uchun maxsus boshqaruv paneli (statistikalar, yangi videolar yuklash).

## Marshrutlash (Routing)
Frontend da marshrutlash `react-router-dom` orqali amalga oshiriladi. Himoyalangan sahifalarga faqat JWT token mavjud bo'lsagina (`ProtectedRoute` orqali) kirish mumkin.

🔗 **Bog'liq hujjatlar**: [[README]], [[Vazifalar_Rejasi]]
