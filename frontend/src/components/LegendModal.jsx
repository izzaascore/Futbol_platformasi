import React, { useEffect } from 'react';
import { X, Trophy, Target, Star, History, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const legendsData = {
  ronaldo: {
    name: "Cristiano Ronaldo",
    title: "Jahon Afsonasi",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/8/8c/Cristiano_Ronaldo_2018.jpg",
    bio: [
        "Kriştianu Ronaldu 1985-yil 5-fevralda Portugaliyaning Madeyra orolida tug'ilgan. Bolaligi juda qiyinchilikda o'tgan bo'lishiga qaramay, futbolga bo'lgan ulkan muhabbati uni yuksaklikka yetakladi. U dastlab 'Sporting' klubida o'zini ko'rsatdi.",
        "2003-yilda Ser Aleks Fergyuson uni 'Manchester Yunayted'ga olib keldi. Bu yerda u nafaqat Angliya, balki Yevropa futbolining eng yorqin yulduziga aylandi. Uning tinimsiz mehnati, mashg'ulotlarga bo'lgan 100% fidoiyligi barchaga o'rnakdir.",
        "Keyinchalik 'Real Madrid'da 450 ta gol urib, klub tarixidagi eng yaxshi to'purarga aylandi. Shundan so'ng 'Yuventus' va hozirda 'Al-Nassr' klublarida o'zining aqlbovar qilmas barqarorligini isbotlab kelmoqda.",
        "\"Men iste'dodli bo'lishim mumkin, ammo muvaffaqiyatim siri – bu tinimsiz va qattiq mehnat. Qachonki boshqalar dam olganda, men shug'ullanaman.\""
    ],
    stats: {
        goals: "900+",
        games: "1200+",
        assists: "250+"
    },
    trophies: [
        { name: "Oltin To'p", count: "5", image: "https://img.icons8.com/fluency/256/star.png" },
        { name: "YCHL Kubogi", count: "5", image: "https://img.icons8.com/fluency/256/trophy.png" },
        { name: "Oltin Butsa", count: "4", image: "https://img.icons8.com/fluency/256/football2.png" }
    ]
  },
  ahmedov: {
    name: "Odil Ahmedov",
    title: "O'zbekiston Faxri, Sardor",
    heroImage: "https://upload.wikimedia.org/wikipedia/commons/f/fe/Odil_Ahmedov.jpg",
    bio: [
        "Odil Ahmedov 1987-yil 25-noyabrda Namangan viloyatida tavallud topgan. Yoshligidanoq futbolga bo'lgan ishtiyoqi uni 'Paxtakor' akademiyasiga olib keldi va 2006-yildan asosiy tarkibda o'ynay boshladi.",
        "Uning maydondagi zakovati va texnikasi tezda xorij klublari e'tiborini tortdi. Rossiyaning 'Anji' va 'Krasnodar' klublarida o'zini haqiqiy yetakchi sifatida ko'rsatdi. Krasnodarda u muxlislar yoqimtoyiga aylandi.",
        "Xitoyning 'Shanxay SIPG' klubi safida Xitoy chempionligini qo'lga kiritdi. O'zbekiston milliy terma jamoasi safida 108 ta o'yin o'tkazib, uzoq yillar jamoa sardori sifatida maydonga tushdi.",
        "Odil Ahmedov – nafaqat ajoyib futbolchi, balki yoshlarimiz uchun haqiqiy professionalizm va kamtarlik timsolidir."
    ],
    stats: {
        goals: "40+",
        games: "500+",
        assists: "60+"
    },
    trophies: [
        { name: "Yil O'yinchisi", count: "6", image: "https://img.icons8.com/fluency/256/trophy.png" },
        { name: "Xitoy Chempioni", count: "1", image: "https://img.icons8.com/fluency/256/star.png" },
        { name: "O'zb. Chempioni", count: "2", image: "https://img.icons8.com/fluency/256/football2.png" }
    ]
  }
};

const LegendModal = ({ legendId, onClose }) => {
  const legend = legendsData[legendId];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!legend) return null;

  return (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose}></div>
        
        <motion.div 
          initial={{ y: 50, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="relative w-full max-w-5xl bg-stone-900 border border-stone-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh]"
        >
          <style>{`
            @keyframes spinY {
              from { transform: rotateY(0deg); }
              to { transform: rotateY(360deg); }
            }
            .trophy-spin {
              animation: spinY 8s linear infinite;
              transform-style: preserve-3d;
            }
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 10px; }
          `}</style>

          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 p-2 bg-black/40 hover:bg-red-500/80 text-white rounded-full transition-colors backdrop-blur-md"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full md:w-5/12 bg-stone-950 flex flex-col relative overflow-hidden shrink-0 border-r border-stone-800">
            <div className="relative h-64 md:h-1/2 w-full">
              <img src={legend.heroImage} alt={legend.name} className="w-full h-full object-cover object-top opacity-80" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h2 className="text-4xl font-serif font-bold text-white mb-1 drop-shadow-lg">{legend.name}</h2>
                <p className="text-amber-500 font-medium tracking-wider text-sm uppercase">{legend.title}</p>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950"></div>
                
                <h3 className="text-stone-400 font-bold uppercase tracking-[0.2em] text-xs mb-8 text-center relative z-10 flex items-center justify-center gap-2">
                    <Award className="w-4 h-4 text-amber-500"/> Asosiy Sovrinlar
                </h3>
                
                <div className="flex justify-around items-end relative z-10 gap-2">
                    {legend.trophies.map((trophy, idx) => (
                        <div key={idx} className="flex flex-col items-center group perspective-[1000px] w-1/3">
                            <div className="relative w-full h-32 flex justify-center items-end pb-4">
                                <div className="absolute bottom-0 w-20 h-8 bg-gradient-to-t from-white/10 to-white/30 backdrop-blur-xl border border-white/20 rounded-[100%] shadow-[0_0_20px_rgba(245,158,11,0.2)] flex items-center justify-center transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                                    <div className="w-12 h-4 border border-white/30 rounded-[100%] shadow-inner"></div>
                                </div>
                                <div className="relative z-10 w-20 h-20 trophy-spin">
                                    <img 
                                        src={trophy.image} 
                                        alt={trophy.name} 
                                        className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(245,158,11,0.3)] group-hover:drop-shadow-[0_15px_25px_rgba(245,158,11,0.6)] transition-all duration-500" 
                                        style={{ transform: 'translateZ(15px)' }}
                                    />
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <span className="block text-2xl font-bold text-amber-500">{trophy.count}x</span>
                                <span className="block text-[9px] text-stone-400 uppercase tracking-wider h-8 overflow-hidden">{trophy.name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>

          <div className="w-full md:w-7/12 bg-stone-900 p-6 md:p-10 overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-stone-800">
                <History className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-serif font-bold text-white">Hayot Yo'li</h3>
            </div>
            
            <div className="space-y-6 text-stone-300 font-light leading-relaxed text-sm md:text-base">
                {legend.bio.map((paragraph, idx) => (
                    <p key={idx} className={idx === legend.bio.length - 1 && paragraph.startsWith('"') ? "italic text-amber-400 font-medium p-4 border-l-4 border-amber-500 bg-amber-950/20" : ""}>
                        {paragraph}
                    </p>
                ))}
            </div>

            <div className="mt-10 pt-8 border-t border-stone-800 grid grid-cols-3 gap-4">
                <div className="bg-stone-950/50 p-4 rounded-2xl border border-stone-800 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{legend.stats.games}</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">O'yinlar</p>
                </div>
                <div className="bg-stone-950/50 p-4 rounded-2xl border border-stone-800 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{legend.stats.goals}</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Gollar</p>
                </div>
                <div className="bg-stone-950/50 p-4 rounded-2xl border border-stone-800 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{legend.stats.assists}</p>
                    <p className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">Uzatma</p>
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
  );
};

export default LegendModal;
