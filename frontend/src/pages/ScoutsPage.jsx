import { motion } from "framer-motion";
import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Eye, UserCheck, Star, MapPin, Building, MessageSquare, Plus, Paperclip, Send } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const ScoutsPage = () => {
  const [selectedScout, setSelectedScout] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans">
        
        {/* Header */}
        <div className="relative pt-24 pb-16 w-full border-b border-stone-800 bg-stone-900">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2500&auto=format&fit=crop" 
              className="w-full h-full object-cover filter grayscale opacity-20" 
              alt="Scouting Field" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-end gap-6">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-stone-900 border border-stone-700 rounded-sm">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Professional Ekotizim</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase mb-2">
                Klublar <span className="text-stone-500">&</span> Skautlar
              </h1>
              <p className="text-stone-400 font-light max-w-xl">
                FootballRise tarmog'idagi rasmiy skautlar va akademiyalar. Sizning videolaringiz va harakatlaringizni aynan shu mutaxassislar kuzatib borishadi.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Scouts Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-stone-800">
                <Eye className="w-6 h-6 text-amber-500" />
                <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Tasdiqlangan Skautlar</h3>
              </div>
              
              {[
                { name: 'Azizbek Ahmedov', club: 'Nasaf', exp: '10 yil', img: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?q=80&w=200&auto=format&fit=crop' },
                { name: 'Murod Rajabov', club: 'Mustaqil', exp: '15 yil', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
                { name: 'Denis Istomin', club: 'Paxtakor', exp: '8 yil', img: 'https://images.unsplash.com/photo-1531885420367-172551e180d5?q=80&w=200&auto=format&fit=crop' }
              ].map((scout, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx} 
                  onClick={() => setSelectedScout(scout)}
                  className="bg-stone-900 border border-stone-800 p-6 rounded-sm flex items-center justify-between group hover:border-stone-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-6">
                    <img src={scout.img} alt={scout.name} className="w-16 h-16 rounded-full object-cover border-2 border-stone-800 group-hover:border-amber-500 transition-colors" />
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1">{scout.name}</h4>
                      <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-500">
                        <span className="flex items-center gap-1 text-amber-500"><Building className="w-3 h-3" /> {scout.club}</span>
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {scout.exp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-stone-950 border border-stone-800 flex items-center justify-center rounded-sm text-stone-400 group-hover:text-white group-hover:bg-amber-600 transition-colors">
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Clubs Column */}
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-800">
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-stone-500" />
                  <h3 className="text-2xl font-bold text-white uppercase tracking-tight">Klublar & Akademiyalar</h3>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 border border-stone-700 hover:border-amber-500 hover:text-amber-500 text-stone-400 rounded-sm text-[10px] font-bold uppercase tracking-widest transition-colors">
                  <Plus className="w-3 h-3" /> Qo'shish
                </button>
              </div>
              
              {[
                { name: '"Nasaf" Akademiyasi', region: 'Qashqadaryo', status: 'Ochiq tanlov', img: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?q=80&w=400&auto=format&fit=crop', desc: "2010-2012 yillarda tug'ilgan yoshlar uchun markaziy hujumchi pozitsiyasida tanlov." },
                { name: '"Paxtakor" Yoshlar Jamoasi', region: 'Toshkent', status: 'Kuzatuvda', img: 'https://images.unsplash.com/photo-1518602164578-cd0074062767?q=80&w=400&auto=format&fit=crop', desc: "Asosiy jamoa uchun zaxira o'yinchilarini FootballRise reytingi orqali saralamoqda." }
              ].map((club, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                  key={idx} 
                  onClick={() => setSelectedClub(club)}
                  className="bg-stone-900 border border-stone-800 overflow-hidden rounded-sm group cursor-pointer hover:border-stone-700 transition-colors"
                >
                  <div className="h-40 w-full relative overflow-hidden">
                    <img src={club.img} alt={club.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-stone-950/80 backdrop-blur-md px-3 py-1.5 border border-stone-700/50 rounded-sm">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${club.status === 'Ochiq tanlov' ? 'text-amber-500' : 'text-stone-400'}`}>{club.status}</span>
                    </div>
                  </div>
                  <div className="p-6 relative">
                    <div className="w-16 h-16 bg-stone-950 border border-stone-800 rounded-sm flex items-center justify-center absolute -top-8 left-6 shadow-xl">
                      <ShieldCheck className="w-8 h-8 text-stone-300" />
                    </div>
                    <div className="mt-8">
                      <h4 className="font-bold text-2xl text-white tracking-tight uppercase mb-2">{club.name}</h4>
                      <p className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <MapPin className="w-3 h-3 text-amber-500" /> {club.region}
                      </p>
                      <p className="text-sm font-light text-stone-400 leading-relaxed border-t border-stone-800 pt-4">
                        {club.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </div>
        
        {/* Scout Chat Modal */}
        {selectedScout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-0 md:p-4">
            <div className="bg-stone-900 border-0 md:border border-stone-800 w-full h-full md:w-[95vw] md:h-[95vh] max-w-7xl shadow-2xl rounded-none md:rounded-sm flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/50">
                <div className="flex items-center gap-4">
                  <img src={selectedScout.img} alt={selectedScout.name} className="w-12 h-12 rounded-full object-cover border border-amber-500" />
                  <div>
                    <h4 className="font-bold text-white text-lg">{selectedScout.name}</h4>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Online
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedScout(null)} className="text-stone-500 hover:text-white p-2">✕</button>
              </div>
              
              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col bg-stone-950/20">
                <div className="self-center bg-stone-950 border border-stone-800 px-4 py-1.5 rounded-sm text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                  Bugun, 14:30
                </div>
                
                <div className="self-start max-w-[80%]">
                  <div className="bg-stone-800 text-stone-200 p-4 rounded-r-xl rounded-bl-xl text-sm leading-relaxed border border-stone-700">
                    Assalomu alaykum. Profilingizdagi oxirgi "Toshkent Kubogi" videongizni ko'rib chiqdim. Hujumdagi harakatlaringiz e'tiborimni tortdi. Qaysi akademiyada mashg'ulot o'tayapsiz?
                  </div>
                  <span className="text-[10px] text-stone-500 font-bold mt-1 inline-block px-1">14:32</span>
                </div>
                
                {/* Simulated sent message if user typed anything */}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 border-t border-stone-800 bg-stone-950 flex gap-3">
                <button className="w-12 h-12 flex items-center justify-center bg-stone-900 border border-stone-800 text-stone-400 hover:text-amber-500 rounded-sm transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Xabar yoki video havola yozing..." 
                  className="flex-1 bg-stone-900 border border-stone-800 text-white px-4 rounded-sm focus:outline-none focus:border-amber-500 text-sm"
                />
                <button className="w-12 h-12 flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white rounded-sm transition-colors shadow-[0_0_10px_rgba(217,119,6,0.3)]">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Club Details Modal */}
        {selectedClub && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 w-full max-w-4xl shadow-2xl rounded-sm my-8 relative overflow-hidden">
              <button onClick={() => setSelectedClub(null)} className="absolute top-5 right-5 text-stone-300 hover:text-white p-2 z-20 bg-stone-950/50 backdrop-blur-sm rounded-sm">✕</button>
              
              <div className="h-64 relative w-full">
                <img src={selectedClub.img} alt={selectedClub.name} className="w-full h-full object-cover filter grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-8 flex items-end gap-6">
                  <div className="w-24 h-24 bg-stone-950 border-2 border-amber-500 rounded-sm flex items-center justify-center shadow-2xl">
                    <Building className="w-10 h-10 text-white" />
                  </div>
                  <div className="mb-2">
                    <h2 className="text-4xl font-bold text-white uppercase tracking-tight leading-none mb-2">{selectedClub.name}</h2>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500 uppercase tracking-widest"><MapPin className="w-4 h-4"/> {selectedClub.region}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">Akademiya haqida</h4>
                      <p className="text-stone-300 text-sm leading-relaxed font-light">
                        {selectedClub.desc} Bu akademiya yosh istiqbolli futbolchilarni kashf etish, ularni Yevropa standartlari asosida tayyorlash va professional shartnomalar taklif etish bilan shug'ullanadi. Asosiy e'tibor texnik mahorat va taktik ongni rivojlantirishga qaratilgan.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-stone-500 mb-3">Infratuzilma va jamoalar</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stone-950 border border-stone-800 p-4 rounded-sm">
                          <div className="text-xl font-bold text-white mb-1">5+</div>
                          <div className="text-[9px] uppercase tracking-widest text-stone-400">Tabiiy maydonlar</div>
                        </div>
                        <div className="bg-stone-950 border border-stone-800 p-4 rounded-sm">
                          <div className="text-xl font-bold text-white mb-1">U10-U21</div>
                          <div className="text-[9px] uppercase tracking-widest text-stone-400">Yoshlar jamoalari ro'yxati</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 bg-stone-950 border border-stone-800 p-6 rounded-sm h-fit">
                    <div className="text-center pb-6 border-b border-stone-800">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-2">Hozirgi Holat</div>
                      <div className="text-xl font-bold text-white uppercase">{selectedClub.status}</div>
                    </div>
                    
                    {selectedClub.status === 'Ochiq tanlov' ? (
                      <button className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest rounded-sm shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-colors">
                        Tanlovda qatnashish
                      </button>
                    ) : (
                      <div className="w-full py-4 bg-stone-900 border border-stone-700 text-stone-500 text-center font-bold text-xs uppercase tracking-widest rounded-sm">
                        E'lon Yopilgan
                      </div>
                    )}
                    
                    <button className="w-full py-4 bg-stone-900 border border-stone-800 hover:border-amber-500 text-white font-bold text-xs uppercase tracking-widest rounded-sm transition-colors">
                      Akademiyaga yozish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default ScoutsPage;
