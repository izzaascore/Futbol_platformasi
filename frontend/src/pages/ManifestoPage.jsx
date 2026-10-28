import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, ShieldAlert, Target, Zap, TrendingUp, ShieldCheck, 
  Dumbbell, AlertTriangle, BatteryCharging, BrainCircuit, Activity, 
  ChevronRight, Lock, Camera, Smartphone, EyeOff, Trash2 
} from 'lucide-react';
import PageTransition from '../components/PageTransition';

const rules = [
  {
    title: "Kuchlilar emas, o'ziga ishonib tinimsiz mehnat qilganlar g'olib bo'ladi",
    desc: "Futbolda faqat tug'ma iste'dod yoki pul hal qiladi degan tushunchani unut. Maydonda qimmat kiyim yoki tanishlar emas, tinimsiz qilingan mehnat va xarakter yutadi. Kuchsiz ko'ringanlar ham o'z irodasi bilan cho'qqiga chiqishi mumkin.",
    icon: <Dumbbell className="w-5 h-5" />
  },
  {
    title: "Yutqazish — taslim bo'lish degani emas, bu dars",
    desc: "Mag'lubiyat yoki tanlovdan o'ta olmagan kun — bu oxiri emas. Haqiqiy g'olib yiqilgandan keyin yig'lab o'tirmaydi, sababini topadi va ikki barobar kuch bilan qaytadi.",
    icon: <Activity className="w-5 h-5" />
  },
  {
    title: "Faqat o'zingga ishon, bahona qidirma",
    desc: "\"Hakam yomon\", \"Sharoitim yo'q\" degan gaplarni yig'ishtir. Agar sen haqiqatan ham kuchli bo'lsang, seni hech kim yashira olmaydi. Bor e'tiboringni faqat o'z mahoratingga qarat.",
    icon: <ShieldCheck className="w-5 h-5" />
  },
  {
    title: "O'zing haqingda hech qachon yomon gapirma",
    desc: "O'ziga \"men eplolmayman\" degan odam oldindan yutqazadi. Tilga chiqqan narsa taqdirga aylanadi. G'oliblar o'zi bilan har doim kuchli va to'g'ri tilda gaplashadi.",
    icon: <BrainCircuit className="w-5 h-5" />
  },
  {
    title: "Biz yo'l ko'rsatamiz, qadamni o'zing bosasan",
    desc: "Biz senga qanday harakat qilish kerakligini, to'g'ri yo'lni ko'rsatib qo'yamiz. Lekin o'sha yo'ldan o'tish, ter to'kish va g'alabani tortib olish faqat sening o'zingga bog'liq.",
    icon: <Target className="w-5 h-5" />
  },
  {
    title: "Harakat — erkinlik, erinchoqlik — qullik",
    desc: "Kecha nima qilganingni o'zingga hisobot ber. Hech kim majburlamasa ham, o'z xohishing bilan o'sha mashqni bajarish — bu o'zingni hurmat qilishning eng oliy ko'rinishi.",
    icon: <Lock className="w-5 h-5" />
  },
  {
    title: "Tanish-bilish va pul emas, raqamlar va faktlar gapiradi",
    desc: "Kimdir \"tanishing bo'lmasa bo'lmaydi\" desa, ishonma. Futuro platformasida sen o'z natijalaring, videolaring va statistikang bilan gapirasan.",
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    title: "Qo'rquvni yengish — erkakning ishi",
    desc: "Maydonga tushganda yoki sinovdan oldin hayajonlanish tabiiy. Lekin qo'rquvga taslim bo'lish — jang boshlanmasdan turib yutqazish degani. Uni sindirib o't!",
    icon: <ShieldAlert className="w-5 h-5" />
  },
  {
    title: "Kichik qadamlar katta imperiyani quradi",
    desc: "Bir kunda yulduz bo'lib qolmaysan. Lekin har kuni bitta kamchilikni to'g'rilash — bir yildan keyin seni boshqalardan osmonqadar oldinga o'tkazib yuboradi.",
    icon: <TrendingUp className="w-5 h-5" />
  },
  {
    title: "Sen o'zing o'ylagandan ko'ra kuchlisan",
    desc: "Charchadim deb o'ylagan paytingda, aslida yana yarim zaxirang qolgan bo'ladi. O'sish faqat qiyinchilik va chidamlilik ichida bo'ladi. O'sha chegaralarni doim kengaytir!",
    icon: <BatteryCharging className="w-5 h-5" />
  }
];

const ManifestoPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#030303] text-stone-300 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-grid selection:bg-white selection:text-black">
        
        {/* Dark Luxury Stadium Lighting Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/4 -right-48 w-80 h-80 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 -left-48 w-80 h-80 bg-white/[0.02] rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/20 text-stone-200 mb-6 backdrop-blur-md">
              <Flame className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-stone-200">
                Faqat kuchlilar uchun
              </span>
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-[1.05] mb-6">
              Xarakter, Psixologiya va <br className="hidden md:block"/>
              <span className="text-gradient">O'zini O'zi Tarbiyalash</span> Manifesti
            </h1>

            <p className="text-stone-300 text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
              Sen xohlagan o'sha badavlat hayot, olqishlar, tribunadagi muxlislar — bularning hammasi shunchaki xohish bo'lib qolaveradi, agar sen hozir, shu soniyada o'zgarishga rozi bo'lmasang.
            </p>
          </motion.div>

          {/* Part 1: The Truth */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-card"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center border border-white/15 shrink-0">
                <AlertTriangle className="w-5 h-5 text-white" />
              </span>
              Qism 1: O'zingni Aldashni To'xtatadigan Haqiqat
            </h2>
            
            <div className="space-y-6 text-stone-300 leading-relaxed font-normal text-base md:text-lg">
              <p className="font-semibold text-white text-xl md:text-2xl border-l-2 border-white pl-5 py-1">
                To'xtat! Bir minutga to'xtagin-u, o'zingga o'zing savol ber: Shu yashashing, shu harakating bilan ertaga kim bo'lasan?
              </p>
              
              <p>
                Hozir ichingda bitta ovoz: <span className="italic text-stone-400">"Menda sharoit yo'q, dadam boy emas, tanishim yo'q, shuning uchun o'xshamayapti"</span>, deb bahona qidiryaptimi? Rostdan ham shundoq deb o'ylaysanmi?
              </p>

              <p>
                Keling, ochiq gaplashamiz. Bahona topish — bu ojizlarning ishi. Sen o'zingga achinishni bas qilmaguningcha, kimdir kelib sening qo'lingdan tutib, seni yulduz qilib qo'yishini kutib yashayverasanmi? Afsuski, bunday bo'lmaydi. Dunyo shafqatsiz: u yerda faqat kuchlilar, irodasiga tayanib o'rnidan turganlar qoladi.
              </p>

              <div className="bg-black/60 p-6 md:p-8 rounded-xl border border-white/10 my-8">
                <h3 className="font-heading text-white font-bold uppercase tracking-widest mb-4 flex items-center gap-2.5">
                  <Zap className="w-4 h-4 text-white" /> O'zingga tan ol:
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <span>Kecha nima qilding? Ertalab yana uyqudan turishga erindingmi?</span>
                  </li>
                  <li className="flex gap-3">
                    <ChevronRight className="w-5 h-5 text-stone-400 shrink-0 mt-0.5" />
                    <span>"Bugun dam olaman, ertadan boshlayman" dedingmi?</span>
                  </li>
                  <li className="flex gap-3 text-white font-medium">
                    <AlertTriangle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                    <span>Mana, o'sha "ertang" keldi. Nima o'zgardi? Hech narsa! Chunki sen yana o'sha eski joydasan.</span>
                  </li>
                </ul>
              </div>

              <p>
                Lekin bitta narsani tushunib ol: <strong className="text-white">Yutqazganing — bu oxiring emas. Taslim bo'lganing — mana bu haqiqiy fojiadir.</strong> Maydonda mag'lub bo'lish uyat emas, lekin harakat qilmasdan turib yutqazishni tan olish — bu o'z-o'ziga qilingan xiyonat.
              </p>

              <p>
                Senga hech kim qimmatbaho butsa yoki tayyor yo'l olib kelib bermaydi. Yo'lni o'zing ochasan. Agar bugun ter to'kmasang, ertaga boshqalarning g'alabasini faqat telefonda tomosha qilib o'tirishga majbur bo'lasan.
              </p>

              <div className="pt-8 mt-8 border-t border-white/10">
                <h3 className="font-heading text-xl font-bold text-white uppercase tracking-widest mb-4">
                  Ruhni Sindirmaydigan Haqiqat
                </h3>
                <p className="mb-4 text-stone-300">
                  "Mayli, xato qildingmi? 10 marta yutqazdingmi? Yana yiqildingmi? Mayli, turgin! Chunki boshqa hech kim kelib seni o'rnidan turgazib qo'ymaydi. Hayot shafqatsiz – bu yerda senga hech kim yordam bermaydi, birov kelib qo'lingdan tutmaydi. Hamma o'zi uchun kurashadi.
                </p>
                <p className="mb-6 text-stone-300">
                  Endi o'zingga o'zing savol ber: Shunday yotib qolasanmi yoki turgirib, yana urishni boshlaysanmi? Taslim bo'lish – bu o'z qo'ling bilan o'z o'limingga imzo qo'yish bilan barobar. Mayli, yig'la, charchagin, lekin tur va yana davom et! Sening taqdiring faqat va faqat o'zingning qo'lingda."
                </p>
                
                <p className="text-xl font-bold text-white mt-8">
                  Xo'sh, roziemisan? Yana shunday yashashda davom etib, yillar o'tib "Menda imkon bo'lgandi, lekin foydalana olmadim" deb afsuslanib o'tishga roziemisan yoki bugundan boshlab o'zingni tarbiyalashga, haqiqiy erkakdek o'z taqdiringni o'z qo'lingga olishga tayyormisan?
                </p>
                <p className="text-white font-heading font-bold uppercase tracking-widest mt-4">Tanlov har doim o'zingda.</p>
              </div>
            </div>
          </motion.section>

          {/* Part 2: 10 Rules */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2 text-center">
              Qism 2: G'olibning 10 Ta Temir Qoidasi
            </h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest text-center mb-10">Psixologik Poydevor</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rules.map((rule, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/30 p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0 group-hover:bg-white group-hover:text-black transition-colors duration-300">
                      {rule.icon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">Qoida #{idx + 1}</div>
                      <h3 className="font-heading text-lg font-bold text-white mb-2 leading-tight group-hover:text-stone-100 transition-colors">{rule.title}</h3>
                      <p className="text-sm text-stone-300 font-normal leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Part 3: Hardcore Training Mode */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-card"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center border border-white/15 shrink-0">
                <Dumbbell className="w-5 h-5 text-white" />
              </span>
              Qism 3: "Hardcore Training Mode" (Temir Intizom)
            </h2>
            
            <div className="space-y-8 text-stone-300 leading-relaxed font-normal text-base md:text-lg">
              <p>
                Odamlar kompyuterdan ko'ra ko'proq telefondan foydalanishini inobatga olib, futbolchi mashg'ulot vaqtini aldab o'tib ketolmaydigan, qattiqqo'l mobil ilova mexanizmini yaratamiz:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2.5">
                    <Lock className="w-4 h-4 text-white" /> Vaqti kelganda qulflash
                  </h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Foydalanuvchi mashq uchun belgilangan vaqtni tanlaydi. Vaqt kelganda ilova unga xabar yuboradi. Agar u sababsiz kirmasa yoki boshqa narsa bilan ovvora bo'lib o'tirsa, ilova avtomatik ravishda boshqa ilovalardan chiqarib yuboradi va o'zini to'g'ridan-to'g'ri mashq sahifasiga majburiy kirgizib qo'yadi.</p>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10">
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-white" /> No Exit Zone
                  </h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Mashq vaqti boshlanganda telefonning pastki qismidagi "Uyga qaytish", "Orqaga" tugmalari va oynalarni almashtirish menyusi butunlay o'chib qoladi (bloklanadi). Foydalanuvchi qochib qutula olmaydi – faqat o'sha mashqni oxirigacha bajarishi shart.</p>
                </div>

                <div className="bg-black/60 p-6 rounded-xl border border-white/10 md:col-span-2">
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-3 flex items-center gap-2.5">
                    <Camera className="w-4 h-4 text-white" /> AI Camera Vision
                  </h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Kimdir "shunchaki taymerni yoqib qo'yib, telefonni chetga tashlab qo'yaman" deb o'ylasa, xato qiladi! Telefonning old kamerasi futbolchini kuzatib turadi. Agar kamera qarshisida hech qanday harakat bo'lmasa, bola o'tirib olib shunchaki kutayotgan bo'lsa, taymer darhol to'xtaydi va ekranga: <strong className="text-white">"O'zingni aldashni to'xtat, mashqni boshla!"</strong> degan qattiq ogohlantirish chiqadi.</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/15 p-6 rounded-xl text-stone-200">
                <h4 className="font-heading font-bold uppercase tracking-widest mb-2 text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-white" /> Qachon ochiladi?
                </h4>
                <p className="text-sm text-stone-300">Faqatgina belgilangan fizika mashqi kamera tomonidan to'liq bajarilgani tasdiqlangandagina taymer tugaydi, barcha cheklovlar olib tashlanadi va ilovadan normal foydalanishga ruxsat beriladi.</p>
              </div>
            </div>
          </motion.section>

          {/* Part 4: Privacy */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-2xl shadow-card"
          >
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white uppercase tracking-tight mb-8 flex items-center gap-4">
              <span className="w-12 h-12 rounded-xl bg-white/5 text-white flex items-center justify-center border border-white/15 shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </span>
              Qism 4: Shaxsiy Ma'lumotlar va Halollik Tamoyili
            </h2>
            
            <div className="space-y-6 text-stone-300 leading-relaxed font-normal text-base md:text-lg">
              <div className="flex gap-4 items-start bg-black/40 p-5 rounded-xl border border-white/5">
                <EyeOff className="w-5 h-5 text-stone-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-1 text-sm md:text-base">Yashirin Kuzatuv Yo'q</h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Foydalanuvchi ilovada bo'lmagan paytda uning ortidan hech qanday yashirin ma'lumot yig'ilmaydi. Faqatgina o'zi faol bo'lgan paytdagi (mashg'ulotlar, videolar, natijalar) ma'lumotlar uning shaxsiy xronologiyasiga yozib boriladi.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-black/40 p-5 rounded-xl border border-white/5">
                <Trash2 className="w-5 h-5 text-stone-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-1 text-sm md:text-base">To'liq Nazorat (Delete Anytime)</h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Foydalanuvchi o'zining xohlagan bitta ma'lumotini, statistikasini yoki butun profilidagi tarixini istalgan soniyada o'chirib yuborish huquqiga ega. "Biz ma'lumotlaringizni o'chirdik" deb aldab, uni serverda saqlab qolish degan jirkanch narsa bizda bo'lmaydi.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start bg-black/40 p-5 rounded-xl border border-white/5">
                <AlertTriangle className="w-5 h-5 text-stone-400 shrink-0 mt-1" />
                <div>
                  <h4 className="font-heading text-white font-bold uppercase tracking-widest mb-1 text-sm md:text-base">Ilovani O'chirish Oldidan Halol Ogohlantirish</h4>
                  <p className="text-sm text-stone-300 leading-relaxed">Agar foydalanuvchi ilovani telefonidan o'chirmoqchi bo'lsa, tizim unga zudlik bilan so'rov chiqaradi: <br/><br/>
                  <span className="italic text-stone-400">"Ilovani o'chirishdan oldin barcha shaxsiy ma'lumotlaringizni tozalab (o'chirib) yubordingizmi? Agar xohlasangiz, hozirning o'zida bazamizdagi barcha izlaringizni butunlay yo'q qilib yuborishimiz mumkin."</span><br/><br/>
                  Foydalanuvchi xohlasa hamma narsasini o'chirib ketadi, xohlasa o'zida saqlaydi. Tanish-bilishchilik yo'q joyda, ma'lumotlarda ham mutlaq halollik bo'lishi shart!</p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Conclusion */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center max-w-3xl mx-auto"
          >
            <h2 className="font-heading text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-6">
              Ishon, Natijaga Erishtiramiz!
            </h2>
            <p className="text-stone-300 text-base md:text-lg font-normal leading-relaxed mb-4">
              "Biz bu yerda sen shunchaki vaqt o'tkazishing uchun emas, g'alaba qozonishing uchun turibmiz. Biz sening yutqazishingni, sinishingni yoki o'zingga ishonmay yo'ldan qaytishingni aslo istamaymiz. Biz faqat va faqat SENING YUTISHINGNI xohlaymiz!
            </p>
            <p className="text-white text-lg md:text-xl font-bold leading-relaxed mb-4">
              Lekin bitta shart bor: Seni faqat o'zinggina qutqara olasan.
            </p>
            <p className="text-stone-300 text-base md:text-lg font-normal leading-relaxed mb-8">
              Biz senga eng to'g'ri yo'lni ko'rsatamiz, sharoitni yaratamiz, senga kerak bo'lgan hamma narsani beramiz, lekin oxirgi qadamni, o'sha hal qiluvchi zarbani o'zing urasan.
            </p>
            <div className="p-8 border border-white/15 bg-white/[0.04] backdrop-blur-xl rounded-2xl shadow-card">
              <p className="text-white font-heading font-bold uppercase tracking-widest text-base sm:text-lg leading-relaxed">
                Ishon! O'zingga ishon! Agar bugun tishingni tishingga qo'yib chidabsan, ertaga maydonda hamma sening ismingni qichqiradi. Taslim bo'lish yo'q. Orqaga yo'l yo'q. Faqat oldinga, faqat cho'qqiga! Biz bilan birga ekanmisan, oxirigacha.
              </p>
            </div>
          </motion.section>
          
          {/* Footer Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 text-center"
          >
            <div className="max-w-3xl mx-auto rounded-2xl p-px bg-gradient-to-b from-white/20 to-white/5">
              <div className="bg-[#030303] px-8 py-8 md:py-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10">
                <div className="text-left">
                  <h4 className="font-heading text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                    O'zgarishni hozirdan boshla
                  </h4>
                  <p className="text-sm text-stone-400 font-normal">Ertaga emas, dushanbadan emas. Hozir.</p>
                </div>
                <button 
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                  className="px-8 py-4 bg-white hover:bg-stone-200 text-black font-heading font-bold text-xs uppercase tracking-widest transition-all duration-300 rounded-xl shadow-glow flex items-center gap-2.5 shrink-0 transform hover:-translate-y-0.5"
                >
                  Tizimga Qaytish <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </PageTransition>
  );
};

export default ManifestoPage;
