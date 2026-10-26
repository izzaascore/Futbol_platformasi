import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Star, 
  Medal, 
  Shield, 
  Activity, 
  Search, 
  Filter, 
  Sparkles,
  ChevronRight,
  Flame,
  X
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const INITIAL_RANKINGS = [
  { id: 1, name: 'Umidjon Erkinov', club: 'Buxoro U-19', position: 'FW', rating: 92, trend: 'up', points: 2940, image: 'https://images.unsplash.com/photo-1550286395-520556eecdb7?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, name: 'Azizbek Karimov', club: 'Bunyodkor FK / O\'zb U-21', position: 'FW', rating: 91, trend: 'same', points: 2850, image: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, name: 'Sardor Rashidov', club: 'Andijon FK', position: 'DF', rating: 89, trend: 'up', points: 2710, image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, name: 'Jasur Hasanov', club: 'Dinamo Samarqand', position: 'MF', rating: 88, trend: 'up', points: 2620, image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, name: 'Doston Hamdamov', club: 'Neftchi Farg\'ona', position: 'GK', rating: 86, trend: 'down', points: 2590, image: 'https://images.unsplash.com/photo-1518605368461-1ee7c5320746?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, name: 'Otabek Shukurov', club: 'Nasaf Qarshi U-21', position: 'MF', rating: 85, trend: 'up', points: 2510, image: 'https://images.unsplash.com/photo-1517466787929-bc9095ab716e?q=80&w=1000&auto=format&fit=crop' },
  { id: 7, name: 'Alisher Jalilov', club: 'Paxtakor U-19', position: 'DF', rating: 84, trend: 'same', points: 2450, image: 'https://images.unsplash.com/photo-1518605368461-1ee7c5320746?q=80&w=1000&auto=format&fit=crop' },
  { id: 8, name: 'Bobur Davlatov', club: 'Qizilqum Navoiy', position: 'FW', rating: 83, trend: 'down', points: 2380, image: 'https://images.unsplash.com/photo-1550286395-520556eecdb7?q=80&w=1000&auto=format&fit=crop' }
];

function normalizePosition(pos) {
  if (!pos) return 'FW';
  const p = pos.toLowerCase();
  if (p.includes('hujum') || p === 'fw') return 'FW';
  if (p.includes('yarim') || p === 'mf') return 'MF';
  if (p.includes('himoya') || p === 'df') return 'DF';
  if (p.includes('darvoza') || p === 'gk') return 'GK';
  return 'FW';
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((p, idx) => ({
            id: p.id,
            name: p.full_name || p.name || 'Futbolchi',
            club: p.club || p.city || 'O\'zbekiston',
            position: normalizePosition(p.position),
            rating: p.rating || 85,
            trend: idx % 3 === 0 ? 'up' : idx % 3 === 1 ? 'same' : 'down',
            points: (p.rating || 85) * 30 + (p.goals || 0) * 15,
            image: p.avatar_url || p.photo_url || INITIAL_RANKINGS[idx % INITIAL_RANKINGS.length].image
          })).sort((a, b) => b.rating - a.rating);
          setRankings(formatted);
        } else {
          setRankings(INITIAL_RANKINGS);
        }
        setLoading(false);
      })
      .catch(() => {
        setRankings(INITIAL_RANKINGS);
        setLoading(false);
      });
  }, []);

  const filteredRankings = rankings.filter(r => {
    const matchesCategory = category === 'all' || r.position === category;
    const matchesSearch = !searchQuery || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showPodium = !loading && category === 'all' && !searchQuery && filteredRankings.length >= 3;

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-white relative selection:bg-white selection:text-black overflow-hidden pb-24">
        
        {/* Stadium Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-[550px] bg-stadium opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[550px] bg-grid pointer-events-none" />
        <div className="glass-glow absolute top-10 left-1/2 -translate-x-1/2 opacity-35 blur-3xl pointer-events-none w-[600px] h-[350px]"></div>

        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 mb-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xl">
              <Trophy className="w-4 h-4 text-white" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-stone-200 uppercase">FUTURO MILLIY REYTINGI</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white uppercase">
              TOP <span className="text-gradient">100 IQTIDORLAR</span>
            </h1>
            
            <p className="text-stone-300 font-normal mt-3 max-w-xl text-sm leading-relaxed">
              O'zbekistonning eng kuchli yosh futbolchilari. Reyting OVR ko'rsatkichlari, professional skauting baholari va maydondagi statistika asosida shakllanadi.
            </p>
          </motion.div>

          {/* TOP 3 PODIUM */}
          {showPodium && (
            <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-20 mt-6 px-2 max-w-5xl mx-auto">
              
              {/* Rank 2 (Silver) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.1 }}
                className="w-full md:w-1/3 flex flex-col items-center group order-2 md:order-1"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-stone-300 p-1 shadow-card overflow-hidden bg-stone-900 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={filteredRankings[1].image} 
                      alt="Silver" 
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-stone-300 text-black font-heading font-black text-base flex items-center justify-center rounded-full border-4 border-[#030303] shadow-lg">2</div>
                </div>
                
                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 w-full p-5 pt-7 rounded-3xl flex flex-col items-center h-[200px] shadow-card relative overflow-hidden group-hover:border-white/30 transition">
                  <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight mb-1 text-center truncate w-full">{filteredRankings[1].name}</h3>
                  <span className="text-[11px] text-stone-400 uppercase tracking-widest font-bold mb-3">{filteredRankings[1].club}</span>
                  <div className="text-3xl font-heading font-black text-white">{filteredRankings[1].rating}</div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">OVR (2-O'rin)</span>
                </div>
              </motion.div>

              {/* Rank 1 (Gold / Stark White Glow) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="w-full md:w-5/12 flex flex-col items-center group order-1 md:order-2 z-10"
              >
                <div className="relative mb-5">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-4 border-white p-1.5 shadow-glow group-hover:scale-105 transition-transform duration-500 overflow-hidden bg-stone-900">
                    <img 
                      src={filteredRankings[0].image} 
                      alt="Gold" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-white text-black font-heading font-black text-xl flex items-center justify-center rounded-full border-4 border-[#030303] shadow-glow">
                    <Medal className="w-6 h-6 fill-black" />
                  </div>
                </div>

                <div className="bg-white/[0.06] backdrop-blur-2xl border-2 border-white/40 w-full p-6 pt-9 rounded-3xl flex flex-col items-center h-[230px] shadow-glow relative overflow-hidden">
                  <Sparkles className="absolute top-3 right-4 w-5 h-5 text-white/50 animate-pulse" />
                  <h3 className="font-heading font-black text-2xl text-white uppercase tracking-tight mb-1 text-center truncate w-full">{filteredRankings[0].name}</h3>
                  <span className="text-xs text-stone-300 uppercase tracking-widest font-bold mb-3">{filteredRankings[0].club}</span>
                  <div className="text-5xl font-heading font-black text-white">{filteredRankings[0].rating}</div>
                  <span className="text-[10px] text-white uppercase tracking-widest font-bold mt-1">OVR (Mutloq Yetakchi)</span>
                </div>
              </motion.div>

              {/* Rank 3 (Bronze) */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full md:w-1/3 flex flex-col items-center group order-3"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-600/70 p-1 shadow-card overflow-hidden bg-stone-900 group-hover:scale-105 transition-transform duration-300">
                    <img 
                      src={filteredRankings[2].image} 
                      alt="Bronze" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-amber-600 text-white font-heading font-black text-base flex items-center justify-center rounded-full border-4 border-[#030303] shadow-lg">3</div>
                </div>

                <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 w-full p-5 pt-7 rounded-3xl flex flex-col items-center h-[200px] shadow-card relative overflow-hidden group-hover:border-white/30 transition">
                  <h3 className="font-heading font-black text-lg text-white uppercase tracking-tight mb-1 text-center truncate w-full">{filteredRankings[2].name}</h3>
                  <span className="text-[11px] text-stone-400 uppercase tracking-widest font-bold mb-3">{filteredRankings[2].club}</span>
                  <div className="text-3xl font-heading font-black text-stone-200">{filteredRankings[2].rating}</div>
                  <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">OVR (3-O'rin)</span>
                </div>
              </motion.div>

            </div>
          )}

          {/* Controls: Category Filter & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-white/10 pb-6">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    category === c.id 
                      ? 'bg-white text-black shadow-glow' 
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O'yinchini izlash..." 
                className="w-full py-3 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-xs font-bold text-white placeholder-stone-500 focus:outline-none focus:border-white transition shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List of Players */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-20 bg-white/[0.03] rounded-2xl border border-white/10 animate-pulse" />
              ))}
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="text-center py-16 bg-white/[0.02] rounded-2xl border border-white/10 max-w-md mx-auto">
              <Trophy className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">O'yinchi topilmadi</h3>
              <p className="text-xs text-stone-400 mt-1">Qidiruv so'zini yoki tanlangan pozitsiyani o'zgartiring.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showPodium ? filteredRankings.slice(3) : filteredRankings).map((player, index) => {
                const actualRank = showPodium ? index + 4 : index + 1;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                    key={player.id}
                    className="flex items-center p-3.5 sm:p-4 bg-white/[0.03] hover:bg-white/[0.07] backdrop-blur-xl border border-white/10 hover:border-white/30 rounded-2xl transition-all cursor-pointer group shadow-sm"
                  >
                    {/* Rank Number */}
                    <div className="w-10 sm:w-12 text-center text-lg sm:text-xl font-heading font-black text-stone-400 group-hover:text-white transition-colors">
                      #{actualRank}
                    </div>

                    {/* Avatar */}
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-stone-900 border border-white/15 flex-shrink-0 mr-4">
                      <img 
                        src={player.image} 
                        alt={player.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-grow min-w-0 mr-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-black text-sm sm:text-base text-white uppercase tracking-tight truncate group-hover:text-stone-200 transition">
                          {player.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-white/10 border border-white/15 text-stone-300">
                          {player.position}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 truncate mt-0.5">{player.club}</p>
                    </div>

                    {/* Trend Indicator */}
                    <div className="hidden sm:flex items-center gap-1.5 mr-6 text-xs font-bold">
                      {player.trend === 'up' && (
                        <span className="flex items-center text-emerald-400 text-xs font-bold">
                          <TrendingUp className="w-4 h-4 mr-1" /> +2
                        </span>
                      )}
                      {player.trend === 'down' && (
                        <span className="flex items-center text-red-400 text-xs font-bold">
                          <TrendingDown className="w-4 h-4 mr-1" /> -1
                        </span>
                      )}
                      {player.trend === 'same' && (
                        <span className="flex items-center text-stone-500 text-xs font-bold">
                          <Minus className="w-4 h-4 mr-1" /> 0
                        </span>
                      )}
                    </div>

                    {/* Rating OVR Badge */}
                    <div className="text-right">
                      <div className="font-heading font-black text-xl sm:text-2xl text-white">
                        {player.rating}
                      </div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 tracking-wider">OVR</span>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </PageTransition>
  );
}
