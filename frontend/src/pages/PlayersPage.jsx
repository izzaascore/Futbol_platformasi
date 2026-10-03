import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, Target, Zap } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const PlayersPage = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [ageFilter, setAgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Scout PRO features
  const [isScoutPro, setIsScoutPro] = useState(false);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [aiCompareResult, setAiCompareResult] = useState(null);
  
  const [advancedFilters, setAdvancedFilters] = useState({
    min_stamina: 0,
    min_sprint: 0,
    min_pass: 0
  });

  // Simulating dummy players if the API is empty, just to show the beautiful cards
  const fallbackPlayers = [
    { id: 1, full_name: 'Azizbek Karimov', position: 'hujumchi', city: 'Toshkent', rating: 84, age: 18, image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop' },
    { id: 2, full_name: 'Jasur Hasanov', position: 'yarimhimoyachi', city: 'Samarqand', rating: 79, age: 16, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600&auto=format&fit=crop' },
    { id: 3, full_name: 'Sardor Rashidov', position: 'himoyachi', city: 'Andijon', rating: 81, age: 20, image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=600&auto=format&fit=crop' },
    { id: 4, full_name: 'Umidjon Erkinov', position: 'hujumchi', city: 'Buxoro', rating: 88, age: 15, image: 'https://images.unsplash.com/photo-1614632537190-23e414c77c0c?q=80&w=600&auto=format&fit=crop' },
    { id: 5, full_name: 'Doston Hamdamov', position: 'yarimhimoyachi', city: 'Farg\'ona', rating: 76, age: 19, image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=600&auto=format&fit=crop' },
    { id: 6, full_name: 'Otabek Shukurov', position: 'himoyachi', city: 'Xorazm', rating: 85, age: 14, image: 'https://images.unsplash.com/photo-1531885420367-172551e180d5?q=80&w=600&auto=format&fit=crop' },
  ];

  useEffect(() => {
    fetch('http://localhost:8000/players')
      .then(res => res.json())
      .then(data => {
        // If data is empty from backend, use fallback so the premium UI is visible
        setPlayers(data.length > 0 ? data : fallbackPlayers);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPlayers(fallbackPlayers); // use fallback on error
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
    try {
      const res = await fetch('http://localhost:8000/ai-compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1_id: compareList[0].id, player2_id: compareList[1].id })
      });
      const data = await res.json();
      setAiCompareResult(data);
    } catch (e) {
      // Mock result if backend not reachable
      setAiCompareResult({
        summary: `${compareList[0].full_name} jismoniy jihatdan baquvvat va uzoq masofalarga pas berishda ustun. ${compareList[1].full_name} esa tezlik va driblingda ajralib turadi. Ikkala o'yinchi ham yoshlar terma jamoasi uchun potensial nomzod.`,
        matrix: {
          sprint_speed: { [compareList[0].full_name]: 28, [compareList[1].full_name]: 32 },
          pass_accuracy: { [compareList[0].full_name]: 85, [compareList[1].full_name]: 78 },
          stamina: { [compareList[0].full_name]: 92, [compareList[1].full_name]: 80 }
        }
      });
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans">
        
        {/* Cinematic Header */}
        <div className="relative h-[45vh] min-h-[400px] w-full flex items-end pb-12">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1431324155629-1a6d0a11f486?q=80&w=2500&auto=format&fit=crop" 
              alt="Scouting Field" 
              className="w-full h-full object-cover filter grayscale"
            />
            <div className="absolute inset-0 bg-stone-950/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
                <span className="text-[10px] font-bold tracking-[0.2em] text-amber-500 uppercase">Scouting Network</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase mb-2">Iqtidorlar</h1>
              <p className="text-stone-400 font-light max-w-lg">
                Markaziy Osiyoning eng kuchli istiqbolli yosh futbolchilari. Reytinglar, ko'rsatkichlar va analizlar.
              </p>
            </motion.div>

            {/* Advanced Search/Filter Bar simulating real product interface */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-[450px] flex items-center gap-2"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                <input 
                  type="text" 
                  placeholder="Futbolchini izlash..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-stone-900/80 border border-stone-800 text-white pl-11 pr-4 py-3 rounded-sm focus:outline-none focus:border-amber-500 transition-colors placeholder:text-stone-600 text-sm"
                />
              </div>
              <button className="bg-stone-900/80 border border-stone-800 p-3 rounded-sm text-stone-400 hover:text-white hover:border-amber-500 transition-all flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-stone-800">
          
          {/* Filter Navigation */}
          <div className="flex flex-col gap-4 mb-8">
            {/* Position Filters */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[
                { id: 'all', label: 'Barcha pozitsiyalar' },
                { id: 'hujumchi', label: 'Markaziy hujumchi (CF)' },
                { id: 'yarimhimoyachi', label: 'Markaziy yarim himoyachi (CM)' },
                { id: 'himoyachi', label: 'Qanot himoyachisi (RB/LB)' }
              ].map((f) => (
                <button 
                  key={f.id} 
                  onClick={() => setFilter(f.id)} 
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                    filter === f.id 
                    ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.3)]' 
                    : 'bg-stone-900 text-stone-400 border border-stone-800 hover:bg-stone-800 hover:text-stone-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Age Filters */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {[
                { id: 'all', label: 'Barcha yosh' },
                { id: 'u14', label: 'U-14 gacha' },
                { id: 'u16', label: 'U-16 gacha' },
                { id: 'u18', label: 'U-18 gacha' },
                { id: 'u21', label: 'U-21 gacha' }
              ].map((f) => (
                <button 
                  key={f.id} 
                  onClick={() => setAgeFilter(f.id)} 
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${
                    ageFilter === f.id 
                    ? 'bg-stone-700 text-white border border-stone-500' 
                    : 'bg-stone-900/50 text-stone-500 border border-stone-800 hover:bg-stone-800 hover:text-stone-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            
            {/* Scout PRO Toggle & AI Compare Button */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-stone-900 border border-amber-500/30 p-4 rounded-sm gap-4 mt-2">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsScoutPro(!isScoutPro)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border ${isScoutPro ? 'bg-amber-600 border-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]' : 'bg-transparent border-amber-600 text-amber-500 hover:bg-amber-600/10'}`}
                >
                  Scout PRO
                </button>
                <span className="text-xs text-stone-400">PRO obunasi faollashtirilganda chuqurlashtirilgan filtrlar va maxfiy hisobotlar ochiladi.</span>
              </div>
              <div className="flex items-center gap-4">
                {isScoutPro && (
                  <button 
                    onClick={() => setIsCompareMode(!isCompareMode)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors border ${isCompareMode ? 'bg-stone-100 text-stone-900 border-stone-100' : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-700'}`}
                  >
                    {isCompareMode ? 'Solishtirishni yopish' : 'AI Solishtirish (2ta tanlang)'}
                  </button>
                )}
                {isCompareMode && compareList.length === 2 && (
                  <button 
                    onClick={handleAiCompare}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(79,70,229,0.4)] transition-all"
                  >
                    AI Xulosasini Olish
                  </button>
                )}
              </div>
            </div>

            {/* Advanced Filters (Only Visible in Scout PRO) */}
            {isScoutPro && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-950 p-6 border border-stone-800 mt-2">
                <div>
                  <label className="text-[10px] uppercase text-stone-500 tracking-widest font-bold block mb-2">Minimal Chidamlilik (Stamina)</label>
                  <input type="range" min="0" max="100" value={advancedFilters.min_stamina} onChange={(e) => setAdvancedFilters({...advancedFilters, min_stamina: e.target.value})} className="w-full accent-amber-500" />
                  <div className="text-xs text-amber-500 text-right mt-1 font-bold">{advancedFilters.min_stamina}%</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 tracking-widest font-bold block mb-2">Minimal Tezlik (km/h)</label>
                  <input type="range" min="0" max="40" value={advancedFilters.min_sprint} onChange={(e) => setAdvancedFilters({...advancedFilters, min_sprint: e.target.value})} className="w-full accent-amber-500" />
                  <div className="text-xs text-amber-500 text-right mt-1 font-bold">{advancedFilters.min_sprint} km/h</div>
                </div>
                <div>
                  <label className="text-[10px] uppercase text-stone-500 tracking-widest font-bold block mb-2">Pas Aniqligi (%)</label>
                  <input type="range" min="0" max="100" value={advancedFilters.min_pass} onChange={(e) => setAdvancedFilters({...advancedFilters, min_pass: e.target.value})} className="w-full accent-amber-500" />
                  <div className="text-xs text-amber-500 text-right mt-1 font-bold">{advancedFilters.min_pass}%</div>
                </div>
              </motion.div>
            )}

          </div>
          
          {/* Content Area */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => (
                <div key={i} className="h-[400px] bg-stone-900 animate-pulse rounded-sm border border-stone-800"></div>
              ))}
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredPlayers.length === 0 ? (
                <div className="col-span-full h-[400px] flex flex-col items-center justify-center border border-stone-800 bg-stone-900/50 rounded-sm">
                  <div className="w-20 h-20 mb-4 opacity-20"><Search className="w-full h-full text-stone-100" /></div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase">Natija topilmadi</h3>
                  <p className="text-stone-500 font-light text-sm">Boshqa qidiruv mezonlarini sinab ko'ring.</p>
                </div>
              ) : (
                filteredPlayers.map((player, index) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    key={player.id} 
                    onClick={() => {
                      if (isCompareMode) return;
                      setSelectedPlayer(player);
                    }}
                    className={`group relative h-[420px] bg-stone-900 rounded-sm overflow-hidden border ${isCompareMode && compareList.find(p => p.id === player.id) ? 'border-amber-500 shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'border-stone-800'} cursor-pointer`}
                  >
                    {isCompareMode && (
                      <div className="absolute top-2 right-2 z-30">
                        <input 
                          type="checkbox" 
                          checked={!!compareList.find(p => p.id === player.id)}
                          onChange={(e) => handleCompareSelect(player, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-6 h-6 accent-amber-500 cursor-pointer"
                        />
                      </div>
                    )}
                    {/* Background Image full card */}
                    <img 
                      src={player.image || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop"} 
                      alt={player.full_name} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out grayscale group-hover:grayscale-0"
                    />
                    
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-stone-900/10 opacity-90 group-hover:opacity-70 transition-opacity duration-500"></div>
                    
                    {/* Card Content Top */}
                    <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-start z-10">
                      <div className="flex flex-col items-center justify-center w-12 h-14 bg-stone-950/80 backdrop-blur-md border border-stone-700/50 rounded-sm shadow-xl">
                        <span className="text-amber-500 font-bold text-xl leading-none">{player.rating || (Math.floor(Math.random() * 20) + 70)}</span>
                        <span className="text-[8px] uppercase tracking-widest text-stone-400 mt-1">OVR</span>
                      </div>
                      
                      <div className="px-3 py-1 bg-stone-900/80 backdrop-blur-md border border-stone-800 text-[9px] uppercase tracking-widest text-white rounded-sm">
                        {player.position === 'hujumchi' ? 'FW' : player.position === 'yarimhimoyachi' ? 'MF' : player.position === 'himoyachi' ? 'DF' : 'GK'}
                      </div>
                    </div>

                    {/* Card Content Bottom */}
                    <div className="absolute bottom-0 left-0 w-full p-5 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="font-bold text-2xl text-white tracking-tighter uppercase mb-1 drop-shadow-md">{player.full_name}</h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="text-xs font-bold tracking-widest text-stone-400 uppercase">{player.city || 'Toshkent'}</span>
                      </div>
                      
                      {/* Hover Stats Reveal (Full 6 metrics) */}
                      <div className="grid grid-cols-3 gap-y-4 gap-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 border-t border-stone-700/50 pt-4">
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">88</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">PAC</div>
                        </div>
                        <div className="text-center border-l border-stone-700/50">
                          <div className="text-sm font-bold text-white">74</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">SHO</div>
                        </div>
                        <div className="text-center border-l border-stone-700/50">
                          <div className="text-sm font-bold text-white">81</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">PAS</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-bold text-white">85</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">DRI</div>
                        </div>
                        <div className="text-center border-l border-stone-700/50">
                          <div className="text-sm font-bold text-white">42</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">DEF</div>
                        </div>
                        <div className="text-center border-l border-stone-700/50">
                          <div className="text-sm font-bold text-white">79</div>
                          <div className="text-[8px] text-stone-500 uppercase tracking-widest">PHY</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 w-full h-10 bg-amber-600 flex items-center justify-center text-xs font-bold uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_15px_rgba(217,119,6,0.4)]">
                        Profilni ko'rish
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
        
        {/* Player Detailed Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 max-w-4xl w-full relative shadow-2xl rounded-sm flex flex-col md:flex-row overflow-hidden my-8">
                <button onClick={() => setSelectedPlayer(null)} className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors z-20 bg-stone-900/50 p-2 rounded-sm backdrop-blur-sm">✕</button>
                
                <div className="md:w-2/5 h-[400px] md:h-auto relative">
                    <img loading="lazy" src={selectedPlayer.image || "/images/player.jpg"} alt={selectedPlayer.full_name} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent"></div>
                    <div className="absolute bottom-6 left-6">
                        <div className="text-amber-500 font-bold text-6xl tracking-tighter leading-none mb-1">{selectedPlayer.rating || 84}</div>
                        <div className="text-[10px] uppercase tracking-widest text-white font-bold bg-stone-900/80 px-2 py-1 rounded-sm border border-stone-700 inline-block">Professional OVR</div>
                    </div>
                </div>

                <div className="md:w-3/5 p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-stone-950 border border-stone-800 text-[9px] uppercase tracking-widest text-amber-500 rounded-sm">Skauting Hisoboti</div>
                    </div>
                    <h2 className="text-4xl font-bold text-white uppercase tracking-tight mb-2">{selectedPlayer.full_name}</h2>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400 mb-8 pb-6 border-b border-stone-800">
                        <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-amber-500"/> {selectedPlayer.city || 'Toshkent'}</span>
                        <span className="text-stone-700">•</span>
                        <span>{selectedPlayer.age || 18} Yosh</span>
                        <span className="text-stone-700">•</span>
                        <span>{selectedPlayer.position === 'hujumchi' ? 'Markaziy hujumchi (CF)' : selectedPlayer.position === 'yarimhimoyachi' ? 'Markaziy yarim himoyachi (CM)' : 'Qanot himoyachisi (RB/LB)'}</span>
                    </div>

                    <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-4">To'liq Analitika va O'yin Protokoli</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
                        {[
                            { label: 'PAC (Tezlik)', val: 88, color: 'text-green-400' },
                            { label: 'SHO (Zarba)', val: 74, color: 'text-amber-400' },
                            { label: 'PAS (Uzatma)', val: 81, color: 'text-green-400' },
                            { label: 'DRI (Dribling)', val: 85, color: 'text-green-400' },
                            { label: 'DEF (Himoya)', val: 42, color: 'text-red-400' },
                            { label: 'PHY (Fizika)', val: 79, color: 'text-amber-400' }
                        ].map(stat => (
                            <div key={stat.label} className="bg-stone-950 border border-stone-800 p-2 rounded-sm text-center flex flex-col items-center justify-center">
                                <div className={`text-xl font-bold ${stat.color}`}>{stat.val}</div>
                                <div className="text-[7px] uppercase tracking-widest text-stone-500 mt-1 leading-tight">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Yutuqlar (Milestone Badges) & Market Status */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <div className="flex-1 bg-stone-950 border border-stone-800 p-4 rounded-sm flex items-center gap-3">
                            <div className="flex -space-x-2">
                                <div className="w-8 h-8 rounded-full bg-stone-900 border border-amber-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(217,119,6,0.2)]" title="Temir Oyoq (Fizika kuchli)">
                                    <span className="text-[10px]">🦵</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-stone-900 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]" title="Snayper (Zarba aniq)">
                                    <span className="text-[10px]">🎯</span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-stone-900 border border-emerald-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.2)]" title="Gepard (Juda tez)">
                                    <span className="text-[10px]">🐆</span>
                                </div>
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold ml-2">Yutuq Nishonlari</div>
                        </div>
                        <div className="flex-1 bg-stone-950 border border-stone-800 p-4 rounded-sm flex flex-col justify-center">
                            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold mb-1">Transfer Statusi (Market)</div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-xs font-bold text-emerald-400">Takliflarga Ochiq</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <button className="flex-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-sm transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                            Videolarni Ko'rish
                        </button>
                        {isScoutPro ? (
                          <button className="flex-1 bg-stone-950 hover:bg-stone-800 active:scale-95 border border-amber-500 text-amber-500 hover:text-white hover:bg-amber-600/20 font-bold text-[10px] uppercase tracking-widest py-4 rounded-sm transition-all">
                              Maxfiy Hisobot Yozish
                          </button>
                        ) : (
                          <button className="flex-1 bg-stone-950 hover:bg-stone-800 active:scale-95 border border-stone-800 hover:border-amber-500 text-white font-bold text-[10px] uppercase tracking-widest py-4 rounded-sm transition-all">
                              Skaut Sifatida Bog'lanish
                          </button>
                        )}
                    </div>
                    
                    {/* Sponsor Fund / Crowdfunding Section */}
                    <div className="mt-4 p-4 border border-stone-800 bg-stone-950 rounded-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Karyera Jamg'armasi</h4>
                        <span className="text-xs text-stone-400 font-bold">{selectedPlayer.fund_raised || 120}$ / {selectedPlayer.fund_goal || 500}$</span>
                      </div>
                      <p className="text-stone-400 text-xs mb-3 font-light leading-relaxed">
                        {selectedPlayer.fund_description || "Turnirga borish yo'l xarajatlari va yangi butsa uchun moliyaviy ko'mak so'rayman. Iqtidorimni ko'rsatishimga yordam bering!"}
                      </p>
                      <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden mb-4">
                        <div className="h-full bg-emerald-500" style={{width: `${((selectedPlayer.fund_raised || 120)/(selectedPlayer.fund_goal || 500))*100}%`}}></div>
                      </div>
                      <button className="w-full bg-stone-900 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300 active:scale-95 font-bold text-[10px] uppercase tracking-widest py-3 rounded-sm transition-all">
                        Moliyaviy Qo'llab-quvvatlash
                      </button>
                    </div>

                    {/* Career History (Player Passport) */}
                    <div className="mt-4 p-4 border border-stone-800 bg-stone-950 rounded-sm">
                      <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-2">
                        <svg className="w-4 h-4 text-stone-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Karyera Tarixi (Pasport)</h4>
                      </div>
                      
                      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-stone-700 before:to-transparent">
                        {[
                          { id: 1, team: 'Olimpiya', years: '2023 - Hozir', matches: 30, goals: 12, assists: 4 },
                          { id: 2, team: 'Paxtakor U21', years: '2021 - 2023', matches: 45, goals: 28, assists: 15 },
                          { id: 3, team: 'Paxtakor Akademiyasi', years: '2018 - 2021', matches: 60, goals: 50, assists: 22 },
                        ].map((career, idx) => (
                          <div key={career.id} className="relative flex items-start pl-8 group">
                            <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-4 border-stone-950 bg-stone-700 group-hover:bg-amber-500 transition-colors z-10 -ml-[7px]"></div>
                            <div className="bg-stone-900 border border-stone-800 p-3 rounded-sm w-full flex justify-between items-center group-hover:border-stone-700 transition-colors">
                              <div>
                                <div className="text-xs font-bold text-white mb-0.5">{career.team}</div>
                                <div className="text-[9px] uppercase tracking-widest text-stone-500">{career.years}</div>
                              </div>
                              <div className="flex gap-4 text-center">
                                <div>
                                  <div className="text-xs font-bold text-stone-300">{career.matches}</div>
                                  <div className="text-[8px] uppercase tracking-widest text-stone-600">O'yin</div>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-stone-300">{career.goals}</div>
                                  <div className="text-[8px] uppercase tracking-widest text-stone-600">Gol</div>
                                </div>
                                <div>
                                  <div className="text-xs font-bold text-stone-300">{career.assists}</div>
                                  <div className="text-[8px] uppercase tracking-widest text-stone-600">Assist</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                </div>
            </div>
          </div>
        )}

        {/* AI Compare Modal */}
        {aiCompareResult && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-950/95 backdrop-blur-xl p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-indigo-500/30 max-w-3xl w-full relative shadow-[0_0_50px_rgba(79,70,229,0.15)] rounded-sm overflow-hidden my-8">
              <button onClick={() => setAiCompareResult(null)} className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors z-20 bg-stone-900/50 p-2 rounded-sm backdrop-blur-sm">✕</button>
              
              <div className="p-8 border-b border-stone-800 bg-gradient-to-r from-stone-900 to-indigo-900/20">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-indigo-400" />
                  <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">AI Scouting Report</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight uppercase">O'yinchilarni Solishtirish</h2>
              </div>
              
              <div className="p-8">
                <div className="bg-stone-950 border border-stone-800 p-6 rounded-sm mb-8">
                  <p className="text-stone-300 font-light leading-relaxed text-sm">
                    {aiCompareResult.summary}
                  </p>
                </div>
                
                <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-4">Comparison Matrix</h4>
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(aiCompareResult.matrix).map(([metric, values]) => {
                    const p1Name = Object.keys(values)[0];
                    const p2Name = Object.keys(values)[1];
                    const v1 = values[p1Name];
                    const v2 = values[p2Name];
                    
                    return (
                      <div key={metric} className="bg-stone-950 p-4 border border-stone-800 rounded-sm">
                        <div className="text-[10px] font-bold text-stone-400 uppercase text-center mb-3 tracking-widest">{metric.replace('_', ' ')}</div>
                        <div className="flex justify-between items-center gap-4">
                          <div className="w-[45%] text-right">
                            <div className="text-xs text-stone-500 mb-1 truncate">{p1Name}</div>
                            <div className="flex items-center justify-end gap-2">
                              <span className={`font-bold text-lg ${v1 >= v2 ? 'text-indigo-400' : 'text-stone-300'}`}>{v1}</span>
                              <div className="w-full bg-stone-800 h-1.5 flex justify-end">
                                <div className={`h-full ${v1 >= v2 ? 'bg-indigo-500' : 'bg-stone-600'}`} style={{ width: `${v1}%` }}></div>
                              </div>
                            </div>
                          </div>
                          <div className="w-[10%] text-center text-stone-600 font-bold text-xs">VS</div>
                          <div className="w-[45%] text-left">
                            <div className="text-xs text-stone-500 mb-1 truncate">{p2Name}</div>
                            <div className="flex items-center justify-start gap-2 flex-row-reverse">
                              <span className={`font-bold text-lg ${v2 >= v1 ? 'text-indigo-400' : 'text-stone-300'}`}>{v2}</span>
                              <div className="w-full bg-stone-800 h-1.5 flex justify-start">
                                <div className={`h-full ${v2 >= v1 ? 'bg-indigo-500' : 'bg-stone-600'}`} style={{ width: `${v2}%` }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default PlayersPage;
