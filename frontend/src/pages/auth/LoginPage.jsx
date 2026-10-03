import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Key, ShieldHalf } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', password: '' });
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.detail || 'Xato yuz berdi');
            return;
        }
        const data = await res.json();
        localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
        
        // Role based redirect
        if (data.role === 'admin') navigate('/admin/dashboard');
        else if (data.role === 'scout') navigate('/scout/dashboard');
        else navigate('/player/dashboard');
        
    } catch (e) {
        setError("Server bilan bog'lanishda xatolik.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-stone-900 p-8 rounded-xl shadow-2xl border border-stone-800">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-stone-950 border border-stone-700 flex items-center justify-center text-amber-500">
            <ShieldHalf className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-6 uppercase tracking-widest">Tizimga Kirish</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-xs font-bold text-center uppercase tracking-widest">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Ism</label>
            <input required type="text" value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Familiya</label>
            <input required type="text" value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Parol</label>
            <input required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
          </div>
          <button type="submit" className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded transition flex justify-center items-center gap-2 mt-4">
            <Key className="w-4 h-4"/> Kirish
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
