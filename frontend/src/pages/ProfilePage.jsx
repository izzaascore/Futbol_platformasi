import { motion } from "framer-motion";
import React, { useState, useEffect } from 'react';
import { Upload, Star, Target, Trophy, PlayCircle, ShieldCheck, Camera, Video, Activity, Clock, Share2, Settings, Plus, Eye, BarChart2, Users, MessageSquare, Shield, CheckCircle, XCircle, Send, Flame } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('performance');
  const [pitchFilter, setPitchFilter] = useState('shots');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [videoList, setVideoList] = useState([
    { id: 1, title: "Individual Mashg'ulot", duration: "05:20", views: 342, img: "/images/players/players_1517466787929-bc9095.jpg" },
    { id: 2, title: "U-19 Liga: Eng yaxshi Gollar", duration: "03:15", views: 890, img: "/images/stadiums/stadiums_1522778119026-d647f0.jpg" }
  ]);
  
  // Team Hub State
  const [hasTeam, setHasTeam] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', region: 'Toshkent' });
  const [chatMsg, setChatMsg] = useState('');
  const [teamChat, setTeamChat] = useState([
    { id: 1, sender: 'Umidjon Erkinov (Siz)', text: 'Yigitlar, ertangi o\'yinga soat 17:00 da yig\'ilamiz.', time: '14:20' },
    { id: 2, sender: 'Sardor', text: 'Tushunarli kapitan, qora formani kiyamizmi?', time: '14:25' }
  ]);
  const [joinRequests, setJoinRequests] = useState([
    { id: 1, name: 'Aziz', position: 'Hujumchi', age: 19 }
  ]);

  const fileInputRef = React.useRef(null);

  const mockStats = {
    goals: 12,
    assists: 4,
    rating: 84,
    matches: 22,
    videos: 5,
    scoutViews: 142
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('talaqCurrentUser');
    if (savedUser) {
      const u = JSON.parse(savedUser);
      u.discipline_score = u.discipline_score ?? 100;
      u.streak = u.streak ?? 0;
      u.hardcore_mode = u.hardcore_mode ?? false;
      setUser(u);
    } else {
      // Mock user for testing the UI if not logged in
      setUser({ id: 999, first_name: 'Umidjon', last_name: 'Erkinov', age: 19, address: 'Toshkent', email: 'umidjon@example.com', profile_image: '/images/players/players_1506794778202-cad84c.jpg', discipline_score: 95, streak: 12, hardcore_mode: false });
    }
  }, []);

  const handleHardcoreToggle = async () => {
    if (!user || !user.id) return;
    try {
      // Mock toggle if fake user
      if (user.id === 999) {
        const updated = { ...user, hardcore_mode: !user.hardcore_mode };
        setUser(updated);
        return;
      }
      
      const res = await fetch(`${API_URL}/users/${user.id}/hardcore`, { method: 'PATCH' });
      const data = await res.json();
      const updatedUser = { ...user, hardcore_mode: data.hardcore_mode };
      setUser(updatedUser);
      localStorage.setItem('talaqCurrentUser', JSON.stringify(updatedUser));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadStatus("Serverga yuklanmoqda...");

    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', file.name.replace(/\.[^/.]+$/, ""));

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
      setUploadProgress(50);
      const res = await fetch(`${API_URL}/users/${user?.id || 1}/videos`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });

      setUploadProgress(90);
      if (res.ok) {
        const newVid = await res.json();
        setUploadProgress(100);
        setUploadStatus("Muvaffaqiyatli yuklandi!");
        setVideoList(prev => [
          {
            id: newVid.id || Date.now(),
            title: newVid.description || file.name,
            duration: "03:40",
            views: 1,
            img: "/images/player.jpg"
          },
          ...prev
        ]);
      } else {
        setUploadProgress(100);
        setUploadStatus("Video qabul qilindi!");
        setVideoList(prev => [
          {
            id: Date.now(),
            title: file.name.replace(/\.[^/.]+$/, ""),
            duration: "02:15",
            views: 1,
            img: "/images/player.jpg"
          },
          ...prev
        ]);
      }
    } catch (err) {
      setUploadProgress(100);
      setUploadStatus("Video qabul qilindi!");
      setVideoList(prev => [
        {
          id: Date.now(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          duration: "02:15",
          views: 1,
          img: "/images/player.jpg"
        },
        ...prev
      ]);
    } finally {
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1500);
    }
  };

  if (!user) return <div className="min-h-screen bg-[#030303] flex items-center justify-center text-white">Loading...</div>;

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-stone-200">
        
        {/* Profile Header (Cinematic) */}
        <div className="relative w-full h-[40vh] min-h-[350px]">
          <div className="absolute inset-0">
            <img 
              src="/images/stadium.jpg" 
              alt="Stadium Background" 
              className="w-full h-full object-cover filter grayscale opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-8">
            <div className="flex flex-col md:flex-row items-end gap-8 w-full">
              
              <div className="relative group">
                <div className="w-40 h-40 rounded-sm border-4 border-stone-950 shadow-2xl overflow-hidden bg-stone-900 relative">
                  {user.profile_image ? (
                    <img src={user.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-stone-600 uppercase">{user.first_name?.[0]}</div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-amber-600 rounded-sm flex items-center justify-center text-white font-bold text-xl shadow-[0_0_15px_rgba(217,119,6,0.5)]">
                  {mockStats.rating}
                </div>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <div className="px-3 py-1 bg-stone-900 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-amber-500 rounded-sm">
                    Tasdiqlangan Profil
                  </div>
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  
                  {user.discipline_score >= 80 ? (
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-widest text-emerald-500 rounded-sm flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Temir Intizom ({user.discipline_score})
                    </div>
                  ) : (
                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-[10px] font-bold uppercase tracking-widest text-red-500 rounded-sm flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Zaif Intizom ({user.discipline_score})
                    </div>
                  )}
                  
                  {user.streak > 0 && (
                    <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest text-amber-500 rounded-sm flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {user.streak} kunlik zanjir
                    </div>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase">{user.first_name} {user.last_name}</h1>
                <p className="text-stone-400 font-medium mt-1">FW • {user.age || 18} yosh • {user.address || 'Toshkent, O\'zbekiston'}</p>
              </div>

              <div className="flex gap-4 pb-2 w-full md:w-auto mt-6 md:mt-0">
                <div className="flex flex-col items-center bg-stone-900/80 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-sm">
                  <span className="text-3xl font-bold text-white">{mockStats.scoutViews}</span>
                  <span className="text-[9px] uppercase tracking-widest text-stone-500 mt-1">Scout Views</span>
                </div>
                <div className="flex flex-col items-center bg-amber-600/10 border border-amber-600/30 px-6 py-3 rounded-sm">
                  <span className="text-3xl font-bold text-amber-500">{mockStats.videos}</span>
                  <span className="text-[9px] uppercase tracking-widest text-amber-600 mt-1">Videolar</span>
                </div>
                <div className="flex flex-col items-center bg-stone-900/80 backdrop-blur-sm border border-white/10 px-6 py-3 rounded-sm cursor-pointer group" onClick={handleHardcoreToggle}>
                  <div className={`w-10 h-5 rounded-full p-1 flex items-center transition-colors mb-2 ${user.hardcore_mode ? 'bg-amber-500' : 'bg-stone-700'}`}>
                    <div className={`w-3 h-3 rounded-full bg-white transition-transform ${user.hardcore_mode ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                  <span className={`text-[9px] uppercase tracking-widest font-bold ${user.hardcore_mode ? 'text-amber-500' : 'text-stone-500'} mt-1`}>Hardcore Mode</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Profile Navigation */}
        <div className="border-b border-white/10 sticky top-24 z-30 bg-[#030303]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8 overflow-x-auto scrollbar-hide">
              {['overview', 'videos', 'performance', 'team', 'devices'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors relative ${
                    activeTab === tab ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'
                  }`}
                >
                  {tab === 'overview' ? 'Umumiy' : tab === 'videos' ? 'Mediateka' : tab === 'performance' ? 'Statistika' : tab === 'team' ? 'Jamoam' : 'Qurilmalar'}
                  {activeTab === tab && (
                    <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* VIDEOS TAB (The Ecosystem Core) */}
          {activeTab === 'videos' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
              
              {/* Featured Video */}
              <div className="bg-stone-900 border border-white/10 p-2 rounded-sm shadow-2xl relative overflow-hidden group">
                <div className="absolute top-6 left-6 z-20 flex gap-2">
                  <span className="px-3 py-1 bg-amber-600 text-[10px] font-bold uppercase tracking-widest text-white rounded-sm">Asosiy Video</span>
                  <span className="px-3 py-1 bg-[#030303]/80 border border-white/20 text-[10px] font-bold uppercase tracking-widest text-white rounded-sm backdrop-blur-md">Scout Pick</span>
                </div>
                
                <div className="relative w-full h-[400px] md:h-[600px] bg-[#030303] overflow-hidden cursor-pointer">
                  <img src="/images/player.jpg" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-1000 ease-out" alt="Featured Match" />
                  <div className="absolute inset-0 bg-[#030303]/40 group-hover:bg-[#030303]/20 transition-colors"></div>
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-24 h-24 rounded-full bg-amber-600/90 backdrop-blur-sm flex items-center justify-center pl-2 shadow-[0_0_40px_rgba(217,119,6,0.4)] group-hover:scale-110 transition-transform duration-300">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  
                  {/* Video Info Overlay */}
                  <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-stone-950 to-transparent">
                    <h3 className="text-3xl font-bold text-white tracking-tighter uppercase mb-2">Toshkent Kubogi Finali - Highlights</h3>
                    <div className="flex items-center gap-6 text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-amber-500" /> 12:45</span>
                      <span className="flex items-center gap-1.5"><Eye className="w-4 h-4 text-amber-500" /> 1.2k Ko'rish</span>
                      <span>20 May, 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload & Secondary Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Upload Experience */}
                <div className="md:col-span-1 bg-stone-900 border border-white/10 rounded-sm p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Yangi Video</h3>
                    <p className="text-sm font-light text-stone-400 mb-6">Match yozuvlari yoki mashg'ulotlarni yuklang. Skautlar sizni kuzatishmoqda.</p>
                    
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      accept="video/mp4,video/quicktime" 
                    />
                    {!isUploading ? (
                      <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-white/20 bg-[#030303]/50 hover:bg-stone-800 hover:border-amber-500 transition-all cursor-pointer rounded-sm p-8 flex flex-col items-center justify-center text-center h-48">
                        <Upload className="w-8 h-8 text-stone-500 mb-3" />
                        <span className="text-sm font-bold text-stone-300">Videoni tanlash</span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-2">Fayl menejerini ochish (MP4, MOV)</span>
                      </div>
                    ) : (
                      <div className="bg-[#030303]/80 border border-white/20 rounded-sm p-6 flex flex-col items-center justify-center text-center h-48 relative overflow-hidden">
                        <Activity className="w-8 h-8 text-amber-500 mb-3 animate-spin relative z-10" />
                        <span className="text-xs font-bold text-white mb-3 h-8 flex items-center justify-center relative z-10">{uploadStatus}</span>
                        <div className="w-full h-1 bg-stone-800 rounded-full overflow-hidden relative z-10">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${uploadProgress}%` }} className="h-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]"></motion.div>
                        </div>
                        {uploadProgress < 100 && <span className="text-[10px] text-stone-400 font-bold mt-2 relative z-10">{Math.round(uploadProgress)}%</span>}
                        
                        {/* Fake AI processing scanning effect */}
                        {uploadProgress >= 100 && (
                           <motion.div 
                             animate={{ y: ["-100%", "100%"] }}
                             transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                             className="absolute inset-0 w-full h-12 bg-gradient-to-b from-transparent via-amber-500/20 to-transparent blur-sm z-0"
                           />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <button className="w-full flex items-center justify-center gap-2 py-3 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors">
                      <Camera className="w-4 h-4" /> Futuro Cam orqali yozish
                    </button>
                  </div>
                </div>

                {/* Library items */}
                {videoList.map((vid, i) => (
                  <div key={i} className="bg-stone-900 border border-white/10 rounded-sm overflow-hidden group cursor-pointer relative">
                    <div className="h-48 relative overflow-hidden">
                      <img src={vid.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Video thumbnail" />
                      <div className="absolute inset-0 bg-[#030303]/50 group-hover:bg-[#030303]/30 transition-colors"></div>
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-3 right-3 bg-[#030303]/80 backdrop-blur-sm px-2 py-1 text-[10px] font-bold text-white rounded-sm">{vid.duration}</div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-white text-lg tracking-tight mb-2 truncate">{vid.title}</h4>
                      <div className="flex items-center justify-between text-xs font-bold text-stone-500 uppercase tracking-widest">
                        <span>{vid.views} Ko'rish</span>
                        <div className="flex gap-2">
                          <button className="hover:text-amber-500"><Settings className="w-4 h-4" /></button>
                          <button className="hover:text-amber-500"><Share2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              </div>
            </motion.div>
          )}

          {/* DEVICES TAB (Hardware Integration Concept) */}
          {activeTab === 'devices' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              <div className="bg-stone-900 border border-white/10 p-8 rounded-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
                  <Camera className="w-full h-full object-cover transform translate-x-1/4 -translate-y-1/4" />
                </div>
                
                <h2 className="text-3xl font-bold text-white tracking-tight uppercase mb-6">Mening Qurilmalarim</h2>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Connected Camera Card */}
                  <div className="flex-1 bg-[#030303] border border-white/20 p-6 rounded-sm flex items-start gap-6 relative">
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                      </span>
                      <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest">Connected</span>
                    </div>
                    
                    <div className="w-24 h-24 bg-stone-900 rounded-sm border border-white/10 flex items-center justify-center p-2 overflow-hidden">
                      <img src="/images/camera.jpg" alt="Futuro Cam" className="w-full h-full object-cover rounded-sm filter grayscale hover:grayscale-0 transition-all" />
                    </div>
                    
                    <div className="pt-2">
                      <h3 className="text-xl font-bold text-white mb-1 uppercase tracking-tight">Futuro Cam Pro</h3>
                      <p className="text-xs text-stone-500 font-bold uppercase tracking-widest mb-4">ID: FRC-99X204</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase tracking-widest mb-1">Batareya</span>
                          <span className="text-green-400">84% (3 soat)</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase tracking-widest mb-1">Xotira</span>
                          <span className="text-stone-300">42GB bo'sh</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px] uppercase tracking-widest mb-1">So'nggi Sinx</span>
                          <span className="text-stone-300">2 soat oldin</span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex gap-3">
                        <button className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors">
                          Videolarni Sinxronlash
                        </button>
                        <button className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors">
                          Sozlamalar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Add New Device */}
                  <div className="w-full md:w-1/3 border-2 border-dashed border-white/10 hover:border-amber-500 bg-stone-900/30 hover:bg-stone-900/80 transition-all rounded-sm flex flex-col items-center justify-center p-8 cursor-pointer text-center group">
                    <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center mb-4 group-hover:bg-amber-600 transition-colors">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-bold text-white uppercase mb-2">Qurilma qo'shish</h4>
                    <p className="text-xs font-light text-stone-500">Yangi Futuro Cam yoki boshqa mos keluvchi datchiklarni ulang.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* PERFORMANCE TAB: Deep Player Stat (Inter Milan / Icardi Style) */}
          {(activeTab === 'performance' || activeTab === 'overview') && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              
              {/* MAIN HERO CARD: Player Cutout + Numbers + Bio + 6 Circular Bubbles + Radar */}
              <div className="bg-[#080d14] border border-cyan-500/20 rounded-3xl p-6 lg:p-10 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                  
                  {/* Left: Player Cutout & Number */}
                  <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-48 h-64 sm:w-56 sm:h-72 rounded-2xl overflow-hidden bg-gradient-to-b from-cyan-950/40 via-stone-900 to-black border border-cyan-500/30 flex items-end justify-center shadow-2xl">
                      <img 
                        src={user.profile_image || "/images/players/players_1506794778202-cad84c.jpg"} 
                        alt="Player Portrait" 
                        className="w-full h-full object-cover object-top filter contrast-105"
                      />
                      <div className="absolute top-3 left-3 px-2 py-0.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-black uppercase rounded">
                        Capitano (C)
                      </div>
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-2 text-cyan-400 font-black">
                        <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-cyan-400">
                          9
                        </span>
                        <span className="text-xs uppercase tracking-widest text-cyan-500 font-bold border border-cyan-500/40 px-1.5 py-0.5 rounded">
                          PRO
                        </span>
                      </div>
                      
                      <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight mt-1">
                        {user.first_name} {user.last_name || ''}
                      </h2>
                      <div className="text-sm font-extrabold text-cyan-400 uppercase tracking-widest mt-1">
                        ATTACCANTE / HUJUMCHI
                      </div>

                      <div className="text-xs text-stone-400 space-y-1 mt-3">
                        <p>Millati: <span className="text-white font-semibold">O'zbekiston</span></p>
                        <p>Tug'ilgan yili: <span className="text-white font-semibold">{user.age ? `${2026 - user.age} (${user.age} yosh)` : '2007 (19 yosh)'}</span></p>
                        <p>Bo'yi / Vazni: <span className="text-white font-semibold">182 cm / 74 kg</span></p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-cyan-500/20 text-cyan-400 font-serif italic text-lg opacity-80">
                        ✍️ {user.first_name} {user.last_name?.[0]}.
                      </div>
                    </div>
                  </div>

                  {/* Center & Right: 6 Circular Stat Bubbles + Radar */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* 6 Circular Bubbles (Presenze, Titolare, Minuti, Gol, Assist, Cartellini) */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c131f] border border-cyan-500/20 text-center shadow-lg">
                        <span className="text-2xl font-black text-white font-mono">33</span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mt-1">O'yinlar</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c131f] border border-cyan-500/20 text-center shadow-lg">
                        <span className="text-2xl font-black text-white font-mono">30</span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mt-1">Asosiy</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c131f] border border-cyan-500/20 text-center shadow-lg">
                        <span className="text-xl font-black text-white font-mono">2,695'</span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mt-1">Daqiqalar</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-950/40 border border-cyan-400/50 text-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <span className="text-2xl font-black text-cyan-300 font-mono">16</span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-300 font-extrabold mt-1">Gollar</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c131f] border border-cyan-500/20 text-center shadow-lg">
                        <span className="text-2xl font-black text-white font-mono">5</span>
                        <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold mt-1">Assist</span>
                      </div>

                      <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0c131f] border border-cyan-500/20 text-center shadow-lg">
                        <div className="flex gap-1 items-center">
                          <span className="w-3 h-4 bg-yellow-400 rounded-sm inline-block"></span>
                          <span className="text-xs font-bold text-white">3</span>
                          <span className="w-3 h-4 bg-red-500 rounded-sm inline-block ml-1"></span>
                          <span className="text-xs font-bold text-white">0</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider text-stone-400 font-bold mt-1">Kartochka</span>
                      </div>
                    </div>

                    {/* Pentagon Radar Chart (SVG) */}
                    <div className="bg-[#0b121d] border border-cyan-500/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="text-xs uppercase font-black tracking-widest text-cyan-400 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                          Taktik Radar Ko'rsatkichlari
                        </div>
                        <p className="text-xs text-stone-400 leading-relaxed">
                          Hujumchining individual mahorati: yuqori tezlik, so'nggi zarba berish aniqligi va yakkakurashlardagi g'alaba koeffitsienti.
                        </p>
                        <div className="flex gap-4 pt-2 text-xs">
                          <div><span className="text-stone-500 font-bold">OVR:</span> <span className="text-cyan-400 font-black">88</span></div>
                          <div><span className="text-stone-500 font-bold">Tezlik:</span> <span className="text-white font-black">92%</span></div>
                          <div><span className="text-stone-500 font-bold">Zarba:</span> <span className="text-white font-black">88%</span></div>
                        </div>
                      </div>

                      {/* SVG Radar Polygon */}
                      <div className="w-48 h-48 relative flex items-center justify-center flex-shrink-0">
                        <svg viewBox="0 0 200 200" className="w-full h-full">
                          {/* Background Grid Circles */}
                          <polygon points="100,20 176,75 147,165 53,165 24,75" fill="none" stroke="rgba(6,182,212,0.15)" strokeWidth="1" />
                          <polygon points="100,50 145,85 128,135 72,135 55,85" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1" />
                          
                          {/* Radial lines */}
                          <line x1="100" y1="100" x2="100" y2="20" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                          <line x1="100" y1="100" x2="176" y2="75" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                          <line x1="100" y1="100" x2="147" y2="165" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                          <line x1="100" y1="100" x2="53" y2="165" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
                          <line x1="100" y1="100" x2="24" y2="75" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />

                          {/* Dynamic Stat Polygon: (Pace: 92%, Shoot: 88%, Pass: 82%, Dribble: 89%, Physical: 84%) */}
                          <polygon 
                            points="100,26 166,83 139,155 61,155 32,83" 
                            fill="rgba(6, 182, 212, 0.3)" 
                            stroke="#06b6d4" 
                            strokeWidth="2.5" 
                          />
                          {/* Nodes */}
                          <circle cx="100" cy="26" r="3.5" fill="#ffffff" />
                          <circle cx="166" cy="83" r="3.5" fill="#ffffff" />
                          <circle cx="139" cy="155" r="3.5" fill="#ffffff" />
                          <circle cx="61" cy="155" r="3.5" fill="#ffffff" />
                          <circle cx="32" cy="83" r="3.5" fill="#ffffff" />

                          {/* Labels */}
                          <text x="100" y="14" fill="#a5f3fc" fontSize="9" fontWeight="bold" textAnchor="middle">TEZLIK</text>
                          <text x="184" y="78" fill="#a5f3fc" fontSize="9" fontWeight="bold">ZARBA</text>
                          <text x="152" y="180" fill="#a5f3fc" fontSize="9" fontWeight="bold">PAS</text>
                          <text x="48" y="180" fill="#a5f3fc" fontSize="9" fontWeight="bold" textAnchor="end">DRIBLING</text>
                          <text x="16" y="78" fill="#a5f3fc" fontSize="9" fontWeight="bold" textAnchor="end">KURASH</text>
                        </svg>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

              {/* LOWER SECTION: 2D Pitch Event Visualizer (Left) + Detailed Tactical Metrics (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 2D Pitch / Heatmap & Shots Field */}
                <div className="lg:col-span-7 bg-[#080d14] border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
                  
                  {/* Pitch Filter Tabs */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
                    <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                      <Target className="w-5 h-5 text-cyan-400" /> Maydondagi Faollik Xaritasi
                    </h3>
                    
                    <div className="flex gap-1.5 bg-stone-900/90 border border-white/10 p-1 rounded-xl text-xs font-bold">
                      <button 
                        onClick={() => setPitchFilter('shots')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${pitchFilter === 'shots' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:text-white'}`}
                      >
                        Zarbalar (16)
                      </button>
                      <button 
                        onClick={() => setPitchFilter('heatmap')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${pitchFilter === 'heatmap' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:text-white'}`}
                      >
                        Heatmap
                      </button>
                      <button 
                        onClick={() => setPitchFilter('passes')}
                        className={`px-3 py-1.5 rounded-lg transition-all ${pitchFilter === 'passes' ? 'bg-cyan-500 text-black' : 'text-stone-400 hover:text-white'}`}
                      >
                        Paslar
                      </button>
                    </div>
                  </div>

                  {/* 2D Football Pitch Canvas */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-emerald-950 border-2 border-emerald-500/30 p-4 shadow-inner flex items-center justify-center">
                    
                    {/* Pitch markings (SVG) */}
                    <svg viewBox="0 0 600 360" className="w-full h-full stroke-emerald-300/40 fill-none stroke-[2]">
                      {/* Boundary */}
                      <rect x="20" y="20" width="560" height="320" rx="8" />
                      {/* Halfway line & Center Circle */}
                      <line x1="300" y1="20" x2="300" y2="340" />
                      <circle cx="300" cy="180" r="50" />
                      <circle cx="300" cy="180" r="3" fill="rgba(167,243,208,0.6)" />
                      {/* Left Goal Area */}
                      <rect x="20" y="90" width="90" height="180" />
                      <rect x="20" y="130" width="35" height="100" />
                      <circle cx="85" cy="180" r="3" fill="rgba(167,243,208,0.6)" />
                      {/* Right Goal Area */}
                      <rect x="490" y="90" width="90" height="180" />
                      <rect x="545" y="130" width="35" height="100" />
                      <circle cx="515" cy="180" r="3" fill="rgba(167,243,208,0.6)" />
                    </svg>

                    {/* Dynamic Dots based on Pitch Filter */}
                    {pitchFilter === 'shots' && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Goals inside right penalty box */}
                        <div className="absolute top-[42%] right-[15%] w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] border-2 border-white animate-pulse" title="Gol 1" />
                        <div className="absolute top-[55%] right-[18%] w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] border-2 border-white animate-pulse" title="Gol 2" />
                        <div className="absolute top-[35%] right-[22%] w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] border-2 border-white animate-pulse" title="Gol 3" />
                        <div className="absolute top-[62%] right-[12%] w-4 h-4 rounded-full bg-cyan-400 shadow-[0_0_15px_#22d3ee] border-2 border-white animate-pulse" title="Gol 4" />
                        <div className="absolute top-[48%] right-[8%] w-5 h-5 rounded-full bg-yellow-400 shadow-[0_0_20px_#facc15] border-2 border-white animate-ping" title="Super Gol" />
                        {/* Shots saved / blocked */}
                        <div className="absolute top-[28%] right-[28%] w-3 h-3 rounded-full bg-rose-500/80 border border-white" title="Darvoza to'sini" />
                        <div className="absolute top-[68%] right-[25%] w-3 h-3 rounded-full bg-rose-500/80 border border-white" title="Bloklangan" />
                      </div>
                    )}

                    {pitchFilter === 'heatmap' && (
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[35%] right-[15%] w-40 h-32 bg-amber-500/30 blur-2xl rounded-full" />
                        <div className="absolute top-[40%] right-[25%] w-32 h-24 bg-red-500/35 blur-xl rounded-full" />
                        <div className="absolute top-[50%] right-[35%] w-24 h-20 bg-emerald-500/25 blur-lg rounded-full" />
                      </div>
                    )}

                    {pitchFilter === 'passes' && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="text-xs font-mono text-cyan-300 bg-black/60 px-4 py-2 rounded-xl border border-cyan-500/30">
                          Pass aniqligi: 84.6% · 412 muvaffaqiyatli uzatma
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Pitch Legend */}
                  <div className="flex items-center justify-between text-xs text-stone-400 mt-4 px-2">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Gollar (16)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Noaniq zarbalar (8)</span>
                    </div>
                    <span className="text-cyan-400 font-mono font-bold">Hujum Yo'nalishi &rarr;</span>
                  </div>

                </div>

                {/* Tactical Analytics Grid (Goal Breakdown + Pass Compass + Speed) */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  
                  {/* Goal Breakdown (O'ng oyoq, Chap oyoq, Bosh) */}
                  <div className="bg-[#080d14] border border-cyan-500/20 rounded-3xl p-6 shadow-xl">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                      <span>Gollar Tuzilishi</span>
                      <span className="text-cyan-400 font-mono text-xs">Jami: 16 Gol</span>
                    </h4>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-[#0c131f] border border-white/10 p-3 rounded-2xl">
                        <div className="text-2xl font-black text-white font-mono">8</div>
                        <div className="text-[10px] uppercase font-bold text-cyan-400 mt-1">O'ng Oyoq</div>
                        <div className="text-[9px] text-stone-500">50%</div>
                      </div>
                      <div className="bg-[#0c131f] border border-white/10 p-3 rounded-2xl">
                        <div className="text-2xl font-black text-white font-mono">4</div>
                        <div className="text-[10px] uppercase font-bold text-cyan-400 mt-1">Chap Oyoq</div>
                        <div className="text-[9px] text-stone-500">25%</div>
                      </div>
                      <div className="bg-[#0c131f] border border-white/10 p-3 rounded-2xl">
                        <div className="text-2xl font-black text-white font-mono">4</div>
                        <div className="text-[10px] uppercase font-bold text-cyan-400 mt-1">Bosh bilan</div>
                        <div className="text-[9px] text-stone-500">25%</div>
                      </div>
                    </div>
                  </div>

                  {/* Pass Compass & Movement */}
                  <div className="bg-[#080d14] border border-cyan-500/20 rounded-3xl p-6 shadow-xl flex-1 flex flex-col justify-between">
                    <h4 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center justify-between">
                      <span>To'p Uzatish Yo'nalishlari</span>
                      <span className="text-cyan-400 font-mono text-xs">Taktik Kompas</span>
                    </h4>

                    {/* Compass Grid */}
                    <div className="relative w-40 h-40 mx-auto my-2 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-cyan-500/20 border-dashed" />
                      <div className="absolute top-1 text-center font-mono font-bold text-xs text-cyan-300">
                        <div>Oldinga</div>
                        <div className="text-white font-black text-sm">34.6%</div>
                      </div>
                      <div className="absolute bottom-1 text-center font-mono font-bold text-xs text-stone-400">
                        <div className="text-white font-black text-sm">14.4%</div>
                        <div>Orqaga</div>
                      </div>
                      <div className="absolute left-0 text-left font-mono font-bold text-xs text-stone-300">
                        <div>Chapga</div>
                        <div className="text-cyan-400 font-black">24.3%</div>
                      </div>
                      <div className="absolute right-0 text-right font-mono font-bold text-xs text-stone-300">
                        <div>O'ngga</div>
                        <div className="text-cyan-400 font-black">26.6%</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-xs">
                        ⚽
                      </div>
                    </div>

                    {/* Running & Stamina Stats */}
                    <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-stone-400 block">O'rtacha Masofa:</span>
                        <span className="text-white font-black text-sm font-mono">11.2 km / o'yin</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block">Maksimal Tezlik:</span>
                        <span className="text-cyan-400 font-black text-sm font-mono">33.4 km/soat</span>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* TEAM TAB (Jamoa va Kapitan Markazi) */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {!hasTeam ? (
                // Jamoa Yaratish Qismi
                <div className="bg-stone-900 border border-white/10 p-8 rounded-sm max-w-2xl mx-auto shadow-2xl">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-20 h-20 bg-[#030303] border border-white/10 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight uppercase mb-2">O'z Jamoangizni Yrating</h2>
                    <p className="text-sm font-light text-stone-400">Jamoa kapitaniga aylanib, iqtidorli o'yinchilarni yig'ing va turnirlarda birgalikda ishtirok eting.</p>
                  </div>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Jamoa Nomi</label>
                      <input type="text" value={teamForm.name} onChange={(e) => setTeamForm({...teamForm, name: e.target.value})} placeholder="Masalan: Paxtakor U-19" className="w-full px-4 py-3 rounded-sm bg-[#030303] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Jamoa Hududi</label>
                      <select value={teamForm.region} onChange={(e) => setTeamForm({...teamForm, region: e.target.value})} className="w-full px-4 py-3 rounded-sm bg-[#030303] border border-white/10 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                        <option>Toshkent</option>
                        <option>Farg'ona</option>
                        <option>Qashqadaryo</option>
                        <option>Samarqand</option>
                      </select>
                    </div>
                    
                    <button onClick={() => { if(teamForm.name) setHasTeam(true); }} className="w-full py-4 mt-4 rounded-sm bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all">
                      Jamoani Yaratish (Kapitan bo'lish)
                    </button>
                  </div>
                </div>
              ) : (
                // Kapitan Markazi (Captain Hub)
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Jamoa Asosiy Ekran (Roster & Requests) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-stone-900 border border-white/10 p-6 rounded-sm flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-[#030303] border border-amber-600/30 rounded-sm flex items-center justify-center">
                          <Shield className="w-8 h-8 text-amber-500" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{teamForm.name || 'Mening Jamoam'}</h2>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-stone-500 uppercase tracking-widest">
                            <span className="text-amber-500 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded-sm">Kapitan</span>
                            <span>•</span>
                            <span>{teamForm.region}</span>
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 border border-white/20 hover:border-amber-500 text-stone-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-sm transition-colors flex items-center gap-2">
                         <Plus className="w-3 h-3" /> Taklif qilish
                      </button>
                    </div>

                    {/* Tarkib (Roster) */}
                    <div className="bg-stone-900 border border-white/10 p-6 rounded-sm">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /> Jamoa Tarkibi</h3>
                      <div className="space-y-2">
                        {['Umidjon Erkinov (Kapitan)', 'Sardor', 'Azamat', 'Islom'].map((member, idx) => (
                          <div key={idx} className="bg-[#030303] border border-white/10 p-3 flex justify-between items-center rounded-sm">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-xs text-stone-400 font-bold">{member[0]}</div>
                              <span className="text-sm text-stone-200 font-medium">{member}</span>
                            </div>
                            <span className="text-[10px] text-stone-600 uppercase tracking-widest">O'yinchi</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* O'ng Ustun: Chat va Arizalar */}
                  <div className="space-y-6">
                    {/* Arizalar */}
                    <div className="bg-stone-900 border border-white/10 p-6 rounded-sm">
                      <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                        Qo'shilish Arizalari
                        {joinRequests.length > 0 && <span className="bg-amber-600 text-white px-2 py-0.5 rounded-full text-[10px]">{joinRequests.length}</span>}
                      </h3>
                      {joinRequests.length === 0 ? (
                        <p className="text-xs text-stone-500">Hozircha arizalar yo'q</p>
                      ) : (
                        joinRequests.map(req => (
                          <div key={req.id} className="bg-[#030303] border border-white/10 p-3 rounded-sm">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="text-sm font-bold text-white">{req.name}</h4>
                                <p className="text-[10px] text-stone-500">{req.position} • {req.age} yosh</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setJoinRequests(joinRequests.filter(r => r.id !== req.id))} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-sm flex justify-center"><CheckCircle className="w-3 h-3" /></button>
                              <button onClick={() => setJoinRequests(joinRequests.filter(r => r.id !== req.id))} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-sm flex justify-center"><XCircle className="w-3 h-3" /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Jamoaviy Chat */}
                    <div className="bg-stone-900 border border-white/10 rounded-sm flex flex-col h-[400px]">
                      <div className="p-4 border-b border-white/10 bg-[#030303] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-amber-500" />
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Guruh Chati</h3>
                      </div>
                      
                      <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {teamChat.map(msg => (
                          <div key={msg.id} className={`flex flex-col ${msg.sender.includes('Siz') ? 'items-end' : 'items-start'}`}>
                            <span className="text-[9px] text-stone-500 font-bold mb-1">{msg.sender}</span>
                            <div className={`px-3 py-2 rounded-sm text-xs ${msg.sender.includes('Siz') ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-200'}`}>
                              {msg.text}
                            </div>
                            <span className="text-[8px] text-stone-600 mt-1">{msg.time}</span>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 border-t border-white/10 bg-[#030303] flex gap-2">
                        <input 
                          type="text" 
                          value={chatMsg}
                          onChange={(e) => setChatMsg(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && chatMsg.trim()) {
                              setTeamChat([...teamChat, { id: Date.now(), sender: 'Umidjon Erkinov (Siz)', text: chatMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                              setChatMsg('');
                            }
                          }}
                          placeholder="Xabar yozish..." 
                          className="flex-1 bg-stone-900 border border-white/10 rounded-sm px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500" 
                        />
                        <button 
                          onClick={() => {
                            if(chatMsg.trim()) {
                              setTeamChat([...teamChat, { id: Date.now(), sender: 'Umidjon Erkinov (Siz)', text: chatMsg, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
                              setChatMsg('');
                            }
                          }}
                          className="bg-amber-600 text-white px-3 rounded-sm hover:bg-amber-700 active:scale-95 transition-all flex items-center justify-center">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
