import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { 
  Target, Search, FileText, CheckCircle, Clock, ShieldCheck, Mail, MapPin, 
  Eye, Zap, BookMarked, Filter, Calendar, AlertCircle, ShieldAlert, Lock, 
  ArrowRight, ExternalLink, RefreshCw, UserCheck, Trash2, Send
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

// Dynamic SVG Radar Chart component
const RadarChart = ({ stats = { pac: 85, sho: 78, pas: 82, dri: 84, def: 65, phy: 72 } }) => {
  const pac = Math.min(100, Math.max(30, stats.pac || 80)) / 100;
  const sho = Math.min(100, Math.max(30, stats.sho || 75)) / 100;
  const pas = Math.min(100, Math.max(30, stats.pas || 75)) / 100;
  const dri = Math.min(100, Math.max(30, stats.dri || 80)) / 100;
  const def = Math.min(100, Math.max(30, stats.def || 60)) / 100;
  const phy = Math.min(100, Math.max(30, stats.phy || 70)) / 100;

  const p0 = `50,${50 - pac * 40}`;
  const p1 = `${(50 + sho * 40 * 0.866).toFixed(1)},${(50 - sho * 40 * 0.5).toFixed(1)}`;
  const p2 = `${(50 + pas * 40 * 0.866).toFixed(1)},${(50 + pas * 40 * 0.5).toFixed(1)}`;
  const p3 = `50,${(50 + dri * 40).toFixed(1)}`;
  const p4 = `${(50 - def * 40 * 0.866).toFixed(1)},${(50 + def * 40 * 0.5).toFixed(1)}`;
  const p5 = `${(50 - phy * 40 * 0.866).toFixed(1)},${(50 - phy * 40 * 0.5).toFixed(1)}`;
  const polygonPoints = `${p0} ${p1} ${p2} ${p3} ${p4} ${p5}`;

  return (
    <div className="relative w-full aspect-square max-w-[240px] mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(217,119,6,0.5)]">
        {[20, 40, 60, 80, 100].map(r => (
          <polygon 
            key={r} 
            points={`50,${50-r*0.4} ${50+r*0.4*0.866},${50-r*0.4*0.5} ${50+r*0.4*0.866},${50+r*0.4*0.5} 50,${50+r*0.4} ${50-r*0.4*0.866},${50+r*0.4*0.5} ${50-r*0.4*0.866},${50-r*0.4*0.5}`} 
            fill="none" 
            stroke="rgba(120,113,108,0.2)" 
            strokeWidth="0.5"
          />
        ))}
        <line x1="50" y1="10" x2="50" y2="90" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        <line x1="15" y1="30" x2="85" y2="70" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        <line x1="15" y1="70" x2="85" y2="30" stroke="rgba(120,113,108,0.3)" strokeWidth="0.5" />
        
        <polygon 
          points={polygonPoints} 
          fill="rgba(217, 119, 6, 0.4)" 
          stroke="#f59e0b" 
          strokeWidth="1.5"
          className="transition-all duration-500 animate-pulse"
        />
        
        <text x="50" y="5" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PAC</text>
        <text x="94" y="27" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">SHO</text>
        <text x="94" y="75" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PAS</text>
        <text x="50" y="98" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">DRI</text>
        <text x="6" y="75" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">DEF</text>
        <text x="6" y="27" fontSize="5" fill="#a8a29e" textAnchor="middle" fontWeight="bold">PHY</text>
      </svg>
    </div>
  );
};

export default function ScoutsPage({ initialTab = 'dashboard' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [players, setPlayers] = useState([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);

  // Shortlist from localStorage
  const [shortlist, setShortlist] = useState(() => {
    try {
      const saved = localStorage.getItem('futuro_scout_shortlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Current logged in user
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('talaqCurrentUser') || '{}');
    } catch {
      return {};
    }
  });

  const token = localStorage.getItem('token') || localStorage.getItem('adminToken') || '';
  const storedRole = localStorage.getItem('role') || user?.role;

  // Refresh live user profile to catch recent admin approvals immediately
  const refreshUserStatus = async () => {
    const currentToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!currentToken) return;
    setCheckingAuth(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${currentToken}` }
      });
      if (res.ok) {
        const liveData = await res.json();
        setUser(liveData);
        localStorage.setItem('talaqCurrentUser', JSON.stringify(liveData));
        if (liveData.role) localStorage.setItem('role', liveData.role);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUserStatus();
    }
  }, []);

  const isPending = (user?.role === 'scout' || storedRole === 'scout') && 
                    (user?.status === 'pending' || !user?.status || user?.status === 'UserStatus.PENDING');
  
  const isApprovedScout = ((user?.role === 'scout' || storedRole === 'scout') && user?.status === 'active') || 
                          user?.role === 'admin' || storedRole === 'admin';

  const isPlayer = (user?.role === 'player' || storedRole === 'player') && !isApprovedScout;

  // Fetch real data when approved
  useEffect(() => {
    if (!token || !isApprovedScout) return;

    // Fetch real invitations
    const fetchInvites = async () => {
      setLoadingInvites(true);
      try {
        const res = await fetch(`${API_URL}/api/scout/my-invitations`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInvitations(Array.isArray(data) ? data : []);
        } else {
          setInvitations([]);
        }
      } catch (e) {
        setInvitations([]);
      } finally {
        setLoadingInvites(false);
      }
    };

    // Fetch real players for top prospect and analytics
    const fetchPlayers = async () => {
      setLoadingPlayers(true);
      try {
        const res = await fetch(`${API_URL}/api/players`);
        if (res.ok) {
          const data = await res.json();
          setPlayers(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchInvites();
    fetchPlayers();
  }, [token, isApprovedScout]);

  const toggleShortlist = (player) => {
    if (!player) return;
    setShortlist(prev => {
      const exists = prev.some(p => p.id === player.id);
      const updated = exists ? prev.filter(p => p.id !== player.id) : [...prev, player];
      try {
        localStorage.setItem('futuro_scout_shortlist', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Top prospect from real players in DB
  const topPlayer = players.length > 0 
    ? [...players].sort((a, b) => (b.rating || b.goals_count || 0) - (a.rating || a.goals_count || 0))[0] 
    : null;

  const topPlayerStats = topPlayer ? {
    pac: topPlayer.sprint_speed ? Math.round(topPlayer.sprint_speed * 10) : 88,
    sho: Math.round((topPlayer.rating || 82) * 0.95),
    pas: topPlayer.pass_accuracy || 80,
    dri: Math.round((topPlayer.rating || 80) * 0.98),
    def: Math.round((topPlayer.rating || 75) * 0.7),
    phy: topPlayer.stamina || 75
  } : { pac: 85, sho: 78, pas: 82, dri: 84, def: 65, phy: 72 };

  // ==============================================================
  // GATE 1: Foydalanuvchi tizimga kirmagan (Not Logged In)
  // ==============================================================
  if (!token || !user?.id) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#030303] text-stone-200 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>

          <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 text-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.3)]">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-500 mb-2">Professional Skauting Tizimi</span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight max-w-xl mb-4">
            Futuro <span className="text-amber-500">ScoutPRO</span> Kabineti
          </h1>
          <p className="text-sm text-stone-400 max-w-lg mb-6 leading-relaxed">
            O'zbekiston bo'ylab yosh iqtidorlar bazasi, rasmiy ko'rik sinovlari, professional AI tahlillari va klublar uchun markazlashgan skauting tizimi.
          </p>

          <div className="max-w-md bg-stone-900/60 border border-amber-500/20 rounded-2xl p-4 mb-8 text-left flex items-start gap-3 backdrop-blur-md">
            <Lock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-stone-300 leading-relaxed">
              Yosh futbolchilarning xavfsizligi va shaxsiy ma'lumotlarini himoya qilish maqsadida, Scout PRO tizimi faqat tasdiqlangan skautlar, klublar va murabbiylar uchun ochiq.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Link 
              to="/login" 
              className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.4)] text-center"
            >
              Tizimga Kirish
            </Link>
            <Link 
              to="/register" 
              className="flex-1 py-3.5 px-6 bg-stone-900 hover:bg-stone-800 border border-white/10 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all text-center"
            >
              Skaut Ro'yxatdan O'tish
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ==============================================================
  // GATE 2: Foydalanuvchi futbolchi hisobi bilan kirgan (Player role)
  // ==============================================================
  if (isPlayer) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#030303] text-stone-200 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6 text-blue-500">
            <AlertCircle className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-400 mb-2">Futbolchi Hisobi</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight max-w-md mb-3">
            ScoutPRO Faqat Skaut va Murabbiylar Uchun
          </h2>
          <p className="text-sm text-stone-400 max-w-md mb-8 leading-relaxed">
            Hurmatli <strong className="text-white">{user.first_name}</strong>, siz tizimga futbolchi sifatida kirgansiz. O'z statistikangizni va video gollaringizni profil sahifangizda boshqarishingiz mumkin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <Link 
              to="/profile" 
              className="flex-1 py-3 px-6 bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all text-center"
            >
              Profilimga O'tish
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ==============================================================
  // GATE 3: Skaut arizasi tasdiqlanmagan (PENDING STATUS)
  // ==============================================================
  if (isPending) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-[#030303] text-stone-200 flex flex-col items-center justify-center p-6">
          <div className="max-w-xl w-full bg-stone-900/60 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.15)]">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-4">
                <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500/50 rounded-2xl flex items-center justify-center text-amber-500 shadow-[0_0_30px_rgba(217,119,6,0.3)]">
                  <Clock className="w-10 h-10 animate-pulse text-amber-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full animate-ping"></div>
              </div>

              <span className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
                ⏳ Akkreditatsiya Kutilmoqda (Pending Approval)
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Profilingiz Tekshiruvda
              </h2>
              <p className="text-xs text-stone-400 mt-2 max-w-md">
                Hurmatli <strong className="text-white">{user.first_name} {user.last_name}</strong>, skautlik arizangiz Futuro ma'muriyati (admin) tomonidan ko'rib chiqilmoqda.
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-[#030303]/80 border border-white/10 rounded-2xl p-5 mb-6 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-stone-400">Skaut / Vakil:</span>
                <span className="text-white font-bold">{user.first_name} {user.last_name}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-stone-400">Tashkilot / Klub:</span>
                <span className="text-amber-400 font-bold">{user.organization || "Mustaqil Skaut"}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/5">
                <span className="text-stone-400">Hujjat / Litsenziya:</span>
                <span className="text-stone-300 font-mono">
                  {user.kyc_document_url ? (
                    <a href={user.kyc_document_url} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1">
                      Yuklangan havola <ExternalLink className="w-3 h-3"/>
                    </a>
                  ) : "Yuklanmagan"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-stone-400">Holat:</span>
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
                  Moderator tekshiruvida
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] text-stone-300 leading-relaxed">
                <strong className="text-amber-400 block mb-1">Xavfsizlik va ma'lumotlar himoyasi:</strong>
                Futuro platformasida yosh iqtidorlar shug'ullanadi. Begona yoki tasdiqlanmagan shaxslar bolalarning shaxsiy kontaktlari va joylashuvini ko'ra olmasligi uchun barcha yangi skautlar qat'iy tekshiruvdan o'tkaziladi. Admin tasdiqlashi bilan to'liq Scout PRO paneli ochiladi.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={refreshUserStatus}
                disabled={checkingAuth}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${checkingAuth ? 'animate-spin' : ''}`} />
                {checkingAuth ? "Tekshirilmoqda..." : "Holatni Qayta Tekshirish"}
              </button>

              <a 
                href="https://t.me/FuturoAdminBot"
                target="_blank"
                rel="noreferrer"
                className="py-3 px-5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-white/10 text-center"
              >
                Admin Bilan Bog'lanish
              </a>
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('talaqCurrentUser');
                  localStorage.removeItem('role');
                  window.location.href = '/login';
                }}
                className="text-[11px] text-stone-500 hover:text-stone-300 uppercase tracking-widest font-bold transition-colors"
              >
                Boshqa hisobga o'tish (Chiqish)
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  // ==============================================================
  // ACTIVE APPROVED SCOUT PRO CABINET
  // ==============================================================
  const scoutOrganization = user?.organization || "Mustaqil Professional Skaut";
  const scoutName = `${user?.first_name || 'Skaut'} ${user?.last_name || ''}`.trim();

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden">
        
        {/* Dashboard Top Navigation */}
        <div className="sticky top-0 z-40 bg-[#030303]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                <ShieldCheck className="w-6 h-6 text-stone-950" />
              </div>
              <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tight">
                  Scout<span className="text-amber-500">PRO</span> Cabinet
                </h1>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <span>{scoutOrganization}</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3"/> Tasdiqlangan Skaut ({scoutName})
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link to="/players" className="hidden md:flex px-4 py-2 bg-stone-900 border border-white/10 rounded-md text-xs font-bold uppercase text-white items-center gap-2 hover:border-amber-500 transition-colors">
                <Search className="w-4 h-4 text-stone-400"/> O'yinchilarni Qidirish
              </Link>
              <button 
                onClick={() => window.print()}
                className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 rounded-md text-xs font-black uppercase text-stone-950 shadow-[0_0_15px_rgba(217,119,6,0.4)] transition-all"
              >
                Hisobot Chop Etish
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 flex flex-col gap-2">
            {[
              { id: 'dashboard', label: 'Bosh Panel', icon: <Target className="w-4 h-4"/> },
              { id: 'bookmarks', label: `Kuzatuv (${shortlist.length})`, icon: <BookMarked className="w-4 h-4"/> },
              { id: 'reports', label: 'AI Analizlar', icon: <FileText className="w-4 h-4"/> },
              { id: 'offers', label: `Taklifnomalar (${invitations.length})`, icon: <Mail className="w-4 h-4"/> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  activeTab === tab.id 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/50 shadow-inner' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-900 border border-transparent'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: "Kuzatuvdagi O'yinchilar", val: shortlist.length, icon: <Eye className="text-blue-500"/>, color: 'blue' },
                    { label: "Yuborilgan Takliflar", val: invitations.length, icon: <Mail className="text-amber-500"/>, color: 'amber' },
                    { label: "Bazada Mavjud Iqtidorlar", val: players.length, icon: <Zap className="text-purple-500"/>, color: 'purple' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-stone-900/50 p-6 rounded-2xl border border-white/10 flex items-center gap-6 backdrop-blur-md">
                      <div className="p-4 bg-[#030303] rounded-xl border border-white/10 shadow-inner">
                        {stat.icon}
                      </div>
                      <div>
                        <div className="text-3xl font-black text-white">{stat.val}</div>
                        <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hot Prospect Spotlight (Real DB Player) */}
                <h3 className="text-lg font-black text-white uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
                  <Target className="text-amber-500 w-5 h-5"/> Hafta Iqtidori (Top Reyting)
                </h3>

                {topPlayer ? (
                  <div className="bg-gradient-to-r from-stone-900 to-stone-950 border border-white/10 rounded-3xl p-8 flex flex-col lg:flex-row gap-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none"></div>

                    <div className="w-full lg:w-1/3 flex flex-col items-center justify-center text-center">
                       <div className="relative w-40 h-40 mb-4">
                          <div className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                          <img 
                            src={topPlayer.photo_url || "/images/futuro_crest.jpg"} 
                            className="w-full h-full rounded-full object-cover border-4 border-white/10 relative z-10" 
                            alt={topPlayer.full_name} 
                          />
                       </div>
                       <h2 className="text-2xl font-black text-white uppercase tracking-tight">{topPlayer.full_name}</h2>
                       <p className="text-amber-500 font-bold text-xs uppercase tracking-widest mt-1">
                         {topPlayer.team || "Erkin Agent"} • {topPlayer.position || "Hujumchi"}
                       </p>
                       <div className="mt-3 flex items-center gap-2">
                         <span className="px-3 py-1 bg-[#030303] border border-white/10 rounded-full text-xs font-mono font-bold text-white">
                           ⭐ Reyting: {topPlayer.rating || 82}
                         </span>
                       </div>
                    </div>

                    <div className="w-full lg:w-1/3 flex flex-col justify-center items-center">
                      <RadarChart stats={topPlayerStats} />
                    </div>

                    <div className="w-full lg:w-1/3 flex flex-col justify-center space-y-4">
                      <div className="bg-[#030303] p-4 rounded-xl border border-white/10 shadow-inner">
                        <div className="text-[10px] uppercase font-bold text-stone-500 tracking-widest mb-1.5 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500"/> AI Skaut Xulosasi
                        </div>
                        <p className="text-xs text-stone-300 font-light leading-relaxed">
                          Maydonda to'p bilan ishlash aniqligi ({topPlayer.pass_accuracy || 80}%) va tezkor qaror qabul qilishi yuqori. Oxirgi ko'rik va video tahlillarga ko'ra jismoniy chidamliligi o'z toifasida eng yaxshilardan biri.
                        </p>
                      </div>

                      <button 
                        onClick={() => toggleShortlist(topPlayer)}
                        className={`w-full py-3.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(217,119,6,0.3)] ${
                          shortlist.some(p => p.id === topPlayer.id)
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-amber-600 hover:bg-amber-500 text-white'
                        }`}
                      >
                        {shortlist.some(p => p.id === topPlayer.id) ? "✓ Kuzatuvga Saqlangan" : "+ Kuzatuvga Qo'shish"}
                      </button>

                      <Link 
                        to="/players"
                        className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-colors border border-white/20 text-center"
                      >
                        Barcha Iqtidorlarni Ko'rish
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-900/30 border border-white/10 rounded-2xl p-12 text-center">
                    <Target className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Iqtidorlar bazasi yuklanmoqda</h4>
                    <p className="text-stone-400 text-xs">Platformaga yangi futbolchilar qo'shilishi bilan haftaning eng kuchli iqtidori bu yerda ko'rsatiladi.</p>
                  </div>
                )}

              </motion.div>
            )}

            {/* Kuzatuv Ro'yxati (Shortlist) Tab */}
            {activeTab === 'bookmarks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <BookMarked className="text-amber-500 w-5 h-5"/> Kuzatuv Ro'yxati (Shortlist)
                    </h3>
                    <p className="text-xs text-stone-400">Siz shaxsan kuzatib borayotgan yosh futbolchilar</p>
                  </div>
                  <Link 
                    to="/players" 
                    className="px-4 py-2 bg-stone-900 border border-white/10 rounded-md text-xs font-bold uppercase text-amber-400 hover:border-amber-500 flex items-center gap-2 transition-colors"
                  >
                    + Yangi O'yinchi Topish
                  </Link>
                </div>
                
                {shortlist.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {shortlist.map((player) => (
                      <div key={player.id} className="flex bg-stone-900/50 border border-white/10 rounded-2xl p-4 gap-4 items-center hover:border-amber-500/50 transition-colors group">
                        <img 
                          src={player.photo_url || "/images/futuro_crest.jpg"} 
                          className="w-20 h-20 rounded-xl object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10" 
                          alt={player.full_name} 
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-black text-white uppercase tracking-tight text-lg">{player.full_name}</h4>
                              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                                {player.position || "Futbolchi"} • {player.team || "Erkin agent"}
                              </span>
                            </div>
                            <div className="bg-[#030303] px-2.5 py-1 rounded border border-white/10 text-sm font-black text-white">
                              {player.rating || 80}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-stone-400 font-mono">
                              Aniq pas: {player.pass_accuracy || 80}%
                            </span>
                            <button 
                              onClick={() => toggleShortlist(player)}
                              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 uppercase tracking-widest flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3"/> Kuzatuvdan O'chirish
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-stone-900/30 border border-white/10 rounded-2xl p-12 text-center">
                    <BookMarked className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                    <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Kuzatuv ro'yxatingiz bo'sh</h4>
                    <p className="text-stone-400 text-xs mb-4 max-w-sm mx-auto">
                      O'yinchilar katalogidan iqtidorlarni ko'rib chiqib, ularni shaxsiy ro'yxatingizga qo'shishingiz mumkin.
                    </p>
                    <Link to="/players" className="inline-block px-5 py-2.5 bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-colors">
                      O'yinchilar Katalogini Ochish
                    </Link>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI Analizlar Tab */}
            {activeTab === 'reports' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Zap className="text-amber-500 w-5 h-5"/> AI Skaut Tahlil Xulosalari
                    </h3>
                    <p className="text-xs text-stone-400">Platformadagi iqtidorlar bo'yicha sun'iy intellekt tahlillari</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {players.slice(0, 5).map((p, i) => (
                    <div key={p.id || i} className="bg-stone-900/60 border border-white/10 p-6 rounded-2xl hover:border-amber-500/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-black text-white uppercase tracking-tight text-base">{p.full_name}</h4>
                          <span className="text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                            {p.team || "Erkin agent"} • {p.position || "Hujumchi"}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 text-[10px] font-black uppercase rounded bg-emerald-950/60 text-emerald-400 border border-emerald-900">
                          ⭐ Reyting: {p.rating || 82}
                        </span>
                      </div>
                      <p className="text-stone-300 text-sm leading-relaxed mb-4">
                        Maydonda to'pni qabul qilish tezligi va zarbalar aniqligi yuqori. Pas aniqligi {p.pass_accuracy || 82}%. Professional klublar akademiyasi uchun tavsiya etiladi.
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => toggleShortlist(p)}
                          className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold"
                        >
                          {shortlist.some(s => s.id === p.id) ? "✓ Ro'yxatda" : "+ Kuzatuvga Olish"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {players.length === 0 && (
                    <div className="bg-stone-900/30 border border-white/10 rounded-2xl p-12 text-center text-stone-500 text-xs uppercase tracking-widest">
                      Hozircha tahlillar tayyorlanmoqda...
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Shartnomalar / Taklifnomalar Tab */}
            {activeTab === 'offers' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                      <Mail className="text-amber-500 w-5 h-5"/> Yuborilgan Ko'rik Taklifnomalari
                    </h3>
                    <p className="text-xs text-stone-400">O'yinchilarga jo'natilgan rasmiy sinov va ko'rik mashg'ulotlari</p>
                  </div>
                  <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded-lg">
                    {invitations.length} ta Taklifnoma
                  </span>
                </div>

                {loadingInvites ? (
                  <div className="py-16 text-center text-stone-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                    Taklifnomalar yuklanmoqda...
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="bg-stone-900/60 border border-white/10 hover:border-amber-500/40 transition-colors p-6 rounded-2xl relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-white/10">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-500">{inv.club_name}</div>
                            <h4 className="text-lg font-black text-white uppercase tracking-tight">{inv.title}</h4>
                          </div>
                          <div>
                            <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                              inv.status === 'qabul_qilindi' ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800' :
                              inv.status === 'rad_etildi' ? 'bg-rose-950/70 text-rose-400 border-rose-800' :
                              'bg-amber-950/70 text-amber-400 border-amber-800 animate-pulse'
                            }`}>
                              {inv.status === 'qabul_qilindi' ? '✓ O\'yinchi Qabul Qildi' :
                               inv.status === 'rad_etildi' ? '✕ Rad Etildi' :
                               '⏳ Kutilmoqda (O\'yinchi ko\'rishi kutilmoqda)'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                          <div className="flex items-center gap-2 text-stone-300">
                            <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>Vaqti: <strong className="text-white">{inv.tryout_date}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-stone-300">
                            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span>Maydon: <strong className="text-white">{inv.location}</strong></span>
                          </div>
                        </div>

                        <div className="bg-[#030303] p-4 rounded-xl border border-white/10 mb-3 text-xs text-stone-300 font-light leading-relaxed">
                          <strong className="text-stone-400 uppercase text-[10px] block mb-1 font-bold">Xabar:</strong>
                          {inv.message}
                        </div>

                        <div className="text-[10px] font-mono text-stone-500 flex justify-between items-center">
                          <span>Aloqa: {inv.contact_phone || "+998 90 000 00 00"}</span>
                          <span>ID: #{inv.id}</span>
                        </div>
                      </div>
                    ))}

                    {invitations.length === 0 && (
                      <div className="bg-stone-900/30 border border-white/10 rounded-2xl p-12 text-center">
                        <Mail className="w-8 h-8 text-stone-600 mx-auto mb-3" />
                        <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">Hozircha taklifnomalar yuborilmagan</h4>
                        <p className="text-stone-400 text-xs mb-4">Iqtidorli futbolchilar ro'yxatidan o'yinchi tanlab, ko'rikka taklif yuborishingiz mumkin.</p>
                        <Link to="/players" className="inline-block px-5 py-2.5 bg-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-colors">
                          O'yinchilarni Ko'rish
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
