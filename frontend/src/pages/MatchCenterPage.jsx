import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, Activity, Calendar, Trophy, ChevronRight, 
  MapPin, Users, MonitorPlay, Sparkles, Send, CheckCircle2, 
  UserPlus, Clock, DollarSign, PlusCircle, AlertTriangle, Zap 
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

export default function MatchCenterPage() {
  const [activeTab, setActiveTab] = useState('sos');
  const userStr = localStorage.getItem('talaqCurrentUser');
  let currentUser = null;
  try { currentUser = userStr ? JSON.parse(userStr) : null; } catch(e) {}
  const isAdmin = currentUser?.role === 'admin' || localStorage.getItem('role') === 'admin';
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Tezkor O'yinchi Qidirish (SOS) States
  const [callouts, setCallouts] = useState([]);
  const [showCalloutModal, setShowCalloutModal] = useState(false);
  const [newCallout, setNewCallout] = useState({
    title: '',
    city: 'Toshkent',
    district: '',
    stadium_name: '',
    match_time: '',
    players_needed: 1,
    position_needed: 'Ixtiyoriy',
    price_per_person: 0
  });
  const [calloutSuccess, setCalloutSuccess] = useState('');

  // O'yinlarni yuklash
  useEffect(() => {
    fetch(`${API_URL}/matches`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setMatches(data);
          setSelectedMatch(data[0]);
        }
      })
      .catch(() => {});

    // SOS e'lonlarni yuklash
    fetch(`${API_URL}/api/match-callouts?status=open`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCallouts(data);
      })
      .catch(() => {});
  }, []);

  // SOS E'lon berish
  const handleCreateCallout = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/match-callouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newCallout)
      });
      if (res.ok) {
        setShowCalloutModal(false);
        setCalloutSuccess("SOS E'lon muvaffaqiyatli joylashtirildi!");
        const updated = await fetch(`${API_URL}/api/match-callouts?status=open`);
        if (updated.ok) setCallouts(await updated.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  // O'yinga qo'shilish ("Men boraman!")
  const handleJoinCallout = async (calloutId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/match-callouts/${calloutId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ note: "Men tayyorman!" })
      });
      if (res.ok) {
        alert("🎉 Tabriklaymiz! Siz o'yinga qo'shildingiz, kapitan siz bilan bog'lanadi.");
        const updated = await fetch(`${API_URL}/api/match-callouts?status=open`);
        if (updated.ok) setCallouts(await updated.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-stone-200 relative selection:bg-white selection:text-black overflow-hidden pb-20">
        
        {/* Cinematic Header */}
        <div className="relative h-[36vh] min-h-[300px] w-full flex items-end pb-10 z-10 border-b border-white/10">
          <div className="absolute inset-0">
            <img 
              src="/images/general/general_1518609878373-06d740.jpg" 
              alt="Jonli Efir" 
              className="w-full h-full object-cover opacity-25 grayscale"
            />
            <div className="absolute inset-0 bg-[#030303]/80 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-3 bg-white/5 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <span className="text-[10px] font-heading font-black tracking-[0.2em] text-stone-200 uppercase">
                  Futuro Jonli Markazi
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase mb-2">
                O'yinlar & <span className="text-gradient">Jonli Efir</span>
              </h1>
              <p className="text-stone-300 font-normal max-w-xl text-sm md:text-base leading-relaxed">
                Jonli o'yinlar, turnir jadvallari va kechki o'yinlar uchun tezkor o'yinchi topish markazi.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full relative z-20">
          
          {/* Tabs Menu - Pure Futuro Dark Luxury */}
          <div className="flex flex-wrap gap-2 bg-white/[0.03] p-1.5 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl mb-8">
            {[
              { id: 'sos', label: 'SOS: Odam Yetmayapti', badge: 'Qaynoq', icon: <Zap className="w-3.5 h-3.5" /> },
              { id: 'live', label: "Jonli O'yinlar", icon: <Activity className="w-3.5 h-3.5" /> },
              { id: 'tournaments', label: 'Turnirlar', icon: <Trophy className="w-3.5 h-3.5" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-heading font-bold uppercase tracking-wider transition-all duration-300 relative ${
                  activeTab === tab.id 
                  ? 'bg-white text-black font-black shadow-glow' 
                  : 'text-stone-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.badge && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-heading font-black uppercase tracking-wider ${
                    activeTab === tab.id ? 'bg-black text-white' : 'bg-white/10 text-stone-300 border border-white/15'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* TAB 1: SOS MATCHMAKER (ODAM YETMAYAPTI) */}
          {/* ============================================================== */}
          {activeTab === 'sos' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* E'lon berish sarlavhasi va tugmasi */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.03] border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl">
                <div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-white" /> Tezkor O'yinchi Qidirish (SOS): Futbolga Odam Qidirish
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-400 mt-1 font-normal">
                    Kechki o'yiningizga o'yinchi yetmayaptimi? E'lon bering yoki yaqin atrofdagi o'yinga qo'shiling!
                  </p>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => setShowCalloutModal(true)}
                    className="px-6 py-3.5 bg-white hover:bg-stone-200 text-black font-heading font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 flex items-center gap-2 shadow-glow whitespace-nowrap transform hover:-translate-y-0.5"
                  >
                    <PlusCircle className="w-4 h-4" /> + E'lon Berish (Admin)
                  </button>
                )}
              </div>

              {calloutSuccess && (
                <div className="p-4 bg-white/5 border border-white/20 rounded-xl text-stone-200 text-xs flex items-center gap-2 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4 text-white" /> {calloutSuccess}
                </div>
              )}

              {/* E'lonlar ro'yxati */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {callouts.length > 0 ? (
                  callouts.map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-white/[0.03] border border-white/10 hover:border-white/30 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 shadow-xl flex flex-col justify-between group hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 bg-white/5 border border-white/15 text-stone-200 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                            📍 {c.city} {c.district ? `(${c.district})` : ''}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {c.match_time || 'Bugun'}
                          </span>
                        </div>

                        <h4 className="font-heading text-lg font-bold text-white mb-3 group-hover:text-stone-100 transition-colors">
                          {c.title}
                        </h4>

                        <div className="space-y-2 text-xs text-stone-300 my-4 border-y border-white/10 py-3">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-400" />
                            <span>Maydon: <strong className="text-white">{c.stadium_name}</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-stone-400" />
                            <span>Kerak: <strong className="text-white">{c.players_needed} nafar ({c.position_needed})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-stone-400" />
                            <span>To'lov: <strong className="text-white">{c.price_per_person > 0 ? `${c.price_per_person.toLocaleString()} so'm` : "Tekin"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinCallout(c.id)}
                        className="w-full mt-4 py-3.5 bg-white/5 hover:bg-white text-stone-200 hover:text-black border border-white/20 font-heading font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                      >
                        <UserPlus className="w-4 h-4" /> Men Boraman! ({c.joined_count || 0}/{c.players_needed})
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-stone-400 bg-white/[0.02] rounded-2xl border border-white/10 flex flex-col items-center justify-center p-8">
                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                      <AlertTriangle className="w-6 h-6 text-stone-300" />
                    </div>
                    <h4 className="font-heading font-bold text-white text-base mb-1 uppercase tracking-wider">
                      Hozircha faol SOS e'lonlar mavjud emas
                    </h4>
                    <p className="text-stone-400 text-sm max-w-md">
                      Birinchi bo'lib o'z e'loningizni qoldiring yoki keyinroq qayta tekshiring!
                    </p>
                  </div>
                )}
              </div>

              {/* E'lon berish Modali */}
              {showCalloutModal && (
                <div className="fixed inset-0 z-50 bg-[#030303]/85 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-[#080808] border border-white/20 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl">
                    <h3 className="font-heading text-xl font-black text-white uppercase tracking-tight mb-6">
                      ⚡️ Yangi O'yin Uchun E'lon Berish
                    </h3>
                    <form onSubmit={handleCreateCallout} className="space-y-4">
                      <div>
                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">E'lon Sarlavhasi</label>
                        <input
                          type="text"
                          required
                          value={newCallout.title}
                          onChange={(e) => setNewCallout({ ...newCallout, title: e.target.value })}
                          placeholder="Masalan: Kechki do'stona o'yinga 2 kishi kerak"
                          className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Shahar</label>
                          <input
                            type="text"
                            required
                            value={newCallout.city}
                            onChange={(e) => setNewCallout({ ...newCallout, city: e.target.value })}
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Tuman</label>
                          <input
                            type="text"
                            value={newCallout.district}
                            onChange={(e) => setNewCallout({ ...newCallout, district: e.target.value })}
                            placeholder="Chilonzor"
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Stadion Nomi / Manzil</label>
                        <input
                          type="text"
                          required
                          value={newCallout.stadium_name}
                          onChange={(e) => setNewCallout({ ...newCallout, stadium_name: e.target.value })}
                          placeholder="Bunyodkor Mini Arena"
                          className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">O'yin Vaqti</label>
                          <input
                            type="text"
                            required
                            value={newCallout.match_time}
                            onChange={(e) => setNewCallout({ ...newCallout, match_time: e.target.value })}
                            placeholder="Bugun, 20:00"
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Nechta Odam Kerak</label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            required
                            value={newCallout.players_needed}
                            onChange={(e) => setNewCallout({ ...newCallout, players_needed: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Pozitsiya</label>
                          <select
                            value={newCallout.position_needed}
                            onChange={(e) => setNewCallout({ ...newCallout, position_needed: e.target.value })}
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          >
                            <option value="Ixtiyoriy">Ixtiyoriy</option>
                            <option value="Himoyachi">Himoyachi</option>
                            <option value="Yarim himoyachi">Yarim himoyachi</option>
                            <option value="Hujumchi">Hujumchi</option>
                            <option value="Darvozabon">Darvozabon</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Kishi Boshiga To'lov (so'm)</label>
                          <input
                            type="number"
                            min="0"
                            step="5000"
                            value={newCallout.price_per_person}
                            onChange={(e) => setNewCallout({ ...newCallout, price_per_person: parseInt(e.target.value) || 0 })}
                            placeholder="0 (Tekin)"
                            className="w-full px-4 py-3 bg-black/60 border border-white/15 rounded-xl text-white text-xs focus:outline-none focus:border-white transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setShowCalloutModal(false)}
                          className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-stone-300 rounded-xl text-xs font-bold transition-colors"
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-white hover:bg-stone-200 text-black rounded-xl text-xs font-heading font-black uppercase tracking-wider transition-colors shadow-glow"
                        >
                          E'lonni Joylash
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* TAB 2: JONLI O'YINLAR (Dinamik & Real-Vaqt) */}
          {activeTab === 'live' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="font-heading text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-white" /> Jonli Uchrashuvlar Markazi
                  </h3>
                  <p className="text-xs text-stone-400">Respublika va viloyat birinchiliklaridagi jonli hisoblar</p>
                </div>
                <span className="px-3.5 py-1.5 bg-white/5 border border-white/20 text-white text-xs font-heading font-bold uppercase rounded-xl flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE efir
                </span>
              </div>

              {(!matches || matches.length === 0) ? (
                <div className="py-16 bg-white/[0.02] border border-white/10 rounded-2xl text-center flex flex-col items-center justify-center p-8">
                  <Activity className="w-12 h-12 text-stone-600 mb-4" />
                  <h4 className="font-heading text-xl font-bold text-white mb-2 uppercase tracking-wide">Hozirda jonli o'yinlar mavjud emas</h4>
                  <p className="text-stone-400 text-sm max-w-md">Rasmiy uchrashuvlar boshlanganda ushbu bo'limda real-vaqt rejimida hisoblar va voqealar namoyish etiladi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {matches.map((m, idx) => (
                  <div key={m.id || idx} className="bg-white/[0.03] border border-white/10 hover:border-white/30 transition-all p-6 rounded-2xl relative overflow-hidden shadow-xl">
                    <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-widest pb-3 mb-4 border-b border-white/10">
                      <span>{m.tournament || "Rasmiy Turnir"}</span>
                      <span className="text-white font-mono font-black flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> {m.minute || "65'"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center my-4 px-2">
                      <div className="w-2/5 text-center">
                        <div className="font-heading text-lg font-black text-white uppercase tracking-tight">{m.home_team}</div>
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Mezbon</span>
                      </div>
                      <div className="w-1/5 flex justify-center">
                        <div className="px-5 py-2.5 bg-black/80 border border-white/15 rounded-xl text-2xl font-black text-white font-mono shadow-inner">
                          {m.home_score !== undefined ? m.home_score : 1} : {m.away_score !== undefined ? m.away_score : 0}
                        </div>
                      </div>
                      <div className="w-2/5 text-center">
                        <div className="font-heading text-lg font-black text-white uppercase tracking-tight">{m.away_team}</div>
                        <span className="text-[10px] text-stone-500 font-bold uppercase tracking-widest">Mehmon</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs text-stone-400">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-stone-300" /> {m.stadium || "Markaziy Stadion"}</span>
                      <span className="text-white font-bold hover:underline cursor-pointer">Batafsil & Stats &rarr;</span>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: TURNIRLAR (Mavjud) */}
          {activeTab === 'tournaments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "O'zbekiston Yoshlar Kubogi", teams: 16, status: "Pley-off bosqichi", img: "/images/stadiums/stadiums_1574629810360-7efbb6.jpg" },
                { name: "Toshkent Chempionati U-18", teams: 12, status: "3-Tur", img: "/images/stadiums/stadiums_1522778119026-d647f0.jpg" }
              ].map((t, i) => (
                <div key={i} className="relative h-72 rounded-2xl overflow-hidden group cursor-pointer border border-white/10">
                  <img src={t.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="Tournament"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="px-3 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-heading font-black uppercase tracking-widest inline-block mb-2 rounded-md">{t.status}</div>
                    <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tighter mb-1">{t.name}</h3>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
                      <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {t.teams} Jamoa</span>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
