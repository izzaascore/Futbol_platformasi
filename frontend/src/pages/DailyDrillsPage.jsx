import React, { useState, useEffect } from 'react';
import { PlayCircle, CheckCircle, Flame, Dumbbell, ShieldAlert, Check, X, Skull } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

export default function DailyDrillsPage() {
    const [drills, setDrills] = useState([]);
    const [activeDrill, setActiveDrill] = useState(null);
    const [user, setUser] = useState(null);
    const [completedMessage, setCompletedMessage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('talaqCurrentUser');
        if (savedUser) setUser(JSON.parse(savedUser));
        
        fetchDrills();
    }, []);

    const fetchDrills = async () => {
        try {
            const res = await fetch(`${API_URL}/drills`);
            const data = await res.json();
            setDrills(data);
            if (data.length > 0) setActiveDrill(data[0]);
        } catch (error) {
            console.error("Xato:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteDrill = async () => {
        if (!user) return alert("Avval tizimga kiring!");
        
        try {
            const res = await fetch(`${API_URL}/users/${user.id}/drills/complete`, { method: 'POST' });
            const data = await res.json();
            
            // Update local user state
            const updatedUser = { ...user, streak: data.streak, discipline_score: data.discipline_score };
            setUser(updatedUser);
            localStorage.setItem('talaqCurrentUser', JSON.stringify(updatedUser));
            
            setCompletedMessage(data.message);
            setTimeout(() => setCompletedMessage(null), 5000);
        } catch (error) {
            console.error("Xato:", error);
        }
    };

    if (loading) return <div className="text-center py-20 text-amber-500 font-bold uppercase">Yuklanmoqda...</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
                        FootballRise <span className="text-amber-500">Daily</span> <Dumbbell className="w-6 h-6 text-amber-500"/>
                    </h1>
                    <p className="text-stone-400 text-sm font-light">Anjomlarsiz kundalik mashg'ulotlar tizimi</p>
                </div>

                {user && (
                    <div className="flex gap-4">
                        <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-sm flex items-center gap-2">
                            <Flame className={`w-5 h-5 ${user.streak > 0 ? 'text-amber-500' : 'text-stone-600'}`} />
                            <div>
                                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Streak</span>
                                <span className="text-lg font-black text-white leading-none">{user.streak} kun</span>
                            </div>
                        </div>
                        <div className="bg-stone-900 border border-stone-800 px-4 py-2 rounded-sm flex items-center gap-2">
                            <ShieldAlert className={`w-5 h-5 ${user.discipline_score >= 80 ? 'text-emerald-500' : user.discipline_score >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                            <div>
                                <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest">Intizom</span>
                                <span className="text-lg font-black text-white leading-none">{user.discipline_score}/100</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {completedMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0 }}
                        className={`p-4 mb-6 rounded-sm border font-bold text-sm flex items-start gap-3 ${completedMessage.includes('dangasalik') || completedMessage.includes('dam olmoqchi') ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-emerald-500/10 border-emerald-500 text-emerald-500'}`}
                    >
                        {completedMessage.includes('dangasalik') || completedMessage.includes('dam olmoqchi') ? <Skull className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
                        {completedMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Drills List */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest mb-4">Bugungi Reja</h3>
                    {drills.map((drill, idx) => (
                        <div 
                            key={drill.id} 
                            onClick={() => setActiveDrill(drill)}
                            className={`p-4 rounded-sm border cursor-pointer transition-all ${activeDrill?.id === drill.id ? 'bg-amber-600/10 border-amber-500' : 'bg-stone-900 border-stone-800 hover:border-amber-500/50'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-stone-950 text-stone-400 uppercase tracking-widest">{drill.duration}</span>
                                <span className="text-stone-600 text-xs font-bold">#{idx+1}</span>
                            </div>
                            <h4 className={`font-bold ${activeDrill?.id === drill.id ? 'text-amber-500' : 'text-white'}`}>{drill.title}</h4>
                        </div>
                    ))}
                </div>

                {/* Drill Detail & Animation */}
                <div className="lg:col-span-2">
                    {activeDrill ? (
                        <div className="bg-stone-900 border border-stone-800 rounded-sm overflow-hidden">
                            {/* Animation Placeholder / Loop */}
                            <div className="w-full aspect-video bg-stone-950 flex flex-col items-center justify-center relative border-b border-stone-800 overflow-hidden group">
                                <div className="absolute inset-0 bg-stone-900/50 flex items-center justify-center z-10">
                                    <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <PlayCircle className="w-8 h-8 text-amber-500" />
                                    </div>
                                </div>
                                {/* Simulated 3D Loop Animation Background */}
                                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] animate-[pulse_4s_ease-in-out_infinite]"></div>
                                <h3 className="relative z-0 text-stone-600 font-black text-4xl uppercase tracking-tighter opacity-30 text-center px-4">
                                    3D ANIMATION LOOP<br/>{activeDrill.title}
                                </h3>
                            </div>

                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-white mb-4">{activeDrill.title}</h2>
                                <p className="text-stone-400 text-sm leading-relaxed mb-8">{activeDrill.description}</p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-sm">
                                        <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <Check className="w-4 h-4" /> To'g'ri (Do's)
                                        </h4>
                                        <p className="text-xs text-stone-300 leading-relaxed">{activeDrill.dos}</p>
                                    </div>
                                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-sm">
                                        <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <X className="w-4 h-4" /> Xato (Don'ts)
                                        </h4>
                                        <p className="text-xs text-stone-300 leading-relaxed">{activeDrill.donts}</p>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleCompleteDrill}
                                    className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs uppercase tracking-widest transition-all rounded-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(217,119,6,0.2)]"
                                >
                                    <CheckCircle className="w-5 h-5" /> Mashqni Bajarib Bo'ldim
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-stone-900 border border-stone-800 p-12 text-center rounded-sm">
                            <p className="text-stone-500">Mashqni tanlang</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
