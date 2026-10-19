import { motion } from "framer-motion";
import React, { useEffect, useState } from 'react';
import { Trophy, Calendar, MapPin, Users, ArrowRight, Circle, PlayCircle, Shield, CheckCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackTournaments = [
    { id: 1, name: "Qashqadaryo BOSM Kubogi 2026", description: "Viloyatning eng kuchli bolalar va o'smirlar futbol maktablari (BOSM) o'rtasidagi yozgi musobaqa. 'Nasaf' akademiyasi skautlari kuzatuvida.", prize: "Nasaf akademiyasi ko'rigi", status: "Aktiv", image: "/images/tournaments/tournaments_1518602164578-cd0074.jpg", teams_count: 16, start_date: "15 Iyun, 2026", location: "Qarshi, Markaziy Stadion" },
    { id: 2, name: "U-16 Respublika SSOR Ligasi", description: "O'zbekiston Respublikasi miqyosidagi ixtisoslashtirilgan sport maktablari (SSOR) va xususiy akademiyalar o'rtasidagi asosiy turnir.", prize: "Professional Shartnomalar", status: "Tez kunda", image: "/images/stadiums/stadiums_1522778119026-d647f0.jpg", teams_count: 32, start_date: "10 Avgust, 2026", location: "Toshkent, Paxtakor Stadioni" },
  ];

  useEffect(() => {
    fetch(`${API_URL}/tournaments`)
      .then(res => res.json())
      .then(data => {
        setTournaments(data.length > 0 ? data : fallbackTournaments);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setTournaments(fallbackTournaments);
        setLoading(false);
      });
  }, []);

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans">
        
        {/* Cinematic Header */}
        <div className="relative h-[50vh] min-h-[450px] w-full flex items-center justify-center">
          <div className="absolute inset-0">
            <img 
              src="/images/tournaments/tournaments_1589487391730-58f20e.jpg" 
              alt="Football Tournament" 
              className="w-full h-full object-cover filter grayscale"
            />
            <div className="absolute inset-0 bg-stone-950/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="mx-auto w-16 h-16 mb-6 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-700/50 flex items-center justify-center shadow-[0_0_30px_rgba(217,119,6,0.2)]">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white uppercase mb-6 drop-shadow-2xl">
                Jang <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">Maydoni</span>
              </h1>
              <p className="text-stone-300 font-light text-lg max-w-2xl mx-auto leading-relaxed">
                Tarix aynan shu yerda, rasmiy musobaqalarda yoziladi. G'alaba qozoning, e'tibor markazida bo'ling va o'z orzuingiz sari dadil qadam tashlang.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full -mt-10 relative z-20">
          
          {loading ? (
            <div className="space-y-10">
              <div className="h-[400px] bg-stone-900 animate-pulse rounded-sm border border-stone-800"></div>
              <div className="h-[400px] bg-stone-900 animate-pulse rounded-sm border border-stone-800"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {tournaments.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center border border-stone-800 bg-stone-900/50 rounded-sm">
                  <div className="w-20 h-20 mb-4 opacity-20"><Trophy className="w-full h-full text-stone-100" /></div>
                  <h3 className="text-xl font-bold text-white mb-2 uppercase">Faol turnirlar yo'q</h3>
                  <p className="text-stone-500 font-light text-sm">Yangi mavsum tez orada boshlanadi.</p>
                </div>
              ) : (
                tournaments.map((tournament, index) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    key={tournament.id} 
                    className="group relative h-[450px] lg:h-[400px] bg-stone-900 rounded-sm overflow-hidden border border-stone-800 flex flex-col lg:flex-row cursor-pointer shadow-2xl hover:border-stone-700 hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-500"
                  >
                    {/* Left: Huge Cinematic Banner */}
                    <div className="relative h-1/2 lg:h-full lg:w-3/5 overflow-hidden">
                      <img 
                        loading="lazy"
                        src={tournament.image || "/images/tournaments/tournaments_1518602164578-cd0074.jpg"} 
                        alt={tournament.name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-stone-950 via-stone-950/50 to-transparent"></div>
                      
                      {/* Live/Status Badge */}
                      <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 bg-stone-950/80 backdrop-blur-md border border-stone-700/50 rounded-sm">
                        {tournament.status === "Aktiv" ? (
                          <>
                            <Circle className="w-2 h-2 text-red-500 fill-red-500 animate-pulse" />
                            <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Live</span>
                          </>
                        ) : (
                          <>
                            <Calendar className="w-3 h-3 text-amber-500" />
                            <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">{tournament.status}</span>
                          </>
                        )}
                      </div>
                      
                      <div className="absolute bottom-6 left-6 lg:w-4/5">
                        <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-amber-500" /> Rasmiy Turnir
                        </div>
                        <h3 className="text-3xl lg:text-4xl font-bold text-white uppercase tracking-tighter drop-shadow-lg leading-none">
                          {tournament.name}
                        </h3>
                      </div>
                    </div>

                    {/* Right: Rich Data & Details */}
                    <div className="relative h-1/2 lg:h-full lg:w-2/5 p-6 lg:p-10 flex flex-col justify-between bg-stone-950 border-t lg:border-t-0 lg:border-l border-stone-800">
                      
                      <div>
                        <p className="text-stone-400 font-light leading-relaxed mb-8 line-clamp-3 lg:line-clamp-none">
                          {tournament.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center"><MapPin className="w-3 h-3 mr-1" /> Manzil</div>
                            <div className="text-sm text-white font-medium">{tournament.location || "Toshkent"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center"><Calendar className="w-3 h-3 mr-1" /> Sana</div>
                            <div className="text-sm text-white font-medium">{tournament.start_date || "Tez kunda"}</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center"><Users className="w-3 h-3 mr-1" /> Jamoalar</div>
                            <div className="text-sm text-white font-medium">{tournament.teams_count || 16} Klub</div>
                          </div>
                          <div>
                            <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold mb-1 flex items-center"><Trophy className="w-3 h-3 mr-1 text-amber-500" /> Mukofot</div>
                            <div className="text-sm text-amber-500 font-bold">{tournament.prize || "Shon-sharaf"}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 mt-auto">
                        <button 
                          onClick={() => { setSelectedTournament(tournament); setShowRegModal(true); }}
                          className="flex-1 bg-white text-stone-950 hover:bg-amber-500 hover:text-white active:scale-95 font-bold text-xs uppercase tracking-widest py-4 rounded-sm transition-all duration-300 flex items-center justify-center gap-2">
                          <Users className="w-4 h-4" /> Jamoa bilan qatnashish
                        </button>
                        <button className="w-14 h-14 bg-stone-900 border border-stone-800 hover:border-white text-stone-400 hover:text-white active:scale-95 rounded-sm transition-all duration-300 flex items-center justify-center group-hover:bg-stone-800">
                          <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                        </button>
                      </div>
                      
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Team Registration Modal */}
        {showRegModal && selectedTournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4">
            <div className="bg-stone-900 border border-stone-800 p-8 max-w-lg w-full relative shadow-2xl rounded-sm">
              <button onClick={() => setShowRegModal(false)} className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors">✕</button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-stone-950 border border-stone-700 rounded-sm flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight">{selectedTournament.name}</h3>
                  <p className="text-[10px] text-stone-500 uppercase tracking-widest">Jamoaviy Ro'yxatdan O'tish</p>
                </div>
              </div>

              {!isSubmitting ? (
                <div className="space-y-6">
                  <div className="bg-stone-950 border border-stone-800 p-4 rounded-sm">
                    <h4 className="text-sm font-bold text-white uppercase mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-amber-500" /> Sizning Jamoangiz</h4>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-stone-300">Paxtakor U-19</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded-sm uppercase tracking-widest font-bold">4 O'yinchi</span>
                    </div>
                    <p className="text-[10px] text-stone-500">Tarkibdagi barcha o'yinchilar turnir ro'yxatiga avtomatik qo'shiladi.</p>
                  </div>
                  
                  <div className="flex items-start gap-3 bg-amber-600/10 border border-amber-600/30 p-4 rounded-sm">
                    <Calendar className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Turnir sanasi: {selectedTournament.start_date}</p>
                      <p className="text-[10px] text-amber-600 leading-relaxed">Turnir tashkilotchilari sizning arizangizni ko'rib chiqib, Jamoaviy Chatga tasdiq xabarini yuborishadi.</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setIsSubmitting(true);
                      setTimeout(() => {
                        setIsSubmitting(false);
                        setShowRegModal(false);
                        alert("Arizangiz muvaffaqiyatli yuborildi! Jamoaviy chatni kuzatib boring.");
                      }, 2000);
                    }}
                    className="w-full py-4 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] rounded-sm transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Arizani Yuborish
                  </button>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                  <div className="w-12 h-12 border-4 border-stone-800 border-t-amber-500 rounded-full animate-spin"></div>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Ariza yuborilmoqda...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

export default TournamentsPage;
