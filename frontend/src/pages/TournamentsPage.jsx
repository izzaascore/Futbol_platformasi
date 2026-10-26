import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin, Users, ArrowRight, Circle, PlayCircle, Shield, CheckCircle2, X } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const fallbackTournaments = [
    { 
      id: 1, 
      name: "Futuro Cadets Cup 2026", 
      description: "O'zbekistonning eng iqtidorli yoshlar akademiyalari o'rtasidagi asosiy kubok musobaqasi. Xalqaro va mahalliy skautlar to'liq kuzatuvi ostida.", 
      prize: "€10,000 & Yevropa Ko'rigi", 
      status: "Aktiv", 
      image: "https://images.unsplash.com/photo-1518605368461-1ee7c5320746?q=80&w=2670&auto=format&fit=crop", 
      teams_count: 16, 
      start_date: "15 Iyun, 2026", 
      location: "Toshkent, Jar Stadioni" 
    },
    { 
      id: 2, 
      name: "U-18 Toshkent Yoshlar Ligasi", 
      description: "Respublika miqyosidagi ixtisoslashtirilgan futbol maktablari (BOSM, SSOR) va xususiy akademiyalar o'rtasidagi yirik mavsumiy liga.", 
      prize: "Professional Shartnomalar", 
      status: "Tez kunda", 
      image: "https://images.unsplash.com/photo-1550286395-520556eecdb7?q=80&w=2500&auto=format&fit=crop", 
      teams_count: 32, 
      start_date: "10 Avgust, 2026", 
      location: "Toshkent, Paxtakor Stadioni" 
    },
    { 
      id: 3, 
      name: "Vodiy Stars Super Cup", 
      description: "Andijon, Farg'ona va Namangan viloyatlarining eng sara U-17 jamoalari to'qnashuvi. Superliga klublari murabbiylari ishtirokida.", 
      prize: "Klublar Akademiyasiga Qabul", 
      status: "Tez kunda", 
      image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?q=80&w=2500&auto=format&fit=crop", 
      teams_count: 16, 
      start_date: "20 Sentyabr, 2026", 
      location: "Andijon, Bobur Arena" 
    }
  ];

  useEffect(() => {
    fetch(`${API_URL}/api/tournaments`)
      .then(res => res.json())
      .then(data => {
        setTournaments(Array.isArray(data) && data.length > 0 ? data : fallbackTournaments);
        setLoading(false);
      })
      .catch(() => {
        setTournaments(fallbackTournaments);
        setLoading(false);
      });
  }, []);

  const handleRegister = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMsg(true);
      setTimeout(() => {
        setSuccessMsg(false);
        setShowRegModal(false);
        setSelectedTournament(null);
      }, 1800);
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-white relative selection:bg-white selection:text-black overflow-hidden pb-24">
        
        {/* Cinematic Header with Stadium Lighting */}
        <div className="relative min-h-[420px] w-full flex items-center justify-center bg-stadium bg-grid border-b border-white/10 pt-12 pb-16">
          <div className="glass-glow absolute top-10 left-1/2 -translate-x-1/2 opacity-30 blur-3xl pointer-events-none w-[600px] h-[300px]"></div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mx-auto w-14 h-14 mb-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-glow">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white uppercase mb-4">
                TURNIRLAR VA <span className="text-gradient">KUBOKLAR</span>
              </h1>
              <p className="text-stone-300 font-normal text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                Tarix aynan shu yerda, rasmiy chempionatlarda yoziladi. G'alaba qozoning, xalqaro skautlar e'tiboriga tushing va professional klublarga yo'l oling.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Tournaments Content List */}
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full relative z-20">
          
          {loading ? (
            <div className="space-y-8">
              <div className="h-96 bg-white/[0.03] animate-pulse rounded-3xl border border-white/10"></div>
              <div className="h-96 bg-white/[0.03] animate-pulse rounded-3xl border border-white/10"></div>
            </div>
          ) : (
            <div className="space-y-10">
              {tournaments.map((tournament, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={tournament.id} 
                  className="group relative rounded-3xl bg-white/[0.03] border border-white/10 overflow-hidden flex flex-col lg:flex-row hover:border-white/30 transition-all duration-500 shadow-card backdrop-blur-xl"
                >
                  {/* Left: Cinematic Image Section */}
                  <div className="relative h-72 lg:h-auto lg:w-3/5 overflow-hidden bg-stone-900">
                    <img 
                      loading="lazy"
                      src={tournament.image || fallbackTournaments[0].image} 
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-[#030303] via-[#030303]/40 to-transparent"></div>
                    
                    {/* Live/Status Badge */}
                    <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-black/80 backdrop-blur-md border border-white/20 rounded-xl">
                      {tournament.status === "Aktiv" ? (
                        <>
                          <Circle className="w-2 h-2 text-red-500 fill-red-500 animate-pulse" />
                          <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Jonli Efir</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-3.5 h-3.5 text-white" />
                          <span className="text-xs font-bold text-stone-300 uppercase tracking-widest">{tournament.status}</span>
                        </>
                      )}
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 lg:right-auto lg:w-4/5">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-white" /> Rasmiy Turnir
                      </div>
                      <h3 className="text-3xl lg:text-4xl font-heading font-black text-white uppercase tracking-tight leading-tight">
                        {tournament.name}
                      </h3>
                    </div>
                  </div>

                  {/* Right: Rich Details and CTAs */}
                  <div className="relative lg:w-2/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-[#030303]/90 border-t lg:border-t-0 lg:border-l border-white/10">
                    
                    <div>
                      <p className="text-stone-300 text-xs sm:text-sm font-normal leading-relaxed mb-8">
                        {tournament.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                        <div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1 flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-stone-400" /> Manzil
                          </div>
                          <div className="text-sm text-white font-bold">{tournament.location || "Toshkent"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1 text-stone-400" /> Boshlanish Sanasi
                          </div>
                          <div className="text-sm text-white font-bold">{tournament.start_date || "Tez kunda"}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1 flex items-center">
                            <Users className="w-3 h-3 mr-1 text-stone-400" /> Ishtirokchilar
                          </div>
                          <div className="text-sm text-white font-bold">{tournament.teams_count || 16} Jamoa</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1 flex items-center">
                            <Trophy className="w-3 h-3 mr-1 text-white" /> Mukofot
                          </div>
                          <div className="text-sm text-white font-heading font-black">{tournament.prize || "Shartnoma"}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-auto pt-4 border-t border-white/10">
                      <button 
                        onClick={() => { setSelectedTournament(tournament); setShowRegModal(true); }}
                        className="flex-1 bg-white hover:bg-stone-200 text-black font-heading font-black text-xs uppercase tracking-widest py-3.5 rounded-xl transition duration-300 shadow-glow flex items-center justify-center gap-2"
                      >
                        <Users className="w-4 h-4" /> Jamoa Bilan Qatnashish
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))}
            </div>
          )}

        </div>

        {/* Registration Modal */}
        {showRegModal && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <div className="relative w-full max-w-lg rounded-3xl bg-[#030303] border border-white/20 p-6 sm:p-8 shadow-2xl">
              <button 
                onClick={() => setShowRegModal(false)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-white/10 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-heading font-black text-2xl uppercase text-white mb-1">
                Turnirga Ro'yxatdan O'tish
              </h3>
              <p className="text-stone-400 text-xs mb-6">
                {selectedTournament.name} musobaqasida ishtirok etish uchun jamoangiz anketasini yuboring.
              </p>

              {successMsg ? (
                <div className="py-8 text-center">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-3 animate-bounce" />
                  <h4 className="font-heading font-black text-xl text-white uppercase">Ariza Qabul Qilindi!</h4>
                  <p className="text-stone-400 text-xs mt-1">Tashkiliy qo'mita siz bilan 24 soat ichida bog'lanadi.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} className="flex flex-col gap-3.5 text-xs">
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Jamoa yoki Akademiya Nomi:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masalan: Paxtakor U-17"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Murabbiy / Mas'ul Shaxs:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="F.I.SH."
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 font-bold uppercase text-[10px] block mb-1">Aloqa Uchun Telefon:</label>
                    <input 
                      type="text" 
                      required
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 focus:outline-none focus:border-white"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 rounded-xl bg-white text-black font-heading font-black text-xs uppercase tracking-wider shadow-glow hover:bg-stone-200 transition"
                  >
                    {isSubmitting ? "Yuborilmoqda..." : "Arizani Yuborish"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
};

export default TournamentsPage;
