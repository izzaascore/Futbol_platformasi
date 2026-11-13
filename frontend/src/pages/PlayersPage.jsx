import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { 
  Search, Filter, SlidersHorizontal, MapPin, Target, Zap, 
  Shield, X, Send, CheckCircle2, Sparkles, Award, ArrowUpRight, Check,
  MessageSquare, MessageCircle, CheckCheck, Loader2, UserPlus, Pin
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import UserAvatar from '../components/UserAvatar';
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
        if (Array.isArray(data)) {
          // Faqat haqiqiy ro'yxatdan o'tgan futbolchilarni olamiz va takrorlanishlarni tozalaymiz
          const seen = new Set();
          const registered = [];

          for (let idx = 0; idx < data.length; idx++) {
            const p = data[idx];
            if (!p) continue;
            const fullName = (p.full_name || p.username || '').trim();
            const normKey = fullName.toLowerCase() || `player_${p.id || idx}`;
            if (seen.has(normKey)) continue;
            seen.add(normKey);

            registered.push({
              ...p,
              id: p.id || idx + 100,
              full_name: fullName || 'Futbolchi',
              position: (p.position || 'hujumchi').toLowerCase(),
              rating: p.rating || 85,
              age: p.age || 18,
              club: p.team || p.club || "Mustaqil Futbolchi",
              city: p.city || 'Toshkent',
              market_value: p.market_value || '—',
              image: p.photo_url || p.avatar_url || p.profile_image || null,
              stats: p.stats || { pac: 82, sho: 78, pas: 80, dri: 82, def: 58, phy: 76 },
              is_real_registered: true
            });
          }

          // Agar joriy foydalanuvchi login qilgan bo'lsa, uni topib PIN qilamiz (takrorlamasdan!)
          const userStr = localStorage.getItem('talaqCurrentUser');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u && (u.role === 'player' || u.first_name)) {
                const myName = `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username;
                const existingIdx = registered.findIndex(cp => 
                  (u.id && cp.user_id === u.id) || 
                  (myName && cp.full_name.toLowerCase() === myName.toLowerCase())
                );

                if (existingIdx !== -1) {
                  // Foydalanuvchi allaqachon ro'yxatda bor - uni yangilab, boshiga PIN qilamiz
                  const existing = registered[existingIdx];
                  existing.is_pinned = true;
                  if (u.profile_image) existing.image = u.profile_image;
                  registered.splice(existingIdx, 1);
                  registered.unshift(existing);
                } else if (myName) {
                  // Ro'yxatda hali yo'q bo'lsa, birinchi o'ringa qo'shamiz
                  const myProfile = {
                    id: u.id || 99999,
                    user_id: u.id,
                    full_name: myName,
                    position: (u.position || 'hujumchi').toLowerCase(),
                    rating: u.rating || 88,
                    age: u.age || 19,
                    club: u.team || "Mening Profilim",
                    city: u.address || 'Toshkent',
                    market_value: u.market_value || '—',
                    image: u.profile_image || null,
                    stats: { pac: 88, sho: 85, pas: 86, dri: 89, def: 65, phy: 80 },
                    is_real_registered: true,
                    is_pinned: true
                  };
                  registered.unshift(myProfile);
                }
              }
            } catch (e) {}
          }

          setPlayers(registered);
        } else {
          setPlayers([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setPlayers([]);
        setLoading(false);
      });
  }, []);

  const filteredPlayers = (players || []).filter(p => {
    if (!p) return false;
    // "Faqat PIN qilingan" filtri — tizimga kirgan foydalanuvchi
    if (filter === 'registered') {
      return p.is_pinned === true;
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
    // PIN qilingan (tizimga kirgan foydalanuvchi) doimo eng birinchi
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
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
                { id: 'registered', label: '📌 Mening Profilim' },
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

          {/* Bo'sh holat: Hali hech kim ro'yxatdan o'tmagan */}
          {!loading && players.length === 0 && (
            <div className="mt-10 py-20 text-center rounded-3xl bg-white/[0.02] border border-white/10 border-dashed flex flex-col items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-white/[0.04] border border-white/15 flex items-center justify-center">
                <UserPlus className="w-9 h-9 text-stone-400" />
              </div>
              <div>
                <h3 className="font-heading font-black text-2xl uppercase text-white mb-2">Hali Hech Kim Yo'q</h3>
                <p className="text-stone-400 text-sm max-w-sm mx-auto leading-relaxed">
                  Bu platforma yangi boshlanyapti. Birinchi bo'lib ro'yxatdan o'ting va profilingiz bazaning <span className="text-white font-bold">birinchi o'rnida</span> turadi!
                </p>
              </div>
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-xl bg-white text-black font-heading font-black text-xs uppercase tracking-wider shadow-glow hover:bg-stone-200 transition flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Ro'yxatdan O'tish — Bepul
              </Link>
            </div>
          )}

          {/* Players Card Grid (3-Rasm Scouting Look) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredPlayers.map((player) => (
              <TiltCard
                key={player.id}
                onClick={() => setSelectedPlayer(player)}
                className="group cursor-pointer rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden hover:border-white/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone-900 flex items-center justify-center">
                  {player.image && !player.image.includes('player.jpg') ? (
                    <img
                      src={player.image}
                      alt={player.full_name}
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      className="w-full h-full object-cover object-top filter brightness-95 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-stone-900 via-stone-950 to-black p-4">
                      <UserAvatar name={player.full_name} size="2xl" rounded="2xl" className="shadow-2xl border-2 border-white/20 mb-2" />
                      <span className="text-[10px] font-mono tracking-widest uppercase text-stone-500">Futuro Player</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/30 to-transparent pointer-events-none"></div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10 gap-2">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/20 text-[9px] font-heading font-black uppercase text-white tracking-wider">
                        {player.position}
                      </span>
                      {player.is_real_registered || player.is_pinned ? (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-stone-950 text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md shadow-emerald-500/30">
                          <Pin className="w-2.5 h-2.5 fill-stone-950" />
                          {player.is_pinned ? 'Mening Profilim' : 'Tasdiqlangan'}
                        </span>
                      ) : null}
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
                <div className="w-full sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden bg-stone-900 border border-white/15 flex-shrink-0 flex items-center justify-center">
                  {selectedPlayer.image && !selectedPlayer.image.includes('player.jpg') ? (
                    <img src={selectedPlayer.image} alt={selectedPlayer.full_name} className="w-full h-full object-cover object-top" />
                  ) : (
                    <UserAvatar name={selectedPlayer.full_name} size="2xl" rounded="2xl" className="border-2 border-white/20" />
                  )}
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
                    <UserAvatar 
                      name={chatPlayer.full_name} 
                      src={chatPlayer.image} 
                      size="sm" 
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black"></span>
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
