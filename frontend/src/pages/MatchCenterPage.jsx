import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, ShieldHalf, ChevronLeft, Flag, TrendingUp, Crosshair, Users, ActivitySquare, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:8000';
const WS_URL = 'ws://localhost:8000/ws/matches';

export default function MatchCenterPage() {
    const [matches, setMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/matches`);
            const data = await res.json();
            // Sort to show live first, then scheduled, then completed
            const sorted = data.sort((a, b) => {
                if (a.status === 'live' && b.status !== 'live') return -1;
                if (a.status !== 'live' && b.status === 'live') return 1;
                return 0;
            });
            setMatches(sorted);
        } catch (error) {
            console.error("Failed to fetch matches:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectMatch = async (matchId) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/matches/${matchId}`);
            const data = await res.json();
            setSelectedMatch(data);
        } catch (error) {
            console.error("Failed to fetch match detail:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-sm bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500">
                    <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white uppercase tracking-tight">Match <span className="text-red-500">Center</span></h1>
                    <p className="text-stone-400 text-sm font-light">Real vaqt rejimida o'yinlarni kuzating</p>
                </div>
            </div>

            {loading && !selectedMatch ? (
                <div className="flex justify-center items-center py-20 text-amber-500">
                    <Activity className="w-8 h-8 animate-spin" />
                </div>
            ) : selectedMatch ? (
                <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />
            ) : (
                <MatchList matches={matches} onSelect={handleSelectMatch} />
            )}
        </div>
    );
}

