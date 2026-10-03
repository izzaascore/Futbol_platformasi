import { motion } from "framer-motion";
import React from 'react';
import { Camera, Battery, Wifi, Video, ArrowRight, ShieldCheck, Zap, Share2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ShopPage = () => {
  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200">
        
        {/* HERO: Product Showcase */}
        <section className="relative h-[85vh] min-h-[700px] w-full flex items-center justify-center overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-stone-950 mix-blend-multiply"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/30 via-stone-950 to-stone-950 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-12 mt-16">
            
            {/* Left: Text & CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:w-1/2 max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 border border-stone-800 rounded-sm mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Stokda Mavjud</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter text-white uppercase mb-4 leading-none">
                FootballRise <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Cam Pro</span>
              </h1>
              
              <p className="text-lg text-stone-400 font-light leading-relaxed mb-8">
                Libosingizga oson qistiriladigan magnitli ixcham dizayn. O'yinlaringizni 4K sifatda (POV) yozib oling va to'g'ridan-to'g'ri profilingizga sinxronlashtiring.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-12">
                <div className="text-4xl font-bold text-white">
                  3,450,000 <span className="text-lg text-stone-500">UZS</span>
                </div>
                <button className="px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.3)]">
                  Xarid qilish <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Key Features Quick List */}
              <div className="flex gap-8 border-t border-stone-800 pt-8">
                <div className="flex flex-col gap-1">
                  <Video className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="font-bold text-white text-sm">4K 60FPS</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">Ultra tiniq video</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-stone-800 pl-8">
                  <Wifi className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="font-bold text-white text-sm">Auto-Sync</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">Profilga to'g'ridan-to'g'ri</span>
                </div>
                <div className="flex flex-col gap-1 border-l border-stone-800 pl-8">
                  <Battery className="w-5 h-5 text-amber-500 mb-1" />
                  <span className="font-bold text-white text-sm">4 Soat</span>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest">Batareya quvvati</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Product Image/Render */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="lg:w-1/2 relative h-[500px] w-full flex justify-center items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 to-transparent z-10 w-1/4"></div>
              {/* Fake 3D Camera Render using high-quality Unsplash image */}
              <img 
                src="/images/camera.jpg" 
                alt="FootballRise Cam" 
                className="w-full h-full object-cover rounded-sm border border-stone-800 shadow-2xl z-0"
              />
              
              {/* Product UI Overlay */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -left-10 top-20 z-20 bg-stone-900/90 backdrop-blur-md border border-stone-700 p-4 rounded-sm shadow-2xl flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-amber-600 rounded-sm flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Sync Active</div>
                  <div className="text-sm font-bold text-white">Recording Match...</div>
                </div>
              </motion.div>
            </motion.div>

          </div>
        </section>

        {/* ECOSYSTEM INTEGRATION EXPLANATION */}
        <section className="py-24 bg-stone-900 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight text-white mb-4">Bir Kamera. <span className="text-amber-500">Cheksiz Imkoniyatlar.</span></h2>
            <p className="text-stone-400 font-light max-w-2xl mx-auto">FootballRise Cam faqat video yozmaydi. U sizning karyerangizni FootballRise ekotizimi orqali dunyo skautlariga olib chiqadigan ko'prikdir.</p>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-stone-800 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
              
              {[
                { icon: <Video className="w-8 h-8 text-amber-500" />, title: "1. Yozib olish", text: "Kamerani libosingizga magnit orqali qistiring va o'yinni 4K POV sifatda yozib oling." },
                { icon: <Zap className="w-8 h-8 text-amber-500" />, title: "2. Avto-Sinxronizatsiya", text: "O'yin tugashi bilan video avtomatik tarzda FootballRise profilingizga yuklanadi." },
                { icon: <Share2 className="w-8 h-8 text-amber-500" />, title: "3. Tahlil va Qirqish", text: "Platformada o'z harakatlaringizni ajratib olib, 'Highlights' tayyorlang." },
                { icon: <ShieldCheck className="w-8 h-8 text-amber-500" />, title: "4. Skautlar Nigohida", text: "Tayyor videolarni skautlar va klublar ko'rib chiqadi hamda sizga taklif jo'natadi." }
              ].map((step, i) => (
                <div key={i} className="bg-stone-950 border border-stone-800 p-8 rounded-sm text-center relative group hover:border-amber-500/50 transition-colors">
                  <div className="w-20 h-20 mx-auto bg-stone-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-tight mb-3">{step.title}</h3>
                  <p className="text-sm font-light text-stone-400 leading-relaxed">{step.text}</p>
                </div>
              ))}
              
            </div>
          </div>
        </section>

      </div>
    </PageTransition>
  );
};

export default ShopPage;
