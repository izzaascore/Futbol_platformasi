import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, Shield, MapPin, Activity, Trophy, ChevronRight, 
  Sparkles, CheckCircle2, TrendingUp, ArrowUpRight, Flame, Star, Play
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

// Fallback high-potential scouted players for immediate display
const DEFAULT_TALENTS = [
  {
    id: 1,
    full_name: "Azizbek Karimov",
    position: "Hujumchi (ST)",
    age: 19,
    city: "Toshkent",
    club: "Bunyodkor FK",
    potential: 94,
    market_value: "€1.5M",
    image: "https://images.unsplash.com/photo-1550286395-520556eecdb7?q=80&w=1000&auto=format&fit=crop",
    stats: { pac: 89, sho: 92, pas: 84, dri: 91, def: 45, phy: 82 },
    is_verified: true,
    tag: "TOP TALENT"
  },
  {
    id: 2,
    full_name: "Xolqo'zi Rashidoyev",
    position: "Yarim himoyachi (CAM)",
    age: 18,
    city: "Andijon",
    club: "Navbahor U-19",
    potential: 91,
    market_value: "€950K",
    image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=1000&auto=format&fit=crop",
    stats: { pac: 85, sho: 80, pas: 90, dri: 88, def: 62, phy: 75 },
    is_verified: true,
    tag: "SCOUT PRO"
  },
  {
    id: 3,
    full_name: "Jasur Jalolov",
    position: "Qanot Hujumchisi (LW)",
    age: 20,
    city: "Samarqand",
    club: "Dinamo Samarqand",
    potential: 89,
    market_value: "€800K",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000&auto=format&fit=crop",
    stats: { pac: 93, sho: 84, pas: 81, dri: 89, def: 38, phy: 74 },
    is_verified: true,
    tag: "RISING STAR"
  },
  {
    id: 4,
    full_name: "Sardor Mirzayev",
    position: "Markaziy Himoyachi (CB)",
    age: 19,
    city: "Farg'ona",
    club: "Neftchi U-21",
    potential: 88,
    market_value: "€650K",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop",
    stats: { pac: 78, sho: 50, pas: 74, dri: 72, def: 89, phy: 88 },
    is_verified: true,
    tag: "ROCK DEFENDER"
  }
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('ALL');
  const [selectedAge, setSelectedAge] = useState('ALL');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [players, setPlayers] = useState(DEFAULT_TALENTS);
  const [loading, setLoading] = useState(false);

  // Fetch real players from API and merge with default talents
  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((p, idx) => ({
            id: p.id || idx + 10,
            full_name: p.full_name || p.username || "O'yinchi",
            position: p.position || "Hujumchi",
            age: p.age || 18,
            city: p.city || "Toshkent",
            club: p.club || "Erkin agent",
            potential: p.potential || 85,
            market_value: p.market_value ? `€${p.market_value}` : "€500K",
            image: p.avatar_url || p.photo_url || DEFAULT_TALENTS[idx % DEFAULT_TALENTS.length].image,
            stats: p.stats || { pac: 80, sho: 75, pas: 78, dri: 80, def: 60, phy: 70 },
            is_verified: p.is_verified ?? true,
            tag: p.tag || "TALENT"
          }));
          setPlayers([...formatted, ...DEFAULT_TALENTS.slice(formatted.length >= 4 ? 0 : 0)]);
        }
      })
      .catch(() => {
        // Keep DEFAULT_TALENTS on offline/error
      });
  }, []);

  // Filter logic
  const filteredPlayers = players.filter(p => {
    const matchesSearch = !searchQuery || 
      (p.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.club || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.city || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPosition = selectedPosition === 'ALL' || 
      (p.position || '').toLowerCase().includes(selectedPosition.toLowerCase());

    const matchesAge = selectedAge === 'ALL' || (
      selectedAge === '16-18' ? (p.age >= 16 && p.age <= 18) :
      selectedAge === '19-21' ? (p.age >= 19 && p.age <= 21) :
      selectedAge === '22+' ? (p.age >= 22) : true
    );

    const matchesVerified = !onlyVerified || p.is_verified;

    return matchesSearch && matchesPosition && matchesAge && matchesVerified;
  });

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-[#030303] text-white selection:bg-white selection:text-black">
        
        {/* ========================================================================= */}
        {/* HERO SECTION                                                             */}
        {/* ========================================================================= */}
        <section className="relative flex items-center bg-stadium bg-grid min-h-[92vh] pt-12 pb-24 overflow-hidden border-b border-white/10">
          
          <div className="max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Content: Typography & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 bg-white/5 w-max mb-6 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase text-stone-200">
                  O'ZBEKISTONNING #1 PROFESSIONAL SKAUTING PLATFORMASI
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-heading font-black text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] uppercase mb-6">
                KELAJAKNI <br />
                <span className="text-gradient">BUGUN QURING.</span>
              </h1>

              {/* Description */}
              <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl font-normal leading-relaxed mb-8">
                O'zbekiston bo'ylab yosh iqtidorli futbolchilarni kashf eting, ularning professional statistikasini kuzating va xalqaro skautlar bilan bog'laning.
              </p>

              {/* Action Buttons & Badges */}
              <div className="flex flex-wrap items-center gap-4 mb-12">
                <Link
                  to="/players"
                  className="bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition duration-300 shadow-glow flex items-center gap-2.5 transform hover:-translate-y-0.5"
                >
                  <Search className="w-4 h-4" />
                  Iqtidorlarni kashf etish
                </Link>
                <Link
                  to="/register"
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition duration-300 flex items-center gap-2.5 backdrop-blur-sm hover:border-white/40"
                >
                  <Star className="w-4 h-4 text-white" />
                  Profil ochish
                </Link>
              </div>

              {/* Analytics Mini Card */}
              <div className="grid grid-cols-3 gap-4 max-w-xl p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white">1,250+</div>
                  <div className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Faol O'yinchilar</div>
                </div>
                <div className="border-x border-white/10 px-4">
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white">48+</div>
                  <div className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Pro Skautlar</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-heading font-black text-white">18+</div>
                  <div className="text-[10px] sm:text-xs text-stone-400 font-bold uppercase tracking-wider mt-1">Klublar & Akademiyalar</div>
                </div>
              </div>

            </div>

            {/* Right Content: 3D Scouting Card with Intense Glow */}
            <div className="lg:col-span-5 flex justify-center items-center relative">
              
              {/* Radial Glass Glow */}
              <div className="glass-glow absolute -inset-8 opacity-75 blur-3xl pointer-events-none"></div>

              {/* Player Card UI */}
              <div className="relative w-full max-w-[420px] rounded-3xl bg-white/[0.04] border border-white/20 backdrop-blur-2xl shadow-card overflow-hidden group hover:border-white/50 transition-all duration-500">
                
                {/* Top Badge */}
                <div className="px-6 pt-6 pb-2 flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-heading font-black tracking-wider uppercase">
                      TOP TALENT
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/10 border border-white/20 text-white text-[10px] font-bold tracking-wider">
                      POT 94
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden p-0.5 bg-black/60 shadow-sm">
                    <img src="/images/futuro_icon.jpg" alt="Futuro Icon" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>

                {/* Player Image Section with smooth gradient fade */}
                <div className="relative h-72 sm:h-80 w-full overflow-hidden flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1550286395-520556eecdb7?q=80&w=2500&auto=format&fit=crop"
                    alt="Hero Player Action"
                    className="w-full h-full object-cover object-top filter brightness-95 contrast-105 group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent"></div>
                  
                  {/* Floating Price Tag */}
                  <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-widest text-stone-400">Taxminiy Bahosi</div>
                      <div className="text-3xl font-heading font-black text-white">€1.5M</div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                      Best Value
                    </span>
                  </div>
                </div>

                {/* Card Info Section */}
                <div className="p-6 pt-2 bg-[#030303]/80">
                  <div className="mb-4">
                    <h3 className="text-2xl font-heading font-black uppercase text-white tracking-wide">
                      Azizbek Karimov
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-400 mt-1">
                      <span className="text-white font-semibold">Bunyodkor FK / O'zb U-21</span>
                      <span className="w-1 h-1 rounded-full bg-stone-500"></span>
                      <span>19 Yosh</span>
                      <span className="w-1 h-1 rounded-full bg-stone-500"></span>
                      <span className="text-stone-300">ST (Hujumchi)</span>
                    </div>
                  </div>

                  {/* Radar / Stat Grid */}
                  <div className="grid grid-cols-6 gap-2 p-3 rounded-xl bg-white/[0.04] border border-white/10 text-center mb-5">
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">PAC</div>
                      <div className="font-heading font-black text-sm text-white">89</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">SHO</div>
                      <div className="font-heading font-black text-sm text-white">92</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">PAS</div>
                      <div className="font-heading font-black text-sm text-white">84</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">DRI</div>
                      <div className="font-heading font-black text-sm text-white">91</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">DEF</div>
                      <div className="font-heading font-black text-sm text-white">45</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-stone-400 uppercase">PHY</div>
                      <div className="font-heading font-black text-sm text-white">82</div>
                    </div>
                  </div>

                  {/* Action Link */}
                  <Link
                    to="/players"
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-heading font-bold text-xs uppercase tracking-widest transition duration-300 flex items-center justify-center gap-2 border border-white/20"
                  >
                    To'liq Skauting Dossiyesini Ko'rish
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* IQTIDORLAR / SCOUTING SHOWCASE SECTION                                   */}
        {/* ========================================================================= */}
        <section className="py-20 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-widest mb-2">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span>Tanlangan Futbolchilar</span>
              </div>
              <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
                IQTIDORLAR
              </h2>
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ism, klub yoki shahar bo'yicha qidiring..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-white transition"
              />
            </div>
          </div>

          {/* Filter Panel */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            
            {/* Position Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10">
              {['ALL', 'Hujumchi', 'Yarim himoyachi', 'Himoyachi', 'Darvozabon'].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setSelectedPosition(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    selectedPosition === pos
                      ? 'bg-white text-black shadow-glow'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {pos === 'ALL' ? 'Barcha Pozitsiyalar' : pos}
                </button>
              ))}
            </div>

            {/* Age Filter */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10">
              {[
                { label: 'Barcha Yoshlar', value: 'ALL' },
                { label: '16 - 18 Yosh', value: '16-18' },
                { label: '19 - 21 Yosh', value: '19-21' },
                { label: '22+ Yosh', value: '22+' }
              ].map((ag) => (
                <button
                  key={ag.value}
                  onClick={() => setSelectedAge(ag.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                    selectedAge === ag.value
                      ? 'bg-white text-black shadow-glow'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ag.label}
                </button>
              ))}
            </div>

            {/* Verified Toggle */}
            <button
              onClick={() => setOnlyVerified(!onlyVerified)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition flex items-center gap-2 ${
                onlyVerified
                  ? 'bg-white text-black border-white shadow-glow'
                  : 'bg-white/[0.03] text-stone-400 border-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Skaut Tasdiqlagan
            </button>

          </div>

          {/* Player Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <div
                  key={player.id}
                  className="group relative rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/40 transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                    <img
                      src={player.image}
                      alt={player.full_name}
                      className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/20 to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-heading font-black uppercase text-white tracking-wider">
                        {player.tag || 'PRO'}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-white text-black text-[10px] font-heading font-black">
                        POT {player.potential}
                      </span>
                    </div>

                    {/* Bottom overlay info */}
                    <div className="absolute bottom-3 left-3 right-3">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">
                        {player.position}
                      </div>
                      <h4 className="font-heading font-black text-xl text-white uppercase truncate">
                        {player.full_name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-300 mt-1">
                        <span>{player.club}</span>
                        <span className="w-1 h-1 rounded-full bg-stone-500"></span>
                        <span>{player.age} yosh</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer / Stats */}
                  <div className="p-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-stone-500">Bozor qiymati</div>
                      <div className="font-heading font-black text-sm text-white">{player.market_value}</div>
                    </div>
                    <Link
                      to="/players"
                      className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1"
                    >
                      Profil <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center rounded-2xl bg-white/[0.02] border border-white/10 border-dashed">
                <Search className="w-10 h-10 mx-auto text-stone-600 mb-3" />
                <p className="text-stone-400 text-sm font-semibold">Qidiruv bo'yicha futbolchi topilmadi.</p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedPosition('ALL'); setSelectedAge('ALL'); }}
                  className="mt-4 px-4 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}
          </div>

          {/* Bottom "Barcha O'yinchilar" Button */}
          <div className="mt-12 text-center">
            <Link
              to="/players"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white font-heading font-bold text-xs uppercase tracking-widest transition duration-300"
            >
              Barcha 1,250+ O'yinchilarni Ko'rish
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

        </section>

        {/* ========================================================================= */}
        {/* PLATFORM MODULES: MAYDONLAR, LIVE CENTER, REYTINQ                         */}
        {/* ========================================================================= */}
        <section className="py-20 border-t border-white/10 bg-stadium-card relative">
          <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 border border-white/10 rounded-full px-3 py-1 bg-white/5">
                EKOSISTEMA
              </span>
              <h2 className="font-heading font-black text-3xl sm:text-5xl uppercase tracking-tight text-white mt-4">
                BIR PLATFORMA — TO'LIQ IMKONIYAT
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Module 1: Maydonlar */}
              <Link
                to="/stadiums"
                className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/40 transition duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-black text-2xl uppercase text-white mb-2">
                    Professional Maydonlar
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Toshkent va viloyatlardagi 4K yoritish tizimiga ega eng yaxshi tabiiy va sun'iy maydonlarni onlayn bron qiling.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:gap-3 transition-all">
                  <span>Maydonlarni ko'rish</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Module 2: Live Center */}
              <Link
                to="/live"
                className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-red-500/40 transition duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                    <Activity className="w-6 h-6 text-red-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-heading font-black text-2xl uppercase text-white">
                      Live Center
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Haqiqiy vaqt rejimida o'yinlar hisobi, tarkiblar, xaritadagi harakatlar va skautlarning onlayn qaydlari.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-400 group-hover:gap-3 transition-all">
                  <span>Jonli efirga kirish</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

              {/* Module 3: Reyting & Turnirlar */}
              <Link
                to="/tournaments"
                className="group p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-white/40 transition duration-300 flex flex-col justify-between backdrop-blur-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 group-hover:scale-110 transition duration-300">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-black text-2xl uppercase text-white mb-2">
                    Turnirlar & Kuboklar
                  </h3>
                  <p className="text-stone-400 text-xs leading-relaxed">
                    Cadets Cup, Toshkent Ligasi va xalqaro saralash bosqichlari. Mukofot jamg'armalari va rasmiy skautlar qatnashuvi.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white group-hover:gap-3 transition-all">
                  <span>Turnirlar jadvali</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </Link>

            </div>

          </div>
        </section>

      </div>
    </PageTransition>
  );
}
