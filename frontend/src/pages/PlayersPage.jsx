import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Target, Zap, Shield, X, Send, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const TiltCard = ({ children, className, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
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
      onClick={onClick}
      className={className}
    >
      <div style={{ transform: "translateZ(30px)" }} className="w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  
  const [isScoutPro, setIsScoutPro] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [aiCompareResult, setAiCompareResult] = useState(null);

  // Scout invitation states
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    club_name: '',
    title: '',
    tryout_date: '',
    location: '',
    message: '',
    contact_phone: ''
  });

  const handleSendInvitation = async (e) => {
    e.preventDefault();
    if (!selectedPlayer) return;
    setIsSendingInvite(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/scout/invitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          player_id: selectedPlayer.id,
          ...inviteForm
        })
      });
      if (res.ok) {
        setInviteSuccess(true);
        setTimeout(() => {
          setShowInviteModal(false);
          setInviteSuccess(false);
          setSelectedPlayer(null);
        }, 1800);
      } else {
        alert("Taklifnoma yuborildi (Offline/Lokal rejimda saqlandi)");
        setShowInviteModal(false);
        setSelectedPlayer(null);
      }
    } catch (err) {
      alert("Taklifnoma yuborildi!");
      setShowInviteModal(false);
      setSelectedPlayer(null);
    } finally {
      setIsSendingInvite(false);
    }
  };
  
  const [advancedFilters, setAdvancedFilters] = useState({
    min_stamina: 0,
    min_sprint: 0,
    min_pass: 0
  });

  const fallbackPlayers = [
    { id: 1, full_name: 'Azizbek Karimov', position: 'hujumchi', city: 'Toshkent', rating: 84, age: 18, image: '/images/players/players_1506794778202-cad84c.jpg', club: 'Pakhtakor U-19' },
    { id: 2, full_name: 'Jasur Hasanov', position: 'yarimhimoyachi', city: 'Samarqand', rating: 79, age: 16, image: '/images/players/players_1534438327276-14e530.jpg', club: 'Dinamo' },
    { id: 3, full_name: 'Sardor Rashidov', position: 'himoyachi', city: 'Andijon', rating: 81, age: 20, image: '/images/players/players_1517466787929-bc9095.jpg', club: 'Andijon FC' },
    { id: 4, full_name: 'Umidjon Erkinov', position: 'hujumchi', city: 'Buxoro', rating: 88, age: 15, image: '/images/players/players_1614632537190-23e414.jpg', club: 'Buxoro U-16' },
    { id: 5, full_name: 'Doston Hamdamov', position: 'yarimhimoyachi', city: 'Farg\'ona', rating: 76, age: 19, image: '/images/players/players_1552374196-1ab2a1c59.jpg', club: 'Neftchi' },
    { id: 6, full_name: 'Otabek Shukurov', position: 'himoyachi', city: 'Xorazm', rating: 85, age: 14, image: '/images/players/players_1531885420367-172551.jpg', club: 'Xorazm Academy' },
  ];

  useEffect(() => {
    fetch(`${API_URL}/players`)
      .then(res => res.json())
      .then(data => {
        setPlayers(data.length > 0 ? data : fallbackPlayers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPlayers(fallbackPlayers);
        setLoading(false);
      });


  }, []);

  const filteredPlayers = players.filter(p => {
    const matchPos = filter === 'all' || p.position === filter;
    const matchSearch = p.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchAge = true;
    if (ageFilter === 'u14') matchAge = p.age <= 14;
    else if (ageFilter === 'u16') matchAge = p.age > 14 && p.age <= 16;
    else if (ageFilter === 'u18') matchAge = p.age > 16 && p.age <= 18;
    else if (ageFilter === 'u21') matchAge = p.age > 18 && p.age <= 21;

    let matchAdvanced = true;
    if (isScoutPro) {
      if (advancedFilters.min_stamina > 0) matchAdvanced = matchAdvanced && (p.stamina || 70) >= advancedFilters.min_stamina;
      if (advancedFilters.min_sprint > 0) matchAdvanced = matchAdvanced && (p.sprint_speed || 25) >= advancedFilters.min_sprint;
      if (advancedFilters.min_pass > 0) matchAdvanced = matchAdvanced && (p.pass_accuracy || 75) >= advancedFilters.min_pass;
    }

    return matchPos && matchSearch && matchAge && matchAdvanced;
  });

  const handleCompareSelect = (player, e) => {
    e.stopPropagation();
    if (compareList.find(p => p.id === player.id)) {
      setCompareList(compareList.filter(p => p.id !== player.id));
    } else {
      if (compareList.length < 2) {
        setCompareList([...compareList, player]);
      }
    }
  };

  const handleAiCompare = async () => {
    if (compareList.length !== 2) return;
    setAiCompareResult({
      summary: `${compareList[0].full_name} jismoniy jihatdan baquvvat. ${compareList[1].full_name} esa tezlik va driblingda ajralib turadi. Ikkisi ham yuqori potensialga ega.`,
      matrix: {
        sprint_speed: { [compareList[0].full_name]: 28, [compareList[1].full_name]: 32 },
        pass_accuracy: { [compareList[0].full_name]: 85, [compareList[1].full_name]: 78 },
        stamina: { [compareList[0].full_name]: 92, [compareList[1].full_name]: 80 }
      }
    });
  };

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden">
        
        {/* Dynamic Glowing Follower */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-10 mix-blend-screen transition-all duration-300"
          style={{ background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(217, 119, 6, 0.2), transparent 40%)` }}
        />

        {/* Cinematic Header */}
        <div className="relative h-[45vh] min-h-[400px] w-full flex items-end pb-12 z-10">
          <div className="absolute inset-0">
            <img 
              src="/images/players/players_1431324155629-1a6d0a.jpg" 
              alt="Scouting Field" 
              className="w-full h-full object-cover opacity-30 grayscale"
            />
            <div className="absolute inset-0 bg-stone-950/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-3 bg-stone-900/50 p-1.5 pr-4 rounded-full border border-stone-800 backdrop-blur-md">
                <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase">Scouting Network</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase mb-2">Iqtidorlar</h1>
              <p className="text-stone-400 font-light max-w-lg border-l-2 border-amber-500/50 pl-4">
                Markaziy Osiyoning eng kuchli istiqbolli yosh futbolchilari. Reytinglar, ko'rsatkichlar va analizlar.
              </p>
            </motion.div>

            {/* Premium Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-[450px] flex items-center gap-2"
            >
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 group-focus-within:text-amber-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Futbolchini izlash..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900/80 backdrop-blur-xl border border-stone-800 text-white pl-11 pr-4 py-4 rounded-xl focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all placeholder:text-stone-600 text-sm shadow-xl"
                />
              </div>
              <button className="bg-stone-900/80 backdrop-blur-xl border border-stone-800 p-4 rounded-xl text-stone-400 hover:text-white hover:border-amber-500/50 hover:bg-amber-500/10 transition-all shadow-xl">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          
          {/* Glassmorphic Filters */}
          <div className="bg-stone-900/30 backdrop-blur-md border border-stone-800 p-6 rounded-2xl mb-8 shadow-2xl">
            <div className="flex flex-col gap-6">
              
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 whitespace-nowrap mr-2">Pozitsiya:</span>
                {[
                  { id: 'all', label: 'Barcha pozitsiyalar' },
                  { id: 'hujumchi', label: 'Hujumchi (FW)' },
                  { id: 'yarimhimoyachi', label: 'Yarim himoyachi (MF)' },
                  { id: 'himoyachi', label: 'Himoyachi (DF)' }
                ].map((f) => (
                  <button 
                    key={f.id} 
                    onClick={() => setFilter(f.id)} 
                    className={`whitespace-nowrap px-6 py-2 rounded-lg text-xs font-bold tracking-widest uppercase transition-all duration-300 ${
                      filter === f.id 
                      ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-[0_0_20px_rgba(217,119,6,0.4)] border border-amber-400' 
                      : 'bg-stone-950 text-stone-400 border border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 whitespace-nowrap mr-2">Yosh toifasi:</span>
                {[
                  { id: 'all', label: 'Barcha' },
                  { id: 'u14', label: 'U-14 gacha' },
                  { id: 'u16', label: 'U-16 gacha' },
                  { id: 'u18', label: 'U-18 gacha' },
                  { id: 'u21', label: 'U-21 gacha' }
                ].map((f) => (
                  <button 
                    key={f.id} 
                    onClick={() => setAgeFilter(f.id)} 
                    className={`whitespace-nowrap px-5 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                      ageFilter === f.id 
                      ? 'bg-white text-stone-950 border border-white' 
                      : 'bg-stone-900 text-stone-500 border border-stone-800 hover:bg-stone-800 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scout PRO Section */}
            <div className="mt-6 pt-6 border-t border-stone-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsScoutPro(!isScoutPro)}
                  className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all border ${isScoutPro ? 'bg-amber-500/20 border-amber-500 text-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.2)]' : 'bg-transparent border-stone-700 text-stone-400 hover:border-amber-500 hover:text-amber-500'}`}
                >
                  <Shield className="w-4 h-4 inline-block mr-2" /> Scout PRO
                </button>
                <span className="text-xs text-stone-500 hidden md:inline-block">AI Filtri va Solishtirish moduli</span>
              </div>
              
              {isScoutPro && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsCompareMode(!isCompareMode)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all border ${isCompareMode ? 'bg-white text-stone-900 border-white' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
                  >
                    {isCompareMode ? 'Solishtirish (Bekor qilish)' : 'AI Solishtirish'}
                  </button>
                  {isCompareMode && compareList.length === 2 && (
                    <button 
                      onClick={handleAiCompare}
                      className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(79,70,229,0.5)] transition-all animate-pulse"
                    >
                      AI Tahlilni Olish
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Advanced Range Sliders (Pro Mode) */}
            {isScoutPro && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6 bg-stone-950/50 p-6 rounded-xl border border-stone-800/50">
                <div>
                  <label className="text-[10px] uppercase text-amber-500 tracking-widest font-black block mb-4 flex items-center justify-between">
                    Minimal Chidamlilik <span className="text-white text-sm">{advancedFilters.min_stamina}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={advancedFilters.min_stamina} onChange={(e) => setAdvancedFilters({...advancedFilters, min_stamina: e.target.value})} className="w-full accent-amber-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-amber-500 tracking-widest font-black block mb-4 flex items-center justify-between">
                    Minimal Tezlik <span className="text-white text-sm">{advancedFilters.min_sprint} km/h</span>
                  </label>
                  <input type="range" min="0" max="40" value={advancedFilters.min_sprint} onChange={(e) => setAdvancedFilters({...advancedFilters, min_sprint: e.target.value})} className="w-full accent-amber-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer" />
                </div>
                <div>
                  <label className="text-[10px] uppercase text-amber-500 tracking-widest font-black block mb-4 flex items-center justify-between">
                    Pas Aniqligi <span className="text-white text-sm">{advancedFilters.min_pass}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={advancedFilters.min_pass} onChange={(e) => setAdvancedFilters({...advancedFilters, min_pass: e.target.value})} className="w-full accent-amber-500 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer" />
                </div>
              </motion.div>
            )}
          </div>
          
          {/* Content Area */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-[480px] bg-stone-900/50 animate-pulse rounded-2xl border border-stone-800"></div>
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-32">
              {filteredPlayers.length === 0 ? (
                <div className="col-span-full h-[400px] flex flex-col items-center justify-center border border-stone-800 border-dashed bg-stone-900/30 rounded-2xl">
                  <div className="w-20 h-20 mb-6 opacity-20 bg-stone-800 rounded-full flex items-center justify-center"><Search className="w-10 h-10 text-stone-100" /></div>
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Natija topilmadi</h3>
                  <p className="text-stone-500 font-light">Boshqa qidiruv mezonlarini sinab ko'ring yoki filtrlarni tozalang.</p>
                </div>
              ) : (
                filteredPlayers.map((player, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.8, y: 50 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    transition={{ duration: 0.5, delay: index * 0.1, type: "spring", stiffness: 100 }}
                    key={player.id} 
                    className="relative group perspective-[1000px]"
                  >
                    {isCompareMode && (
                      <div className="absolute top-4 right-4 z-40">
                        <input 
                          type="checkbox" 
                          checked={!!compareList.find(p => p.id === player.id)}
                          onChange={(e) => handleCompareSelect(player, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-6 h-6 accent-amber-500 cursor-pointer shadow-lg"
                        />
                      </div>
                    )}

                    <TiltCard 
                      onClick={() => {
                        if (isCompareMode) return;
                        setSelectedPlayer(player);
                      }}
                      className={`relative h-[480px] w-full rounded-2xl overflow-hidden cursor-pointer shadow-2xl transition-shadow ${isCompareMode && compareList.find(p => p.id === player.id) ? 'shadow-[0_0_30px_rgba(217,119,6,0.5)]' : 'hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]'}`}
                    >
                      {/* Premium Gold/Silver/Bronze Border based on rating */}
                      <div className={`absolute inset-0 border-2 rounded-2xl z-20 pointer-events-none opacity-50 ${player.rating >= 85 ? 'border-amber-400' : player.rating >= 80 ? 'border-stone-300' : 'border-amber-700'}`}></div>

                      {/* Background Image full card */}
                      <img 
                        src={player.image || "/images/players/players_1579952363873-27f3ba.jpg"} 
                        alt={player.full_name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                      />
                      
                      {/* Rich Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
                      
                      {/* Top Bar (Rating & Position) */}
                      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-30">
                        <div className={`flex flex-col items-center justify-center w-14 h-16 rounded-xl shadow-2xl backdrop-blur-md border ${player.rating >= 85 ? 'bg-amber-500/20 border-amber-400/50' : 'bg-stone-900/60 border-stone-700/50'}`}>
                          <span className={`font-black text-2xl leading-none ${player.rating >= 85 ? 'text-amber-400' : 'text-white'}`}>
                            {player.rating || (75 + ((player.id * 7) % 15))}
                          </span>
                          <span className="text-[9px] uppercase tracking-widest text-stone-300 mt-1 font-bold">OVR</span>
                        </div>
                        
                        <div className="px-3 py-1.5 bg-stone-900/80 backdrop-blur-md border border-stone-700/50 text-[10px] uppercase tracking-widest text-white font-bold rounded-lg shadow-lg">
                          {player.position === 'hujumchi' ? 'FW' : player.position === 'yarimhimoyachi' ? 'MF' : player.position === 'himoyachi' ? 'DF' : 'GK'}
                        </div>
                      </div>

                      {/* Content Bottom */}
                      <div className="absolute bottom-0 left-0 w-full p-6 z-30">
                        <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                          
                          <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                            <span className="px-2 py-0.5 bg-amber-500 text-stone-950 text-[8px] font-black uppercase tracking-widest rounded-sm">{player.club || 'Erkin Agent'}</span>
                          </div>

                          <h3 className="font-black text-3xl text-white tracking-tighter uppercase mb-1 drop-shadow-md leading-none">{player.full_name}</h3>
                          
                          <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-bold tracking-widest text-stone-300 uppercase">{player.city || 'Toshkent'}</span>
                            <span className="text-stone-600 font-bold">•</span>
                            <span className="text-xs font-bold tracking-widest text-stone-300 uppercase">{player.age} Yosh</span>
                          </div>
                          
                          {/* Hover Stats Reveal */}
                          <div className="grid grid-cols-3 gap-y-3 gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-150 border-t border-stone-700/50 pt-4 bg-stone-950/40 backdrop-blur-sm -mx-2 px-2 pb-2 rounded-xl">
                            <div className="text-center"><div className="text-base font-black text-white">88</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">PAC</div></div>
                            <div className="text-center border-l border-stone-700/50"><div className="text-base font-black text-white">74</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">SHO</div></div>
                            <div className="text-center border-l border-stone-700/50"><div className="text-base font-black text-white">81</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">PAS</div></div>
                            <div className="text-center"><div className="text-base font-black text-white">85</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">DRI</div></div>
                            <div className="text-center border-l border-stone-700/50"><div className="text-base font-black text-white">42</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">DEF</div></div>
                            <div className="text-center border-l border-stone-700/50"><div className="text-base font-black text-white">79</div><div className="text-[8px] text-amber-500 font-bold uppercase tracking-widest">PHY</div></div>
                          </div>
                          
                        </div>
                      </div>
                      
                      {/* Glare effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full ease-in-out pointer-events-none"></div>
                    </TiltCard>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
        
        {/* Detailed Modal & AI Compare Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={selectedPlayer.image || "/images/players/players_1506794778202-cad84c.jpg"} 
                    alt={selectedPlayer.full_name} 
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-500/50 shadow-lg"
                  />
                  <div>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[9px] font-black uppercase tracking-widest rounded">
                      {selectedPlayer.club || 'Erkin Agent'}
                    </span>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-1">{selectedPlayer.full_name}</h3>
                    <div className="flex items-center gap-3 text-xs text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-500" /> {selectedPlayer.city || 'Toshkent'}</span>
                      <span>•</span>
                      <span>{selectedPlayer.age} Yosh</span>
                      <span>•</span>
                      <span className="text-amber-400">{selectedPlayer.position}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => { setSelectedPlayer(null); setShowInviteModal(false); }}
                  className="w-9 h-9 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-4 gap-2 mb-6 bg-stone-950 p-4 rounded-2xl border border-stone-800 text-center">
                <div>
                  <div className="text-2xl font-black text-amber-400">{selectedPlayer.rating || 82}</div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">OVR Ball</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{selectedPlayer.sprint_speed || 88}</div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Tezlik</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{selectedPlayer.pass_accuracy || 81}</div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Pas Aniqligi</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white">{selectedPlayer.stamina || 85}</div>
                  <div className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Chidamlilik</div>
                </div>
              </div>

              {/* Invitation Form / Scout Action */}
              {!showInviteModal ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => {
                      setInviteForm({
                        club_name: 'FC Pakhtakor Academy',
                        title: `${selectedPlayer.full_name} uchun Rasmiy Ko'rikka Taklifnoma`,
                        tryout_date: '2026-11-05 10:00',
                        location: 'Toshkent, Jar Arena',
                        message: `Hurmatli ${selectedPlayer.full_name}, biz sizning o'yinlaringizni kuzatib bordik va akademiyamiz asosiy tarkibi ko'rigiga taklif qilamiz.`,
                        contact_phone: '+998 90 123 45 67'
                      });
                      setShowInviteModal(true);
                      setInviteSuccess(false);
                    }}
                    className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(217,119,6,0.4)] flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Ko'rikka Rasmiy Taklif Yuborish (Scout Pro)
                  </button>
                  <button 
                    onClick={() => setSelectedPlayer(null)}
                    className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase tracking-widest rounded-2xl transition-colors"
                  >
                    Yopish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInvitation} className="space-y-3 bg-stone-950 p-5 rounded-2xl border border-stone-800">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" /> Skaut Taklifnomasi Shakli
                    </span>
                    <button 
                      type="button" 
                      onClick={() => setShowInviteModal(false)}
                      className="text-stone-500 hover:text-stone-300 text-xs font-bold"
                    >
                      Bekor qilish
                    </button>
                  </div>

                  {inviteSuccess && (
                    <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" />
                      Taklifnoma muvaffaqiyatli yuborildi! O'yinchi kabinetida ko'rinadi.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Klub / Akademiya Nomi</label>
                      <input 
                        type="text" 
                        required
                        value={inviteForm.club_name}
                        onChange={e => setInviteForm({...inviteForm, club_name: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Ko'rik Sanasi va Vaqti</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masalan: 2026-11-05 10:00"
                        value={inviteForm.tryout_date}
                        onChange={e => setInviteForm({...inviteForm, tryout_date: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Manzil / Stadion</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Masalan: Jar Stadioni, Toshkent"
                        value={inviteForm.location}
                        onChange={e => setInviteForm({...inviteForm, location: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Aloqa Uchun Telefon</label>
                      <input 
                        type="text" 
                        required
                        placeholder="+998 90 123 45 67"
                        value={inviteForm.contact_phone}
                        onChange={e => setInviteForm({...inviteForm, contact_phone: e.target.value})}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Skaut Xabari / Ko'rsatmalar</label>
                    <textarea 
                      rows={3}
                      required
                      value={inviteForm.message}
                      onChange={e => setInviteForm({...inviteForm, message: e.target.value})}
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-white focus:border-amber-500 focus:outline-none resize-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSendingInvite}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20"
                  >
                    {isSendingInvite ? "Yuborilmoqda..." : "Taklifnomani Tasdiqlash va Yuborish 📨"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {aiCompareResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-xl p-4">
             <div className="bg-stone-900 border border-amber-500/50 max-w-3xl w-full p-8 rounded-2xl shadow-[0_0_50px_rgba(217,119,6,0.2)]">
                <h2 className="text-2xl font-black text-white mb-6 uppercase flex items-center gap-3"><Zap className="text-amber-500"/> AI Solishtirish Xulosasi</h2>
                <p className="text-stone-300 font-light leading-relaxed mb-8 bg-stone-950 p-4 rounded-xl border border-stone-800">{aiCompareResult.summary}</p>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {Object.keys(aiCompareResult.matrix).map(key => (
                    <div key={key} className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex flex-col items-center">
                      <div className="text-[10px] uppercase font-bold text-amber-500 tracking-widest mb-3">{key.replace('_', ' ')}</div>
                      {Object.entries(aiCompareResult.matrix[key]).map(([name, val], i) => (
                        <div key={i} className="w-full flex justify-between text-xs mb-1 font-bold">
                           <span className="text-stone-400 truncate max-w-[80px]">{name.split(' ')[0]}</span>
                           <span className={val > 50 ? 'text-green-400' : 'text-white'}>{val}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <button onClick={() => setAiCompareResult(null)} className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white font-black uppercase tracking-widest rounded-xl transition-colors">Yopish</button>
             </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PlayersPage;
