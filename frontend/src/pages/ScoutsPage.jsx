import { motion } from "framer-motion";
import React, { useState } from 'react';
import { Target, Search, FileText, CheckCircle, Clock, ShieldCheck, Mail, MapPin, Eye, Zap, BookMarked, Filter } from 'lucide-react';
import PageTransition from '../components/PageTransition';

// Custom SVG Radar Chart component (no dependencies)
const RadarChart = () => {
  return (
    <div className="relative w-full aspect-square max-w-[250px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]">
        {/* Web/Grid */}
        {[20, 40, 60, 80, 100].map(r => (
          <polygon key={r} points={`50,${50-r*0.45} ${50+r*0.4*0.866},${50-r*0.4*0.5} ${50+r*0.4*0.866},${50+r*0.4*0.5} 50,${50+r*0.45} ${50-r*0.4*0.866},${50+r*0.4*0.5} ${50-r*0.4*0.866},${50-r*0.4*0.5}`} fill="none" stroke="rgba(120,113,108,0.2)" strokeWidth="0.5"/>
        ))}
        {/* Axes */}
        <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        <line x1="11" y1="27.5" x2="89" y2="72.5" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        <line x1="11" y1="72.5" x2="89" y2="27.5" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        
        {/* Data Polygon */}
        <polygon 
          points="50,15 80,35 75,70 50,85 25,65 20,30" 
          fill="rgba(217, 119, 6, 0.4)" 
          stroke="#f59e0b" 
          strokeWidth="1.5"
          className="animate-pulse"
        />
        
        {/* Labels */}
        <text x="50" y="2" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PAC</text>
        <text x="95" y="27" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">SHO</text>
        <text x="95" y="75" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PAS</text>
        <text x="50" y="100" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">DRI</text>
        <text x="5" y="75" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">DEF</text>
        <text x="5" y="27" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PHY</text>
      </svg>
    </div>
  );
};

export default function ScoutsPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden">
        
        {/* Dashboard Top Navigation (Specific to Scout) */}
        <div className="sticky top-0 z-40 bg-stone-950/80 backdrop-blur-xl border-b border-stone-800 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                <ShieldCheck className="w-6 h-6 text-stone-950" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">Scout<span className="text-amber-500">PRO</span> Cabinet</h1>
                <p className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">FC Pakhtakor Skauti</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="hidden md:flex px-4 py-2 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold uppercase text-white items-center gap-2 hover:border-amber-500 transition-colors">
                <Search className="w-4 h-4 text-stone-400"/> Global Qidiruv
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 rounded-md text-xs font-black uppercase text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]">
                Hisobot Yuklash
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            {[
              { id: 'dashboard', label: 'Bosh Panel', icon: <Target className="w-4 h-4"/> },
              { id: 'bookmarks', label: 'Kuzatuvdagi O\'yinchilar', icon: <BookMarked className="w-4 h-4"/> },
              { id: 'reports', label: 'AI Analizlar', icon: <FileText className="w-4 h-4"/> },
              { id: 'offers', label: 'Shartnomalar', icon: <Mail className="w-4 h-4"/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 shadow-inner' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-900 border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Kuzatuvda", val: "24", icon: <Eye className="text-blue-500"/>, color: 'blue' },
                    { label: "Shartnoma Yuborildi", val: "3", icon: <Mail className="text-amber-500"/>, color: 'amber' },
                    { label: "Yangi AI Analiz", val: "7", icon: <Zap className="text-purple-500"/>, color: 'purple' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-stone-900/50 p-6 rounded-2xl border border-stone-800 flex items-center gap-6 backdrop-blur-md">
                      <div className={`p-4 bg-stone-950 rounded-xl border border-stone-800 shadow-inner`}>
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-3xl font-black text-white">{stat.val}</div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hot Prospect Spotlight */}
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 mt-8 flex items-center gap-2"><Target className="text-amber-500 w-5 h-5"/> Hafta Iqtidori</h3>
                <div className="bg-gradient-to-r from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-8 flex flex-col lg:flex-row gap-12 relative overflow-hidden shadow-2xl">
                  {/* Decorative */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                  <div className="w-full lg:w-1/3 flex flex-col items-center">
                     <div className="relative w-48 h-48 mb-6">
                        <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                        <img src="https://images.unsplash.com/photo-1614632537190-23e414c77c0c?q=80&w=600&auto=format&fit=crop" className="w-full h-full rounded-full object-cover border-4 border-stone-800 relative z-10" alt="Prospect" />
                     </div>
                     <h2 className="text-3xl font-black text-white uppercase tracking-tighter text-center">Umidjon Erkinov</h2>
                     <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-1">Buxoro U-16 • Hujumchi</p>
                  </div>

                  <div className="w-full lg:w-1/3 flex flex-col justify-center items-center">
                    <RadarChart />
                  </div>

                  <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-6">
                    <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 shadow-inner">
                      <div className="text-[10px] uppercase font-bold text-stone-500 tracking-widest mb-2">AI Skaut Xulosasi</div>
                      <p className="text-sm text-stone-300 font-light leading-relaxed">
                        Yuqori tezlik (PAC 91) va ajoyib dribling (DRI 85). Jarima maydonchasida qaror qabul qilish tezligi o'z yosh toifasida eng yaxshilardan biri. Jismoniy tayyorgarligi (PHY) ustida ishlashi kerak.
                      </p>
                    </div>
                    <button className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors shadow-[0_0_20px_rgba(217,119,6,0.4)]">
                      Kuzatuvga Qo'shish
                    </button>
                    <button className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors border border-stone-700">
                      To'liq Profil
                    </button>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'bookmarks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2"><BookMarked className="text-amber-500 w-5 h-5"/> Kuzatuv Ro'yxati (Shortlist)</h3>
                  <button className="px-4 py-2 bg-stone-900 border border-stone-800 rounded-md text-xs font-bold uppercase text-stone-400 flex items-center gap-2"><Filter className="w-4 h-4"/> Filtrlar</button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((item, i) => (
                    <div key={i} className="flex bg-stone-900/50 border border-stone-800 rounded-2xl p-4 gap-4 items-center hover:border-amber-500/50 transition-colors group">
                      <img src={`https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop&sig=${i}`} className="w-20 h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="Player" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-black text-white uppercase tracking-tight text-lg">Azizbek Karimov</h4>
                            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">Markaziy Himoyachi</span>
                          </div>
                          <div className="bg-stone-950 px-2 py-1 rounded border border-stone-800 text-lg font-black text-white">84</div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <span className="px-2 py-1 bg-green-500/10 text-green-500 border border-green-500/30 text-[9px] font-bold uppercase rounded">Texnik</span>
                          <span className="px-2 py-1 bg-blue-500/10 text-blue-500 border border-blue-500/30 text-[9px] font-bold uppercase rounded">Pas ustasi</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