function MatchList({ matches, onSelect }) {
    if (matches.length === 0) {
        return (
            <div className="bg-stone-900 border border-stone-800 p-12 text-center rounded-sm">
                <Clock className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2 uppercase">O'yinlar yo'q</h3>
                <p className="text-stone-400">Hozircha hech qanday o'yin mavjud emas.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map(match => (
                <div 
                    key={match.id} 
                    onClick={() => onSelect(match.id)}
                    className="bg-stone-900 border border-stone-800 hover:border-amber-500/50 p-6 rounded-sm cursor-pointer group transition-all relative overflow-hidden"
                >
                    {match.status === 'live' && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 animate-pulse">
                            Live
                        </div>
                    )}
                    
                    <div className="text-center mb-6 mt-2">
                        <span className="text-xs text-stone-500 font-bold uppercase tracking-widest block mb-4">
                            {match.status === 'live' ? match.current_minute : match.status}
                        </span>
                        
                        <div className="flex items-center justify-between px-4">
                            <div className="text-center w-1/3">
                                <ShieldHalf className="w-10 h-10 mx-auto text-stone-400 group-hover:text-amber-500 transition-colors mb-2" />
                                <span className="text-sm font-bold text-white truncate block">{match.home_team}</span>
                            </div>
                            
                            <div className="text-2xl font-black text-white px-4 tracking-widest">
                                {match.home_score} : {match.away_score}
                            </div>
                            
                            <div className="text-center w-1/3">
                                <ShieldHalf className="w-10 h-10 mx-auto text-stone-400 group-hover:text-amber-500 transition-colors mb-2" />
                                <span className="text-sm font-bold text-white truncate block">{match.away_team}</span>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-stone-800 pt-4 flex justify-between items-center text-xs text-stone-400 uppercase tracking-widest">
                        <span>Batafsil ko'rish</span>
                        <Activity className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function MatchDetail({ match: initialMatch, onBack }) {
    const [match, setMatch] = useState(initialMatch);
    const wsRef = useRef(null);
    const [goalAnimation, setGoalAnimation] = useState(null);

    useEffect(() => {
        // Connect to WebSocket
        const ws = new WebSocket(`${WS_URL}/${match.id}`);
        wsRef.current = ws;

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'NEW_EVENT') {
                if (data.event.event_type === 'goal') {
                    setGoalAnimation(data.event.team);
                    setTimeout(() => setGoalAnimation(null), 3000); // 3 sec animation
                }
                
                setMatch(prev => ({
                    ...prev,
                    home_score: data.match.home_score,
                    away_score: data.match.away_score,
                    events: [...prev.events, data.event].sort((a,b) => parseInt(b.minute) - parseInt(a.minute))
                }));
            } else if (data.type === 'STAT_UPDATE') {
                setMatch(prev => {
                    const newStats = [...prev.player_stats];
                    const idx = newStats.findIndex(s => s.player_id === data.stat.player_id);
                    if (idx >= 0) {
                        newStats[idx] = { ...newStats[idx], ...data.stat };
                    } else {
                        newStats.push(data.stat);
                    }
                    return { ...prev, player_stats: newStats };
                });
            }
        };

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [match.id]);

    const sortedEvents = [...(match.events || [])].sort((a,b) => parseInt(b.minute) - parseInt(a.minute));

    return (
        <div className="space-y-6">
            <button onClick={onBack} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" /> Ortga qaytish
            </button>

            {/* Scoreboard */}
            <div className="bg-stone-900 border border-stone-800 rounded-sm relative overflow-hidden">
                {/* Goal Animation Overlay */}
                <AnimatePresence>
                    {goalAnimation && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            className="absolute inset-0 z-10 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                        >
                            <h2 className="text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 uppercase tracking-tighter shadow-2xl drop-shadow-[0_0_30px_rgba(217,119,6,0.8)]">
                                GOAL!
                            </h2>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="p-8 md:p-12 relative z-0 flex flex-col items-center justify-center bg-gradient-to-b from-stone-900 to-stone-950">
                    {match.status === 'live' && (
                        <div className="absolute top-6 flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-xs">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> Live {match.current_minute}
                        </div>
                    )}
                    
                    <div className="flex w-full items-center justify-center gap-8 md:gap-16 mt-4">
                        <div className="flex flex-col items-center w-1/3">
                            <ShieldHalf className={`w-16 h-16 md:w-24 md:h-24 mb-4 ${goalAnimation === 'home' ? 'text-amber-500 animate-bounce' : 'text-stone-400'}`} />
                            <span className="text-xl md:text-3xl font-black text-white uppercase text-center">{match.home_team}</span>
                        </div>

                        <div className="flex items-center gap-4 md:gap-8">
                            <motion.span 
                                key={match.home_score}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-7xl font-black text-white"
                            >
                                {match.home_score}
                            </motion.span>
                            <span className="text-3xl md:text-5xl font-black text-stone-700">:</span>
                            <motion.span 
                                key={match.away_score}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-7xl font-black text-white"
                            >
                                {match.away_score}
                            </motion.span>
                        </div>

                        <div className="flex flex-col items-center w-1/3">
                            <ShieldHalf className={`w-16 h-16 md:w-24 md:h-24 mb-4 ${goalAnimation === 'away' ? 'text-amber-500 animate-bounce' : 'text-stone-400'}`} />
                            <span className="text-xl md:text-3xl font-black text-white uppercase text-center">{match.away_team}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Timeline */}
                <div className="lg:col-span-1 bg-stone-900 border border-stone-800 rounded-sm p-6">
                    <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-500"/> Xronologiya
                    </h3>
                    
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-700 before:to-transparent">
                        {sortedEvents.length === 0 ? (
                            <div className="text-center text-stone-500 text-xs uppercase py-4">Voqealar mavjud emas</div>
                        ) : (
                            sortedEvents.map(event => (
                                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-stone-900 bg-stone-800 text-stone-400 group-[.is-active]:text-amber-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        {event.event_type === 'goal' && <Crosshair className="w-4 h-4" />}
                                        {event.event_type === 'yellow_card' && <div className="w-3 h-4 bg-yellow-500 rounded-sm" />}
                                        {event.event_type === 'red_card' && <div className="w-3 h-4 bg-red-500 rounded-sm" />}
                                        {event.event_type === 'sub_in' && <ArrowRightLeft className="w-4 h-4" />}
                                        {event.event_type === 'chance' && <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-sm border border-stone-800 bg-stone-950 shadow-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-bold text-amber-500 text-xs">{event.minute}'</span>
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${event.team==='home'?'bg-stone-800 text-stone-300':'bg-stone-800 text-stone-300'}`}>{event.team === 'home' ? match.home_team : match.away_team}</span>
                                        </div>
                                        <p className="text-sm font-bold text-white mb-1">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                                        <p className="text-xs text-stone-400">{event.description}</p>
                                        {event.player_id && (
                                            <Link to={`/players/${event.player_id}`} className="inline-block mt-2 text-[10px] text-amber-500 hover:text-amber-400 font-bold uppercase tracking-widest transition-colors">
                                                Profilni ko'rish &rarr;
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Match Stats & Tactical Formation */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Tactical Formation Mockup */}
                    <div className="bg-stone-900 border border-stone-800 rounded-sm p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Users className="w-4 h-4 text-amber-500"/> Taktik Tuzilma
                        </h3>
                        <div className="relative w-full aspect-[16/9] md:aspect-[2/1] bg-[#1a3822] border-2 border-stone-700 rounded-sm overflow-hidden flex items-center justify-center">
                            {/* Field lines */}
                            <div className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white -translate-y-1/2"></div>
                                <div className="absolute top-1/2 left-1/2 w-24 h-24 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                <div className="absolute top-0 left-0 w-32 h-48 border-2 border-white -translate-x-1/2 -translate-y-1/2 rounded-br-full"></div>
                                <div className="absolute bottom-0 right-0 w-32 h-48 border-2 border-white translate-x-1/2 translate-y-1/2 rounded-tl-full"></div>
                            </div>
                            
                            <div className="z-10 flex w-full justify-between px-8">
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block bg-stone-900/50 px-2 py-1 rounded-sm">{match.home_team}</span>
                                    <span className="text-2xl font-black text-amber-400 drop-shadow-md">{match.home_formation}</span>
                                </div>
                                <div className="text-center space-y-1">
                                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block bg-stone-900/50 px-2 py-1 rounded-sm">{match.away_team}</span>
                                    <span className="text-2xl font-black text-amber-400 drop-shadow-md">{match.away_formation}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Team Stats */}
                    <div className="bg-stone-900 border border-stone-800 rounded-sm p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-500"/> Jamoaviy Statistika
                        </h3>
                        
                        <div className="space-y-4">
                            <StatBar label="To'pga egalik qilish" home={match.possession_home} away={match.possession_away} suffix="%" />
                            <StatBar label="Aniq zarbalar" home={match.shots_on_target_home} away={match.shots_on_target_away} />
                            <StatBar label="Burchak to'plari" home={match.corners_home} away={match.corners_away} />
                            <StatBar label="Qoidabuzarliklar" home={match.fouls_home} away={match.fouls_away} />
                        </div>
                    </div>

                    {/* Live Player Ratings */}
                    <div className="bg-stone-900 border border-stone-800 rounded-sm p-6">
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex items-center gap-2">
                            <ActivitySquare className="w-4 h-4 text-amber-500"/> Live O'yinchi Reytinglari
                        </h3>
                        {match.player_stats && match.player_stats.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-stone-400">
                                    <thead className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-950 border-b border-stone-800">
                                        <tr>
                                            <th className="px-4 py-3">O'yinchi ID</th>
                                            <th className="px-4 py-3 text-center">G / A</th>
                                            <th className="px-4 py-3 text-center">P / T / S</th>
                                            <th className="px-4 py-3 text-right">Reyting</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-800/50">
                                        {match.player_stats.sort((a,b) => b.rating - a.rating).map(stat => (
                                            <tr key={stat.id} className="hover:bg-stone-950/50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-white"># {stat.player_id}</td>
                                                <td className="px-4 py-3 text-center">{stat.goals} / {stat.assists}</td>
                                                <td className="px-4 py-3 text-center text-xs">{stat.passes} / {stat.tackles} / {stat.saves}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-sm text-xs font-bold ${stat.rating >= 8 ? 'bg-amber-500/20 text-amber-500' : stat.rating >= 6 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                                                        {stat.rating.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-xs text-stone-500 uppercase tracking-widest text-center py-4">Reyting ma'lumotlari kutilmoqda...</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatBar({ label, home, away, suffix = '' }) {
    const total = home + away || 1;
    const homePercent = (home / total) * 100;
    const awayPercent = (away / total) * 100;

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-white">
                <span>{home}{suffix}</span>
                <span className="text-stone-500 text-[10px]">{label}</span>
                <span>{away}{suffix}</span>
            </div>
            <div className="flex h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <div style={{ width: `${homePercent}%` }} className="bg-amber-500 transition-all duration-500"></div>
                <div style={{ width: `${awayPercent}%` }} className="bg-stone-500 transition-all duration-500"></div>
            </div>
        </div>
    );
}
