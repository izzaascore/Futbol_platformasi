import { motion } from "framer-motion";
import React from 'react';
import { TrendingUp, TrendingDown, Minus, Medal, Star, Shield } from 'lucide-react';
import PageTransition from '../components/PageTransition';

const RankingsPage = () => {
  const [activeTab, setActiveTab] = React.useState('players');

  const topPlayers = [
    { id: 1, name: 'Sardorbek Karimov', region: 'Farg\'ona', goals: 24, assists: 12, matches: 30, trophies: 3, position: 'FW', form: 'up', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
    { id: 2, name: 'Jasur Abdullayev', region: 'Toshkent', goals: 18, assists: 21, matches: 32, trophies: 2, position: 'MF', form: 'up', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&auto=format&fit=crop' },
    { id: 3, name: 'Doston Tursunov', region: 'Samarqand', goals: 5, assists: 8, matches: 28, trophies: 4, position: 'DF', form: 'down', image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=200&auto=format&fit=crop' },
    { id: 4, name: 'Bobur Yuldashev', region: 'Namangan', goals: 21, assists: 5, matches: 25, trophies: 1, position: 'FW', form: 'same', image: 'https://images.unsplash.com/photo-1614632537190-23e414c77c0c?q=80&w=200&auto=format&fit=crop' },
  ];

  const topAcademies = [
    { id: 1, name: '"Nasaf" Akademiyasi', location: 'Qashqadaryo', rating: 4.8, reviews: 154, trend: 'up' },
    { id: 2, name: '"Paxtakor" Akademiyasi', location: 'Toshkent', rating: 4.7, reviews: 210, trend: 'same' },
    { id: 3, name: '"Bunyodkor" Akademiyasi', location: 'Toshkent', rating: 4.5, reviews: 189, trend: 'up' },
    { id: 4, name: '"Mash\'al" Akademiyasi', location: 'Muborak', rating: 4.2, reviews: 98, trend: 'down' }
  ];

  const topReferees = [
    { id: 1, name: 'Rustam Lutfullin', matches: 45, rating: 4.9, reviews: 120, trend: 'up' },
    { id: 2, name: 'Ilgiz Tantashev', matches: 58, rating: 4.7, reviews: 145, trend: 'same' },
    { id: 3, name: 'Ahrol Risqullayev', matches: 32, rating: 4.5, reviews: 89, trend: 'up' },
    { id: 4, name: 'Firdavs Norsafarov', matches: 28, rating: 4.1, reviews: 67, trend: 'down' }
  ];

  return (
    <PageTransition>
      <div className="w-full bg-stone-950 min-h-screen font-sans">
        
        {/* Header */}
        <div className="relative pt-24 pb-12 w-full flex items-center justify-center border-b border-stone-800">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-stone-950 mix-blend-multiply"></div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-stone-950 to-stone-950"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 block mb-3 flex items-center gap-2">
                  <Medal className="w-4 h-4" /> Official Leaderboard
                </span>
                <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white uppercase drop-shadow-lg">Global <br/>Reyting</h2>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="flex gap-2">
                <button className="px-6 py-3 rounded-sm bg-amber-600 text-white text-xs uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(217,119,6,0.3)]">Oyning eng yaxshilari</button>
                <button className="px-6 py-3 rounded-sm border border-stone-700 text-stone-400 hover:text-white hover:border-stone-500 text-xs uppercase tracking-widest font-bold transition-colors">Yillik reyting</button>
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div className="w-full bg-stone-900 border-b border-stone-800 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
            {[
              { id: 'players', label: 'O\'yinchilar Reytingi' },
              { id: 'academies', label: 'Akademiyalar' },
              { id: 'referees', label: 'Hakamlar' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 font-bold text-xs uppercase tracking-widest transition-colors relative ${activeTab === tab.id ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings Table */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full overflow-x-auto"
          >
            <table className="w-full text-left border-collapse min-w-[800px]">
              {activeTab === 'players' && (
                <>
                <thead>
                    <tr className="border-b border-stone-800 text-stone-500">
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center w-20">O'rin</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest">O'yinchi</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Gollar</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Assistlar</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">O'yinlar</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Sovrinlar</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Forma</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                    {topPlayers.map((player, index) => (
                        <tr key={player.id} className="group hover:bg-stone-900/50 transition-colors cursor-pointer">
                            
                            {/* Rank */}
                            <td className="py-4 px-4 text-center">
                                {index === 0 ? <div className="mx-auto w-10 h-10 rounded-sm bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold shadow-[0_0_15px_rgba(217,119,6,0.5)]">1</div> : 
                                 index === 1 ? <div className="mx-auto w-10 h-10 rounded-sm bg-gradient-to-br from-stone-300 to-stone-500 flex items-center justify-center text-white font-bold shadow-lg">2</div> : 
                                 index === 2 ? <div className="mx-auto w-10 h-10 rounded-sm bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-white font-bold shadow-lg">3</div> : 
                                 <div className="mx-auto w-10 h-10 flex items-center justify-center text-stone-500 font-bold text-lg">{index + 1}</div>}
                            </td>
                            
                            {/* Player Info */}
                            <td className="py-4 px-4">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <img src={player.image} alt={player.name} className="w-14 h-14 rounded-full object-cover border-2 border-stone-800 group-hover:border-amber-500 transition-colors" />
                                    {index === 0 && <Medal className="w-4 h-4 text-amber-500 absolute -bottom-1 -right-1 bg-stone-950 rounded-full" />}
                                  </div>
                                  <div>
                                    <div className="font-bold text-lg text-white group-hover:text-amber-500 transition-colors">{player.name}</div>
                                    <div className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-2 mt-0.5">
                                      <span className="text-amber-500 font-bold">{player.position}</span> &bull; {player.region}
                                    </div>
                                  </div>
                                </div>
                            </td>
                            
                            <td className="py-4 px-4 text-center">
                              <span className="text-xl font-bold text-white">{player.goals}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-xl font-bold text-stone-300">{player.assists}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-xl font-bold text-stone-300">{player.matches}</span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-xl font-bold text-amber-500">{player.trophies}</span>
                            </td>

                            
                            {/* Form */}
                            <td className="py-4 px-4 text-center">
                                {player.form === 'up' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                                    <TrendingUp className="w-4 h-4" />
                                  </div>
                                ) : player.form === 'down' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                                    <TrendingDown className="w-4 h-4" />
                                  </div>
                                ) : (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 border border-stone-700">
                                    <Minus className="w-4 h-4" />
                                  </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
              </>
              )}

              {activeTab === 'academies' && (
                <>
                <thead>
                    <tr className="border-b border-stone-800 text-stone-500">
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center w-20">O'rin</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest">Akademiya Nomi</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest">Manzil</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-right">Ota-onalar Bahosi</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Trend</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                    {topAcademies.map((item, index) => (
                        <tr key={item.id} className="group hover:bg-stone-900/50 transition-colors cursor-pointer">
                            <td className="py-4 px-4 text-center">
                              <div className="mx-auto w-10 h-10 flex items-center justify-center text-stone-500 font-bold text-lg">{index + 1}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-lg text-white group-hover:text-amber-500 transition-colors">{item.name}</div>
                              <div className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">Tasdiqlangan Akademiya</div>
                            </td>
                            <td className="py-4 px-4 text-stone-400 font-bold text-sm uppercase">{item.location}</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-white flex items-center gap-1">
                                    {item.rating} <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                                </span>
                                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">{item.reviews} ta izoh</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                                {item.trend === 'up' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><TrendingUp className="w-4 h-4" /></div>
                                ) : item.trend === 'down' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20"><TrendingDown className="w-4 h-4" /></div>
                                ) : (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 border border-stone-700"><Minus className="w-4 h-4" /></div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
              </>
              )}

              {activeTab === 'referees' && (
                <>
                <thead>
                    <tr className="border-b border-stone-800 text-stone-500">
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center w-20">O'rin</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest">Hakam Ismi</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest">Boshqargan O'yinlari</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-right">Jamoalar Bahosi</th>
                        <th className="py-6 px-4 text-[10px] font-bold uppercase tracking-widest text-center">Trend</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                    {topReferees.map((item, index) => (
                        <tr key={item.id} className="group hover:bg-stone-900/50 transition-colors cursor-pointer">
                            <td className="py-4 px-4 text-center">
                              <div className="mx-auto w-10 h-10 flex items-center justify-center text-stone-500 font-bold text-lg">{index + 1}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-lg text-white group-hover:text-amber-500 transition-colors">{item.name}</div>
                              <div className="text-[10px] text-stone-500 uppercase tracking-widest flex items-center gap-1 mt-0.5">OFA Litsenziyasi</div>
                            </td>
                            <td className="py-4 px-4 text-stone-400 font-bold text-sm uppercase">{item.matches} ta o'yin</td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-white flex items-center gap-1">
                                    {item.rating} <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                                </span>
                                <span className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">{item.reviews} ta izoh</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                                {item.trend === 'up' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"><TrendingUp className="w-4 h-4" /></div>
                                ) : item.trend === 'down' ? (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20"><TrendingDown className="w-4 h-4" /></div>
                                ) : (
                                  <div className="mx-auto w-8 h-8 rounded-full bg-stone-800 flex items-center justify-center text-stone-500 border border-stone-700"><Minus className="w-4 h-4" /></div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
              </>
              )}

            </table>
          </motion.div>
          
          <div className="mt-12 text-center flex flex-col items-center justify-center border-t border-stone-800 pt-8">
              <Star className="w-6 h-6 text-stone-700 mb-4" />
              <p className="text-xs text-stone-500 font-bold uppercase tracking-widest max-w-lg">Reyting ballari qatnashilgan rasmiy turnirlar, tasdiqlangan ko'rsatkichlar va professional skautlar baholari asosida real vaqtda hisoblanadi.</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default RankingsPage;
