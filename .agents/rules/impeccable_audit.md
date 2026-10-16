# Impeccable Design Audit Rules (24 Gold UX Standards)

Har bir frontend komponent yoki sahifa yaratilganda / yangilanganda Sardor (UI/UX) va Rustam (PM) quyidagi 24 qoidani avtomatik tekshirishi shart:

1. **Touch Targets**: Minimum 44x44px maydon mobil bosishlar uchun.
2. **Thumb Zone**: Asosiy harakatlar (CTA) ekranning pastki qismida.
3. **Micro-feedback**: Tugma bosilganda `active:scale-95` taktil sezgi.
4. **Instant State**: Yuklanish holatlari va xatolar darhol bildiriladi.
5. **Clear Typography**: Sarlavhalar `font-black uppercase`, kontrastli.
6. **No Overflow**: `truncate` / `line-clamp-2` orqali matnlar chegaralanadi.
7. **Readability**: Matn eni 65 belgidan oshmaydi.
8. **Kerning**: Katta harflar (ALL CAPS) doimo `tracking-wider`.
9. **WCAG Contrast**: Qora fonda matn aniq ko'rinishi shart (`text-stone-200`/`white`).
10. **Obsidian Depth**: Chuqur fon `#050505` + shaffof oynasimon kartochkalar.
11. **Single Focal Color**: 1 ta dominant rang (Oltin `#F59E0B`).
12. **Status Accents**: Yashil (muvaffaqiyat), qizil (xavf/jarima), sariq (ogoh).
13. **8px Grid**: Barcha padding/margin 8px karrali.
14. **Zero Layout Shifts**: Skeleton loaderlar va aniq aspect-ratio.
15. **Responsive Padding**: Ekranga yopishib qolmaslik (`px-4 sm:px-6`).
16. **Hidden Scrollbars**: Silliq surish, lekin yashirin scrollbar (`scrollbar-none`).
17. **Telegram Safe Area**: Tepadan va pastdan xavfsiz masofa.
18. **GPU Animations**: Faqat `transform` va `opacity` animatsiya qilinadi.
19. **Lightweight Bundle**: Ortiqcha kutubxonasiz yengil kod.
20. **Graceful Errors**: Tarmoq uzilsa tushunarli xabar va "Qayta urinish" tugmasi.
21. **Max 2 Clicks**: Maqsadga yetish uchun ko'pi bilan 2 bosish.
22. **Zero Form Overload**: Faqat eng kerakli maydonlar.
23. **Clear Primary CTA**: Eng muhim tugma darhol ko'zga tashlanadi.
24. **No Visual Noise**: Keraksiz shovqin va ortiqcha chiziqlar yo'q.
