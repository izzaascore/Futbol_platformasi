import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ShieldHalf, Menu, Activity, Flame, Home, Users, Search, Target, ShoppingBag, User } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import ScoutLayout from './layouts/ScoutLayout';
import PlayerLayout from './layouts/PlayerLayout';

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
import DailyDrillsPage from './pages/DailyDrillsPage';
import ManifestoPage from './pages/ManifestoPage';

// Public layout wrapper for normal pages (like Home, News, etc.)
function PublicLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userStr = localStorage.getItem('talaqCurrentUser');
  const user = userStr ? JSON.parse(userStr) : null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-talaq-light text-[#292524] overflow-x-hidden">
      <header className="bg-stone-950/90 backdrop-blur-xl sticky top-0 z-40 border-b border-stone-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-10 h-10 rounded-sm bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-500 group-hover:border-amber-500 group-hover:bg-amber-500/10 transition-colors shadow-lg shadow-amber-500/20">
                      <ShieldHalf className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:flex flex-col justify-center">
                      <span className="text-xl font-bold tracking-tighter text-white uppercase leading-none">Football<span className="text-amber-500">Rise</span></span>
                      <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mt-1">Professional Tizim</span>
                  </div>
              </Link>

              <nav className="hidden xl:flex items-center space-x-6">
                  <Link to="/" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Bosh sahifa</Link>
                  <Link to="/manifesto" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Manifest</Link>
                  <Link to="/live" className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors animate-pulse flex items-center gap-1"><Activity className="w-3 h-3"/> Live Center</Link>
              </nav>

              <div className="flex items-center gap-4">
                {!user ? (
                  <>
                    <Link to="/login" className="px-6 py-2.5 rounded-sm text-stone-400 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-all">
                        Kirish
                    </Link>
                    <Link to="/register" className="px-6 py-2.5 rounded-sm bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all">
                        Ro'yxatdan O'tish
                    </Link>
                  </>
                ) : (
                  <Link to={`/${user.role}/dashboard`} className="flex items-center gap-3 group bg-stone-900 border border-stone-800 hover:border-amber-500/50 pl-3 pr-4 py-2 rounded-sm transition-colors text-white text-xs uppercase tracking-widest font-bold">
                    Dashboard
                  </Link>
                )}
                
                <button className="xl:hidden p-2 text-stone-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
              </div>
          </div>
      </header>

      <main className="flex-1 w-full relative pb-16 md:pb-0">
          {children}
      </main>

      <footer className="bg-stone-950 py-8 text-center text-stone-500 text-xs font-bold uppercase tracking-widest">
        FootballRise &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/manifesto" element={<PublicLayout><ManifestoPage /></PublicLayout>} />
        <Route path="/live" element={<PublicLayout><MatchCenterPage /></PublicLayout>} />
        
        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
        </Route>

        {/* Scout Routes */}
        <Route element={<ProtectedRoute allowedRoles={['scout']} />}>
            <Route path="/scout" element={<ScoutLayout />}>
                <Route path="dashboard" element={<ScoutDashboard />} />
                <Route path="search" element={<PlayersPage />} />
                <Route path="reports" element={<div className="text-white">Reports here</div>} />
            </Route>
        </Route>

        {/* Player Routes */}
        <Route element={<ProtectedRoute allowedRoles={['player']} />}>
            <Route path="/player" element={<PlayerLayout />}>
                <Route path="dashboard" element={<PlayerDashboard />} />
                <Route path="drills" element={<DailyDrillsPage />} />
                <Route path="profile" element={<ProfilePage />} />
            </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
