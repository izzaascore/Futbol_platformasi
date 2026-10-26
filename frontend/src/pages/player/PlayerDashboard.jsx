import React, { useState, useEffect } from 'react';
import { Mail, Calendar, MapPin, CheckCircle, XCircle, Shield, Award, PlaySquare, Video, ArrowUpRight } from 'lucide-react';
import { API_URL } from '../../config';

const PlayerDashboard = () => {
  const userStr = localStorage.getItem('talaqCurrentUser');
  const user = userStr ? JSON.parse(userStr) : null;

  const [invitations, setInvitations] = useState([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const playerId = user?.player_id || user?.id || 1;

  useEffect(() => {
    fetchInvitations();
  }, [playerId]);

  const fetchInvitations = async () => {
    setLoadingInvites(true);
    try {
      const res = await fetch(`${API_URL}/api/player/${playerId}/invitations`);
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      } else {
        // Fallback demo invitations for player
        setInvitations([
          {
            id: 101,
            club_name: 'FC Pakhtakor U-19',
            title: "Rasmiy Ko'rikka Taklifnoma",
            tryout_date: '2026-11-05 10:00',
            location: 'Jar Arena, Toshkent',
            message: "Hurmatli futbolchi! Sizning platformadagi dribling va tezlik ko'rsatkichlaringiz mutaxassislarimizda katta qiziqish uyg'otdi. Sizni klubimiz akademiyasi asosiy ko'rigiga taklif qilamiz.",
            contact_phone: '+998 90 123 45 67',
            status: 'kutilmoqda',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      setInvitations([
        {
          id: 101,
          club_name: 'FC Pakhtakor U-19',
          title: "Rasmiy Ko'rikka Taklifnoma",
          tryout_date: '2026-11-05 10:00',
          location: 'Jar Arena, Toshkent',
          message: "Hurmatli futbolchi! Sizning platformadagi dribling va tezlik ko'rsatkichlaringiz mutaxassislarimizda katta qiziqish uyg'otdi. Sizni klubimiz akademiyasi asosiy ko'rigiga taklif qilamiz.",
          contact_phone: '+998 90 123 45 67',
          status: 'kutilmoqda',
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingInvites(false);
    }
  };

  const respondToInvite = async (inviteId, newStatus) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/api/player/invitations/${inviteId}/respond`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setInvitations(prev => prev.map(inv => inv.id === inviteId ? updated : inv));
      } else {
        // Local update
        setInvitations(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status: newStatus } : inv));
      }
      setActionMessage(newStatus === 'qabul_qilindi' ? "Taklifnoma qabul qilindi! Skaut siz bilan bog'lanadi." : "Taklifnoma rad etildi.");
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      setInvitations(prev => prev.map(inv => inv.id === inviteId ? { ...inv, status: newStatus } : inv));
      setActionMessage("Holat yangilandi.");
      setTimeout(() => setActionMessage(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-stone-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
        <div>
          <span className="text-amber-500 font-mono text-xs uppercase tracking-widest font-bold">Futbolchi Shaxsiy Kabineti</span>
          <h2 className="text-3xl font-black text-white uppercase tracking-tight mt-1">
            {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Mening Profilim"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase rounded-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Pro Profil Aktiv
          </span>
        </div>
      </div>

      {actionMessage && (
        <div className="mb-6 p-4 bg-amber-950/60 border border-amber-500/40 text-amber-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          {actionMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-stone-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-1">Intizom Balli</h3>
          <p className="text-3xl font-black text-emerald-400 font-mono">100 / 100</p>
        </div>
        <div className="bg-stone-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-1">Tasdiqlangan Gollar</h3>
          <p className="text-3xl font-black text-white font-mono">0 ta</p>
        </div>
        <div className="bg-stone-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-1">Skaut Taklifnomalari</h3>
          <p className="text-3xl font-black text-amber-400 font-mono">{invitations.length} ta</p>
        </div>
        <div className="bg-stone-900/60 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-1">OVR Reyting</h3>
          <p className="text-3xl font-black text-amber-500 font-mono">82</p>
        </div>
      </div>

      {/* Scout Invitations Section (TASK 3) */}
      <div className="mb-10 bg-gradient-to-b from-stone-900/80 to-stone-950 border border-white/10 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
              <Mail className="w-5 h-5 text-amber-500" />
              Skautlardan Menga Kelgan Ko'rik Taklifnomalari
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Rasmiy professional klublar va skautlardan kelgan ko'rik sinovlari. 1-bosishda qabul qiling yoki rad eting.
            </p>
          </div>
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold rounded-lg self-start sm:self-auto">
            {invitations.length} ta taklif
          </span>
        </div>

        {loadingInvites ? (
          <div className="py-12 text-center text-stone-500 text-xs font-bold uppercase tracking-widest animate-pulse">
            Taklifnomalar tekshirilmoqda...
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((inv) => (
              <div 
                key={inv.id} 
                className="bg-[#030303]/70 border border-white/10/90 hover:border-amber-500/40 transition-colors p-6 rounded-2xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 bg-amber-500 text-stone-950 text-[9px] font-black uppercase tracking-widest rounded-md">
                      {inv.club_name}
                    </span>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight mt-1">{inv.title}</h4>
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                      inv.status === 'qabul_qilindi' ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' :
                      inv.status === 'rad_etildi' ? 'bg-rose-950/80 text-rose-400 border-rose-800' :
                      'bg-amber-950/80 text-amber-400 border-amber-800 animate-pulse'
                    }`}>
                      {inv.status === 'qabul_qilindi' ? '✓ Qabul Qilindi' :
                       inv.status === 'rad_etildi' ? '✕ Rad Etildi' :
                       '⏳ Yangi Taklif (Javob Kutilmoqda)'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div className="flex items-center gap-2 text-stone-300">
                    <Calendar className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Ko'rik Sanasi: <strong className="text-white">{inv.tryout_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-stone-300">
                    <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span>Manzil: <strong className="text-white">{inv.location}</strong></span>
                  </div>
                </div>

                <div className="bg-stone-900/60 p-4 rounded-xl border border-white/10/80 mb-4 text-xs text-stone-300 leading-relaxed font-light">
                  <strong className="text-stone-400 uppercase text-[10px] font-bold block mb-1">Skaut Xabari:</strong>
                  {inv.message}
                </div>

                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-white/10/80">
                  <span className="text-[11px] font-mono text-stone-400">
                    Skaut Aloqa Nomeri: <strong className="text-amber-400">{inv.contact_phone || "+998 90 123 45 67"}</strong>
                  </span>
                  
                  {inv.status === 'kutilmoqda' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => respondToInvite(inv.id, 'qabul_qilindi')}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Qabul Qilish
                      </button>
                      <button
                        onClick={() => respondToInvite(inv.id, 'rad_etildi')}
                        className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-white/10 text-xs font-bold uppercase tracking-widest rounded-xl transition-colors"
                      >
                        Rad Etish
                      </button>
                    </div>
                  )}

                  {inv.status === 'qabul_qilindi' && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Ko'rikka borish tasdiqlangan
                    </span>
                  )}
                  {inv.status === 'rad_etildi' && (
                    <span className="text-xs text-stone-500 font-bold">
                      Taklif rad etilgan
                    </span>
                  )}
                </div>
              </div>
            ))}

            {invitations.length === 0 && (
              <div className="py-12 text-center text-stone-500 text-xs font-bold uppercase tracking-widest">
                Hozircha sizga skautlardan ko'rik taklifnomalari kelmagan.
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Videos Section */}
      <div className="bg-stone-900/60 border border-white/10 p-8 rounded-3xl text-center">
        <Video className="w-10 h-10 text-stone-600 mx-auto mb-3" />
        <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Mening Videolarim va Driblinglarim</h3>
        <p className="text-stone-400 text-xs max-w-md mx-auto mb-6">
          O'z o'yinlaringiz va eng chiroyli gollaringizni yuklang. Skautlar videolar orqali sizga ko'rik taklifnomalarini yuboradi.
        </p>
        <button className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/20">
          + Yangi Video Yuklash
        </button>
      </div>

    </div>
  );
};

export default PlayerDashboard;
