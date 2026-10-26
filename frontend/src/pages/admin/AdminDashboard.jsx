import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ShieldAlert, Users, Video, AlertOctagon, Trophy, LogOut, CheckCircle, XCircle, Search, Activity, 
    Lock, Key, LineChart, FileText, ShieldCheck, BadgeCheck, UserX, BarChart2, Database, Wrench, 
    FileClock, MessageSquareWarning, DollarSign, MessageCircle, ShieldX, ChevronDown, ChevronRight,
    ShoppingBag, Truck, Package
} from 'lucide-react';

import { API_URL } from '../../config';

export default function AdminPage({ defaultTab }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [passkey, setPasskey] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(defaultTab || 'users');

    useEffect(() => {
        if (defaultTab) {
            setActiveTab(defaultTab);
        }
    }, [defaultTab]);

    useEffect(() => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const userStr = localStorage.getItem('talaqCurrentUser');
        let user = null;
        try { user = userStr ? JSON.parse(userStr) : null; } catch(e) {}
        if (token && (role === 'admin' || user?.role === 'admin')) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passkey })
            });
            if (res.ok) {
                const data = await res.json();
                if (data.access_token) {
                    localStorage.setItem('adminToken', data.access_token);
                    localStorage.setItem('token', data.access_token);
                    localStorage.setItem('role', 'admin');
                    if (data.user) {
                        localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
                    }
                }
                setIsAuthenticated(true);
                setError('');
            } else {
                setError('Ruxsat etilmadi: Login yoki Maxfiy kalit xato, yoxud xavfsiz manzildan kirmadingiz.');
            }
        } catch (err) {
            setError('Server bilan ulanishda xatolik.');
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            if (token) {
                await fetch(`${API_URL}/api/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }
        } catch (err) {
            console.warn("Logout notice:", err);
        } finally {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('talaqCurrentUser');
            setIsAuthenticated(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#030303] flex items-center justify-center font-mono relative overflow-hidden">
                <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                
                <div className="bg-[#0a0a0a] border border-[#1f1f1f] p-8 w-full max-w-md relative z-10 shadow-[0_0_50px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-center mb-8 gap-3 text-cyan-500">
                        <ShieldAlert className="w-8 h-8" />
                        <h1 className="text-xl font-bold tracking-widest uppercase">Master Control</h1>
                    </div>
                    
                    {error && (
                        <div className="bg-red-950/30 border border-red-500/50 text-red-500 text-xs p-3 mb-6 font-bold uppercase tracking-widest flex items-start gap-2">
                            <AlertOctagon className="w-4 h-4 shrink-0" /> {error}
                        </div>
                    )}
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-2">Admin Identity</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    className="w-full bg-[#111] border border-[#222] text-white px-10 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="Enter ID"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-2">Secret Passkey</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#333]" />
                                <input 
                                    type="password" 
                                    value={passkey}
                                    onChange={e => setPasskey(e.target.value)}
                                    className="w-full bg-[#111] border border-[#222] text-white px-10 py-3 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                    placeholder="••••••••••••"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-black uppercase tracking-widest py-3 text-xs transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                            Tizimga Kirish
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center border-t border-[#1f1f1f] pt-4">
                        <span className="text-[8px] text-[#444] uppercase tracking-widest">SECURE LOCAL ACCESS NODE • AES-256 ENCRYPTED</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#030303] text-[#eee] font-mono flex">
            {/* Sidebar */}
            <div className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col overflow-y-auto custom-scrollbar">
                <div className="p-6 border-b border-[#1f1f1f] flex items-center gap-3 sticky top-0 bg-[#0a0a0a] z-10">
                    <ShieldAlert className="w-6 h-6 text-cyan-500" />
                    <span className="font-bold text-sm tracking-widest uppercase text-white">System Core</span>
                </div>
                
                <div className="flex-1 py-4 space-y-6">
                    {/* Category: OVERVIEW */}
                    <div>
                        <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Overview</div>
                        <NavBtn icon={<LineChart />} label="Analytics Dashboard" active={activeTab==='analytics'} onClick={() => setActiveTab('analytics')} />
                        <NavBtn icon={<Users />} label="Global User Monitor" active={activeTab==='users'} onClick={() => setActiveTab('users')} />
                    </div>

                    {/* Category: MODERATION */}
                    <div>
                        <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Moderation</div>
                        <NavBtn icon={<Video />} label="Verification Queue" active={activeTab==='videos'} onClick={() => setActiveTab('videos')} />
                        <NavBtn icon={<MessageCircle />} label="Chat Moderation" active={activeTab==='chat_mod'} onClick={() => setActiveTab('chat_mod')} />
                        <NavBtn icon={<AlertOctagon />} label="Dispute Resolution" active={activeTab==='disputes'} onClick={() => setActiveTab('disputes')} />
                    </div>

                    {/* Category: CONTENT & ENTITIES */}
                    <div>
                        <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Content & Entities</div>
                        <NavBtn icon={<ShoppingBag />} label="Shop Orders Manager" active={activeTab==='shop_orders'} onClick={() => setActiveTab('shop_orders')} />
                        <NavBtn icon={<Trophy />} label="Tournament Creator" active={activeTab==='tournaments'} onClick={() => setActiveTab('tournaments')} />
                        <NavBtn icon={<FileText />} label="News & Broadcast" active={activeTab==='news'} onClick={() => setActiveTab('news')} />
                        <NavBtn icon={<ShieldCheck />} label="Pro Club Auth" active={activeTab==='clubs'} onClick={() => setActiveTab('clubs')} />
                        <NavBtn icon={<BadgeCheck />} label="Scout Accreditation" active={activeTab==='scouts'} onClick={() => setActiveTab('scouts')} />
                    </div>

                    {/* Category: SECURITY & INTEGRITY */}
                    <div>
                        <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">Security & Integrity</div>
                        <NavBtn icon={<UserX />} label="Anti-Fake & Cleanup" active={activeTab==='antifake'} onClick={() => setActiveTab('antifake')} />
                        <NavBtn icon={<BarChart2 />} label="Rating Integrity" active={activeTab==='rating_integrity'} onClick={() => setActiveTab('rating_integrity')} />
                        <NavBtn icon={<DollarSign />} label="Sponsorship Monitor" active={activeTab==='sponsorship'} onClick={() => setActiveTab('sponsorship')} />
                        <NavBtn icon={<ShieldX />} label="IP Blacklist" active={activeTab==='ip_blacklist'} onClick={() => setActiveTab('ip_blacklist')} />
                    </div>

                    {/* Category: SYSTEM */}
                    <div>
                        <div className="px-6 text-[10px] font-bold uppercase tracking-widest text-[#444] mb-2">System Operations</div>
                        <NavBtn icon={<Database />} label="Database Backup" active={activeTab==='db_backup'} onClick={() => setActiveTab('db_backup')} />
                        <NavBtn icon={<Wrench />} label="Maintenance Mode" active={activeTab==='maintenance'} onClick={() => setActiveTab('maintenance')} />
                        <NavBtn icon={<FileClock />} label="Activity Audit Log" active={activeTab==='audit_log'} onClick={() => setActiveTab('audit_log')} />
                        <NavBtn icon={<MessageSquareWarning />} label="Push Broadcast" active={activeTab==='push_broadcast'} onClick={() => setActiveTab('push_broadcast')} />
                    </div>
                </div>
                
                <div className="p-4 border-t border-[#1f1f1f] sticky bottom-0 bg-[#0a0a0a] space-y-3">
                    <button className="w-full flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-red-600 bg-red-950/30 hover:bg-red-600 hover:text-black py-3 rounded-sm transition-all border border-red-900/50 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                        <AlertOctagon className="w-4 h-4" /> Global Kill-Switch
                    </button>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500/70 hover:bg-red-950/20 py-3 rounded-sm transition-colors border border-transparent hover:border-red-900/30">
                        <LogOut className="w-4 h-4" /> Secure Session Kill
                    </button>
                </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-[#0a0a0a] border-b border-[#1f1f1f] flex items-center justify-between px-8">
                    <div className="text-xs text-[#555] font-bold uppercase tracking-widest flex items-center gap-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Secure Connection Active
                    </div>
                    <div className="text-xs text-cyan-500 font-bold uppercase tracking-widest border border-cyan-900 px-3 py-1 bg-cyan-950/30">
                        Node: localhost (127.0.0.1)
                    </div>
                </header>
                
                <main className="flex-1 overflow-auto p-8 relative">
                    <div className="absolute inset-0 grid-bg opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px), linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    
                    <div className="relative z-10 max-w-6xl mx-auto">
                        {activeTab === 'analytics' && <PlaceholderPanel title="Analytics Dashboard" desc="Platforma faolligi statistikasi va real vaqt analitikasi" icon={<LineChart className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'users' && <UsersMonitor />}
                        {activeTab === 'shop_orders' && <ShopOrdersMonitor />}
                        {activeTab === 'videos' && <ModerationQueue />}
                        {activeTab === 'chat_mod' && <PlaceholderPanel title="Chat Moderation" desc="Skautlar va futbolchilar o'rtasidagi yopiq chatlar nazorati (AI filtrlash)" icon={<MessageCircle className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'disputes' && <DisputeCenter />}
                        {activeTab === 'tournaments' && <TournamentsHub />}
                        {activeTab === 'news' && <PlaceholderPanel title="News & Announcements Manager" desc="Markaziy yangiliklar va e'lonlar boshqaruvi" icon={<FileText className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'clubs' && <PlaceholderPanel title="Pro Club Verification" desc="Klublar va Akademiyalarning arizalarini tasdiqlash" icon={<ShieldCheck className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'scouts' && <PlaceholderPanel title="Scout Accreditation" desc="Skautlar va Agentlar registratsiyasini nazorat qilish" icon={<BadgeCheck className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'antifake' && <PlaceholderPanel title="Anti-Fake & Cleanup" desc="Soxta profillar va dublikatlarni aniqlash va o'chirish" icon={<UserX className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'rating_integrity' && <PlaceholderPanel title="Rating Integrity Monitor" desc="Hakamlar va Akademiyalar reytingini kuzatish (Nakrutkaga qarshi)" icon={<BarChart2 className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'sponsorship' && <PlaceholderPanel title="Sponsorship Fund Monitor" desc="Homiylar va jamg'arma mablag'larini kuzatish" icon={<DollarSign className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'ip_blacklist' && <PlaceholderPanel title="IP Blacklist Control" desc="Qora ro'yxat va xavfli IP manzillar boshqaruvi" icon={<ShieldX className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'db_backup' && <PlaceholderPanel title="Database Backup Control" desc="Ma'lumotlar bazasini AES-256 shifrlangan holda yuklab olish" icon={<Database className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'maintenance' && <PlaceholderPanel title="Maintenance Mode" desc="Texnik ishlar va saytni vaqtincha to'xtatib turish rejimi" icon={<Wrench className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'audit_log' && <PlaceholderPanel title="Activity Audit Log" desc="Xavfsizlik jurnali va barcha ma'muriy harakatlar tarixi" icon={<FileClock className="w-16 h-16 text-[#333] mb-4" />} />}
                        {activeTab === 'push_broadcast' && <PlaceholderPanel title="Push Broadcast" desc="Foydalanuvchilarga global push-bildirishnoma yuborish" icon={<MessageSquareWarning className="w-16 h-16 text-[#333] mb-4" />} />}
                    </div>
                </main>
            </div>
        </div>
    );
}

function NavBtn({ icon, label, active, onClick }) {
    return (
        <button 
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all ${active ? 'bg-cyan-950/40 text-cyan-400 border-l-2 border-cyan-500' : 'text-[#666] hover:text-[#ccc] hover:bg-[#111] border-l-2 border-transparent'}`}
        >
            <div className="[&>svg]:w-4 [&>svg]:h-4">{icon}</div>
            {label}
        </button>
    );
}

