import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldHalf, LogOut, LayoutDashboard, User, Activity, Flame, Video } from 'lucide-react';

const PlayerLayout = () => {
  const navigate = useNavigate();
  const userStr = localStorage.getItem('talaqCurrentUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('talaqCurrentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminToken');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-stone-200 flex flex-col">
      {/* Top Header */}
      <header className="bg-stone-950/90 backdrop-blur-xl sticky top-0 z-40 border-b border-stone-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-10 h-10 rounded-sm bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-500">
                      <ShieldHalf className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:flex flex-col justify-center">
                      <span className="text-xl font-bold tracking-tighter text-white uppercase leading-none">Football<span className="text-amber-500">Rise</span></span>
                  </div>
              </Link>
              
              <nav className="hidden xl:flex items-center space-x-6">
                  <Link to="/player/dashboard" className="text-[11px] font-bold uppercase tracking-widest text-amber-500 transition-colors">Dashboard</Link>
                  <Link to="/live" className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors flex items-center gap-1"><Activity className="w-3 h-3"/> Live</Link>
                  <Link to="/drills" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors flex items-center gap-1"><Flame className="w-3 h-3"/> Drills</Link>
              </nav>

              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                      <div className="text-right">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider block leading-tight">{user?.first_name}</span>
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Player</span>
                      </div>
                  </div>
                  <button onClick={handleLogout} className="text-stone-500 hover:text-red-500 transition-colors">
                      <LogOut className="w-5 h-5" />
                  </button>
              </div>
          </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full relative pb-16 md:pb-0">
          <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-stone-950 py-8 text-center text-stone-500 text-xs font-bold uppercase tracking-widest">
        FootballRise &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default PlayerLayout;
