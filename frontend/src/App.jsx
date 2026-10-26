import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ShieldHalf, Menu, X, Activity, Flame, Home, Users, Search, Target, ShoppingBag, User, MapPin, Trophy, LogOut } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import FeedbackModal from './components/FeedbackModal';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ScoutLayout from './layouts/ScoutLayout';
import PlayerLayout from './layouts/PlayerLayout';
import { API_URL } from './config';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ScoutDashboard from './pages/scout/ScoutDashboard';
import PlayerDashboard from './pages/player/PlayerDashboard';

import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import ScoutsPage from './pages/ScoutsPage';
import ShopPage from './pages/ShopPage';
import TournamentsPage from './pages/TournamentsPage';
import NewsPage from './pages/NewsPage';
import RankingsPage from './pages/RankingsPage';
import ProfilePage from './pages/ProfilePage';
import MatchCenterPage from './pages/MatchCenterPage';
import ReelsPage from './pages/ReelsPage';
import ManifestoPage from './pages/ManifestoPage';
import StadiumsPage from './pages/StadiumsPage';
import DailyDrillsPage from './pages/DailyDrillsPage';

// Public layout wrapper for normal pages (like Home, News, etc.)
function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const userStr = localStorage.getItem('talaqCurrentUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('talaqCurrentUser');
    window.location.href = '/';
  };

  const navLinks = [
    { to: '/', label: 'Bosh sahifa' },
    { to: '/players', label: "O'yinchilar" },
    { to: '/stadiums', label: 'Maydonlar', icon: <MapPin className="w-3.5 h-3.5 text-white" /> },
    { to: '/rankings', label: 'Reyting' },
    { to: '/tournaments', label: 'Turnirlar' },
    { 
      to: '/live', 
      label: 'Jonli Efir', 
      isLive: true 
    },
    { to: '/manifesto', label: 'Manifest' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#030303] text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* Top Luxury Header */}
      <header className="sticky top-0 z-50 bg-[#030303]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl transition-all">
        <div className="w-full max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
          
          {/* Brand: Eagle Crest + Futuro Logo */}
          <Link to="/" className="flex items-center gap-3.5 group flex-shrink-0">
            <div className="w-11 h-11 rounded-xl border border-white/20 overflow-hidden bg-black/60 p-0.5 flex items-center justify-center group-hover:border-white transition-all shadow-glow">
              <img src="/images/futuro_crest.jpg" alt="Futuro Eagle Crest" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-heading font-black text-2xl tracking-wider text-white uppercase leading-none group-hover:text-stone-200 transition">
                FUTURO
              </span>
              <span className="text-[9px] font-bold tracking-widest text-stone-400 uppercase mt-1 leading-tight whitespace-nowrap">
                Kelajaging o'z qo'lingda
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-2 flex-wrap justify-center">
            {navLinks.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3.5 py-2 rounded-lg text-[11px] font-bold tracking-wider uppercase whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white/10 text-white border border-white/30 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  {item.icon}
                  {item.isLive && (
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  )}
                  <span className={item.isLive ? 'text-red-400' : ''}>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth Controls */}
          <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={
                    user.role === 'admin'
                      ? '/admin'
                      : user.role === 'scout'
                      ? '/scout/dashboard'
                      : '/player/dashboard'
                  }
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition"
                >
                  <div className="w-7 h-7 rounded-md bg-stone-800 flex items-center justify-center font-bold text-xs uppercase text-white border border-white/20">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {user.full_name || user.username || 'Foydalanuvchi'}
                    </span>
                    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                      {user.role === 'admin' ? 'Admin' : user.role === 'scout' ? 'Skaut Pro' : "O'yinchi"}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Chiqish"
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-stone-400 hover:text-red-400 border border-white/10 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white px-3 py-2 transition"
                >
                  Kirish
                </Link>
                <Link
                  to="/register"
                  className="bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-lg transition duration-300 shadow-glow flex items-center gap-1.5"
                >
                  Ro'yxatdan O'tish
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-lg text-white hover:bg-white/5 border border-white/10"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="xl:hidden bg-[#030303]/98 backdrop-blur-2xl border-b border-white/10 px-6 py-6 flex flex-col gap-3">
              <nav className="flex flex-col gap-2">
                {navLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold tracking-wider uppercase text-stone-200 hover:bg-white/10 border border-white/5"
                  >
                    {item.icon}
                    {item.isLive && (
                      <span className="relative flex h-2 w-2 mr-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    <span className={item.isLive ? 'text-red-400' : ''}>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link
                      to={
                        user.role === 'admin'
                          ? '/admin'
                          : user.role === 'scout'
                          ? '/scout/dashboard'
                          : '/player/dashboard'
                      }
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-lg bg-white/10 text-center text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Boshqaruv Paneli
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 rounded-lg bg-red-500/10 text-center text-xs font-bold uppercase tracking-wider text-red-400 border border-red-500/20"
                    >
                      Chiqish
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-lg border border-white/20 text-center text-xs font-bold uppercase tracking-wider text-white"
                    >
                      Kirish
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-3 rounded-lg bg-white text-black text-center text-xs font-bold uppercase tracking-wider shadow-glow"
                    >
                      Ro'yxatdan O'tish
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Body */}
      <main className="flex-grow flex flex-col">
        {children}
      </main>

      {/* Luxury Footer */}
      <footer className="bg-[#030303] border-t border-white/10 pt-16 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-stadium opacity-10 pointer-events-none"></div>
        <div className="w-full max-w-[1700px] mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
            
            {/* Brand column */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl border border-white/20 overflow-hidden bg-black/60 p-0.5 shadow-glow">
                  <img src="/images/futuro_crest.jpg" alt="Futuro Eagle Crest" className="w-full h-full object-cover rounded-lg" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-2xl tracking-wider text-white uppercase">
                    FUTURO
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-stone-400 uppercase">
                    Kelajaging o'z qo'lingda
                  </span>
                </div>
              </Link>
              <p className="text-stone-400 text-xs leading-relaxed max-w-md">
                O'zbekistonning birinchi darajali professional futbol skauting va iqtidorlar platformasi. 
                Yosh futbolchilarni kashf eting, shaffof reytinglar va sun'iy intellekt tahlillari orqali xalqaro klublarga yo'l oching.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Tizim 100% Onlayn
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-stone-300">
                  Cadets Nashri
                </span>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
                Platforma
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
                <li><Link to="/players" className="hover:text-white transition">O'yinchilar bazasi</Link></li>
                <li><Link to="/rankings" className="hover:text-white transition">Milliy reyting</Link></li>
                <li><Link to="/stadiums" className="hover:text-white transition">Maydonlar bron qilish</Link></li>
                <li><Link to="/tournaments" className="hover:text-white transition">Turnirlar va Kuboklar</Link></li>
              </ul>
            </div>

            {/* Live & Interactive */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
                Interaktiv
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
                <li><Link to="/live" className="hover:text-red-400 transition flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Jonli Efir</Link></li>
                <li><Link to="/news" className="hover:text-white transition">Yangiliklar va Media</Link></li>
                <li><Link to="/manifesto" className="hover:text-white transition">Bizning Manifest</Link></li>
                <li><Link to="/drills" className="hover:text-white transition">Kunlik mashg'ulotlar</Link></li>
              </ul>
            </div>

            {/* Skautlar va Klublar */}
            <div>
              <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
                Hamkorlik
              </h4>
              <ul className="flex flex-col gap-2.5 text-xs text-stone-400">
                <li><Link to="/register" className="hover:text-white transition">Skaut sifatida kirish</Link></li>
                <li><Link to="/register" className="hover:text-white transition">Klublar uchun API</Link></li>
                <li><Link to="/admin" className="hover:text-stone-300 text-stone-500 transition">Boshqaruv Paneli (Admin)</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <p>© {new Date().getFullYear()} Futuro. Barcha huquqlar himoyalangan.</p>
            <p className="tracking-widest uppercase text-[10px]">Chempionlar uchun yaratilgan • O'zbekistonda ishlab chiqilgan</p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#030303]/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <Link to="/" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-white p-2">
          <Home className="w-5 h-5" />
          <span>Bosh</span>
        </Link>
        <Link to="/players" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-white p-2">
          <Users className="w-5 h-5" />
          <span>O'yinchilar</span>
        </Link>
        <Link to="/live" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-400 p-2">
          <Activity className="w-5 h-5 animate-pulse" />
          <span>Jonli</span>
        </Link>
        <Link to="/stadiums" className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-white hover:text-white p-2">
          <MapPin className="w-5 h-5 text-white" />
          <span>Maydon</span>
        </Link>
        <Link to={user ? (user.role === 'admin' ? '/admin' : user.role === 'scout' ? '/scout/dashboard' : '/player/dashboard') : "/login"} className="flex flex-col items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 hover:text-white p-2">
          <User className="w-5 h-5" />
          <span>{user ? "Profil" : "Kirish"}</span>
        </Link>
      </nav>

      {/* Reusable Floating Feedback Modal */}
      <FeedbackModal />

    </div>
  );
}

function App() {
  useEffect(() => {
    // Telegram WebApp tekshiruvi va avtomatik moslashuv
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      try {
        tg.setHeaderColor('#030303');
        tg.setBackgroundColor('#030303');
      } catch (e) {}

      // Telegramdan avtomatik 1-bosqichli kirish (TMA seamless auth)
      const tgUser = tg.initDataUnsafe?.user;
      if (tgUser && !localStorage.getItem('token')) {
        fetch(`${API_URL}/api/auth/telegram-webapp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: tgUser.id,
            first_name: tgUser.first_name,
            last_name: tgUser.last_name || '',
            username: tgUser.username || '',
            photo_url: tgUser.photo_url || '',
            init_data: tg.initData || ''
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.access_token) {
              localStorage.setItem('token', data.access_token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
            }
          })
          .catch(console.error);
      }
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/stadiums" element={<PublicLayout><StadiumsPage /></PublicLayout>} />
        <Route path="/manifesto" element={<PublicLayout><ManifestoPage /></PublicLayout>} />
        <Route path="/live" element={<PublicLayout><MatchCenterPage /></PublicLayout>} />
        <Route path="/players" element={<PublicLayout><PlayersPage /></PublicLayout>} />
        <Route path="/scouts" element={<PublicLayout><ScoutsPage /></PublicLayout>} />
        <Route path="/tournaments" element={<PublicLayout><TournamentsPage /></PublicLayout>} />
        <Route path="/rankings" element={<PublicLayout><RankingsPage /></PublicLayout>} />
        <Route path="/reels" element={<PublicLayout><ReelsPage /></PublicLayout>} />
        <Route path="/shop" element={<PublicLayout><ShopPage /></PublicLayout>} />
        <Route path="/news" element={<PublicLayout><NewsPage /></PublicLayout>} />
        <Route path="/drills" element={<PublicLayout><DailyDrillsPage /></PublicLayout>} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminDashboard defaultTab="users" />} />
            <Route path="submissions" element={<AdminDashboard defaultTab="submissions" />} />
        </Route>

        {/* Scout Routes */}
        <Route element={<ProtectedRoute allowedRoles={['scout']} />}>
            <Route path="/scout" element={<ScoutLayout />}>
                <Route path="dashboard" element={<ScoutsPage initialTab="dashboard" />} />
                <Route path="search" element={<PlayersPage />} />
                <Route path="reports" element={<ScoutsPage initialTab="reports" />} />
            </Route>
        </Route>

        {/* Player Routes */}
        <Route element={<ProtectedRoute allowedRoles={['player']} />}>
            <Route path="/player" element={<PlayerLayout />}>
                <Route path="dashboard" element={<PlayerDashboard />} />
                <Route path="drills" element={<DailyDrillsPage />} />
                <Route path="reels" element={<ReelsPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Route>

      </Routes>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
