import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Search, Filter, SlidersHorizontal, MapPin, Target, Zap, 
  Shield, X, Send, CheckCircle2, Sparkles, Award, ArrowUpRight, Check,
  MessageSquare, MessageCircle, CheckCheck, Loader2, UserPlus, Pin
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const TiltCard = ({ children, className, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["8deg", "-8deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-8deg", "8deg"]);
  
  const handleMouseMove = (e) => {
    if (!e?.currentTarget) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width || 1;
    const height = rect.height || 1;
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
      <div style={{ transform: "translateZ(25px)" }} className="w-full h-full">
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

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  // Direct Chat (Telegram / IG style) states
  const [chatPlayer, setChatPlayer] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatMessagesEndRef = useRef(null);

  useEffect(() => {
    if (!chatPlayer) return;
    const key = `dm_player_${chatPlayer.id}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setChatMessages(JSON.parse(saved));
      } catch (e) {
        initPlayerChat(chatPlayer);
      }
    } else {
      initPlayerChat(chatPlayer);
    }
  }, [chatPlayer]);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const initPlayerChat = (p) => {
    const initial = [
      {
        id: 1,
        sender: 'them',
        text: `Assalomu alaykum! Men ${p.full_name} (${p.club}). Futuro platformasida mashg'ulotlarim va natijalarimni kuzatib borishingiz mumkin. Qanday savolingiz yoki taklifingiz bor?`,
        time: 'Hozir'
      }
    ];
    setChatMessages(initial);
    localStorage.setItem(`dm_player_${p.id}`, JSON.stringify(initial));
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !chatPlayer) return;
    const userText = chatInput.trim();
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: userText,
      time: nowTime
    };
    const updated = [...chatMessages, newMsg];
    setChatMessages(updated);
    setChatInput('');
    localStorage.setItem(`dm_player_${chatPlayer.id}`, JSON.stringify(updated));

    // Simulate instant player response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Rahmat xabaringiz uchun! Murabbiyim bilan maslahatlashib, albatta ko'rib chiqamiz ⚽️",
        "Taklifingiz uchun tashakkur! Agar klub nomidan bo'lsa, platformadagi rasmiy ko'rik taklifnomasini ham yuborishingiz mumkin.",
        "Qiziqish bildirganingiz uchun rahmat! Mashg'ulot videolarim va statistika tahlillarim doimiy yangilanib boradi."
      ];
      const replyText = responses[Math.floor(Math.random() * responses.length)];
      const replyMsg = {
        id: Date.now() + 1,
        sender: 'them',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => {
        const next = [...prev, replyMsg];
        localStorage.setItem(`dm_player_${chatPlayer.id}`, JSON.stringify(next));
        return next;
      });
    }, 1100);
  };

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
        alert("Taklifnoma yuborildi (Lokal rejimda saqlandi)");
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
    { id: 1, full_name: 'Azizbek Karimov', position: 'hujumchi', city: 'Toshkent', rating: 92, age: 19, image: '/images/players/players_1552374196-1ab2a1c59.jpg', club: 'Bunyodkor FK / O\'zb U-21', market_value: '€1.5M', stats: { pac: 89, sho: 92, pas: 84, dri: 91, def: 45, phy: 82 } },
    { id: 2, full_name: 'Jasur Hasanov', position: 'yarimhimoyachi', city: 'Samarqand', rating: 88, age: 18, image: '/images/players/players_1517466787929-bc9095.jpg', club: 'Dinamo Samarqand', market_value: '€850K', stats: { pac: 85, sho: 80, pas: 90, dri: 88, def: 62, phy: 75 } },
    { id: 3, full_name: 'Sardor Rashidov', position: 'himoyachi', city: 'Andijon', rating: 87, age: 20, image: '/images/players/players_1579952363873-27f3ba.jpg', club: 'Andijon FK', market_value: '€700K', stats: { pac: 78, sho: 50, pas: 74, dri: 72, def: 89, phy: 88 } },
    { id: 4, full_name: 'Umidjon Erkinov', position: 'hujumchi', city: 'Buxoro', rating: 89, age: 17, image: '/images/players/players_1534438327276-14e530.jpg', club: 'Buxoro U-19', market_value: '€900K', stats: { pac: 91, sho: 88, pas: 80, dri: 87, def: 40, phy: 78 } },
    { id: 5, full_name: 'Doston Hamdamov', position: 'darvozabon', city: 'Farg\'ona', rating: 86, age: 21, image: '/images/players/players_1506794778202-cad84c.jpg', club: 'Neftchi Farg\'ona', market_value: '€600K', stats: { pac: 70, sho: 40, pas: 72, dri: 65, def: 90, phy: 85 } },
    { id: 6, full_name: 'Otabek Shukurov', position: 'yarimhimoyachi', city: 'Qarshi', rating: 85, age: 19, image: '/images/players/players_1614632537190-23e414.jpg', club: 'Nasaf Qarshi U-21', market_value: '€750K', stats: { pac: 82, sho: 78, pas: 86, dri: 84, def: 74, phy: 80 } },
    { id: 7, full_name: 'Shoxjahon Ro\'ziyev', position: 'hujumchi', city: 'Toshkent', rating: 90, age: 16, image: '/images/players/players_1431324155629-1a6d0a.jpg', club: 'Paxtakor U-16', market_value: '€1.1M', stats: { pac: 93, sho: 89, pas: 82, dri: 92, def: 38, phy: 76 } },
    { id: 8, full_name: 'Bekzod To\'rayev', position: 'himoyachi', city: 'Namangan', rating: 88, age: 18, image: '/images/players/players_1431324155629-1a6deb.jpg', club: 'Navbahor U-19', market_value: '€820K', stats: { pac: 84, sho: 45, pas: 79, dri: 75, def: 91, phy: 89 } },
    { id: 9, full_name: 'Eldor Sayidov', position: 'hujumchi', city: 'Termiz', rating: 89, age: 18, image: '/images/players/players_1518605368461-1ee7e5.jpg', club: 'Surxon Termiz', market_value: '€950K', stats: { pac: 90, sho: 87, pas: 78, dri: 85, def: 42, phy: 84 } },
    { id: 10, full_name: 'Mirjamol Qosimov', position: 'yarimhimoyachi', city: 'Olmaliq', rating: 87, age: 20, image: '/images/players/players_1531885420367-172551.jpg', club: 'AGMK Olmaliq', market_value: '€700K', stats: { pac: 80, sho: 82, pas: 89, dri: 86, def: 68, phy: 74 } },
    { id: 11, full_name: 'Asadbek Sobirjonov', position: 'himoyachi', city: 'Toshkent', rating: 86, age: 17, image: '/images/players/players_1552374196-1ab2a1c59.jpg', club: 'Olimpik Toshkent', market_value: '€650K', stats: { pac: 83, sho: 52, pas: 76, dri: 74, def: 88, phy: 83 } },
    { id: 12, full_name: 'Jasurbek Jaloliddinov', position: 'yarimhimoyachi', city: 'Toshkent', rating: 91, age: 18, image: '/images/players/players_1517466787929-bc9095.jpg', club: 'Lokomotiv Toshkent U-19', market_value: '€1.3M', stats: { pac: 86, sho: 85, pas: 93, dri: 89, def: 60, phy: 77 } },
    { id: 13, full_name: 'Abduvohid Ne\'matov', position: 'darvozabon', city: 'Qarshi', rating: 90, age: 19, image: '/images/players/players_1506794778202-cad84c.jpg', club: 'Nasaf Akademiya', market_value: '€1.0M', stats: { pac: 72, sho: 42, pas: 75, dri: 68, def: 94, phy: 88 } },
    { id: 14, full_name: 'Samandar Mavlonqulov', position: 'hujumchi', city: 'Toshkent', rating: 88, age: 16, image: '/images/players/players_1534438327276-14e530.jpg', club: 'Bunyodkor U-16', market_value: '€800K', stats: { pac: 92, sho: 86, pas: 81, dri: 88, def: 39, phy: 75 } },
    { id: 15, full_name: 'Muhammadali G\'iyosov', position: 'himoyachi', city: 'Bekobod', rating: 85, age: 19, image: '/images/players/players_1579952363873-27f3ba.jpg', club: 'Metallurg Bekobod', market_value: '€580K', stats: { pac: 81, sho: 48, pas: 73, dri: 70, def: 86, phy: 86 } },
    { id: 16, full_name: 'Shohruh Ibrohimov', position: 'darvozabon', city: 'Muborak', rating: 87, age: 17, image: '/images/player.jpg', club: 'Mash\'al Muborak U-18', market_value: '€720K', stats: { pac: 68, sho: 38, pas: 70, dri: 62, def: 91, phy: 84 } }
  ];

  useEffect(() => {
    // Only track on desktop pointer devices to avoid mobile lag & battery drain
    if (typeof window === 'undefined' || !window.matchMedia('(pointer: fine)').matches || window.innerWidth < 768) {
      return;
    }
    let animationFrameId = null;
    const handleGlobalMouseMove = (e) => {
      if (animationFrameId) return;
      animationFrameId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        animationFrameId = null;
      });
    };
    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, []);

  useEffect(() => {
    fetch(`${API_URL}/api/players`)
      .then(res => res.json())
      .then(data => {
        let combined = [];
        if (Array.isArray(data) && data.length > 0) {
          const registered = data.map((p, idx) => ({
            ...p,
            id: p.id || idx + 100,
            full_name: p.full_name || p.username || 'Haqiqiy Futbolchi',
            position: (p.position || 'hujumchi').toLowerCase(),
            rating: p.rating || 88,
            age: p.age || 18,
            club: p.team || p.club || "Futuro Ro'yxatdan O'tgan",
            city: p.city || 'Toshkent',
            market_value: p.market_value || '€500K',
            image: p.avatar_url || p.photo_url || '/images/player.jpg',
            stats: p.stats || { pac: 85, sho: 80, pas: 82, dri: 84, def: 60, phy: 78 },
            is_real_registered: true
          }));
          combined = [...registered, ...fallbackPlayers];
        } else {
          combined = [...fallbackPlayers];
        }

        // Agar joriy foydalanuvchi tizimda futbolchi sifatida mavjud bo'lsa, uni eng yuqoriga PIN qilamiz
        const userStr = localStorage.getItem('talaqCurrentUser');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u && (u.role === 'player' || u.first_name)) {
              const myProfile = {
                id: 99999,
                full_name: `${u.first_name || 'Foydalanuvchi'} ${u.last_name || ''}`.trim(),
                position: (u.position || 'hujumchi').toLowerCase(),
                rating: 90,
                age: u.age || 19,
                club: u.team || "Mening Profilim (Tasdiqlangan)",
                city: u.address || 'Toshkent',
                market_value: '€850K',
                image: u.profile_image || '/images/player.jpg',
                stats: { pac: 88, sho: 85, pas: 86, dri: 89, def: 65, phy: 80 },
                is_real_registered: true,
                is_pinned: true
              };
              if (!combined.some(cp => cp.full_name === myProfile.full_name)) {
                combined = [myProfile, ...combined];
              }
            }
          } catch (e) {}
        }

        setPlayers(combined);
        setLoading(false);
      })
      .catch(() => {
        setPlayers(fallbackPlayers);
        setLoading(false);
      });
  }, []);

  const filteredPlayers = (players || []).filter(p => {
    if (!p) return false;
    if (filter === 'registered') {
      return p.is_real_registered || p.is_pinned;
    }
    const pos = (p.position || '').toLowerCase();
    const matchPos = filter === 'all' || pos === filter || (filter === 'hujumchi' && pos.includes('hujum')) || (filter === 'yarimhimoyachi' && (pos.includes('yarim') || pos.includes('midfield'))) || (filter === 'himoyachi' && pos.includes('himoya')) || (filter === 'darvozabon' && pos.includes('darvoza'));
    const name = (p.full_name || '').toLowerCase();
    const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || (p.club || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchAge = true;
    const age = Number(p.age) || 18;
    if (ageFilter === 'u16') matchAge = age <= 16;
    else if (ageFilter === 'u18') matchAge = age > 16 && age <= 18;
    else if (ageFilter === 'u21') matchAge = age > 18 && age <= 21;
    else if (ageFilter === 'senior') matchAge = age > 21;

    return matchPos && matchSearch && matchAge;
  }).sort((a, b) => {
    // Haqiqiy ro'yxatdan o'tganlar va PIN qilinganlar doimo eng yuqorida turadi
    if ((a.is_real_registered || a.is_pinned) && !(b.is_real_registered || b.is_pinned)) return -1;
    if (!(a.is_real_registered || a.is_pinned) && (b.is_real_registered || b.is_pinned)) return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-white relative selection:bg-white selection:text-black overflow-hidden">
        
        {/* Dynamic Subtle Follower (Desktop only) */}
        <div 
          className="pointer-events-none fixed inset-0 z-0 opacity-15 mix-blend-screen transition-all duration-300 hidden md:block"
          style={{ background: `radial-gradient(800px circle at ${mousePosition?.x ?? 0}px ${mousePosition?.y ?? 0}px, rgba(255, 255, 255, 0.15), transparent 45%)` }}
        />

        {/* Hero Banner with Stadium Ambient Lighting */}
        <div className="relative min-h-[380px] w-full flex items-end pb-12 z-10 bg-stadium bg-grid border-b border-white/10">
          <div className="relative z-10 max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row justify-between items-end gap-6 pt-16">
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 mb-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                <Shield className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold tracking-widest text-stone-300 uppercase">FUTURO PROFESSIONAL SKAUTING TIZIMI</span>
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white uppercase mb-3">
                IQTIDORLAR <span className="text-gradient">BAZASI</span>
              </h1>
              <p className="text-stone-300 font-normal max-w-xl text-sm leading-relaxed">
                Markaziy Osiyoning eng istiqbolli yosh futbolchilari. Rasmiy reytinglar, tahlillar va to'g'ridan-to'g'ri skauting aloqalari.
              </p>
            </motion.div>

            {/* Search Input Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.15 }}
              className="w-full md:w-[420px] relative"
            >
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Futbolchi ismi yoki klubini qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-white transition shadow-sm backdrop-blur-md"
              />
            </motion.div>

          </div>
        </div>

        {/* Filters and Controls Toolbar */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
            
            {/* Position Pills */}
            <div className="w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 touch-pan-x overscroll-x-contain">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'registered', label: '📌 Faqat Haqiqiy (Real)' },
                { id: 'hujumchi', label: 'Hujumchi' },
                { id: 'yarimhimoyachi', label: 'Yarim himoya' },
                { id: 'himoyachi', label: 'Himoyachi' },
                { id: 'darvozabon', label: 'Darvozabon' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition-all ${
                    filter === tab.id
                      ? 'bg-white text-black shadow-glow'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Age Filter */}
            <div className="w-full lg:w-auto overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/10 touch-pan-x overscroll-x-contain">
              {[
                { id: 'all', label: 'Barcha yoshlar' },
                { id: 'u16', label: 'U-16' },
                { id: 'u18', label: 'U-18' },
                { id: 'u21', label: 'U-21' },
                { id: 'senior', label: '21+' }
              ].map(ag => (
                <button
                  key={ag.id}
                  onClick={() => setAgeFilter(ag.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap flex-shrink-0 transition ${
                    ageFilter === ag.id
                      ? 'bg-white text-black shadow-glow'
                      : 'text-stone-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {ag.label}
                </button>
              ))}
            </div>

            {/* Scout Pro Mode Toggle */}
            <button
              onClick={() => setIsScoutPro(!isScoutPro)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition flex items-center gap-2 flex-shrink-0 self-start lg:self-auto ${
                isScoutPro 
                  ? 'bg-white text-black border-white shadow-glow' 
                  : 'bg-white/[0.03] text-stone-300 border-white/15 hover:border-white/30 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Professional Skaut Tahlili</span>
            </button>

          </div>

          {/* Real Player Registration Prompt Banner */}
          <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900/60 to-[#030303] border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                    📌 Ochiq Ro'yxat
                  </span>
                  <span className="text-[11px] text-stone-400">Haqiqiy futbolchilar</span>
                </div>
                <p className="text-white text-xs font-bold mt-0.5">
                  Siz ham futbolchimisiz? O'z profilingizni bazaga qo'shing va birinchi o'ringa PIN qiling!
                </p>
              </div>
            </div>
            <Link
              to="/register"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-heading font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 flex-shrink-0 transition active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              + Ro'yxatdan O'tish
            </Link>
          </div>

          {/* Players Card Grid (3-Rasm Scouting Look) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredPlayers.map((player) => (
              <TiltCard
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="group cursor-pointer rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900">
                  <img
                    src={player.image || '/images/player.jpg'}
                    alt={player.full_name}
                    onError={(e) => { e.currentTarget.src = '/images/player.jpg'; }}
                    className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/30 to-transparent"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 gap-2">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[9px] font-heading font-black uppercase text-white tracking-wider">
                        {player.position}
                      </span>
                      {player.is_real_registered || player.is_pinned ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/30">
                          <Pin className="w-2.5 h-2.5 fill-stone-950" />
                          PIN: REAL PROFIL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-md text-stone-400 text-[8px] font-bold uppercase tracking-wider border border-white/10">
                          Demo Profil
                        </span>
                      )}
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-white text-black text-[10px] font-heading font-black shadow-glow">
                      REYTING {player.rating || 88}
                    </span>
                  </div>

                  {/* Bottom overlay info */}
                  <div className="absolute bottom-3 left-3 right-3 z-10">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      {player.club || 'Klub'}
                    </div>
                    <h3 className="font-heading font-black text-xl text-white uppercase tracking-tight truncate">
                      {player.full_name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-300 mt-1">
                      <span>{player.city}</span>
                      <span className="w-1 h-1 rounded-full bg-stone-500"></span>
                      <span>{player.age} yosh</span>
                    </div>
                  </div>
                </div>

                {/* Radar stats grid if Scout Pro is active or default pills */}
                <div className="p-4 bg-white/[0.02] border-t border-white/10 flex flex-col gap-3">
                  <div className="grid grid-cols-6 gap-1 text-center py-1 rounded-lg bg-white/[0.03] border border-white/5">
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">TEZ</div>
                      <div className="text-xs font-bold text-white">{player.stats?.pac || 85}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">ZAR</div>
                      <div className="text-xs font-bold text-white">{player.stats?.sho || 82}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">PAS</div>
                      <div className="text-xs font-bold text-white">{player.stats?.pas || 84}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">DRI</div>
                      <div className="text-xs font-bold text-white">{player.stats?.dri || 88}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">HIM</div>
                      <div className="text-xs font-bold text-white">{player.stats?.def || 55}</div>
                    </div>
                    <div>
                      <div className="text-[8px] font-bold text-stone-400">JIS</div>
                      <div className="text-xs font-bold text-white">{player.stats?.phy || 80}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-stone-400">Taxminiy qiymati</div>
                      <div className="font-heading font-black text-sm text-white">{player.market_value || '€850K'}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatPlayer(player);
                        }}
                        title="Xabar yozish (Chat)"
                        className="p-2 rounded-lg bg-blue-600/15 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 border border-blue-500/20 transition flex items-center justify-center"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayer(player);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black text-xs font-bold uppercase tracking-wider transition flex items-center gap-1 border border-white/15"
                      >
                        Profil <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          {filteredPlayers.length === 0 && (
            <div className="py-20 text-center rounded-2xl bg-white/[0.02] border border-white/10 border-dashed my-8">
              <Search className="w-10 h-10 mx-auto text-stone-500 mb-3" />
              <p className="text-stone-400 font-medium text-sm">Ushbu parametrlar bo'yicha futbolchi topilmadi.</p>
              <button
                onClick={() => { setFilter('all'); setAgeFilter('all'); setSearchQuery(''); }}
                className="mt-4 px-5 py-2.5 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider shadow-glow"
              >
                Filtrlarni tiklash
              </button>
            </div>
          )}

        </div>

        {/* Player Detail / Scouting Dossier Modal */}
        {selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl">
            <div className="relative w-full max-w-2xl rounded-3xl bg-[#030303] border border-white/20 p-6 sm:p-8 overflow-hidden shadow-2xl">
              
              <button 
                onClick={() => setSelectedPlayer(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-stone-400 hover:text-white border border-white/10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-full sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-stone-900 border border-white/15 flex-shrink-0">
                  <img src={selectedPlayer.image} alt={selectedPlayer.full_name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="flex-grow">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-heading font-black text-white uppercase tracking-wider mb-2">
                    {selectedPlayer.position} • REYTING {selectedPlayer.rating || 90}
                  </div>
                  <h3 className="font-heading font-black text-3xl uppercase text-white mb-1">
                    {selectedPlayer.full_name}
                  </h3>
                  <p className="text-stone-400 text-xs mb-4">
                    {selectedPlayer.club} • {selectedPlayer.city} • {selectedPlayer.age} Yosh
                  </p>

                  <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-white/[0.04] border border-white/10 mb-6 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Bozor qiymati:</span>
                      <span className="font-heading font-black text-white text-lg">{selectedPlayer.market_value || '€1.2M'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Skaut xulosasi:</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tasdiqlangan</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                    <button
                      onClick={() => {
                        const target = selectedPlayer;
                        setSelectedPlayer(null);
                        setChatPlayer(target);
                      }}
                      className="py-3 px-4 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 font-heading font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat (DM)
                    </button>
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="flex-grow py-3 rounded-xl bg-white text-black font-heading font-black text-xs uppercase tracking-wider shadow-glow hover:bg-stone-200 transition flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Klubga Ko'rikka Taklif Qilish
                    </button>
                    <button
                      onClick={() => setSelectedPlayer(null)}
                      className="px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/20 border border-white/15"
                    >
                      Yopish
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Scout Invitation Modal */}
        {showInviteModal && selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#030303] border border-white/20 p-6 sm:p-8 shadow-2xl">
              <button 
                onClick={() => setShowInviteModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading font-black text-2xl uppercase text-white mb-1">
                Rasmiy Ko'rik Taklifnomasi
              </h3>
              <p className="text-stone-400 text-xs mb-6">
                {selectedPlayer.full_name} ga klubingiz nomidan rasmiy taklifnoma yuborish.
              </p>

              {inviteSuccess ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3" />
                  <h4 className="font-heading font-black text-xl text-white uppercase">Taklifnoma Muvaffaqiyatli Yuborildi!</h4>
                  <p className="text-stone-400 text-xs mt-1">Futbolchi profilingiz orqali aloqaga chiqadi.</p>
                </div>
              ) : (
                <form onSubmit={handleSendInvitation} className="flex flex-col gap-3.5 text-xs">
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Klubingiz yoki Akademiya Nomi:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masalan: Bunyodkor FK Skauting Bo'limi"
                      value={inviteForm.club_name}
                      onChange={(e) => setInviteForm({ ...inviteForm, club_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Ko'rik Sanasi va Joyi:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masalan: 15 Noyabr, Jar Stadioni"
                      value={inviteForm.location}
                      onChange={(e) => setInviteForm({ ...inviteForm, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Aloqa Uchun Telefon / Telegram:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+998 90 123 45 67"
                      value={inviteForm.contact_phone}
                      onChange={(e) => setInviteForm({ ...inviteForm, contact_phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Qo'shimcha Xabar:</label>
                    <textarea 
                      rows={3}
                      placeholder="Futbolchiga taklif tafsilotlari..."
                      value={inviteForm.message}
                      onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingInvite}
                    className="w-full mt-2 py-3.5 rounded-xl bg-white text-black font-heading font-black text-xs uppercase tracking-wider shadow-glow hover:bg-stone-200 transition"
                  >
                    {isSendingInvite ? "Yuborilmoqda..." : "Taklifnomani Yuborish"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Telegram / Instagram Style Direct Chat Modal */}
        {chatPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-xl">
            <div className="relative w-full max-w-lg h-[540px] max-h-[85dvh] rounded-3xl bg-[#09090b] border border-white/20 flex flex-col overflow-hidden shadow-2xl">
              
              {/* Chat Header */}
              <div className="p-4 bg-white/[0.04] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={chatPlayer.image || '/images/player.jpg'} 
                      alt={chatPlayer.full_name} 
                      onError={(e) => { e.currentTarget.src = '/images/player.jpg'; }}
                      className="w-10 h-10 rounded-full object-cover border border-white/20"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white leading-tight">{chatPlayer.full_name}</h4>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                    </div>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      Tarmoqda (Faol) • {chatPlayer.club}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setChatPlayer(null)}
                  className="p-2 rounded-xl bg-white/10 text-stone-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#030303]/40">
                <div className="text-center my-2">
                  <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[10px] text-stone-400 font-mono">
                    Futuro Shaxsiy Chat (Telegram/Instagram uslubida)
                  </span>
                </div>

                {chatMessages.map((msg) => {
                  const isMe = msg.sender === 'me';
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          isMe 
                            ? 'bg-blue-600 text-white rounded-br-xs shadow-md' 
                            : 'bg-white/[0.08] text-stone-200 border border-white/10 rounded-bl-xs'
                        }`}
                      >
                        <p>{msg.text}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${isMe ? 'text-blue-200' : 'text-stone-400'}`}>
                          <span>{msg.time}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-blue-200" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-stone-400 text-xs italic bg-white/[0.04] px-3 py-2 rounded-xl w-fit">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    <span>{chatPlayer.full_name} yozmoqda...</span>
                  </div>
                )}
                <div ref={chatMessagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <form onSubmit={handleSendChatMessage} className="p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] bg-white/[0.03] border-t border-white/10 flex items-center gap-2">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`${chatPlayer.full_name.split(' ')[0]}ga xabar yozing...`}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-white placeholder-stone-500 text-base sm:text-xs focus:outline-none focus:border-blue-500 transition"
                />
                <button 
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white transition flex items-center justify-center shadow-lg shadow-blue-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default PlayersPage;
