import { motion } from "framer-motion";
import React from 'react';
import { Newspaper, Calendar, ArrowRight, PlayCircle, Eye, Share2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const NewsPage = () => {
  const featuredArticle = {
    id: 1, 
    title: "Yangi avlod yulduzlari: O'zbekiston yoshlar terma jamoasi Qatarga yo'l olmoqda",
    date: "20 May, 2026",
    category: "Terma Jamoa",
    image: "/images/news/news_1551280857-2b9ebf241.jpg",
    excerpt: "Osiyo Kubogi arafasida bosh murabbiy jamoa tarkibini e'lon qildi. Tarkibda kutilmagan, ammo iqtidorli yoshlar bor."
  };

  const news = [
    { id: 2, title: "Futuro ekotizimi O'zbekiston PFL bilan rasmiy hamkorlikni boshladi", date: '18 May, 2026', category: 'Platforma', image: '/images/news/news_1518605368461-1eb5d0.jpg', excerpt: "Endilikda rasmiy o'yinlar statistikasi to'g'ridan-to'g'ri profilga ulanadi." },
    { id: 3, title: "Evropaning top skautlari qanday videolarga ko'proq e'tibor qaratadi?", date: '15 May, 2026', category: 'Scouting Tips', image: '/images/stadiums/stadiums_1522778119026-d647f0.jpg', excerpt: "Uzoq muddatli tahlillar shuni ko'rsatmoqdaki, qaror qabul qilish tezligi eng muhim faktor." },
    { id: 4, title: 'Yosh iqtidorlarni izlab: "Nasaf" akademiyasi yangi yig\'inga start berdi', date: '12 May, 2026', category: 'Akademiyalar', image: '/images/tournaments/tournaments_1589487391730-58f20e.jpg', excerpt: 'Markaziy hujumchilar va pleymeykerlar uchun ochiq eshiklar kuni e\'lon qilindi.' },
    { id: 5, title: 'Futuro Cam taqdimoti: Endi video yozib olish yanada oson', date: '10 May, 2026', category: 'Texnologiya', image: '/images/news/news_1516035069371-29a1b2.jpg', excerpt: 'Avto-sinxronizatsiya funksiyasiga ega birinchi portativ futbol kamerasi namoyish etildi.' },
  ];

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans">
        
        {/* Header */}
        <div className="border-b border-white/10 bg-[#030303] py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tighter text-white uppercase">
                Futuro <span className="text-amber-500">Media</span>
              </h1>
              <div className="hidden md:flex gap-6 text-xs font-bold uppercase tracking-widest text-stone-500">
                <span className="hover:text-amber-500 cursor-pointer transition-colors text-amber-500">Barchasi</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Scouting</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Texnologiya</span>
                <span className="hover:text-amber-500 cursor-pointer transition-colors">Intervyu</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Featured Article */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="w-full h-[500px] lg:h-[600px] relative overflow-hidden rounded-sm group cursor-pointer mb-12"
          >
            <img 
              src={featuredArticle.image} 
              alt={featuredArticle.title} 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
            
            <div className="absolute inset-0 p-8 lg:p-16 flex flex-col justify-end">
              <div className="inline-block px-4 py-1.5 bg-amber-600 text-white text-[10px] font-bold uppercase tracking-widest mb-6 self-start rounded-sm">
                Asosiy Xabar
              </div>
              <h2 className="text-4xl lg:text-6xl font-bold text-white tracking-tighter uppercase mb-4 max-w-4xl drop-shadow-lg leading-none">
                {featuredArticle.title}
              </h2>
              <p className="text-stone-300 font-light text-lg max-w-2xl mb-6">
                {featuredArticle.excerpt}
              </p>
              <div className="flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-stone-400">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-amber-500" /> {featuredArticle.date}</span>
                <span className="flex items-center gap-2"><Eye className="w-4 h-4 text-amber-500" /> 15k O'qish</span>
              </div>
            </div>
          </motion.div>

          {/* Editorial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.map((item, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                key={item.id} 
                className="group flex flex-col sm:flex-row gap-6 items-center bg-stone-900 border border-white/10 rounded-sm p-4 hover:border-white/20 transition-colors cursor-pointer"
              >
                <div className="w-full sm:w-1/3 h-48 sm:h-full relative overflow-hidden rounded-sm">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                </div>
                
                <div className="w-full sm:w-2/3 flex flex-col justify-between py-2">
                  <div className="mb-4">
                    <div className="text-[10px] text-amber-500 font-bold uppercase tracking-widest mb-2">{item.category}</div>
                    <h3 className="text-xl font-bold text-white tracking-tight uppercase leading-tight group-hover:text-amber-500 transition-colors mb-2">
                      {item.title}
                    </h3>
                    <p className="text-stone-400 font-light text-sm line-clamp-2">{item.excerpt}</p>
                  </div>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                    <button className="text-white hover:text-amber-500 transition-colors"><ArrowRight className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </PageTransition>
  );
};

export default NewsPage;