function PlaceholderPanel({ title, desc, icon }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-20">
            <div className="flex justify-center">{icon}</div>
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">{title}</h2>
            <p className="text-[#666] text-xs uppercase tracking-widest max-w-lg mx-auto">{desc}</p>
            <div className="mt-8">
                <button className="bg-[#111] text-[#444] border border-[#222] px-6 py-2 text-xs font-bold uppercase tracking-widest cursor-not-allowed">
                    Tizim ishga tushirilmoqda...
                </button>
            </div>
        </motion.div>
    );
}

function UsersMonitor() {
    const [users, setUsers] = useState([]);
    
    useEffect(() => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        fetch(`${API_URL}/api/admin/users`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setUsers([]);
            });
    }, []);
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-[#1f1f1f] pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Global User Monitor</h2>
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">Platformadagi barcha foydalanuvchilar nazorati</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" />
                    <input type="text" placeholder="ID yoki Ism orqali izlash..." className="bg-[#111] border border-[#222] text-white px-9 py-2 text-xs focus:outline-none focus:border-cyan-500 w-64" />
                </div>
            </div>
            
            <div className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111] text-[10px] font-bold text-[#666] uppercase tracking-widest border-b border-[#1f1f1f]">
                        <tr>
                            <th className="px-6 py-4">UID</th>
                            <th className="px-6 py-4">Ism Sharifi</th>
                            <th className="px-6 py-4">Viloyat</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Amallar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f1f]">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-[#111] transition-colors">
                                <td className="px-6 py-4 font-bold text-cyan-500">#{u.id.toString().padStart(4, '0')}</td>
                                <td className="px-6 py-4 font-bold text-white">{u.full_name}</td>
                                <td className="px-6 py-4 text-[#888]">{u.city}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-emerald-950/50 text-emerald-500 border border-emerald-900 text-[10px] font-bold uppercase tracking-widest">Active</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-[10px] font-bold text-[#888] uppercase tracking-widest hover:text-white transition-colors">Kuzatish</button>
                                    <button className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors">Bloklash</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

