import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  Search, 
  Star, 
  ShieldCheck, 
  Sun, 
  Moon, 
  Info, 
  X, 
  ExternalLink, 
  Compass, 
  Clock, 
  CheckCircle2, 
  Filter,
  Sparkles,
  Layers
} from 'lucide-react';
import { API_URL } from '../config';

// 3D Perspective interactive Uzbekistan regions metadata
const REGIONS_DATA = [
  { id: 'barchasi', name: 'Barchasi', count: '10+', x: 50, y: 50 },
  { id: "Farg'ona", name: "Farg'ona", count: '4 ta arena', x: 82, y: 56, highlight: true },
  { id: 'Toshkent', name: 'Toshkent', count: '3 ta arena', x: 68, y: 38 },
  { id: 'Andijon', name: 'Andijon', count: '1 ta arena', x: 88, y: 52 },
  { id: 'Namangan', name: 'Namangan', count: '1 ta arena', x: 78, y: 44 },
  { id: 'Samarqand', name: 'Samarqand', count: '1 ta arena', x: 54, y: 64 },
  { id: 'Buxoro', name: 'Buxoro', count: 'Tez kunda', x: 42, y: 58 },
  { id: 'Qashqadaryo', name: 'Qashqadaryo', count: 'Tez kunda', x: 52, y: 78 },
  { id: 'Xorazm', name: 'Xorazm', count: 'Tez kunda', x: 26, y: 42 },
];

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('barchasi');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStadium, setSelectedStadium] = useState(null);
  const [routeModalStadium, setRouteModalStadium] = useState(null);

  useEffect(() => {
    fetchStadiums();
  }, [selectedRegion]);

  const fetchStadiums = async () => {
    setLoading(true);
    try {
      const url = selectedRegion === 'barchasi' 
        ? `${API_URL}/api/stadiums` 
        : `${API_URL}/api/stadiums?region=${encodeURIComponent(selectedRegion)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setStadiums(data);
      }
    } catch (err) {
      console.error("Stadionlarni yuklashda xatolik:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStadiums = stadiums.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.district && s.district.toLowerCase().includes(q)) ||
      (s.address && s.address.toLowerCase().includes(q)) ||
      s.region.toLowerCase().includes(q)
    );
  });

  // Open Route Navigator modal / direct maps handler
  const handleOpenRoute = (stadium, e) => {
    if (e) e.stopPropagation();
    setRouteModalStadium(stadium);
  };

  // Direct Phone Call
  const handleCall = (phone, e) => {
    if (e) e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\s+/g, '')}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-stone-100 pb-24 md:pb-16 selection:bg-amber-500 selection:text-black">
      
      {/* 1. HERO & 3D MAP HEADER */}
      <div className="relative border-b border-stone-800/80 bg-gradient-to-b from-stone-900/60 via-stone-950 to-[#050505] overflow-hidden pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -top-10 right-10 w-[300px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Badge & Title */}
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4 shadow-lg shadow-amber-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>O'zbekiston Bo'ylab 3D Stadionlar Xaritasi</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25, delay: 0.1 }}
              className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight"
            >
              Maydon Toping, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500">1-Bosishda</span> Biringizga Oling
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-stone-400 text-sm sm:text-base mt-3 max-w-xl font-medium"
            >
              Farg'ona, Toshkent va butun respublika bo'ylab professional sun'iy va tabiiy maysali stadionlar.
            </motion.p>
          </div>

          {/* 3D FUTURISTIC UZBEKISTAN MAP WIDGET */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
            className="relative rounded-2xl bg-stone-900/40 border border-stone-800/80 backdrop-blur-xl p-4 sm:p-6 shadow-2xl overflow-hidden mb-8"
            style={{ perspective: "1000px" }}
          >
            {/* Top Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-800/60 mb-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-300">
                <Compass className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '12s' }} />
                <span>Interaktiv Radar & 3D Panorama:</span>
                <span className="text-amber-400 font-black">{selectedRegion === 'barchasi' ? "Barcha Viloyatlar" : selectedRegion}</span>
              </div>
              <div className="text-[11px] text-stone-500 font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Jonli Holat: Maydonlar Ochiq</span>
              </div>
            </div>

            {/* Stylized 3D Perspective Map Area */}
            <div className="relative w-full h-[220px] sm:h-[280px] bg-radial from-stone-900/80 via-stone-950 to-[#070707] rounded-xl border border-stone-800/40 flex items-center justify-center overflow-hidden group">
              
              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#20202015_1px,transparent_1px),linear-gradient(to_bottom,#20202015_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

              {/* Uzbekistan Stylized Silhouette Vector (3D Tilted Perspective) */}
              <svg 
                viewBox="0 0 1000 500" 
                className="w-full h-full max-w-4xl opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
                style={{ transform: "rotateX(20deg) scale(0.95)" }}
              >
                <defs>
                  <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#222" />
                    <stop offset="50%" stopColor="#181818" />
                    <stop offset="100%" stopColor="#2a2012" />
                  </linearGradient>
                  <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="0.2" />
                  </linearGradient>
                </defs>

                {/* Simplified contour of Uzbekistan */}
                <path 
                  d="M 120 220 C 180 180, 240 140, 320 160 C 400 180, 480 200, 560 180 C 620 150, 700 140, 780 180 C 840 220, 920 220, 950 250 C 900 290, 840 310, 780 320 C 720 330, 640 340, 580 360 C 520 380, 480 390, 420 370 C 340 330, 260 300, 180 280 Z" 
                  fill="url(#mapGrad)" 
                  stroke="#3e382e" 
                  strokeWidth="2.5" 
                  filter="drop-shadow(0 15px 25px rgba(0,0,0,0.8))"
                />

                {/* Connection Flight lines / Radar Beams */}
                <path 
                  d="M 680 190 Q 750 210 820 250" 
                  fill="none" 
                  stroke="url(#glowGrad)" 
                  strokeWidth="1.5" 
                  strokeDasharray="4,4" 
                  className="animate-pulse"
                />
                <path 
                  d="M 540 280 Q 640 230 820 250" 
                  fill="none" 
                  stroke="#f59e0b" 
                  strokeOpacity="0.4" 
                  strokeWidth="1.5" 
                  strokeDasharray="3,3" 
                />
              </svg>

              {/* Interactive Node Markers Overlay */}
              {REGIONS_DATA.filter(r => r.id !== 'barchasi').map((r) => {
                const isActive = selectedRegion.toLowerCase() === r.id.toLowerCase();
                return (
                  <motion.button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ left: `${r.x}%`, top: `${r.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/node cursor-pointer z-20 ${
                      isActive ? 'scale-110' : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Glowing Pin Marker */}
                    <div className="relative">
                      {isActive && (
                        <span className="absolute -inset-2 rounded-full bg-amber-500/40 animate-ping" />
                      )}
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                        isActive 
                          ? 'bg-amber-500 border-white text-black shadow-lg shadow-amber-500/50' 
                          : 'bg-stone-900 border-amber-500/60 text-amber-400 group-hover/node:border-amber-400'
                      }`}>
                        <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </div>
                    </div>

                    {/* Node Tag */}
                    <span className={`mt-1 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md border transition-colors ${
                      isActive 
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md' 
                        : 'bg-stone-950/80 text-stone-300 border-stone-800 group-hover/node:text-white'
                    }`}>
                      {r.name}
                    </span>
                  </motion.button>
                );
              })}

              {/* Map Footer Helper */}
              <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] text-stone-500 font-bold uppercase tracking-wider pointer-events-none">
                <span>📍 Farg'ona vodiysi & O'zbekiston hududlari</span>
                <span className="hidden sm:inline">Viloyatni tanlang va maydonlarni ko'ring</span>
              </div>
            </div>

            {/* QUICK REGION FILTER PILLS (44px touch targets) */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {REGIONS_DATA.map((r) => {
                const isActive = selectedRegion.toLowerCase() === r.id.toLowerCase();
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRegion(r.id)}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                        : 'bg-stone-900/90 hover:bg-stone-800 text-stone-300 border border-stone-800'
                    }`}
                  >
                    <span>{r.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-black/20 text-black' : 'bg-stone-800 text-stone-400'
                    }`}>
                      {r.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* SEARCH BAR (Instant filter) */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Maydon nomi, tuman yoki manzil bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-h-[48px] pl-12 pr-4 bg-stone-900/80 border border-stone-800 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. STADIUMS GRID SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* Count & Status */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              {selectedRegion === 'barchasi' ? "Barcha Maydonlar" : `${selectedRegion} Maydonlari`}
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
              {filteredStadiums.length} ta
            </span>
          </div>

          <div className="text-xs text-stone-400 font-medium hidden sm:block">
            Har bir maydon uchun atigi <span className="text-amber-400 font-bold">2 ta tugma</span>: Yo'nalish va Band qilish
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-2xl bg-stone-900/50 border border-stone-800/80 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredStadiums.length === 0 && (
          <div className="text-center py-16 px-4 bg-stone-900/30 border border-stone-800/60 rounded-2xl max-w-md mx-auto">
            <MapPin className="w-12 h-12 text-stone-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white uppercase tracking-wider">Maydon topilmadi</h3>
            <p className="text-xs text-stone-400 mt-1">Qidiruv so'zini o'zgartiring yoki boshqa viloyatni tanlang.</p>
            <button
              onClick={() => { setSelectedRegion('barchasi'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-lg"
            >
              Barcha maydonlarni ko'rish
            </button>
          </div>
        )}

        {/* STADIUM CARDS LIST */}
        {!loading && filteredStadiums.length > 0 && (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredStadiums.map((stadium, idx) => (
              <motion.div
                key={stadium.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 30,
                  delay: idx * 0.05 
                }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedStadium(stadium)}
                className="group relative bg-stone-900/70 border border-stone-800/80 hover:border-amber-500/50 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Image & Badges */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-950">
                  <img
                    src={stadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                    alt={stadium.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />

                  {/* Region Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-stone-700 text-[10px] font-black uppercase tracking-wider text-amber-400">
                    <MapPin className="w-3 h-3 text-amber-500" />
                    <span>{stadium.region} {stadium.district ? `• ${stadium.district}` : ''}</span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-stone-700 text-[10px] font-black text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{stadium.rating.toFixed(1)}</span>
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 left-3 text-white">
                    <span className="text-lg font-black tracking-tight text-amber-400">
                      {stadium.price_per_hour.toLocaleString('uz-UZ')}
                    </span>
                    <span className="text-[10px] text-stone-400 uppercase font-bold ml-1">so'm / soat</span>
                  </div>

                  {/* Turf / Lights Badge */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1">
                    {stadium.has_lights && (
                      <span className="p-1 rounded bg-stone-900/80 border border-stone-700 text-amber-400" title="Tungi yoritish tizimi">
                        <Moon className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {stadium.is_indoor && (
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/40 text-blue-300 text-[9px] font-black uppercase">
                        Yopiq Arena
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black uppercase tracking-tight text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {stadium.name}
                    </h3>
                    
                    <p className="text-xs text-stone-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span>{stadium.address || `${stadium.region}, ${stadium.district || 'Markaz'}`}</span>
                    </p>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800/80 text-stone-300 border border-stone-700/60">
                        🌱 {stadium.turf_type}
                      </span>
                      {stadium.features && stadium.features.split(',').slice(0, 2).map((feat, fIdx) => (
                        <span key={fIdx} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-800/60 text-stone-400 border border-stone-800">
                          ✓ {feat.trim()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* --- SENIOR GOLDEN RULE: FAHAT 2 TA KATTA TUGMA --- */}
                  <div className="mt-5 pt-4 border-t border-stone-800/80 grid grid-cols-2 gap-2.5">
                    
                    {/* 1. TUGMA: YO'NALISH OLISH (Maps Navigator) */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={(e) => handleOpenRoute(stadium, e)}
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-md"
                    >
                      <Navigation className="w-4 h-4 text-amber-400" />
                      <span>Yo'nalish</span>
                    </motion.button>

                    {/* 2. TUGMA: BAND QILISH (Direct Call) */}
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={(e) => handleCall(stadium.phone_number, e)}
                      className="min-h-[44px] px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-colors"
                    >
                      <Phone className="w-4 h-4 fill-black" />
                      <span>Band Qilish</span>
                    </motion.button>

                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

      </div>

      {/* 3. MODAL: YO'NALISH XARITASINI TANLASH (Google vs Yandex Navigator) */}
      <AnimatePresence>
        {routeModalStadium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-sm rounded-2xl bg-stone-900 border border-stone-800 p-6 shadow-2xl text-white relative"
            >
              <button
                onClick={() => setRouteModalStadium(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                <Navigation className="w-4 h-4" />
                <span>Navigatsiya & Xarita</span>
              </div>

              <h3 className="text-lg font-black uppercase tracking-tight text-white mb-1">
                {routeModalStadium.name}
              </h3>
              <p className="text-xs text-stone-400 mb-6">
                Qaysi xarita ilovasida ochishni xohlaysiz?
              </p>

              <div className="space-y-3">
                {/* Yandex Navigator */}
                <a
                  href={`https://yandex.com/maps/?rtext=~${routeModalStadium.latitude},${routeModalStadium.longitude}&rtt=auto`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full px-4 py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span>Yandex Xarita / Navigator</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Google Maps */}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${routeModalStadium.latitude},${routeModalStadium.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] w-full px-4 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Google Maps</span>
                  </div>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Native Device Geo Link (Apple Maps / Android Geo) */}
                <a
                  href={`geo:${routeModalStadium.latitude},${routeModalStadium.longitude}?q=${routeModalStadium.latitude},${routeModalStadium.longitude}(${encodeURIComponent(routeModalStadium.name)})`}
                  className="min-h-[48px] w-full px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4 text-amber-400" />
                    <span>Telefonning o'z xaritasi</span>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. MODAL: STADION BATAFSIL MA'LUMOTI */}
      <AnimatePresence>
        {selectedStadium && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-lg rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-2xl text-white relative max-h-[90vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedStadium(null)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 backdrop-blur-md border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Image */}
              <div className="relative h-56 w-full bg-stone-950 shrink-0">
                <img
                  src={selectedStadium.image_url || "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80"}
                  alt={selectedStadium.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded bg-amber-500 text-black">
                      {selectedStadium.region}
                    </span>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mt-1">
                      {selectedStadium.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black text-amber-400">
                      {selectedStadium.price_per_hour.toLocaleString('uz-UZ')}
                    </span>
                    <span className="text-[10px] text-stone-400 block font-bold">SO'M / SOAT</span>
                  </div>
                </div>
              </div>

              {/* Details Body */}
              <div className="p-6 overflow-y-auto space-y-4">
                
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Manzil & Hudud:</h4>
                  <p className="text-sm text-stone-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{selectedStadium.address || `${selectedStadium.region}, ${selectedStadium.district || ''}`}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Maysa turi:</span>
                    <span className="text-xs font-black text-emerald-400 mt-0.5 block">{selectedStadium.turf_type}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-stone-950/60 border border-stone-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Tungi yoritish:</span>
                    <span className="text-xs font-black text-amber-400 mt-0.5 block">
                      {selectedStadium.has_lights ? "Mavjud (Pro LED)" : "Mavjud emas"}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">Mavjud qulayliklar:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedStadium.features || "Dush, Kiyinish xonasi, Avtoturargoh, Kafe").split(',').map((f, idx) => (
                      <span key={idx} className="px-3 py-1.5 rounded-lg bg-stone-800/80 border border-stone-700 text-xs font-semibold text-stone-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{f.trim()}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Administrator Call Card */}
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 block">Administrator bilan bog'lanish:</span>
                    <span className="text-sm font-black text-white">{selectedStadium.phone_number}</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase">08:00 - 02:00</span>
                </div>

                {/* 2 Primary CTA Buttons in Modal */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const s = selectedStadium;
                      setSelectedStadium(null);
                      setRouteModalStadium(s);
                    }}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 border border-stone-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-4 h-4 text-amber-400" />
                    <span>Yo'nalish Olish</span>
                  </button>

                  <button
                    onClick={() => handleCall(selectedStadium.phone_number)}
                    className="min-h-[48px] px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                  >
                    <Phone className="w-4 h-4 fill-black" />
                    <span>Qo'ng'iroq Qilish</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
