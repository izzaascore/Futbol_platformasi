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
  Flame
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const INITIAL_RANKINGS = [
  { id: 1, name: 'Umidjon Erkinov', club: 'Buxoro U-16', position: 'FW', rating: 91, trend: 'up', points: 2840, image: '/images/players/players_1614632537190-23e414.jpg' },
  { id: 2, name: 'Azizbek Karimov', club: 'Pakhtakor U-19', position: 'FW', rating: 89, trend: 'same', points: 2750, image: '/images/players/players_1506794778202-cad84c.jpg' },
  { id: 3, name: 'Sardor Rashidov', club: 'Andijon FC', position: 'DF', rating: 88, trend: 'up', points: 2610, image: '/images/players/players_1517466787929-bc9095.jpg' },
  { id: 4, name: 'Doston Hamdamov', club: 'Neftchi', position: 'MF', rating: 86, trend: 'down', points: 2590, image: '/images/players/players_1552374196-1ab2a1c59.jpg' },
  { id: 5, name: 'Jasur Hasanov', club: 'Dinamo', position: 'MF', rating: 85, trend: 'up', points: 2480, image: '/images/players/players_1534438327276-14e530.jpg' },
  { id: 6, name: 'Otabek Shukurov', club: 'Xorazm Academy', position: 'DF', rating: 84, trend: 'up', points: 2410, image: '/images/players/players_1531885420367-172551.jpg' },
  { id: 7, name: 'Alisher Jalilov', club: 'Nasaf', position: 'GK', rating: 82, trend: 'same', points: 2350, image: '/images/players/players_1579952363873-27f3ba.jpg' },
  { id: 8, name: 'Bobur Davlatov', club: 'Qizilqum', position: 'FW', rating: 81, trend: 'down', points: 2280, image: '/images/players/players_1518605368461-1ee7e5.jpg' },
  { id: 9, name: 'Javohir Toqhiry', club: 'Lokomotiv', position: 'MF', rating: 80, trend: 'up', points: 2190, image: '/images/stadiums/stadiums_1522778119026-d647f0.jpg' },
  { id: 10, name: 'Shohruz Norkhonov', club: 'Sogdiana', position: 'FW', rating: 79, trend: 'same', points: 2100, image: '/images/players/players_1431324155629-1a6deb.jpg' },
  { id: 11, name: 'Eldor Shomurodov', club: 'Bunyodkor U-21', position: 'FW', rating: 78, trend: 'up', points: 2050, image: '/images/players/players_1506794778202-cad84c.jpg' },
  { id: 12, name: 'Abbosbek Fayzullaev', club: 'Paxtakor U-19', position: 'MF', rating: 77, trend: 'up', points: 1980, image: '/images/players/players_1517466787929-bc9095.jpg' }
];

