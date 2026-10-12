import { motion } from "framer-motion";
import React, { useState } from 'react';
import { PlayCircle, Activity, Calendar, Trophy, ChevronRight, MapPin, Users, MonitorPlay } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function MatchCenterPage() {
  const [activeTab, setActiveTab] = useState('live');

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200 relative selection:bg-red-500/30 overflow-hidden">
        
        {/* Cinematic Header */}
        <div className="relative h-[40vh] min-h-[350px] w-full flex items-end pb-12 z-10">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2500&auto=format&fit=crop" 
              alt="Match Center" 
              className="w-full h-full object-cover opacity-40 grayscale"
            />
            <div className="absolute inset-0 bg-stone-950/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-3 bg-red-900/30 p-1.5 pr-4 rounded-full border border-red-500/30 backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">Live Match Center</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase mb-4">Jonli <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-700">Arena</span></h1>
              <p className="text-stone-400 font-light max-w-xl text-lg">
                O'zbekistonning eng muhim yoshlar o'yinlari. Translyatsiyalar, jonli statistika va turnir jadvallari bitta markazda.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-20 -mt-10">
          
          {/* Tabs */}
          <div className="flex bg-stone-900/80 p-1.5 rounded-2xl backdrop-blur-xl border border-stone-800 shadow-2xl w-max mb-12">
            {[
              { id: 'live', label: 'Jonli O\'yinlar', icon: <Activity className="w-4 h-4"/> },
              { id: 'upcoming', label: 'Kelgusi Uchrashuvlar', icon: <Calendar className="w-4 h-4"/> },
              { id: 'tournaments', label: 'Turnirlar', icon: <Trophy className="w-4 h-4"/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'live' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              
              {/* Featured Live Match */}
              <div className="relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 shadow-2xl group cursor-pointer">
                <div className="absolute inset-0">
                  <img src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=1200&auto=format&fit=crop" alt="Live Match" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000 grayscale group-hover:grayscale-0" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                </div>
                
                <div className="relative z-10 p-10">
                  <div className="flex justify-between items-start mb-16">
                    <div className="px-4 py-1.5 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> 68' Daqiqa
                    </div>
                    <div className="px-4 py-1.5 bg-stone-900/80 backdrop-blur-md rounded-full border border-stone-700 text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4"/> 2.4k Tomoshabin
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-4 md:px-20">
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-white rounded-full mb-4 flex items-center justify-center p-2 shadow-2xl">
                         <img src="https://upload.wikimedia.org/wikipedia/en/thumb/6/69/Pakhtakor_Tashkent_logo.svg/1200px-Pakhtakor_Tashkent_logo.svg.png" className="w-full h-full object-contain" alt="Pakhtakor" />
                      </div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pakhtakor U-19</h2>
                      <span className="text-sm text-stone-400 font-bold uppercase tracking-widest mt-1">Toshkent</span>
                    </div>

                    <div className="flex flex-col items-center px-8">
                      <div className="text-7xl font-black text-white drop-shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-4">
                        <span>2</span> <span className="text-stone-600 text-4xl">:</span> <span>1</span>
                      </div>
                      <div className="text-amber-500 text-xs font-bold uppercase tracking-widest mt-4">Jonli Efir</div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-blue-900 rounded-full mb-4 flex items-center justify-center p-2 shadow-2xl border-4 border-white">
                         <h2 className="text-white font-black text-2xl">BUN</h2>
                      </div>
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bunyodkor U-19</h2>
                      <span className="text-sm text-stone-400 font-bold uppercase tracking-widest mt-1">Toshkent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Live Matches */}
              <div>
                <h3 className="text-xl font-black text-white uppercase tracking-widest mb-6 flex items-center gap-3"><Activity className="text-red-500"/> Boshqa O'yinlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { team1: 'Nasaf U-19', team2: 'Navbahor U-19', score: '0 - 0', time: '12\'' },
                    { team1: 'Qizilqum', team2: 'Buxoro', score: '3 - 1', time: '89\'' },
                    { team1: 'Andijon', team2: 'Neftchi', score: '1 - 1', time: 'Tanaffus' }
                  ].map((match, i) => (
                    <div key={i} className="bg-stone-900/50 backdrop-blur-md border border-stone-800 hover:border-red-500/50 p-6 rounded-2xl cursor-pointer transition-colors group relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> {match.time}</span>
                        <PlayCircle className="w-5 h-5 text-stone-600 group-hover:text-red-500 transition-colors" />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-white">{match.team1}</span>
                          <span className="font-black text-xl text-white">{match.score.split('-')[0]}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-lg text-stone-400">{match.team2}</span>
                          <span className="font-black text-xl text-stone-400">{match.score.split('-')[1]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tournaments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: "O'zbekiston Yoshlar Kubogi", teams: 16, status: "Pley-off bosqichi", img: "https://images.unsplash.com/photo-1574629810360-7efbb6b667cb?q=80&w=600&auto=format&fit=crop" },
                { name: "Toshkent Chempionati U-18", teams: 12, status: "3-Tur", img: "https://images.unsplash.com/photo-1518605368461-1ee7e5241416?q=80&w=600&auto=format&fit=crop" }
              ].map((t, i) => (
                <div key={i} className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer border border-stone-800">
                  <img src={t.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="Tournament"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <div className="px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] font-black uppercase tracking-widest inline-block mb-3 rounded-md backdrop-blur-md">{t.status}</div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{t.name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {t.teams} Jamoa</span>
                      <span className="flex items-center gap-1 text-amber-500">Batafsil <ChevronRight className="w-4 h-4"/></span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
