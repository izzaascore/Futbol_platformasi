import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldHalf, LogOut, LayoutDashboard, Search, FileText, 
  Lock, Clock, ShieldAlert, RefreshCw, ExternalLink 
} from 'lucide-react';
import { API_URL } from '../config';

const ScoutLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('talaqCurrentUser') || '{}');
    } catch {
      return {};
    }
  });

  const [checking, setChecking] = useState(false);

  const refreshStatus = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) return;
    setChecking(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const liveUser = await res.json();
        setUser(liveUser);
        localStorage.setItem('talaqCurrentUser', JSON.stringify(liveUser));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('talaqCurrentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  const isPending = (user?.role === 'scout') && 
                    (user?.status === 'pending' || !user?.status || user?.status === 'UserStatus.PENDING');

  return (
    <div className="min-h-screen bg-[#030303] flex font-sans text-stone-200">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 border-r border-white/10 flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-white/10">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm bg-[#030303] border border-stone-700 flex items-center justify-center text-amber-500">
              <ShieldHalf className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white uppercase leading-none">
              Scout<span className="text-amber-500">Panel</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {/* Dashboard link */}
          <Link 
            to="/scout/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${
              location.pathname === '/scout/dashboard' 
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40' 
                : 'text-stone-300 hover:bg-stone-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>

          {/* Iqtidor Qidirish — faqat tasdiqlangan skautlar uchun */}
          {isPending ? (
            <div 
              title="Akkreditatsiya tasdiqlangach ochiladi" 
              className="flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm text-stone-600 cursor-not-allowed bg-stone-950/40 border border-white/5"
            >
              <span className="flex items-center gap-3">
                <Search className="w-4 h-4 text-stone-600" /> Iqtidor Qidirish
              </span>
              <Lock className="w-3.5 h-3.5 text-amber-500/50" />
            </div>
          ) : (
            <Link 
              to="/scout/search" 
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${
                location.pathname === '/scout/search' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40' 
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" /> Iqtidor Qidirish
            </Link>
          )}

          {/* Hisobotlar — faqat tasdiqlangan skautlar uchun */}
          {isPending ? (
            <div 
              title="Akkreditatsiya tasdiqlangach ochiladi" 
              className="flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm text-stone-600 cursor-not-allowed bg-stone-950/40 border border-white/5"
            >
              <span className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-stone-600" /> Hisobotlar
              </span>
              <Lock className="w-3.5 h-3.5 text-amber-500/50" />
            </div>
          ) : (
            <Link 
              to="/scout/reports" 
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest rounded-sm transition-colors ${
                location.pathname === '/scout/reports' 
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/40' 
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Hisobotlar
            </Link>
          )}
        </nav>

        {/* User Status Badge in Sidebar */}
        <div className="p-4 border-t border-white/10 bg-stone-950/40">
          <div className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mb-1">
            {user?.organization || "Skaut"}
          </div>
          <div className="text-xs font-bold text-white truncate mb-2">
            {user?.first_name} {user?.last_name}
          </div>
          {isPending ? (
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
              Tekshiruvda (Pending)
            </div>
          ) : (
            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
              ✓ Tasdiqlangan
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 px-4 py-3 w-full text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-red-500/10 text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </div>
      
      {/* Main Content View */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-[#030303]">
        <header className="h-20 bg-stone-900/50 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-10 flex-shrink-0">
          <h1 className="text-xl font-bold uppercase tracking-widest text-white">
            ScoutPRO Kabineti
          </h1>
          {isPending && (
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider rounded-full">
              ⏳ Akkreditatsiya Kutilmoqda
            </span>
          )}
        </header>

        <main className="p-8 flex-1">
          {/* Security Gate: Agar skaut tasdiqlanmagan bo'lsa, o'yinchilar qidiruvi va tahlillar butunlay to'siladi! */}
          {isPending && location.pathname !== '/scout/dashboard' ? (
            <div className="max-w-xl mx-auto my-12 bg-stone-900/80 border border-amber-500/30 rounded-3xl p-8 backdrop-blur-xl text-center relative overflow-hidden shadow-2xl">
              <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl flex items-center justify-center text-amber-400 mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 block mb-2">
                Xavfsizlik Cheklovi
              </span>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">
                Bu Sahifa Faqat Tasdiqlangan Skautlar Uchun
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed mb-6 max-w-md mx-auto">
                Futuro platformasidagi yosh iqtidorlar shaxsiy ma'lumotlari, kontaktlari va video tahlillarini ko'rish uchun profilingiz ma'muriyat tomonidan tasdiqlangan bo'lishi shart.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={refreshStatus}
                  disabled={checking}
                  className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
                  {checking ? "Tekshirilmoqda..." : "Holatni Yangilash"}
                </button>
                <Link
                  to="/scout/dashboard"
                  className="px-5 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-colors border border-white/10"
                >
                  Bosh Panelga Qaytish
                </Link>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default ScoutLayout;
