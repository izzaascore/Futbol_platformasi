import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import React, { useRef, useState, useEffect } from 'react';
import { ArrowRight, PlayCircle, ChevronRight, Activity, TrendingUp, Trophy, Sparkles, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import LegendModal from '../components/LegendModal';

const TiltCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const handleMouseMove = (e) => {
    const rect = e.target.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      <div style={{ transform: "translateZ(50px)" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

const HomePage = ({ openModal }) => {
  const [activeLegend, setActiveLegend] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, []);

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 text-stone-100 overflow-hidden font-sans relative selection:bg-amber-500/30">
        
        {/* Dynamic Global Glow following mouse */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-20 mix-blend-screen transition-all duration-300 ease-out"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(217, 119, 6, 0.15), transparent 40%)`
          }}
        />

        {/* =========================================
            1. CINEMATIC HERO SECTION
        ========================================= */}
        <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y: yHero, opacity: opacityHero }}
          >
            <img 
              src="/images/stadium.jpg" 
              alt="Cinematic Stadium" 
              className="w-full h-full object-cover scale-105"
            />
            {/* Ultra Premium Glassmorphism overlays */}
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-950/50 to-transparent"></div>
          </motion.div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-center mt-20">
            
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl lg:w-3/5"
            >
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-stone-900/40 border border-amber-500/30 backdrop-blur-xl mb-8 shadow-[0_0_30px_rgba(217,119,6,0.15)]">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="text-xs font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500 uppercase">
                  Yangi Davr Skauting Platformasi
                </span>
              </div>
              
              <h1 className="text-6xl sm:text-8xl font-black tracking-tighter leading-[0.95] text-white mb-8">
                Kelajakni <br/>
                <span className="relative">
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-500 to-amber-700">bugun quring.</span>
                  <div className="absolute -bottom-2 left-0 w-full h-4 bg-amber-500/20 blur-xl z-0"></div>
                </span>
              </h1>
              
              <p className="text-xl text-stone-300 font-light leading-relaxed max-w-xl mb-12 border-l-2 border-amber-500/50 pl-6 bg-gradient-to-r from-amber-500/5 to-transparent py-2">
                FootballRise — oddiy statistika emas, bu sizning professional futbolga kirish chiptangiz. 
                AI tahlillar, premium kartalar va to'g'ridan-to'g'ri klublar bilan aloqa.
              </p>
              
              <div className="flex flex-wrap items-center gap-5">
                <Link to="/players" className="group relative px-8 py-5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-black text-sm uppercase tracking-widest overflow-hidden rounded-md flex items-center gap-3 shadow-[0_0_40px_rgba(217,119,6,0.4)] hover:shadow-[0_0_60px_rgba(217,119,6,0.6)] hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute inset-0 w-full h-full bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-0"></div>
                  <span className="relative z-10">Kashf Etish</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <button onClick={() => openModal && openModal('register')} className="px-8 py-5 bg-stone-900/50 backdrop-blur-md border border-stone-700 hover:border-white text-white font-bold text-sm uppercase tracking-widest hover:bg-white hover:text-stone-950 transition-all duration-300 rounded-md flex items-center group">
                  <Globe className="w-5 h-5 mr-3 text-stone-400 group-hover:text-stone-950 transition-colors" /> Klublar uchun
                </button>
              </div>
            </motion.div>

            {/* Right Content - 3D Interactive Elements */}
            <div className="hidden lg:flex lg:w-2/5 justify-end relative perspective-[1000px] h-[600px] items-center mt-10 lg:mt-0">
              
              <TiltCard className="relative w-80 h-[450px] bg-stone-900/80 backdrop-blur-2xl border border-stone-700/50 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_40px_rgba(217,119,6,0.15)] overflow-hidden">
                {/* Neon Top Bar */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                
                <div className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="bg-stone-950 border border-stone-800 p-3 rounded-xl shadow-inner">
                      <div className="text-4xl font-black text-amber-500 leading-none">88</div>
                      <div className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mt-1">OVR</div>
                    </div>
                    <div className="px-3 py-1 bg-stone-800/50 rounded-full border border-stone-700 backdrop-blur-md text-[10px] font-bold text-white uppercase tracking-widest">
                      Hujumchi
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col items-center justify-center mt-[-20px]">
                    <div className="relative w-32 h-32 mb-4 group">
                      <div className="absolute inset-0 bg-amber-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                      <img src="/images/player.jpg" className="relative z-10 w-full h-full rounded-full object-cover border-4 border-stone-800 shadow-xl" alt="Player" />
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-stone-950 p-1.5 rounded-full border-2 border-stone-900 shadow-lg">
                        <Shield className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight uppercase">Azizbek K.</h3>
                    <p className="text-stone-400 text-sm flex items-center gap-2 mt-1"><Globe className="w-3 h-3"/> O'zbekiston</p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-6 p-4 bg-stone-950/50 rounded-xl border border-stone-800/50 backdrop-blur-sm">
                    <div className="text-center"><div className="text-lg font-black text-white">89</div><div className="text-[9px] text-stone-500 font-bold tracking-widest uppercase">PAC</div></div>
                    <div className="text-center"><div className="text-lg font-black text-amber-400">92</div><div className="text-[9px] text-stone-500 font-bold tracking-widest uppercase">SHO</div></div>
                    <div className="text-center"><div className="text-lg font-black text-white">81</div><div className="text-[9px] text-stone-500 font-bold tracking-widest uppercase">DRI</div></div>
                  </div>
                </div>
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </TiltCard>

              {/* Floating Activity Badge */}
              <motion.div 
                animate={{ y: [-15, 15, -15] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                className="absolute bottom-10 -left-16 bg-stone-900/90 backdrop-blur-xl border border-stone-700 p-4 rounded-xl shadow-2xl flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Skautlar Tahlili</div>
                  <div className="text-xl font-black text-white flex items-center gap-2">9.4 <TrendingUp className="w-4 h-4 text-green-400"/></div>
                </div>
              </motion.div>

            </div>
          </div>
          
          {/* Scroll Down Indicator */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Pastga</span>
            <div className="w-0.5 h-12 bg-gradient-to-b from-amber-500 to-transparent"></div>
          </motion.div>
        </section>

        {/* =========================================
            2. IMMERSIVE STATS BANNERS
        ========================================= */}
        <section className="py-20 bg-stone-950 relative border-t border-stone-900 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
              {[
                { label: "Ro'yxatdan o'tganlar", val: "1,240+", icon: <Globe className="w-6 h-6 text-amber-500/50 mb-4" /> },
                { label: "Skautlar", val: "48", icon: <Shield className="w-6 h-6 text-amber-500/50 mb-4" /> },
                { label: "Analizlar", val: "15K+", icon: <Activity className="w-6 h-6 text-amber-500/50 mb-4" /> },
                { label: "Transferlar", val: "12", icon: <Trophy className="w-6 h-6 text-amber-500/50 mb-4" /> }
              ].map((stat, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-stone-900/40 backdrop-blur-md border border-stone-800 hover:border-amber-500/50 p-8 rounded-2xl flex flex-col items-center text-center transition-all group shadow-lg"
                >
                  {stat.icon}
                  <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter group-hover:text-amber-500 transition-colors">{stat.val}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            3. FEATURES - GLASSMORPHISM CARDS
        ========================================= */}
        <section className="py-32 bg-stone-950 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-6 uppercase">
                Haqiqiy raqamlar. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-stone-400 to-stone-600">Haqiqiy imkoniyatlar.</span>
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "To'liq Analitika", text: "Matchdagi harakatingiz ilg'or sun'iy idrok orqali professional kartalarga aylanadi.", no: "01" },
                { title: "To'g'ridan-to'g'ri Skauting", text: "Klublar o'z talablariga mos o'yinchilarni to'g'ridan-to'g'ri izlab topishadi va shartnoma taklif qilishadi.", no: "02" },
                { title: "Karyera O'sishi", text: "Turnirlarda qatnashib, ma'lumotlaringizni yangilang va top-klublar e'tiboriga tushing.", no: "03" }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="relative group p-10 bg-stone-900/30 border border-stone-800 rounded-2xl hover:bg-stone-900/80 hover:border-amber-500/50 transition-all duration-500 overflow-hidden shadow-xl"
                >
                  <div className="absolute -top-10 -right-10 text-9xl font-black text-stone-800/30 group-hover:text-amber-500/10 transition-colors italic pointer-events-none">
                    {item.no}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase">{item.title}</h3>
                  <p className="text-stone-400 font-light leading-relaxed relative z-10">{item.text}</p>
                  
                  <div className="mt-8 w-12 h-1 bg-stone-800 group-hover:bg-amber-500 group-hover:w-full transition-all duration-500"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            4. LEGENDS / HEROES
        ========================================= */}
        <section className="py-32 bg-stone-950 relative border-t border-stone-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              
              <div className="w-full lg:w-1/2 relative perspective-[1000px]">
                <TiltCard className="relative w-full h-[600px] rounded-2xl overflow-hidden cursor-pointer shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-stone-800/50 hover:border-amber-500/30 transition-colors">
                  <img 
                    src="https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?q=80&w=1500&auto=format&fit=crop" 
                    alt="Legend Portrait" 
                    className="absolute inset-0 w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent pointer-events-none"></div>
                  
                  <div className="absolute bottom-0 left-0 p-10 pointer-events-none">
                    <h3 className="text-6xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-lg">C. Ronaldo</h3>
                    <div className="flex gap-4 mb-4">
                      <span className="px-3 py-1 bg-amber-500 text-stone-950 text-xs font-bold uppercase rounded-sm shadow-lg">Afsona</span>
                      <span className="px-3 py-1 bg-stone-900/80 text-white border border-stone-700 text-xs font-bold uppercase backdrop-blur-md rounded-sm">Motivatsiya</span>
                    </div>
                  </div>
                </TiltCard>
              </div>

              <div className="w-full lg:w-1/2 space-y-8">
                <h2 className="text-5xl font-black tracking-tight text-white uppercase">
                  Tarixga Muhirlangan <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Afsonalar</span>
                </h2>
                <p className="text-stone-400 leading-relaxed text-lg font-light">
                  Ularning bosib o'tgan yo'li, tinimsiz mehnati va erishgan natijalari har bir yosh futbolchi uchun tirik o'rnakdir. O'z ustingizda ishlashdan to'xtamang.
                </p>
                <button 
                  onClick={() => setActiveLegend('ronaldo')}
                  className="group flex items-center gap-4 px-6 py-4 bg-stone-900/80 backdrop-blur-md border border-stone-700 hover:border-amber-500 rounded-xl transition-all w-fit shadow-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-stone-950 flex items-center justify-center group-hover:bg-amber-500 transition-colors shadow-inner">
                    <PlayCircle className="w-5 h-5 text-stone-400 group-hover:text-stone-950" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold uppercase text-sm">Hikoyani ko'rish</div>
                    <div className="text-stone-500 text-xs font-bold uppercase tracking-widest">Video format</div>
                  </div>
                </button>
              </div>

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
            <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]" />
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-6 uppercase drop-shadow-xl">
              O'z tarixingizni <br/> bugundan yozing
            </h2>
            <p className="text-stone-300 text-lg font-light mb-10 max-w-2xl mx-auto bg-stone-900/40 p-4 rounded-xl backdrop-blur-md border border-stone-800/50">
              Professional profil yarating, o'yinlaringiz videosini yuklang va butun dunyo skautlari e'tiboriga tushing. Katta futbol endi sizga yaqin.
            </p>
            <button onClick={() => openModal && openModal('register')} className="inline-flex px-10 py-5 bg-gradient-to-r from-white to-stone-200 text-stone-950 hover:from-amber-400 hover:to-amber-600 hover:text-white font-black uppercase tracking-widest text-sm transition-all duration-300 rounded-md shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_10px_40px_rgba(217,119,6,0.5)] hover:-translate-y-1">
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
