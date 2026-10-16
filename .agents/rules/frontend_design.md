# Frontend Design Guidelines

Ushbu qoidalar FootballRise platformasining barcha frontend qismlariga tatbiq qilinishi shart. Dizayn hech qachon "minimalist", "ultra clean", "simple SaaS", "basic landing page" yoki "minimal UI" ko'rinishida bo'lmasligi kerak. Platforma PREMIUM, RICH, REALISTIC, CINEMATIC va PRODUCTION-LEVEL bo'lishi talab etiladi.

## 1. REAL RASMLAR — ASOSIY TALAB
- Imkon qadar ko'proq real va yuqori sifatli futbol rasmlaridan foydalaning.
- Artificial gradient background yoki abstract blob o'rniga real football photography ishlating (professional football player, stadium, match action, locker room, pitch, night stadium, crowd va hokazo).
- Rasmlar professional sports photography darajasida bo'lsin. Stock-photo ko'rinishidan qoching.
- Agar rasm yo'q bo'lsa, keyin almashtirish oson bo'lgan, ammo vizual jihatdan kuchli placeholder (gray/gradient rectangle emas) ishlating.

## 2. HERO — CINEMATIC BO‘LSIN
- Hero qismi oddiy qora fon va tekst/tugmalardan iborat bo'lmasin.
- Full-width, professional dark overlay'ga ega cinematic football rasm (masalan: stadionda yugurayotgan futbolchi, tungi stadion) bilan boshlansin.
- Katta typography (masalan: "Kelajak futbolchilarini bugundan toping.").
- Rasm ustida floating UI elementlar (player rating, scouting score, statistics) real product interfeysiga o'xshash holda joylashsin.

## 3. ANIMATSIYA — JUDA MUHIM
- Static interfeys qilmang, premium animation system yarating.
- Fade in/out bilan cheklanmang.
- Ishlatiladigan animatsiyalar: cinematic hero reveal, image parallax, smooth image zoom, staggered content reveal, horizontal image movement, 3D-like card movement, progress animatsiyalari, button magnetic hover, smooth scrolling va hokazo.

## 4. ANIMATSIYA “ARZON” KO‘RINMASIN
- Animatsiyalar "flashy" bo'lmasin (bounce, random spinning, rainbow gradients, cheap neon mumkin emas).
- Slow cinematic image movement, smooth cubic-bezier transitions, spring-based UI interaction va subtle depth ishlating.

## 5. REALISTIC 3D / DEPTH
- Elementlarda realistik depth yarating (hoverda card perspective, trophy/stadium visual, floating statistics layer).
- 3D elementlar football product'ning visual identity'sini kuchaytirishi kerak.

## 6. PLAYER CARDS — KATTA VISUAL
- Oq oddiy kartalar ishlashmang. Rasm karta orqa fonini egallab, ustida gradient overlay bo'lsin.
- Hover holatida image scale, card perspective, stats reveal animatsiyalari bo'lsin.

## 7. REAL FOOTBALL OBJECTS
- Iconlar o'rniga haqiqiy obyektlar (real trophy, haqiqiy to'p, club badge) ishlating.

## 8. AWARDS SECTION
- Premium composition ishlating (real trophy visual, dark stadium background, text overlay, subtle light animatsiyasi).

## 9. TOURNAMENT SECTION
- Katta visual card yoki banner (stadium image, competition branding, date, location).
- Hoverda image zoom, live-style indicator yoki countdown qo'shing.

## 10. NEWS — MAGAZINE STYLE
- Professional football magazine dizayni. Bitta katta featured story va yonida secondary stories.
- Har bir article image, category, headline, date, author bilan. Hoverda rasm harakati.

## 11. STATS SECTION
- Vizual jihatdan boy section, katta animated numberlar, scroll paytida animated chartlar (line/bar) va counterlar bo'lsin.

## 12. SCOUTING EXPERIENCE
- Asosiy differentiator. Katta real scouting photography orqa foni va foregroundda haqiqiy product screenshotiga o'xshagan real UI elementlar (filters, ratings, performance, shortlist) bo'lsin.

