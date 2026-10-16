---
name: impeccable_audit
description: >
  Impeccable Design & UX Audit system. Evaluates frontend pages against 24 visual design,
  usability, contrast, touch target (44x44px), mobile layout, and zero-shift standards.
---

# Impeccable Design Audit (/audit)

Ushbu skill interfeysni professional dizayn, UX/UI va vizual xatolar bo'yicha audit qiladi.

## 24 Ta Dizayn Audit Qoidalari:

### 1. Touch & Usability (Taktil qulaylik)
1. **44x44px Touch Targets**: Har bir bosiladigan tugma, icon va link mobil qurilmalarda kamida 44x44px maydonga ega bo'lishi shart.
2. **Thumb Zone**: Asosiy amallar (call-to-action) bosh barmoq yetadigan pastki 60% qismda joylashgan.
3. **No Dead Clicks**: Bosiladigan har bir narsa bosilgandek taktil reaksiya (`active:scale-95`) berishi shart.
4. **Instant Feedback**: Har bir tugma bosilganda darhol holat (loading spinner, rang o'zgarishi) o'zgaradi.

### 2. Visual Hierarchy & Typography (Tipografiya va ierarxiya)
5. **Clear Scale**: Sarlavha (H1/H2) va matn o'rtasidagi kontrast aniq (masalan, `font-black uppercase` vs `text-stone-400 font-medium`).
6. **No Truncation Disasters**: Uzun matnlar qutidan chiqib ketmasligi uchun `truncate` yoki `line-clamp-2` ishlatiladi.
7. **Line Length**: O'qiladigan matn satri 65 belgidan oshmasligi kerak (`max-w-prose` yoki `max-w-xl`).
8. **Consistent Kerning**: Katta harflar (ALL CAPS) doimo `tracking-wider` yoki `tracking-widest` bilan yoziladi.

### 3. Color, Contrast & Glassmorphism (Rang va chuqurlik)
9. **WCAG AA Contrast**: Matn va fon kontrasti kamida 4.5:1. Xira kulrang matn qora fonda yo'qolib qolmasligi shart (`text-stone-300` / `text-white`).
10. **Obsidian Palette**: Asosiy fon chuqur obsidian qora (`#050505`), yuzalar shaffof qatlam (`bg-stone-900/80 backdrop-blur-xl border border-stone-800`).
11. **Single Focal Accent**: Sahifada 1 ta asosiy urg'u rangi (Oltin / Amber) hukmronlik qiladi. Barcha ranglar bir vaqtda qichqirmaydi.
12. **Status Colors**: Yashil (g'alaba / faol), qizil (xato / jazo), sariq (ogohlantirish) standart ma'noda ishlatiladi.

### 4. Layout & Spacing (Joylashuv va bo'shliqlar)
13. **8px Grid System**: Barcha bo'shliqlar (gap, padding, margin) 8 karrali (p-2, p-4, p-6, gap-4).
14. **Zero Layout Shifts (CLS)**: Rasmlar va yuklanayotgan kontentlar o'rnida aniq aspect-ratio yoki skeleton placeholder bo'ladi.
15. **Responsive Padding**: Mobil ekranda `px-4`, noutbukda `px-6` yoki `px-8`. Kontent ekran chetiga yopishib qolmasligi shart.
16. **Hidden Scrollbars**: Gorizontal slayderlarda `scrollbar-none` bo'ladi, lekin surish erkin ishlaydi.

### 5. Telegram Mini App & Performance
17. **Safe Area Insets**: Telegram sarlavhasi (header) va pastki yopish tugmalari uchun `pt-safe` / `pb-safe` bo'shliqlari.
18. **GPU Animations Only**: Faqat `transform` va `opacity` animatsiya qilinadi.
19. **Lightweight Bundle**: Ortiqcha kutubxonalar yo'q. Native brauzer APIlari ustun.
20. **Offline/Error Gracefulness**: Internet sekinlashsa yoki API uzilsa bo'sh oq ekran emas, chiroyli qayta urinish (`retry`) ekrani chiqadi.

### 6. Senior Ponytail Simplicity
21. **Max 2 Clicks to Value**: Foydalanuvchi maqsadi sari (masalan, stadion band qilish yoki o'yinchiga ovoz berish) 2 ta bosishdan ko'p talab qilinmaydi.
22. **Zero Form Overload**: Shakllarda faqat zaruriy maydonlar so'raladi.
23. **Clear Primary Action**: Har bir ekranda qaysi tugma asosiy ekanligi yaqqol ko'rinib turadi (`bg-amber-500 text-black font-black`).
24. **No Visual Noise**: Keraksiz bezaklar, haddan tashqari ko'p ramkalar olib tashlanadi.
