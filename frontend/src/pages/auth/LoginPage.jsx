import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Key, ShieldHalf, Send, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { API_URL, TELEGRAM_BOT_USERNAME, ADMIN_PATH, ADMIN_BASE } from '../../config';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tgUser, setTgUser] = useState(null);
  const [tgLoading, setTgLoading] = useState(false);

  // Telegram WebApp ichida ochilganligini aniqlash
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      const user = tg.initDataUnsafe?.user;
      if (user) {
        setTgUser(user);
      }
    }
  }, []);

  const handleTelegramAuth = async (userToAuth) => {
    setTgLoading(true);
    setError('');
    const userPayload = userToAuth || tgUser;

    try {
      if (!userPayload) {
        // Agar oddiy brauzerda bo'lsa va bot hali to'liq ulanmagan bo'lsa,
        // foydalanuvchini botga yo'naltiramiz yoki bot havolasini ochamiz
        const botUrl = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=webapp`;
        window.open(botUrl, '_blank');
        setTgLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/api/auth/telegram-webapp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: userPayload.id,
          first_name: userPayload.first_name,
          last_name: userPayload.last_name || '',
          username: userPayload.username || '',
          photo_url: userPayload.photo_url || '',
          init_data: window.Telegram?.WebApp?.initData || ''
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Telegram orqali kirishda xatolik");
      }

      const data = await res.json();
      localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
      if (data.access_token) localStorage.setItem('token', data.access_token);
      if (data.role) localStorage.setItem('role', data.role);

      if (data.role === 'admin') navigate(ADMIN_PATH ? `${ADMIN_BASE}/dashboard` : '/');
      else if (data.role === 'scout') navigate('/scout/dashboard');
      else navigate('/player/dashboard');
    } catch (e) {
      setError(e.message || "Telegram bilan bog'lanishda xatolik yuz berdi");
    } finally {
      setTgLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || 'Ism, familiya yoki parol noto\'g\'ri');
        setLoading(false);
        return;
      }
      const data = await res.json();
      localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
      if (data.access_token) localStorage.setItem('token', data.access_token);
      if (data.role) localStorage.setItem('role', data.role);
      
      if (data.role === 'admin') navigate(ADMIN_PATH ? `${ADMIN_BASE}/dashboard` : '/');
      else if (data.role === 'scout') navigate('/scout/dashboard');
      else navigate('/player/dashboard');
    } catch (e) {
      setError("Server bilan bog'lanishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] bg-stadium bg-grid flex flex-col items-center justify-center p-4 font-sans text-stone-200 relative overflow-hidden">
      {/* Background neon ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[200px] bg-sky-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-white/[0.04] backdrop-blur-2xl p-8 rounded-2xl shadow-2xl border border-white/10 relative z-10">
        
        {/* Header Icon */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-950 border border-white/20/80 flex items-center justify-center text-amber-500 shadow-xl hover:scale-105 transition-transform">
            <img src="/images/futuro_crest.jpg" alt="Futuro" className="w-full h-full object-cover rounded-xl" />
          </Link>
        </div>

        <h2 className="text-2xl font-black text-white text-center mb-1 uppercase tracking-tight">FUTURO</h2>
        <p className="text-stone-400 text-xs text-center uppercase tracking-widest font-bold mb-6">Tizimga kirish</p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-xs font-bold text-center">
            {error}
          </div>
        )}

        {/* ============================================================== */}
        {/* 1. TELEGRAM 1-CLICK AUTH (SODDALIK VA TEZKORLIK) */}
        {/* ============================================================== */}
        {tgUser ? (
          <div className="mb-6 p-4 rounded-xl bg-sky-500/10 border border-sky-500/30 backdrop-blur-md text-center">
            <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 animate-pulse" /> Telegram Aniqlandi
            </div>
            <div className="text-white font-bold text-sm mb-3">
              {tgUser.first_name} {tgUser.last_name || ''}
            </div>
            <button
              onClick={() => handleTelegramAuth(tgUser)}
              disabled={tgLoading}
              className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.4)] flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              {tgLoading ? "Ulanmoqda..." : "1 ta bosishda profilga kirish"}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => handleTelegramAuth()}
              disabled={tgLoading}
              className="w-full py-4 bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_25px_rgba(14,165,233,0.35)] hover:shadow-[0_0_35px_rgba(14,165,233,0.5)] flex items-center justify-center gap-2.5 group"
            >
              <Send className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              {tgLoading ? "Tekshirilmoqda..." : "Telegram orqali 1-bosqichda kirish"}
            </button>
            <p className="text-[10px] text-stone-500 text-center mt-2 font-bold tracking-wider uppercase">
              Parol kiritmasdan, bir lahzada kiring
            </p>
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-white/10"></div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-widest text-stone-500">yoki parol orqali</span>
          <div className="flex-1 border-t border-white/10"></div>
        </div>

        {/* ============================================================== */}
        {/* 2. AN'ANAVIY KIRISH FORMASI */}
        {/* ============================================================== */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Ism</label>
            <input 
              required 
              type="text" 
              placeholder="Masalan: Abdulbosit"
              value={form.firstName} 
              onChange={e=>setForm({...form, firstName: e.target.value})} 
              className="w-full px-4 py-3 bg-[#030303] bg-stadium bg-grid/80 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-sm" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Familiya</label>
            <input 
              required 
              type="text" 
              placeholder="Masalan: Rashidov"
              value={form.lastName} 
              onChange={e=>setForm({...form, lastName: e.target.value})} 
              className="w-full px-4 py-3 bg-[#030303] bg-stadium bg-grid/80 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-sm" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1.5">Parol</label>
            <input 
              required 
              type="password" 
              placeholder="••••••••"
              value={form.password} 
              onChange={e=>setForm({...form, password: e.target.value})} 
              className="w-full px-4 py-3 bg-[#030303] bg-stadium bg-grid/80 border border-white/10 rounded-xl text-white placeholder-stone-600 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all text-sm" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-white/20 flex justify-center items-center gap-2 mt-4 hover:border-amber-500/50"
          >
            <Key className="w-4 h-4 text-amber-500"/> {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        {/* Footer Link to Register */}
        <div className="mt-8 pt-6 border-t border-white/10/80 text-center">
          <p className="text-xs text-stone-400 font-medium">
            Profilingiz yo'qmi?{' '}
            <Link to="/register" className="text-amber-500 hover:text-amber-400 font-bold uppercase tracking-wider ml-1 inline-flex items-center gap-1">
              Ro'yxatdan o'tish <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
