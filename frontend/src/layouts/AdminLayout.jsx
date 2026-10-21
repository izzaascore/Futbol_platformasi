import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ShieldHalf, LogOut, LayoutDashboard, Users, Video } from 'lucide-react';
import { API_URL } from '../config';

const AdminLayout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const userStr = localStorage.getItem('talaqCurrentUser');
  let user = null;
  try { user = userStr ? JSON.parse(userStr) : null; } catch(e) {}
  const isAuthenticated = token && (role === 'admin' || user?.role === 'admin');

  const handleLogout = async () => {
    try {
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.warn("Backend logout notice:", err);
    } finally {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('talaqCurrentUser');
      navigate('/admin');
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-stone-950 flex font-sans text-stone-200">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 border-r border-stone-800 flex flex-col">
        <div className="h-20 flex items-center px-6 border-b border-stone-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-sm bg-stone-950 border border-stone-700 flex items-center justify-center text-amber-500">
              <ShieldHalf className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold tracking-tighter text-white uppercase leading-none">Admin<span className="text-amber-500">Panel</span></span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link to="/admin/users" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link to="/admin/submissions" className="flex items-center gap-3 px-4 py-3 text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-stone-800 text-stone-300 hover:text-white transition-colors">
            <Video className="w-4 h-4" /> Submissions
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-800">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-sm font-bold uppercase tracking-widest rounded-sm hover:bg-red-500/10 text-red-500 transition-colors">
            <LogOut className="w-4 h-4" /> Chiqish
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-stone-950">
        <header className="h-20 bg-stone-900/50 backdrop-blur-md border-b border-stone-800 flex items-center justify-between px-8 sticky top-0 z-10">
          <h1 className="text-xl font-bold uppercase tracking-widest text-white">Admin Boshqaruv Paneli</h1>
        </header>
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
