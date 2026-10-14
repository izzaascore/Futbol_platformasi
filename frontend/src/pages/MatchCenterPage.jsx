import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { 
  PlayCircle, Activity, Calendar, Trophy, ChevronRight, 
  MapPin, Users, MonitorPlay, Sparkles, Send, CheckCircle2, 
  UserPlus, Clock, DollarSign, PlusCircle, AlertTriangle 
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

export default function MatchCenterPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [prematchData, setPrematchData] = useState(null);
  const [predScore, setPredScore] = useState({ home: '', away: '' });
  const [predLoading, setPredLoading] = useState(false);
  const [predSuccess, setPredSuccess] = useState(false);

  // SOS Matchmaker States
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

  // Pre-Match AI yuklash
  useEffect(() => {
    if (selectedMatch) {
      fetch(`${API_URL}/matches/${selectedMatch.id}/prematch-ai`)
        .then(res => res.json())
        .then(data => setPrematchData(data))
        .catch(() => {});
    }
  }, [selectedMatch]);

  // Bashorat yuborish
  const handlePredictionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMatch || predScore.home === '' || predScore.away === '') return;

    setPredLoading(true);
    setPredSuccess(false);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/matches/${selectedMatch.id}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          predicted_home_score: parseInt(predScore.home),
          predicted_away_score: parseInt(predScore.away)
        })
      });

      if (res.ok) {
        setPredSuccess(true);
        // Yangilangan pre-match ma'lumotlarini qayta yuklash
        const updated = await fetch(`${API_URL}/matches/${selectedMatch.id}/prematch-ai`);
        if (updated.ok) setPrematchData(await updated.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPredLoading(false);
    }
  };

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
      <div className="w-full bg-stone-950 min-h-screen font-sans text-stone-200 relative selection:bg-red-500/30 overflow-hidden pb-20">
        
        {/* Cinematic Header */}
        <div className="relative h-[36vh] min-h-[300px] w-full flex items-end pb-10 z-10">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2500&auto=format&fit=crop" 
              alt="Match Center" 
              className="w-full h-full object-cover opacity-35 grayscale"
            />
            <div className="absolute inset-0 bg-stone-950/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-2 bg-red-900/40 p-1 pr-4 rounded-full border border-red-500/30 backdrop-blur-md">
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                </div>
                <span className="text-[10px] font-black tracking-[0.2em] text-red-500 uppercase">FootballRise Arena</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase mb-2">
                O'yinlar & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-red-500">AI Tahlil</span>
              </h1>
              <p className="text-stone-400 font-light max-w-xl text-sm md:text-base">
                Jonli o'yinlar, AI ehtimollik bashoratlari va kechki o'yinlar uchun tezkor o'yinchi topish markazi.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full relative z-20">
          
          {/* Tabs Menu */}
          <div className="flex flex-wrap gap-2 bg-stone-900/90 p-1.5 rounded-2xl backdrop-blur-xl border border-stone-800 shadow-2xl mb-8">
            {[
              { id: 'prematch', label: '🔮 AI Pre-Match & Bashorat', badge: 'Yangi' },
              { id: 'sos', label: '⚡️ SOS: Odam Yetmayapti', badge: 'Qaynoq' },
              { id: 'live', label: 'Jonli O\'yinlar' },
              { id: 'tournaments', label: 'Turnirlar' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
                  activeTab === tab.id 
                  ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/20' 
                  : 'text-stone-400 hover:text-white hover:bg-stone-800/80'
                }`}
              >
                {tab.label}
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-black uppercase ${
                    activeTab === tab.id ? 'bg-stone-950 text-amber-400' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* TAB 1: AI PRE-MATCH PROBABILITY & BASHORATLAR */}
          {/* ============================================================== */}
          {activeTab === 'prematch' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* O'yin tanlash ro'yxati */}
              {matches.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {matches.map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMatch(m)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${
                        selectedMatch?.id === m.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      {m.home_team} vs {m.away_team}
                    </button>
                  ))}
                </div>
              )}

              {prematchData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Asosiy Ehtimollik Kartasi */}
                  <div className="lg:col-span-2 bg-stone-900/90 border border-stone-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="flex items-center justify-between border-b border-stone-800/80 pb-4 mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-amber-500">AI Statistik Ehtimollik Markazi</span>
                      </div>
                      <span className="text-[11px] text-stone-500 font-bold">100% Ma'lumotlarga Asoslangan</span>
                    </div>

                    {/* Jamoalar nomlari va to'qnashuvi */}
                    <div className="flex items-center justify-between text-center my-6">
                      <div className="flex-1">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-xl font-black text-amber-400 mb-2 shadow-inner">
                          {prematchData.home_team.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">{prematchData.home_team}</h3>
                        <span className="text-xs text-stone-400 font-bold">Mezbon</span>
                      </div>

                      <div className="px-4">
                        <span className="text-2xl font-black text-stone-600 tracking-widest">VS</span>
                      </div>

                      <div className="flex-1">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-800/80 border border-stone-700 flex items-center justify-center text-xl font-black text-red-400 mb-2 shadow-inner">
                          {prematchData.away_team.slice(0, 2).toUpperCase()}
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">{prematchData.away_team}</h3>
                        <span className="text-xs text-stone-400 font-bold">Mehmon</span>
                      </div>
                    </div>

                    {/* G'alaba Ehtimolligi Shkalasi (Probability Bar) */}
                    <div className="my-8">
                      <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider mb-2">
                        <span className="text-emerald-400">{prematchData.home_team}: {prematchData.win_probability_home}%</span>
                        <span className="text-amber-400">Durang: {prematchData.draw_probability}%</span>
                        <span className="text-rose-400">{prematchData.away_team}: {prematchData.win_probability_away}%</span>
                      </div>

                      <div className="h-4 w-full bg-stone-950 rounded-full overflow-hidden flex shadow-inner border border-stone-800">
                        <div 
                          style={{ width: `${prematchData.win_probability_home}%` }} 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-1000"
                          title="Mezbon g'alabasi"
                        />
                        <div 
                          style={{ width: `${prematchData.draw_probability}%` }} 
                          className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000"
                          title="Durang"
                        />
                        <div 
                          style={{ width: `${prematchData.win_probability_away}%` }} 
                          className="bg-gradient-to-r from-rose-600 to-rose-400 h-full transition-all duration-1000"
                          title="Mehmon g'alabasi"
                        />
                      </div>
                    </div>

                    {/* Hujum va Himoya reytinglari */}
                    <div className="grid grid-cols-2 gap-4 my-6 bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Hujum Kuchlari</span>
                        <div className="flex justify-between text-xs font-black mt-1">
                          <span className="text-white">{prematchData.home_attack_rating}/100</span>
                          <span className="text-stone-400">{prematchData.away_attack_rating}/100</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Himoya Barqarorligi</span>
                        <div className="flex justify-between text-xs font-black mt-1">
                          <span className="text-white">{prematchData.home_defense_rating}/100</span>
                          <span className="text-stone-400">{prematchData.away_defense_rating}/100</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Taktik Xulosasi */}
                    <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-stone-300 text-xs md:text-sm leading-relaxed">
                      {prematchData.ai_tactical_breakdown}
                    </div>
                  </div>

                  {/* O'yin Hisobini Bashorat Qilish Bloki */}
                  <div className="bg-stone-900/90 border border-stone-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                    <div>
                      <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2 flex items-center gap-2">
                        🎯 O'yin Hisobini Bashorat Qiling
                      </h4>
                      <p className="text-xs text-stone-400 mb-6">
                        Aniq hisobni toping va platforma reytingida haftalik sovrinlar uchun ballar jamg'aring!
                      </p>

                      <form onSubmit={handlePredictionSubmit} className="space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <span className="block text-[11px] font-bold text-stone-400 mb-1">{prematchData.home_team.slice(0, 10)}</span>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={predScore.home}
                              onChange={(e) => setPredScore({ ...predScore, home: e.target.value })}
                              placeholder="0"
                              required
                              className="w-16 h-14 bg-stone-950 border border-stone-700 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          <span className="text-2xl font-black text-stone-600 mt-5">:</span>

                          <div className="text-center">
                            <span className="block text-[11px] font-bold text-stone-400 mb-1">{prematchData.away_team.slice(0, 10)}</span>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              value={predScore.away}
                              onChange={(e) => setPredScore({ ...predScore, away: e.target.value })}
                              placeholder="0"
                              required
                              className="w-16 h-14 bg-stone-950 border border-stone-700 rounded-2xl text-center text-2xl font-black text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={predLoading}
                          className="w-full mt-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                        >
                          <Send className="w-4 h-4" /> {predLoading ? "Yuborilmoqda..." : "Bashoratni Tasdiqlash"}
                        </button>
                      </form>

                      {predSuccess && (
                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs text-center flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Bashoratingiz muvaffaqiyatli qabul qilindi!
                        </div>
                      )}
                    </div>

                    {/* Muxlislar Ovozi */}
                    <div className="mt-8 pt-6 border-t border-stone-800">
                      <span className="text-[10px] font-black uppercase tracking-wider text-stone-400 block mb-2">Muxlislar Tanlovi</span>
                      <div className="flex justify-between text-xs text-stone-300 font-bold">
                        <span>{prematchData.community_votes.home_pct}% Mezbon</span>
                        <span>{prematchData.community_votes.draw_pct}% Durang</span>
                        <span>{prematchData.community_votes.away_pct}% Mehmon</span>
                      </div>
                      <span className="text-[10px] text-stone-500 mt-1 block">Jami {prematchData.community_votes.total_votes} nafar muxlis ovoz berdi</span>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-stone-500">
                  O'yinlar tahlili yuklanmoqda...
                </div>
              )}
            </motion.div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SOS MATCHMAKER (ODAM YETMAYAPTI) */}
          {/* ============================================================== */}
          {activeTab === 'sos' && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              
              {/* E'lon berish sarlavhasi va tugmasi */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-900/90 border border-stone-800 p-6 rounded-3xl backdrop-blur-xl">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                    ⚡️ SOS Matchmaker: Futbolga Odam Qidirish
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Kechki o'yiningizga o'yinchi yetmayaptimi? E'lon bering yoki yaqin atrofdagi o'yinga qo'shiling!
                  </p>
                </div>

                <button
                  onClick={() => setShowCalloutModal(true)}
                  className="px-5 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-red-600/30 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" /> + O'yinga E'lon Berish
                </button>
              </div>

              {calloutSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> {calloutSuccess}
                </div>
              )}

              {/* E'lonlar ro'yxati */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {callouts.length > 0 ? (
                  callouts.map((c) => (
                    <div 
                      key={c.id} 
                      className="bg-stone-900/90 border border-stone-800 hover:border-amber-500/40 rounded-3xl p-6 backdrop-blur-xl transition-all shadow-xl flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-lg">
                            📍 {c.city} {c.district ? `(${c.district})` : ''}
                          </span>
                          <span className="text-xs font-bold text-stone-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-red-500" /> {c.match_time}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-white uppercase tracking-tight mb-2">
                          {c.title}
                        </h4>

                        <div className="space-y-1.5 text-xs text-stone-300 my-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-stone-500" />
                            <span>{c.stadium_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-500" />
                            <span>Kerak: <strong className="text-white">{c.players_needed} nafar ({c.position_needed})</strong></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span>To'lov: <strong>{c.price_per_person > 0 ? `${c.price_per_person.toLocaleString()} so'm` : "Tekin"}</strong></span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinCallout(c.id)}
                        className="w-full mt-4 py-3 bg-stone-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-emerald-500/30 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-md"
                      >
                        <UserPlus className="w-4 h-4" /> 🟢 Men Boraman! ({c.joined_count || 0}/{c.players_needed})
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-16 text-center text-stone-500 bg-stone-900/40 rounded-3xl border border-stone-800">
                    <AlertTriangle className="w-8 h-8 text-amber-500/40 mx-auto mb-2" />
                    Hozircha faol SOS e'lonlar mavjud emas. Birinchi bo'lib o'z e'loningizni qoldiring!
                  </div>
                )}
              </div>

              {/* E'lon berish Modali */}
              {showCalloutModal && (
                <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
                  <div className="bg-stone-900 border border-stone-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl">
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">
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
                          className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Tuman</label>
                          <input
                            type="text"
                            value={newCallout.district}
                            onChange={(e) => setNewCallout({ ...newCallout, district: e.target.value })}
                            placeholder="Chilonzor"
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
                          className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-1">Pozitsiya</label>
                          <select
                            value={newCallout.position_needed}
                            onChange={(e) => setNewCallout({ ...newCallout, position_needed: e.target.value })}
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
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
                            className="w-full px-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-stone-800">
                        <button
                          type="button"
                          onClick={() => setShowCalloutModal(false)}
                          className="px-4 py-2 bg-stone-800 text-stone-400 rounded-xl text-xs font-bold"
                        >
                          Bekor qilish
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
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

          {/* TAB 3: JONLI O'YINLAR (Mavjud) */}
          {activeTab === 'live' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="p-8 rounded-3xl bg-stone-900 border border-stone-800 text-center text-stone-400">
                <Activity className="w-10 h-10 text-red-500 mx-auto mb-3 animate-pulse" />
                <h3 className="text-xl font-bold text-white mb-2">Hozirda Jonli O'yinlar Davom Etmoqda</h3>
                <p className="text-xs text-stone-400 max-w-md mx-auto">
                  Turnirlardagi jonli hisoblar va voqealar "Pre-Match & Bashorat" bo'limida avtomatik yangilanib boradi.
                </p>
              </div>
            </motion.div>
          )}

          {/* TAB 4: TURNIRLAR (Mavjud) */}
          {activeTab === 'tournaments' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "O'zbekiston Yoshlar Kubogi", teams: 16, status: "Pley-off bosqichi", img: "https://images.unsplash.com/photo-1574629810360-7efbb6b667cb?q=80&w=600&auto=format&fit=crop" },
                { name: "Toshkent Chempionati U-18", teams: 12, status: "3-Tur", img: "https://images.unsplash.com/photo-1518605368461-1ee7e5241416?q=80&w=600&auto=format&fit=crop" }
              ].map((t, i) => (
                <div key={i} className="relative h-72 rounded-3xl overflow-hidden group cursor-pointer border border-stone-800">
                  <img src={t.img} className="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" alt="Tournament"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <div className="px-3 py-1 bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] font-black uppercase tracking-widest inline-block mb-2 rounded-md">{t.status}</div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{t.name}</h3>
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
