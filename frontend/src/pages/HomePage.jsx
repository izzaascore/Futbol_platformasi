import { motion, useScroll, useTransform } from "framer-motion";
import React, { useRef, useState } from 'react';
import { ArrowRight, PlayCircle, ChevronRight, Activity, TrendingUp, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import LegendModal from '../components/LegendModal';

const HomePage = ({ openModal }) => {
  const [activeLegend, setActiveLegend] = useState(null);
  
  // Scroll animation setup
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 text-stone-100 overflow-hidden font-sans">
        
        {/* =========================================
            1. CINEMATIC HERO SECTION
        ========================================= */}
        <section className="relative h-[90vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden">
          {/* Background Image with Parallax */}
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y: yHero, opacity: opacityHero }}
          >
            <img 
              src="/images/stadium.jpg" 
              alt="Cinematic Stadium" 
              className="w-full h-full object-cover"
            />
            {/* Professional Dark Overlay & Gradients */}
            <div className="absolute inset-0 bg-stone-950/40 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/30 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center mt-12">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/50 border border-stone-700/50 backdrop-blur-md mb-6">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span className="text-xs font-bold tracking-widest text-stone-300 uppercase">Professional Scouting Platform</span>
              </div>
              
              <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter leading-[1.05] text-white mb-6">
                Kelajak yulduzlarini <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">bugundan toping.</span>
              </h1>
              
              <p className="text-lg text-stone-400 font-light leading-relaxed max-w-xl mb-10">
                FootballRise — bu iqtidorli yoshlar va professional klublarni bog'lovchi yagona professional tizim. O'z mahoratingizni ko'rsating, statistikalaringizni tasdiqlang va katta futbolga qadam qo'ying.
              </p>
              
              <div className="flex flex-wrap items-center gap-4">
                <Link to="/players" className="group relative px-8 py-4 bg-amber-600 text-white font-bold text-xs uppercase tracking-widest overflow-hidden rounded-sm flex items-center gap-3 shadow-[0_0_20px_rgba(217,119,6,0.2)] hover:shadow-[0_0_30px_rgba(217,119,6,0.4)] transition-shadow">
                  <div className="absolute inset-0 w-full h-full bg-amber-500 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-0"></div>
                  <span className="relative z-10">Iqtidorlarni kashf etish</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <Link to="/live" className="px-8 py-4 bg-stone-900 border border-red-500/50 hover:bg-stone-800 hover:border-red-500 text-white font-bold text-xs uppercase tracking-widest transition-all rounded-sm flex items-center gap-2 group shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                  <Activity className="w-4 h-4 text-red-500 group-hover:animate-pulse" /> Live Center
                </Link>
                
                <Link to="/scouts" className="px-8 py-4 bg-transparent border border-stone-600 text-stone-200 font-bold text-xs uppercase tracking-widest hover:border-white hover:text-white transition-colors duration-300 rounded-sm flex items-center group">
                  Klublar uchun <PlayCircle className="w-4 h-4 ml-2 text-amber-500 group-hover:scale-110 transition-transform" />
                </Link>
              </div>
            </motion.div>

            {/* Right Content - Floating UI Statistics elements (Real UI feel) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block relative w-[400px] h-[500px]"
            >
              {/* Player Profile Card Snippet */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="absolute top-10 right-0 w-64 bg-stone-900/80 backdrop-blur-xl border border-stone-700/50 rounded-xl p-4 shadow-2xl"
              >
                <div className="flex gap-4 items-center border-b border-stone-800 pb-4 mb-4">
                  <img src="/images/player.jpg" className="w-14 h-14 rounded-full object-cover border-2 border-amber-500" alt="Player" />
                  <div>
                    <h4 className="font-bold text-white text-sm">Azizbek Karimov</h4>
                    <p className="text-xs text-stone-400">CM • 17 • O'zbekiston</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div><div className="text-lg font-bold text-amber-400">82</div><div className="text-[9px] text-stone-500 uppercase tracking-widest">PAC</div></div>
                  <div><div className="text-lg font-bold text-white">86</div><div className="text-[9px] text-stone-500 uppercase tracking-widest">PAS</div></div>
                  <div><div className="text-lg font-bold text-white">71</div><div className="text-[9px] text-stone-500 uppercase tracking-widest">SHO</div></div>
                </div>
              </motion.div>

              {/* Scouting Activity Snippet */}
              <motion.div 
                animate={{ y: [0, 15, 0] }} 
                transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -left-10 w-72 bg-stone-900/90 backdrop-blur-xl border border-stone-700/50 rounded-xl p-5 shadow-2xl"
              >
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Scout Rating</span>
                  <Activity className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-4xl font-bold text-white leading-none">9.4</span>
                  <span className="text-sm font-medium text-green-400 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> +1.2</span>
                </div>
                <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mt-3">
                  <motion.div initial={{ width: 0 }} animate={{ width: "94%" }} transition={{ duration: 1.5, delay: 1 }} className="h-full bg-gradient-to-r from-amber-600 to-amber-400"></motion.div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* =========================================
            2. SCROLL STORYTELLING - THE PLATFORM
        ========================================= */}
        <section className="py-32 bg-stone-950 relative border-t border-stone-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              {/* Image Collage (Asymmetric Design) */}
              <div className="w-full lg:w-1/2 relative h-[600px]">
                <motion.div 
                  initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
                  className="absolute top-0 left-0 w-3/4 h-[400px] rounded-sm overflow-hidden z-10"
                >
                  <img src="/images/player.jpg" className="w-full h-full object-cover" alt="Match Action" />
                  <div className="absolute inset-0 bg-stone-900/20 mix-blend-overlay"></div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: 0.2 }}
                  className="absolute bottom-0 right-0 w-2/3 h-[350px] rounded-sm overflow-hidden z-20 border-8 border-stone-950 shadow-2xl"
                >
                  <img src="/images/scout.jpg" className="w-full h-full object-cover" alt="Scouting" />
                </motion.div>
              </div>

              {/* Content */}
              <div className="w-full lg:w-1/2 space-y-10">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                  <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Haqiqiy raqamlar.<br/>Haqiqiy imkoniyatlar.</h2>
                  <p className="text-stone-400 leading-relaxed text-lg font-light">
                    FootballRise orqali siz shunchaki profil yaratmaysiz, balki professional futbol industriyasiga to'g'ridan-to'g'ri bog'lanasiz. Har bir golingiz, tezligingiz va uzatmangiz skautlar tahlilida o'z aksini topadi.
                  </p>
                </motion.div>

                <div className="space-y-6">
                  {[
                    { title: "To'liq Analitika", text: "Matchdagi harakatingiz algoritmlar orqali professional kartalarga aylanadi.", no: "01" },
                    { title: "To'g'ridan-to'g'ri Skauting", text: "Klublar o'z talablariga mos o'yinchilarni to'g'ridan-to'g'ri izlab topishadi.", no: "02" },
                    { title: "Tasdiqlangan Turnirlar", text: "Rasmiy musobaqalarda qatnashib, ma'lumotlaringiz ishonchliligini oshiring.", no: "03" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                      className="group flex gap-6 p-6 border border-stone-800 bg-stone-900/30 hover:bg-stone-900/80 transition-colors rounded-sm cursor-pointer"
                    >
                      <div className="text-2xl font-bold text-stone-700 group-hover:text-amber-500 transition-colors font-serif italic">{item.no}</div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-stone-400 text-sm font-light leading-relaxed">{item.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3. REALISTIC DATA & STATS SECTION
        ========================================= */}
        <section className="py-24 bg-stone-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <img src="/images/stadium.jpg" className="w-full h-full object-cover filter grayscale" alt="Stadium Texture" />
            <div className="absolute inset-0 bg-stone-900 mix-blend-multiply"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-stone-700/50 border border-stone-700/50 bg-stone-950/80 backdrop-blur-xl p-8 rounded-sm">
              {[
                { label: "Faol Iqtidorlar", val: "1,240+" },
                { label: "Klublar va Skautlar", val: "48" },
                { label: "Tasdiqlangan Statistika", val: "15,800" },
                { label: "Muvaffaqiyatli Transfer", val: "12" }
              ].map((stat, i) => (
                <div key={i} className="pt-6 md:pt-0 md:px-8 first:pt-0 first:px-0 text-center md:text-left flex flex-col justify-center">
                  <div className="text-5xl font-bold text-white mb-2 tracking-tighter">{stat.val}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-amber-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            3.5. SHOWCASE EVENTS & TRIAL MATCHES
        ========================================= */}
        <section className="py-24 bg-stone-950 relative border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 uppercase">
                <span className="text-amber-500">FootballRise</span> Showcase
              </h2>
              <p className="text-stone-400 max-w-2xl text-lg font-light">
                Platformadagi eng yaxshi 50 nafar yoshlar maxsus jonli seleksiya o'yinlariga taklif etiladi. Professional murabbiylar qarshisida o'z qobiliyatingizni ko'rsating.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="relative h-[400px] bg-stone-900 rounded-lg overflow-hidden group">
                <img src="https://images.unsplash.com/photo-1574629810360-7efbb6b667cb?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 grayscale group-hover:grayscale-0" alt="Showcase Event" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Live
                    </span>
                    <span className="text-stone-300 text-sm">24-Oktabr, Toshkent</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-2">Toshkent Seleksiya Festivali</h3>
                  <p className="text-stone-400 max-w-md">Oliy liga klublari skautlari kuzatuvidagi katta uchrashuv.</p>
                </div>
              </div>

              <div className="flex flex-col justify-center space-y-6">
                <div className="p-6 border border-stone-800 bg-stone-900/50 rounded-lg hover:border-amber-500/50 transition-colors">
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><PlayCircle className="text-amber-500 w-5 h-5"/> Live Translyatsiya</h4>
                  <p className="text-stone-400 text-sm">Barcha o'yinlar FootballRise Cam orqali saytda to'g'ridan-to'g'ri namoyish etiladi.</p>
                </div>
                <div className="p-6 border border-stone-800 bg-stone-900/50 rounded-lg hover:border-amber-500/50 transition-colors">
                  <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Trophy className="text-amber-500 w-5 h-5"/> Top 50 Iqtidor</h4>
                  <p className="text-stone-400 text-sm">Saytdagi eng yuqori reytingli o'yinchilar qatnashish huquqini bepul qo'lga kiritadi.</p>
                </div>
                <Link to="/tournaments" className="inline-flex justify-center items-center px-6 py-4 border border-stone-700 hover:bg-stone-800 text-white font-bold uppercase tracking-widest text-xs transition-colors rounded-sm mt-4">
                  Barcha turnirlar <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            3.6. VIDEO BATTLE / SKILLS CHALLENGE
        ========================================= */}
        <section className="py-24 bg-stone-900 relative border-t border-stone-800 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-stone-900 mix-blend-multiply"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 uppercase text-white">
                  Skills <span className="text-amber-500">Challenge</span>
                </h2>
                <p className="text-stone-400 max-w-xl text-lg font-light">
                  Haftaning eng yaxshi finti yoki goli! O'z videongizni yuklang va ovoz to'plab "Hafta Iqtidoriga" aylaning.
                </p>
              </div>
              <button className="mt-6 md:mt-0 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm uppercase tracking-widest rounded-sm transition-colors shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                Jangga qo'shilish
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Javohir T.", votes: 450, tag: "Best Freekick", img: "https://images.unsplash.com/photo-1518605368461-1ee7e5241416?q=80&w=600&auto=format&fit=crop" },
                { name: "Bekzod R.", votes: 382, tag: "Crazy Dribbling", img: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600&auto=format&fit=crop" },
                { name: "Sardor M.", votes: 310, tag: "Long Shot", img: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop" }
              ].map((battle, i) => (
                <div key={i} className={`relative bg-stone-950 rounded-lg overflow-hidden border ${i === 0 ? 'border-amber-500' : 'border-stone-800'} group`}>
                  {i === 0 && <div className="absolute top-0 left-0 bg-amber-500 text-stone-950 text-xs font-bold uppercase tracking-widest px-3 py-1 z-20">Hozirgi Lider</div>}
                  <div className="relative h-64 overflow-hidden">
                    <img src={battle.img} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500" alt="Skill" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <PlayCircle className="w-12 h-12 text-white/80" />
                    </div>
                  </div>
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-white text-lg">{battle.name}</h4>
                      <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">{battle.tag}</p>
                    </div>
                    <button className="flex flex-col items-center justify-center w-12 h-12 bg-stone-900 border border-stone-700 hover:border-amber-500 rounded-md transition-colors">
                      <TrendingUp className="w-4 h-4 text-white mb-1" />
                      <span className="text-[10px] text-stone-400 font-bold">{battle.votes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            4. LEGENDS / HEROES (Awards-style Section)
        ========================================= */}
        <section className="py-32 bg-stone-950 relative border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center mb-20 text-center">
              <h2 className="text-5xl font-bold tracking-tight mb-4 uppercase">
                Tarixga Muhirlangan <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-500 to-stone-300">Afsonalar</span>
              </h2>
              <p className="text-stone-400 max-w-2xl text-lg font-light">
                Ularning bosib o'tgan yo'li, tinimsiz mehnati va erishgan natijalari har bir yosh futbolchi uchun tirik o'rnakdir.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Legend 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                className="group relative h-[600px] bg-stone-900 overflow-hidden cursor-pointer"
                onClick={() => setActiveLegend('ronaldo')}
              >
                <img 
                  src="https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=1500&auto=format&fit=crop" 
                  alt="Legend Portrait" 
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex gap-4 mb-6 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-stone-900/80 backdrop-blur-md px-4 py-2 border border-stone-700">
                      <div className="text-xl font-bold text-white">5x</div>
                      <div className="text-[9px] uppercase tracking-widest text-stone-400">Oltin To'p</div>
                    </div>
                    <div className="bg-stone-900/80 backdrop-blur-md px-4 py-2 border border-stone-700">
                      <div className="text-xl font-bold text-white">900+</div>
                      <div className="text-[9px] uppercase tracking-widest text-stone-400">Gollar</div>
                    </div>
                  </div>
                  
                  <h3 className="text-5xl font-bold text-white mb-2 uppercase tracking-tighter">Cristiano<br/>Ronaldo</h3>
                  <div className="w-12 h-1 bg-amber-500 mb-4 group-hover:w-full transition-all duration-700"></div>
                  <p className="text-stone-300 font-light max-w-sm line-clamp-2">
                    "Men iste'dodli bo'lishim mumkin, ammo muvaffaqiyatim siri – bu tinimsiz va qattiq mehnat."
                  </p>
                </div>
              </motion.div>

              {/* Legend 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}
                className="group relative h-[600px] bg-stone-900 overflow-hidden cursor-pointer"
                onClick={() => setActiveLegend('ahmedov')}
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fe/Odil_Ahmedov.jpg" 
                  alt="Odil Ahmedov" 
                  className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000 ease-out grayscale group-hover:grayscale-0"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                
                <div className="absolute inset-0 p-10 flex flex-col justify-end">
                  <div className="flex gap-4 mb-6 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="bg-stone-900/80 backdrop-blur-md px-4 py-2 border border-stone-700">
                      <div className="text-xl font-bold text-white">6x</div>
                      <div className="text-[9px] uppercase tracking-widest text-stone-400">Eng Yaxshi</div>
                    </div>
                    <div className="bg-stone-900/80 backdrop-blur-md px-4 py-2 border border-stone-700">
                      <div className="text-xl font-bold text-white">108</div>
                      <div className="text-[9px] uppercase tracking-widest text-stone-400">MTJ O'yinlar</div>
                    </div>
                  </div>
                  
                  <h3 className="text-5xl font-bold text-white mb-2 uppercase tracking-tighter">Odil<br/>Ahmedov</h3>
                  <div className="w-12 h-1 bg-amber-500 mb-4 group-hover:w-full transition-all duration-700"></div>
                  <p className="text-stone-300 font-light max-w-sm line-clamp-2">
                    O'zbek futbolining tirik afsonasi. Qishloq maydonlaridan Yevropa yashil maydonlarigacha.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* =========================================
            5. CALL TO ACTION - REALISTIC UI
        ========================================= */}
        <section className="py-24 relative overflow-hidden bg-stone-900">
          <div className="absolute inset-0 w-full h-full">
            <img src="/images/stadium.jpg" alt="Football Pitch" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-sm"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 uppercase">
              O'z tarixingizni <br/> bugundan yozing
            </h2>
            <p className="text-stone-300 text-lg font-light mb-10 max-w-2xl mx-auto">
              Professional profil yarating, o'yinlaringiz videosini yuklang va butun dunyo skautlari e'tiboriga tushing. Katta futbol endi sizga yaqin.
            </p>
            <button onClick={() => openModal && openModal('register')} className="inline-flex px-10 py-5 bg-white text-stone-950 hover:bg-amber-500 hover:text-white font-bold uppercase tracking-widest text-sm transition-colors duration-300 rounded-sm">
              Iqtidorlar safiga qo'shilish
            </button>
          </div>
        </section>

      </div>
      
      {activeLegend && (
        <LegendModal legendId={activeLegend} onClose={() => setActiveLegend(null)} />
      )}
    </PageTransition>
  );
};

export default HomePage;
