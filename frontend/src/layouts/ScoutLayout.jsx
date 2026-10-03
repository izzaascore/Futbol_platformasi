import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldHalf, LogOut, LayoutDashboard, Search, FileText } from 'lucide-react';

const ScoutLayout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('talaqCurrentUser');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-950 flex font-sans text-stone-200">
      <div className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-stone-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm bg-stone-950 border border-stone-700 flex items-center justify-center text-emerald-500">
              <ShieldHalf className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white uppercase leading-none">Scout<span className="text-emerald-500">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/scout/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/scout/search" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <Search className="w-4 h-4" /> Iqtidor Qidirish
          </Link>
          <Link to="/scout/reports" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <FileText className="w-4 h-4" /> Hisobotlar
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-red-500/10 text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-stone-950">
        <header className="h-20 bg-stone-900/50 backdrop-blur-md border-b border-stone-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold uppercase tracking-widest text-white">Skaut Paneli</h1>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ScoutLayout;