## 13. SCROLL STORYTELLING
- Ayrim sectionlarda sticky scroll storytelling ishlating (chapda image turib, o'ngda sectionlar aylanadi yoki aksincha).

## 14. ASYMMETRIC DESIGN
- Barcha elementlarni simmetrik (3-column, 3-card) qilmang.
- Layoutlarni almashtirib turing (full-screen hero, large image+small content, overlapping cards, horizontal scroll, split-screen, editorial grid).

## 15. IMAGE COLLAGE
- Real rasmlarni ustma-ust (player, stadium, training) premium simmetriya bilan joylashtiring.

## 16. BACKGROUNDNI BO‘SH QOLDIRMA
- Katta qora sectionlar bo'lmasin.
- Background photography, subtle texture, floating visual, stadium lights kabi elementlar qo'shing.

## 17. PROFESSIONAL IMAGE TREATMENT
- Rasmlarni cropping, gradient overlay, masking, full bleed, dark overlay kabi usullar bilan joylang.

## 18. PREMIUM NAVIGATION
- Navbar hero bilan integratsiyalashgan bo'lsin. Transparent navbar, scroll qilinganda blurred background/dark transition bo'lsin.

## 19. MODAL HAM PREMIUM BO‘LSIN
- Modal ochilganda background blur bo'lsin, smooth scale+opacity animatsiyasi ishlating.
- Chap tomonda real futbol rasmi va o'ngda forma tursin.

## 20. PROFILE IMAGE UPLOAD
- Real football profile preview. Rasm yuklanganda crop, position, background, profile card preview bo'lsin.

## 21. REALISTIC EMPTY STATES
- Elementlar yo'q bo'lsa "No data" + icon o'rniga, real football field/stadium image + message va CTA qo'ying.

## 22. LOADING
- Spinner o'rniga skeleton + image placeholder + animated shimmer ishlating.

## 23. HOVER STATES
- Player card, tournament, news, button va navigation elementlarida professional interaksiyalar (zoom, shift, light sweep) qo'llang.

## 24. CURSOR INTERACTION
- Desktop versiyada player/card hover qilinganda subtle image movement yoki card perspective uchun kerakli joylarda foydalaning.

## 25. SECTION TRANSITIONS
- Sectionlar orasidagi o'tishlarda (dark hero -> light content) gradient transition, image overlap, sticky visual'dan foydalaning. Keskin qora/oq o'tishlar bo'lmasin.

## 26. REAL SPORTS BROADCASTING VISUAL LANGUAGE
- Ba'zi joylarda televideniye sport translyatsiyalariga xos scoreboard, statistics, match status ko'rinishidan ilhom oling.

## 27. RANKINGS PAGE
- Oddiy table o'rniga, position, player image, club, rating, form ustunlari va rank o'zgarishi animatsiyasi qo'yilgan professional sports ranking interface yarating.

## 28. FOOTBALL PLAYER DISCOVERY
- Katta discovery experience (search, filters, trending players, player wall, horizontal carousel). Playerlar bir xil grid bo'lib qolmasin.

## 29. REAL-WORLD PRODUCT FEEL
- Sayt dizayni orqali haqiqiy futbol platformasi ekanligi, real futbolchilar, skautlar va turnirlar borligi vizual his qildirilishi lozim.

## 30. DESIGN DENSITY
- Bo'shliqlar bo'lishi kerak, lekin axborot zichligi ham yuqori darajada bo'lsin. Katta rasmlar, data, kartalar va grafiklar balansli joylashtirilsin.

## 31. “MINIMALIST” SO‘ZINI NOTO‘G‘RI TALQIN QILMA
- "Sodda bo'lmasin" degani tartibsiz ranglar va har joyda 3D degani emas. Bu: VISUAL RICHNESS, REAL PHOTOGRAPHY, DETAILED UI, STRONG COMPOSITION, DEEP HIERARCHY, REALISTIC DATA, PROFESSIONAL ANIMATION, SPORTS ATMOSPHERE, HIGH INFORMATION DENSITY deganidir.

## 32. YAKUNIY TALAB
Quyidagi beshta tamoyil doim asosiy o'rinda tursin:
1. REAL IMAGE
2. REAL DATA
3. REALISTIC UI
4. PREMIUM ANIMATION
5. STRONG VISUAL COMPOSITION

Sayt - premium, realistic, cinematic, sports-tech, data-rich, interactive, editorial va production-ready bo'lishi shart.
