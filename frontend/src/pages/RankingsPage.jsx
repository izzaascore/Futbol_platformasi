import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Minus, Star, Medal, Shield, Activity, Search, Filter } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');

  // Fake top 100 data
  useEffect(() => {
    setTimeout(() => {
      setRankings([
        { id: 1, name: 'Umidjon Erkinov', club: 'Buxoro U-16', position: 'FW', rating: 91, trend: 'up', points: 2840, image: 'https://images.unsplash.com/photo-1614632537190-23e414c77c0c?q=80&w=600&auto=format&fit=crop' },
        { id: 2, name: 'Azizbek Karimov', club: 'Pakhtakor U-19', position: 'FW', rating: 89, trend: 'same', points: 2750, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
        { id: 3, name: 'Sardor Rashidov', club: 'Andijon FC', position: 'DF', rating: 88, trend: 'up', points: 2610, image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop' },
        { id: 4, name: 'Doston Hamdamov', club: 'Neftchi', position: 'MF', rating: 86, trend: 'down', points: 2590, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop' },
        { id: 5, name: 'Jasur Hasanov', club: 'Dinamo', position: 'MF', rating: 85, trend: 'up', points: 2480, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop' },
        { id: 6, name: 'Otabek Shukurov', club: 'Xorazm Academy', position: 'DF', rating: 84, trend: 'up', points: 2410, image: 'https://images.unsplash.com/photo-1531885420367-172551e180d5?q=80&w=600&auto=format&fit=crop' },
        { id: 7, name: 'Alisher Jalilov', club: 'Nasaf', position: 'GK', rating: 82, trend: 'same', points: 2350, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop' },
        { id: 8, name: 'Bobur Davlatov', club: 'Qizilqum', position: 'FW', rating: 81, trend: 'down', points: 2280, image: 'https://images.unsplash.com/photo-1518605368461-1ee7e5241416?q=80&w=600&auto=format&fit=crop' },
        { id: 9, name: 'Javohir Toqhiry', club: 'Lokomotiv', position: 'MF', rating: 80, trend: 'up', points: 2190, image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=600&auto=format&fit=crop' },
        { id: 10, name: 'Shohruz Norkhonov', club: 'Sogdiana', position: 'FW', rating: 79, trend: 'same', points: 2100, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=600&auto=format&fit=crop' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredRankings = rankings.filter(r => category === 'all' || r.position === category);

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-700/30 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4 bg-stone-900/50 p-2 pr-4 rounded-full border border-stone-800 backdrop-blur-md shadow-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase">Global Leaderboard</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase drop-shadow-2xl">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">100</span>
            </h1>
            <p className="text-stone-400 font-light mt-4 max-w-xl text-lg">
              O'zbekistonning eng kuchli yosh futbolchilari. Reyting OVR ko'rsatkichlari, intizom ballari va turnirlardagi natijalar asosida shakllanadi.
            </p>
          </motion.div>

          {/* Top 3 Podium (Visual Masterpiece) */}
          {!loading && filteredRankings.length >= 3 && category === 'all' && (
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-24 mt-10">
              
              {/* Rank 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                className="w-full md:w-1/4 flex flex-col items-center group perspective-[1000px] order-2 md:order-1"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-stone-300 p-1 shadow-[0_0_30px_rgba(215,215,215,0.3)]">
                    <img src={filteredRankings[1].image} alt="Silver" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-stone-300 text-stone-900 font-black text-xl flex items-center justify-center rounded-full border-4 border-stone-950">2</div>
                </div>
                <div className="bg-stone-900/60 backdrop-blur-md border-t-2 border-stone-300/50 w-full p-6 pt-8 rounded-t-2xl flex flex-col items-center h-[200px] shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-stone-300/10 to-transparent pointer-events-none"></div>
                  <h3 className="font-black text-xl text-white uppercase tracking-tight mb-1">{filteredRankings[1].name}</h3>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-4">{filteredRankings[1].club}</span>
                  <div className="text-3xl font-black text-stone-300 drop-shadow-md">{filteredRankings[1].rating}</div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">OVR</span>
                </div>
              </motion.div>

              {/* Rank 1 (Gold) */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="w-full md:w-1/3 flex flex-col items-center group perspective-[1000px] order-1 md:order-2 z-10"
              >
                <div className="relative mb-6">
                  <div className="w-48 h-48 rounded-full border-[6px] border-amber-400 p-1 shadow-[0_0_50px_rgba(251,191,36,0.6)] group-hover:scale-105 transition-transform duration-500">
                    <img src={filteredRankings[0].image} alt="Gold" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-amber-400 text-stone-900 font-black text-3xl flex items-center justify-center rounded-full border-4 border-stone-950 shadow-[0_0_20px_rgba(251,191,36,0.8)]"><Medal className="w-6 h-6"/></div>
                </div>
                <div className="bg-gradient-to-b from-amber-600/20 to-stone-900/60 backdrop-blur-xl border-t-[3px] border-amber-400 w-full p-8 pt-10 rounded-t-2xl flex flex-col items-center h-[250px] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-amber-300 blur-[2px]"></div>
                  <Sparkles className="absolute top-4 right-4 w-6 h-6 text-amber-400/30" />
                  <h3 className="font-black text-2xl text-white uppercase tracking-tighter mb-1 text-center">{filteredRankings[0].name}</h3>
                  <span className="text-sm text-amber-500 uppercase tracking-widest font-bold mb-4">{filteredRankings[0].club}</span>
                  <div className="text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">{filteredRankings[0].rating}</div>
                  <span className="text-[10px] text-amber-500/70 uppercase tracking-widest font-bold mt-1">OVR (Qirol)</span>
                </div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
                className="w-full md:w-1/4 flex flex-col items-center group perspective-[1000px] order-3"
              >
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-amber-700 p-1 shadow-[0_0_30px_rgba(180,83,9,0.4)]">
                    <img src={filteredRankings[2].image} alt="Bronze" className="w-full h-full rounded-full object-cover" />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 bg-amber-700 text-white font-black text-xl flex items-center justify-center rounded-full border-4 border-stone-950">3</div>
                </div>
                <div className="bg-stone-900/60 backdrop-blur-md border-t-2 border-amber-700/50 w-full p-6 pt-8 rounded-t-2xl flex flex-col items-center h-[180px] shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 to-transparent pointer-events-none"></div>
                  <h3 className="font-black text-xl text-white uppercase tracking-tight mb-1 text-center">{filteredRankings[2].name}</h3>
                  <span className="text-xs text-stone-400 uppercase tracking-widest font-bold mb-4">{filteredRankings[2].club}</span>
                  <div className="text-3xl font-black text-amber-700 drop-shadow-md">{filteredRankings[2].rating}</div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">OVR</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8 border-b border-stone-800 pb-8">
            <div className="flex bg-stone-900/50 p-1 rounded-xl backdrop-blur-md border border-stone-800">
              {[
                { id: 'all', label: 'Umumiy' },
                { id: 'FW', label: 'Hujumchilar' },
                { id: 'MF', label: 'Yarim Himoya' },
                { id: 'DF', label: 'Himoyachilar' },
                { id: 'GK', label: 'Darvozabonlar' }
              ].map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`px-6 py-3 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    category === c.id 
                    ? 'bg-amber-500 text-stone-950 shadow-lg' 
                    : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              <input 
                type="text" 
                placeholder="O'yinchini izlash..." 
                className="w-full bg-stone-900/50 border border-stone-800 rounded-xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-stone-900/50 rounded-xl animate-pulse"></div>)}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRankings.slice(3).map((player, index) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  key={player.id}
                  className="flex items-center p-4 bg-stone-900/40 hover:bg-stone-800/80 backdrop-blur-sm border border-stone-800 hover:border-amber-500/30 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="w-12 text-center text-xl font-black text-stone-500 group-hover:text-amber-500 transition-colors">#{index + 4}</div>
                  
                  <div className="w-8 mx-4 flex justify-center">
                    {player.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
                    {player.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
                    {player.trend === 'same' && <Minus className="w-5 h-5 text-stone-500" />}
                  </div>

                  <img src={player.image} alt={player.name} className="w-12 h-12 rounded-full object-cover border-2 border-stone-700 group-hover:border-amber-500 transition-colors mr-6" />
                  
                  <div className="flex-1">
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{player.name}</h4>
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-widest">{player.club}</span>
                  </div>

                  <div className="hidden md:flex gap-8 mr-12 text-center">
                    <div>
                      <div className="text-sm font-bold text-white">{player.points}</div>
                      <div className="text-[9px] uppercase text-stone-500 font-bold tracking-widest">Ballar</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{player.position}</div>
                      <div className="text-[9px] uppercase text-stone-500 font-bold tracking-widest">Ampula</div>
                    </div>
                  </div>

                  <div className="bg-stone-950 p-2 px-4 rounded-lg border border-stone-800 shadow-inner group-hover:bg-amber-500/10 group-hover:border-amber-500/50 transition-all text-center">
                    <div className="text-xl font-black text-amber-500">{player.rating}</div>
                    <div className="text-[9px] font-bold text-stone-500 uppercase tracking-widest">OVR</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
