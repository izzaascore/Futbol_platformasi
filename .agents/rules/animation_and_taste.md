# Emil Kowalski Animation & Taste UI Standards

Ushbu qoidalar FootballRise platformasining barcha frontend (React, Tailwind, Framer Motion) interfeyslariga majburiy tatbiq etiladi.

---

## 1. EMIL KOWALSKI ANIMATSIYA PRINSIPLARI (SPRINGS & PHYSICS)

### A) Hech qachon "Arzon" Transition ishlatmang
- ❌ Taqiqlanadi: `transition: all 0.2s ease` yoki qotib ishlaydigan sun'iy siljishlar.
- ✅ Tavsiya: **Framer Motion Spring Physics** — harakatlar elastik va tabiiy bo'lishi shart:
  ```javascript
  transition: { type: "spring", stiffness: 400, damping: 30 }
  ```
  Ochilish / modal dialoglar uchun: `stiffness: 300, damping: 25`

### B) Faqat GPU xotirasida ishlovchi xususiyatlarni harakatlantiring
- Harakatlantirish faqat `transform` (`scale`, `translate3d`, `rotate`) va `opacity` orqali bo'ladi.
- ❌ Hech qachon `width`, `height`, `top`, `margin` ni bevosita animatsiya qilmang (bu telefon protsessorini qizdiradi).
- Agar o'lcham o'zgarsa: Framer Motion'ning `layout` yoki `layoutId` xususiyatidan foydalaning.

### C) Taktil Mikromoshinalar (Tugmalar jonliligi)
- Har bir bosiladigan tugma va kartochka taktil hissiyot berishi shart:
  ```javascript
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.96 }}
  ```
  yoki Tailwind'da: `active:scale-95 transition-transform duration-100`

### D) Xoreografiya va Kaskad (Staggered Entrance)
- Kartochkalar birdaniga paydo bo'lmasligi kerak. Ro'yxat elementlari kaskad (stagger) bo'lib 0.05 soniya farq bilan ketma-ket chiqadi.

---

## 2. TASTE UI & IMPECCABLE DIZAYN STANDARTLARI

### A) Hashamatli Qorong'u Rejim (Obsidian Glassmorphism)
- Oddiy xira kulrang fonlardan qoching.
- Chuqur obsidian qora `#050505` yoki `#0a0a0a` fon, uning ustida shishasimon frosted-glass panellar (`bg-stone-900/80 backdrop-blur-xl border border-stone-800`).

### B) Shriftlar Ierarxiyasi (Typography)
- Sarlavhalar: `font-black uppercase tracking-tighter text-white`.
- Izohlar va sanalar: `text-[10px] md:text-xs font-bold uppercase tracking-widest text-stone-500`.

### C) Rangli Urg'u (Championship Accent)
- Butun interfeysda 1 ta asosiy premium rang: **Oltin / Amber (`#F59E0B`)** va sport dinamikasi uchun **Qizil / Emerald (`#DC2626` / `#10B981`)** aksentlar.

### D) Mobil va Telegram Mini App Qulayligi (Impeccable Touch)
- Bosiladigan maydonlar (Touch targets) kamida 44x44px bo'lishi shart.
- Gorizontal skrollarda scrollbar yashirilgan (`scrollbar-none`) va silliq surilishi ta'minlanadi.