// Helper to normalize position names
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

  // Fetch real players from API with fallback
  useEffect(() => {
    fetch(`${API_URL}/players`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((p, idx) => ({
            id: p.id,
            name: p.full_name || p.name || 'Noma\'lum o\'yinchi',
            club: p.club || p.city || 'O\'zbekiston',
            position: normalizePosition(p.position),
            rating: p.rating || 75,
            trend: idx % 3 === 0 ? 'up' : idx % 3 === 1 ? 'same' : 'down',
            points: (p.rating || 75) * 30 + (p.goals || 0) * 15,
            image: p.image || '/images/players/players_1506794778202-cad84c.jpg'
          })).sort((a, b) => b.rating - a.rating);
          setRankings(formatted);
        } else {
          setRankings(INITIAL_RANKINGS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn("Backenddan reyting olinmadi, standart bazadan foydalanilmoqda:", err);
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
      <div className="w-full bg-[#050505] min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden pb-24">
        
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-amber-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-stone-800/30 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="flex flex-col items-center text-center mb-14"
          >
            <div className="inline-flex items-center gap-2 mb-4 bg-stone-900/80 px-4 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-xl shadow-lg">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-black tracking-[0.2em] text-amber-400 uppercase">Global Leaderboard</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white uppercase drop-shadow-2xl">
              Top <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">100</span>
            </h1>
            
            <p className="text-stone-400 font-medium mt-3 max-w-xl text-sm sm:text-base">
              O'zbekistonning eng kuchli yosh futbolchilari. Reyting OVR ko'rsatkichlari, intizom ballari va o'yin natijalari asosida shakllanadi.
            </p>
          </motion.div>

          {/* TOP 3 PODIUM (Gold, Silver, Bronze) */}
          {showPodium && (
            <div className="flex flex-col md:flex-row justify-center items-end gap-5 mb-20 mt-6 px-2">
              
              {/* Rank 2 (Silver) */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-full md:w-1/4 flex flex-col items-center group order-2 md:order-1"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-stone-300 p-1 shadow-[0_0_30px_rgba(215,215,215,0.25)] overflow-hidden bg-stone-900">
                    <img 
                      src={filteredRankings[1].image} 
                      alt="Silver" 
                      className="w-full h-full rounded-full object-cover"
                      onError={(e) => { e.target.src = '/images/players/players_1506794778202-cad84c.jpg'; }}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-stone-300 text-stone-950 font-black text-lg flex items-center justify-center rounded-full border-4 border-stone-950 shadow-lg">2</div>
                </div>
                
                <div className="bg-stone-900/70 backdrop-blur-xl border-t-2 border-stone-300/60 w-full p-5 pt-7 rounded-t-3xl flex flex-col items-center h-[180px] shadow-2xl relative overflow-hidden border border-stone-800">
                  <h3 className="font-black text-lg text-white uppercase tracking-tight mb-1 text-center line-clamp-1">{filteredRankings[1].name}</h3>
                  <span className="text-[11px] text-stone-400 uppercase tracking-widest font-bold mb-3">{filteredRankings[1].club}</span>
                  <div className="text-3xl font-black text-stone-200">{filteredRankings[1].rating}</div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">OVR</span>
                </div>
              </motion.div>

              {/* Rank 1 (Gold) */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="w-full md:w-1/3 flex flex-col items-center group order-1 md:order-2 z-10"
              >
                <div className="relative mb-5">
                  <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-[5px] border-amber-400 p-1.5 shadow-[0_0_50px_rgba(251,191,36,0.5)] group-hover:scale-105 transition-transform duration-500 overflow-hidden bg-stone-900">
                    <img 
                      src={filteredRankings[0].image} 
                      alt="Gold" 
                      className="w-full h-full rounded-full object-cover" 
                      onError={(e) => { e.target.src = '/images/players/players_1614632537190-23e414.jpg'; }}
                    />
                  </div>
                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-amber-400 text-stone-950 font-black text-2xl flex items-center justify-center rounded-full border-4 border-stone-950 shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                    <Medal className="w-5 h-5 fill-current" />
                  </div>
                </div>

                <div className="bg-gradient-to-b from-amber-500/20 via-stone-900/90 to-stone-950 backdrop-blur-2xl border-t-[3px] border-amber-400 w-full p-6 pt-9 rounded-t-3xl flex flex-col items-center h-[230px] shadow-2xl relative overflow-hidden border border-stone-800">
                  <Sparkles className="absolute top-3 right-4 w-5 h-5 text-amber-400/50 animate-pulse" />
                  <h3 className="font-black text-xl text-white uppercase tracking-tight mb-1 text-center line-clamp-1">{filteredRankings[0].name}</h3>
                  <span className="text-xs text-amber-400 uppercase tracking-widest font-black mb-3">{filteredRankings[0].club}</span>
                  <div className="text-5xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">{filteredRankings[0].rating}</div>
                  <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-black mt-1">OVR (Lider)</span>
                </div>
              </motion.div>

              {/* Rank 3 (Bronze) */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.25 }}
                className="w-full md:w-1/4 flex flex-col items-center group order-3"
              >
                <div className="relative mb-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-amber-700 p-1 shadow-[0_0_30px_rgba(180,83,9,0.35)] overflow-hidden bg-stone-900">
                    <img 
                      src={filteredRankings[2].image} 
                      alt="Bronze" 
                      className="w-full h-full rounded-full object-cover" 
                      onError={(e) => { e.target.src = '/images/players/players_1517466787929-bc9095.jpg'; }}
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-9 h-9 bg-amber-700 text-white font-black text-lg flex items-center justify-center rounded-full border-4 border-stone-950 shadow-lg">3</div>
                </div>

                <div className="bg-stone-900/70 backdrop-blur-xl border-t-2 border-amber-700/60 w-full p-5 pt-7 rounded-t-3xl flex flex-col items-center h-[170px] shadow-2xl relative overflow-hidden border border-stone-800">
                  <h3 className="font-black text-lg text-white uppercase tracking-tight mb-1 text-center line-clamp-1">{filteredRankings[2].name}</h3>
                  <span className="text-[11px] text-stone-400 uppercase tracking-widest font-bold mb-3">{filteredRankings[2].club}</span>
                  <div className="text-3xl font-black text-amber-600">{filteredRankings[2].rating}</div>
                  <span className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">OVR</span>
                </div>
              </motion.div>

            </div>
          )}

          {/* Controls: Category Filter & Search Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 border-b border-stone-800/80 pb-6">
            
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none bg-stone-900/60 p-1.5 rounded-2xl border border-stone-800">
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
                  className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    category === c.id 
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30' 
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="O'yinchini izlash..." 
                className="w-full min-h-[44px] bg-stone-900/70 border border-stone-800 rounded-2xl pl-11 pr-4 text-xs font-bold text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
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
                <div key={i} className="h-20 bg-stone-900/40 rounded-2xl border border-stone-800/80 animate-pulse" />
              ))}
            </div>
          ) : filteredRankings.length === 0 ? (
            <div className="text-center py-16 bg-stone-900/30 rounded-2xl border border-stone-800/60 max-w-md mx-auto">
              <Trophy className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">O'yinchi topilmadi</h3>
              <p className="text-xs text-stone-400 mt-1">Qidiruv so'zini yoki tanlangan ampulani o'zgartiring.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(showPodium ? filteredRankings.slice(3) : filteredRankings).map((player, index) => {
                const actualRank = showPodium ? index + 4 : index + 1;
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.4) }}
                    key={player.id}
                    className="flex items-center p-3.5 sm:p-4 bg-stone-900/40 hover:bg-stone-800/70 backdrop-blur-xl border border-stone-800/90 hover:border-amber-500/40 rounded-2xl transition-all cursor-pointer group shadow-lg"
                  >
                    {/* Rank Number */}
                    <div className="w-10 sm:w-12 text-center text-lg sm:text-xl font-black text-stone-500 group-hover:text-amber-400 transition-colors">
                      #{actualRank}
                    </div>
                    
                    {/* Trend Indicator */}
                    <div className="w-7 mx-2 sm:mx-3 flex justify-center">
                      {player.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                      {player.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                      {player.trend === 'same' && <Minus className="w-4 h-4 text-stone-500" />}
                    </div>

                    {/* Avatar */}
                    <img 
                      src={player.image} 
                      alt={player.name} 
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-stone-700 group-hover:border-amber-500 transition-colors mr-4 sm:mr-6 shrink-0" 
                      onError={(e) => { e.target.src = '/images/players/players_1506794778202-cad84c.jpg'; }}
                    />
                    
                    {/* Name & Club */}
                    <div className="flex-1 min-w-0 pr-3">
                      <h4 className="text-sm sm:text-base font-black text-white uppercase tracking-tight truncate group-hover:text-amber-400 transition-colors">
                        {player.name}
                      </h4>
                      <span className="text-[11px] text-stone-400 font-bold uppercase tracking-widest truncate block">
                        {player.club}
                      </span>
                    </div>

                    {/* Points & Position */}
                    <div className="hidden md:flex gap-8 mr-8 text-center shrink-0">
                      <div>
                        <div className="text-sm font-black text-white">{player.points}</div>
                        <div className="text-[9px] uppercase text-stone-500 font-bold tracking-widest">Ballar</div>
                      </div>
                      <div>
                        <div className="text-sm font-black text-amber-400">{player.position}</div>
                        <div className="text-[9px] uppercase text-stone-500 font-bold tracking-widest">Ampula</div>
                      </div>
                    </div>

                    {/* OVR Score Badge */}
                    <div className="bg-stone-950/90 py-1.5 px-3 sm:px-4 rounded-xl border border-stone-800 shadow-inner group-hover:border-amber-500/50 transition-all text-center shrink-0">
                      <div className="text-lg sm:text-xl font-black text-amber-400">{player.rating}</div>
                      <div className="text-[8px] font-bold text-stone-500 uppercase tracking-widest">OVR</div>
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
