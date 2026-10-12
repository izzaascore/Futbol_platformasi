import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldHalf, FileText, UserPlus, FileUp } from 'lucide-react';
import { API_URL } from '../../config';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('player');
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', password: '', phone: '+998 '
  });
  const [playerForm, setPlayerForm] = useState({
    position: '', height: '', weight: '', preferred_foot: '', team: '', video_link: ''
  });
  const [scoutForm, setScoutForm] = useState({
    organization: '', license_url: ''
  });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const payload = {
            first_name: form.firstName,
            last_name: form.lastName,
            password: form.password,
            age: form.age ? parseInt(form.age) : null,
            role: role
        };

        if (role === 'player') {
            Object.assign(payload, {
                position: playerForm.position,
                height: playerForm.height ? parseInt(playerForm.height) : null,
                weight: playerForm.weight ? parseInt(playerForm.weight) : null,
                preferred_foot: playerForm.preferred_foot,
                team: playerForm.team,
                video_link: playerForm.video_link
            });
        } else {
            Object.assign(payload, {
                organization: scoutForm.organization,
                license_url: scoutForm.license_url
            });
        }

        const res = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            const err = await res.json();
            setError(err.detail || 'Xato yuz berdi');
            return;
        }
        
        alert("Profil muvaffaqiyatli yaratildi! Endi tizimga kiring.");
        navigate('/login');
        
    } catch (e) {
        setError("Server bilan bog'lanishda xatolik.");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl bg-stone-900 p-8 rounded-xl shadow-2xl border border-stone-800">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-sm bg-stone-950 border border-stone-700 flex items-center justify-center text-amber-500">
            <ShieldHalf className="w-6 h-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white text-center mb-6 uppercase tracking-widest">Ro'yxatdan O'tish</h2>
        
        {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4 text-xs font-bold text-center uppercase tracking-widest">{error}</div>}

        <div className="flex justify-center gap-4 mb-8">
            <button 
                type="button"
                onClick={() => setRole('player')} 
                className={`px-6 py-2 rounded font-bold text-xs uppercase tracking-widest transition-colors ${role === 'player' ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
            >
                Yosh Iqtidor (Player)
            </button>
            <button 
                type="button"
                onClick={() => setRole('scout')} 
                className={`px-6 py-2 rounded font-bold text-xs uppercase tracking-widest transition-colors ${role === 'scout' ? 'bg-emerald-600 text-white' : 'bg-stone-800 text-stone-400 hover:text-white'}`}
            >
                Skaut / Agent
            </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          {/* Umumiy maydonlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Ism</label>
              <input required type="text" value={form.firstName} onChange={e=>setForm({...form, firstName: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Familiya</label>
              <input required type="text" value={form.lastName} onChange={e=>setForm({...form, lastName: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Yosh</label>
              <input required type="number" placeholder="Masalan: 18" value={form.age} onChange={e=>setForm({...form, age: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Parol (Maxfiy Kalit)</label>
              <input required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none" />
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 mt-6">
              {role === 'player' ? (
                  <div className="space-y-4">
                      <h3 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4">Futbolchi Anketasi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Pozitsiya (Amplua)</label>
                              <input placeholder="Hujumchi, Himoyachi..." type="text" value={playerForm.position} onChange={e=>setPlayerForm({...playerForm, position: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Bo'y (cm)</label>
                              <input placeholder="175" type="number" value={playerForm.height} onChange={e=>setPlayerForm({...playerForm, height: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Vazn (kg)</label>
                              <input placeholder="65" type="number" value={playerForm.weight} onChange={e=>setPlayerForm({...playerForm, weight: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Yetakchi Oyoq</label>
                              <input placeholder="O'ng / Chap / Ikkala" type="text" value={playerForm.preferred_foot} onChange={e=>setPlayerForm({...playerForm, preferred_foot: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Hozirgi Jamoasi</label>
                              <input placeholder="Klub nomi yoki Erkin agent" type="text" value={playerForm.team} onChange={e=>setPlayerForm({...playerForm, team: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Video Havola</label>
                              <input placeholder="YouTube yoki TG URL" type="text" value={playerForm.video_link} onChange={e=>setPlayerForm({...playerForm, video_link: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-amber-500 outline-none text-sm" />
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="space-y-4">
                      <h3 className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-4">Skaut Anketasi</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Tashkilot / Klub Nomi</label>
                              <input required placeholder="Qaysi klub yoki agentlikdan?" type="text" value={scoutForm.organization} onChange={e=>setScoutForm({...scoutForm, organization: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-emerald-500 outline-none text-sm" />
                          </div>
                          <div>
                              <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Hujjat / Litsenziya (URL)</label>
                              <input placeholder="Google Drive, PDF link..." type="text" value={scoutForm.license_url} onChange={e=>setScoutForm({...scoutForm, license_url: e.target.value})} className="w-full px-4 py-3 bg-stone-950 border border-stone-800 rounded text-white focus:border-emerald-500 outline-none text-sm" />
                          </div>
                      </div>
                      <div className="bg-stone-950/50 p-4 border border-stone-800 rounded mt-4 text-xs text-stone-400">
                        <FileText className="w-4 h-4 text-emerald-500 inline mr-2" /> 
                        Diqqat: Yangi skaut profili "Pending" holatida yaratiladi va admin tasdiqlamagunicha tizimga kirish cheklangan.
                      </div>
                  </div>
              )}
          </div>

          <button type="submit" className={`w-full py-4 ${role === 'player' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white font-bold text-xs uppercase tracking-widest rounded transition flex justify-center items-center gap-2 mt-4`}>
            <UserPlus className="w-4 h-4"/> Yaratish
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