function ModerationQueue() {
    const [subs, setSubs] = useState([]);
    
    const fetchSubs = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        fetch(`${API_URL}/api/admin/submissions`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => setSubs(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setSubs([]);
            });
    };

    useEffect(() => {
        fetchSubs();
    }, []);
    
    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            await fetch(`${API_URL}/api/admin/submissions/${id}/${action}`, {
                method: 'POST',
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            fetchSubs();
        } catch (e) {
            console.error(e);
        }
    };
    
    const pendingSubs = Array.isArray(subs) ? subs.filter(s => s.status === 'pending') : [];
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-[#1f1f1f] pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-3">
                        Moderation Queue <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]">{pendingSubs.length}</span>
                    </h2>
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">Videolar va natijalarni tasdiqlash markazi</p>
                </div>
            </div>
            
            {pendingSubs.length === 0 ? (
                <div className="border border-dashed border-[#333] p-12 text-center text-[#555]">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="font-bold uppercase tracking-widest text-xs">Navbat bo'sh. Hamma tekshirilgan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {pendingSubs.map(sub => (
                        <div key={sub.id} className="bg-[#0a0a0a] border border-[#1f1f1f] p-4 flex flex-col">
                            <div className="flex items-center justify-between mb-4 border-b border-[#1f1f1f] pb-4">
                                <div>
                                    <div className="text-[10px] text-[#666] uppercase tracking-widest font-bold mb-1">UID: #{sub.player_id}</div>
                                    <div className="text-sm font-bold text-white">Yangi {sub.type === 'goal' ? 'Gol' : 'Video'} Yuklandi</div>
                                </div>
                                <div className="text-[10px] font-bold text-amber-500 border border-amber-900 bg-amber-950/30 px-2 py-1 uppercase tracking-widest animate-pulse">
                                    Kutmoqda
                                </div>
                            </div>
                            
                            <div className="aspect-video bg-[#111] border border-[#222] mb-4 flex items-center justify-center relative group">
                                <Activity className="w-8 h-8 text-[#333]" />
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a href={sub.video_url} target="_blank" rel="noreferrer" className="text-cyan-500 text-xs font-bold uppercase tracking-widest hover:underline">Videoni ko'rish</a>
                                </div>
                            </div>
                            
                            <p className="text-xs text-[#888] mb-6 flex-1">
                                {sub.description || 'Izoh yozilmagan'}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-3 mt-auto">
                                <button onClick={() => handleAction(sub.id, 'approve')} className="flex items-center justify-center gap-2 bg-emerald-950/50 hover:bg-emerald-900/80 text-emerald-500 border border-emerald-900 py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                                    <CheckCircle className="w-4 h-4" /> Tasdiqlash
                                </button>
                                <button onClick={() => handleAction(sub.id, 'reject')} className="flex items-center justify-center gap-2 bg-red-950/50 hover:bg-red-900/80 text-red-500 border border-red-900 py-3 text-xs font-bold uppercase tracking-widest transition-colors">
                                    <XCircle className="w-4 h-4" /> Rad Etish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

function DisputeCenter() {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-center py-20">
            <AlertOctagon className="w-16 h-16 text-[#333] mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Dispute Center</h2>
            <p className="text-[#666] text-xs uppercase tracking-widest">Ayni paytda shikoyat va mojarolar mavjud emas.</p>
        </motion.div>
    );
}

function TournamentsHub() {
    const [tournaments, setTournaments] = useState([]);
    const [form, setForm] = useState({ name: '', description: '', prize: '', image: '', teams_count: 16, start_date: '', location: '' });
    const [showForm, setShowForm] = useState(false);
    
    useEffect(() => {
        fetch(`${API_URL}/tournaments`)
            .then(res => res.json())
            .then(data => setTournaments(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setTournaments([]);
            });
    }, []);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/admin/tournaments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(form)
            });
            if (res.ok) {
                const data = await res.json();
                setTournaments([...tournaments, data]);
                setForm({ name: '', description: '', prize: '', image: '', teams_count: 16, start_date: '', location: '' });
                setShowForm(false);
            }
        } catch (err) {
            console.error(err);
        }
    };
    
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-[#1f1f1f] pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Tournaments Hub</h2>
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">Yangi turnir yaratish va boshqarish</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="bg-cyan-600 hover:bg-cyan-500 text-black px-6 py-2 text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {showForm ? 'Bekor Qilish' : "+ Yangi Turnir E'lon Qilish"}
                </button>
            </div>
            
            {showForm && (
                <div className="bg-[#0a0a0a] border border-cyan-900/50 p-6 mb-8 relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500"></div>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Turnir Nomi</label>
                            <input required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="Masalan: Farg'ona Yulduzlari Cup" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Tavsifi (Description)</label>
                            <input required value={form.description} onChange={e=>setForm({...form, description: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="Turnir haqida qisqacha ma'lumot..." />
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Jamoalar Soni</label>
                            <input required value={form.teams_count} onChange={e=>setForm({...form, teams_count: parseInt(e.target.value)})} type="number" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="16" />
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Sana</label>
                            <input required value={form.start_date} onChange={e=>setForm({...form, start_date: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="20-Oktyabr, 2026" />
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Sovrin (Prize)</label>
                            <input required value={form.prize} onChange={e=>setForm({...form, prize: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="Chempionlik kubogi" />
                        </div>
                        <div>
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Manzil / Stadion</label>
                            <input required value={form.location} onChange={e=>setForm({...form, location: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="Toshkent, Paxtakor Stadioni" />
                        </div>
                        <div className="col-span-2">
                            <label className="text-[10px] text-cyan-700 font-bold uppercase tracking-widest block mb-1">Rasm URL</label>
                            <input required value={form.image} onChange={e=>setForm({...form, image: e.target.value})} type="text" className="w-full bg-[#111] border border-[#222] text-white px-4 py-2 text-xs focus:outline-none focus:border-cyan-500" placeholder="https://..." />
                        </div>
                        <div className="col-span-2 mt-4">
                            <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-widest py-3 text-xs transition-colors">Yaratish va Saytga Chiqarish</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111] text-[10px] font-bold text-[#666] uppercase tracking-widest border-b border-[#1f1f1f]">
                        <tr>
                            <th className="px-6 py-4">Turnir Nomi</th>
                            <th className="px-6 py-4">Jamoalar</th>
                            <th className="px-6 py-4">Sana</th>
                            <th className="px-6 py-4">Format</th>
                            <th className="px-6 py-4 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f1f]">
                        {tournaments.map(t => (
                            <tr key={t.id} className="hover:bg-[#111] transition-colors">
                                <td className="px-6 py-4 font-bold text-white">{t.name}</td>
                                <td className="px-6 py-4 text-cyan-500">{t.teams_count} ta</td>
                                <td className="px-6 py-4 text-[#888]">{t.start_date}</td>
                                <td className="px-6 py-4 text-[#888]">{t.location}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-emerald-950/50 text-emerald-500 border border-emerald-900 text-[10px] font-bold uppercase tracking-widest">{t.status}</span>
                                </td>
                            </tr>
                        ))}
                        {tournaments.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-8 text-center text-[#555] text-xs font-bold uppercase tracking-widest">
                                    Mavjud turnirlar yo'q
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}

function ShopOrdersMonitor() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = () => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        fetch(`${API_URL}/api/shop/orders`, {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        })
            .then(res => res.json())
            .then(data => setOrders(Array.isArray(data) ? data : []))
            .catch(err => {
                console.error(err);
                setOrders([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/shop/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                loadOrders();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-end mb-8 border-b border-[#1f1f1f] pb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white uppercase tracking-tighter flex items-center gap-2">
                        <ShoppingBag className="w-6 h-6 text-amber-500" /> Do'kon Buyurtmalari Nazorati
                    </h2>
                    <p className="text-[#666] text-xs uppercase tracking-widest mt-1">
                        Saytdan Click, Payme, Uzum va naqd to'lov orqali tushgan xaridlar
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-[#111] border border-[#222] px-4 py-2 text-right">
                        <span className="text-[10px] text-[#666] uppercase tracking-widest block">Jami Tushum</span>
                        <span className="text-amber-400 font-bold text-sm font-mono">{totalRevenue.toLocaleString('uz-UZ')} UZS</span>
                    </div>
                    <div className="bg-[#111] border border-[#222] px-4 py-2 text-right">
                        <span className="text-[10px] text-[#666] uppercase tracking-widest block">Buyurtmalar</span>
                        <span className="text-cyan-400 font-bold text-sm font-mono">{orders.length} ta</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1f1f1f]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-[#111] text-[10px] font-bold text-[#666] uppercase tracking-widest border-b border-[#1f1f1f]">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Mijoz / Telefon</th>
                            <th className="px-6 py-4">Shahar & Manzil</th>
                            <th className="px-6 py-4">Mahsulotlar</th>
                            <th className="px-6 py-4">To'lov / Summa</th>
                            <th className="px-6 py-4 text-center">Status</th>
                            <th className="px-6 py-4 text-right">Holatni Boshqarish</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1f1f1f]">
                        {orders.map(o => {
                            let items = [];
                            try { items = JSON.parse(o.items_json); } catch {}
                            return (
                                <tr key={o.id} className="hover:bg-[#111] transition-colors">
                                    <td className="px-6 py-4 font-bold text-amber-500">#{o.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{o.customer_name}</div>
                                        <div className="text-xs text-[#888] font-mono">{o.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-white font-bold">{o.shipping_city}</div>
                                        <div className="text-xs text-[#777] max-w-[200px] truncate">{o.shipping_address}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {items.map((it, idx) => (
                                                <div key={idx} className="text-xs text-stone-300">
                                                    • {it.name} <span className="text-amber-400">({it.qty} dona)</span>
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-amber-400 font-bold font-mono">{o.total_price.toLocaleString('uz-UZ')} UZS</div>
                                        <span className="text-[10px] uppercase font-bold text-[#666] px-1.5 py-0.5 rounded bg-[#181818] border border-[#222]">{o.payment_method}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border rounded ${
                                            o.status === 'yetkazildi' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900' :
                                            o.status === 'yetkazilmoqda' ? 'bg-sky-950/60 text-sky-400 border-sky-900' :
                                            o.status === 'qabul_qilindi' ? 'bg-amber-950/60 text-amber-400 border-amber-900' :
                                            'bg-stone-900 text-stone-400 border-white/10'
                                        }`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-1">
                                        {o.status === 'kutilmoqda' && (
                                            <button 
                                                onClick={() => updateStatus(o.id, 'qabul_qilindi')}
                                                className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider rounded"
                                            >
                                                Qabul
                                            </button>
                                        )}
                                        {o.status === 'qabul_qilindi' && (
                                            <button 
                                                onClick={() => updateStatus(o.id, 'yetkazilmoqda')}
                                                className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-black uppercase tracking-wider rounded"
                                            >
                                                Kuryerga
                                            </button>
                                        )}
                                        {o.status === 'yetkazilmoqda' && (
                                            <button 
                                                onClick={() => updateStatus(o.id, 'yetkazildi')}
                                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded"
                                            >
                                                Yetkazildi ✓
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => updateStatus(o.id, 'bekor_qilindi')}
                                            className="px-2 py-1 text-red-500 hover:text-red-400 text-[10px] font-bold"
                                        >
                                            Bekor
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-[#555] text-xs font-bold uppercase tracking-widest">
                                    Hozircha do'konda buyurtmalar mavjud emas
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
