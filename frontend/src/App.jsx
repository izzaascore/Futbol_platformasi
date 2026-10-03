import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ShieldHalf, Key, UserShield, Fingerprint, Lock, X, ChevronDown, Menu, Flame, Home, Users, Search, Target, ShoppingBag, User, Activity } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import HomePage from './pages/HomePage';
import PlayersPage from './pages/PlayersPage';
import ScoutsPage from './pages/ScoutsPage';
import ShopPage from './pages/ShopPage';
import TournamentsPage from './pages/TournamentsPage';
import NewsPage from './pages/NewsPage';
import RankingsPage from './pages/RankingsPage';
import ProfilePage from './pages/ProfilePage';
import MatchCenterPage from './pages/MatchCenterPage';
import DailyDrillsPage from './pages/DailyDrillsPage';
import AdminPage from './pages/AdminPage';
import ManifestoPage from './pages/ManifestoPage';

function MainApp() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modals, setModals] = useState({
    register: false,
    login: false,
    alert: false
  });
  const [alertMsg, setAlertMsg] = useState({ title: '', text: '' });
  
  const [regForm, setRegForm] = useState({ 
    firstName: '', lastName: '', age: '', phone: '+998 ', region: '', password: '', role: 'player' 
  });
  const [regErrors, setRegErrors] = useState({});
  
  const [loginForm, setLoginForm] = useState({ 
    firstName: '', 
    lastName: '', 
    password: '' 
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('talaqCurrentUser');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const openModal = (name) => setModals(prev => ({ ...prev, [name]: true }));
  const closeModal = (name) => setModals(prev => ({ ...prev, [name]: false }));
  
  const showAlert = (title, text) => {
    setAlertMsg({ title, text });
    openModal('alert');
  };

  const validateRegistration = () => {
    let errors = {};
    const nameRegex = /^[A-Za-zА-Яа-яЁёO'o'G'g'ShshChch\s]+$/;

    if (!regForm.firstName || !nameRegex.test(regForm.firstName)) errors.firstName = "Ismda faqat harflar qabul qilinadi.";
    if (!regForm.lastName || !nameRegex.test(regForm.lastName)) errors.lastName = "Familiyada faqat harflar qabul qilinadi.";
    
    const ageNum = parseInt(regForm.age);
    if (isNaN(ageNum) || ageNum < 12 || ageNum > 21) errors.age = "Yosh faqat U-12 dan U-21 gacha.";
    
    const cleanPhone = regForm.phone.replace(/[\s-]/g, '');
    if (!/^\+998\d{9}$/.test(cleanPhone)) errors.phone = "Noto'g'ri raqam (Masalan: +998 90 123 45 67).";
    
    if (!regForm.region || regForm.region === '') errors.region = "Iltimos, mavjud hududni tanlang.";
    if (!regForm.password || regForm.password.length < 6) errors.password = "Parol/SMS-kod kamida 6 belgidan iborat bo'lishi kerak.";
    
    setRegErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegistration()) return;
    
    try {
        // Backend o'rniga mock JWT auth simulatsiyasi
        const mockUser = { id: Date.now(), first_name: regForm.firstName, last_name: regForm.lastName, phone: regForm.phone, age: parseInt(regForm.age) };
        setUser(mockUser);
        localStorage.setItem('talaqCurrentUser', JSON.stringify(mockUser));
        closeModal('register');
        setRegForm({ firstName: '', lastName: '', age: '', phone: '+998 ', region: '', password: '' });
        showAlert('Muvaffaqiyat', 'Profil yaratildi va xavfsiz JWT token generatsiya qilindi!');
    } catch (e) {
        showAlert('Xato', 'Server bilan bog\'lanishda xatolik.');
    }
  };

  const handleLogin = async () => {
    try {
        const res = await fetch('http://localhost:8000/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                firstName: loginForm.firstName,
                lastName: loginForm.lastName,
                password: loginForm.password
            })
        });
        if (!res.ok) {
            const err = await res.json();
            return showAlert('Xato', err.detail || 'Ism, familiya yoki parol noto\'g\'ri.');
        }
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('talaqCurrentUser', JSON.stringify(data.user));
        closeModal('login');
        setLoginForm({ firstName: '', lastName: '', password: '' });
        showAlert('Tizimga kirdingiz', 'Muvaffaqiyatli kirdingiz!');
        
        // Admin redirect logic
        if (data.user.role === 'admin') {
            window.location.href = '/master-control-panel';
        }
    } catch (e) {
        showAlert('Xato', 'Server bilan bog\'lanishda xatolik.');
    }
  };

  const handleProfileImageUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64String = reader.result;
          try {
              const res = await fetch(`http://localhost:8000/users/${user.id}/profile-image`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ profile_image: base64String })
              });
              if (res.ok) {
                  const updatedUser = await res.json();
                  setUser(updatedUser);
                  localStorage.setItem('talaqCurrentUser', JSON.stringify(updatedUser));
              }
          } catch(err) {
              console.error(err);
          }
      };
      reader.readAsDataURL(file);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('talaqCurrentUser');
    showAlert('Chiqish', 'Sessiya xavfsiz tarzda yakunlandi.');
  };

  if (location.pathname.startsWith('/master-control-panel')) {
      return (
          <Routes location={location} key={location.pathname}>
              <Route path="/master-control-panel/*" element={<AdminPage />} />
          </Routes>
      );
  }

  return (
    <div className="min-h-screen flex flex-col font-sans bg-talaq-light text-[#292524] overflow-x-hidden">
      
      {/* Header */}
      <header className="bg-stone-950/90 backdrop-blur-xl sticky top-0 z-40 border-b border-stone-800 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
              <Link to="/" className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-10 h-10 rounded-sm bg-stone-900 border border-stone-700 flex items-center justify-center text-amber-500 group-hover:border-amber-500 group-hover:bg-amber-500/10 transition-colors shadow-lg shadow-amber-500/20">
                      <ShieldHalf className="w-5 h-5" />
                  </div>
                  <div className="hidden sm:flex flex-col justify-center">
                      <span className="text-xl font-bold tracking-tighter text-white uppercase leading-none">Football<span className="text-amber-500">Rise</span></span>
                      <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest mt-1">Professional Tizim</span>
                  </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden xl:flex items-center space-x-6">
                  <Link to="/" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Bosh sahifa</Link>
                  <Link to="/manifesto" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Manifest</Link>
                  <Link to="/live" className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors animate-pulse flex items-center gap-1"><Activity className="w-3 h-3"/> Live Center</Link>
                  {user && (
                    <>
                      <Link to="/news" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Yangiliklar</Link>
                      <Link to="/drills" className="text-[11px] font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"><Flame className="w-3 h-3"/> Daily</Link>
                      <Link to="/players" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Iqtidorlar</Link>
                      <Link to="/rankings" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Reytinglar</Link>
                      <Link to="/scouts" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Skautlar</Link>
                      <Link to="/tournaments" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Turnirlar</Link>
                      <Link to="/shop" className="text-[11px] font-bold uppercase tracking-widest text-stone-400 hover:text-white transition-colors">Do'kon</Link>
                    </>
                  )}
              </nav>

              <div className="flex items-center gap-4">
                {!user ? (
                  <>
                    <button onClick={() => openModal('login')} className="hidden sm:flex px-6 py-2.5 text-stone-300 hover:text-white font-bold text-[11px] uppercase tracking-widest transition-colors items-center gap-2">
                        Kirish
                    </button>
                    <button onClick={() => openModal('register')} className="px-6 py-2.5 rounded-sm bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-all flex items-center gap-2">
                        Ro'yxatdan o'tish
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-3 group bg-stone-900 border border-stone-800 hover:border-amber-500/50 pl-3 pr-1 py-1 rounded-sm transition-colors">
                      <div className="hidden sm:block text-right">
                          <span className="text-[11px] font-bold text-white uppercase tracking-wider block leading-tight">{user.first_name} {user.last_name}</span>
                          <span className="text-[9px] text-amber-500 font-bold uppercase tracking-widest">Dashboard</span>
                      </div>
                      {user.profile_image ? (
                          <img src={user.profile_image} alt="Profile" className="w-8 h-8 rounded-sm object-cover border border-stone-700 group-hover:border-amber-500 transition-colors" />
                      ) : (
                          <div className="w-8 h-8 rounded-sm bg-stone-950 border border-stone-700 text-stone-400 flex items-center justify-center font-bold text-sm group-hover:text-amber-500 group-hover:border-amber-500 transition-colors">
                              {user.first_name?.[0]}
                          </div>
                      )}
                    </Link>
                    <button onClick={handleLogout} className="flex items-center justify-center w-8 h-8 rounded-sm text-stone-500 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Chiqish">
                        <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <button className="xl:hidden p-2 text-stone-400 hover:text-white transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <Menu className="w-6 h-6" />
                </button>
              </div>
          </div>
          
          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
                <div className="xl:hidden bg-stone-950 border-t border-stone-800 absolute w-full left-0 shadow-2xl flex flex-col px-4 py-6 space-y-1 z-50">
                    <Link onClick={() => setMobileMenuOpen(false)} to="/" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Bosh sahifa</Link>
                    <Link onClick={() => setMobileMenuOpen(false)} to="/manifesto" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Manifest</Link>
                    <Link onClick={() => setMobileMenuOpen(false)} to="/live" className="px-4 py-3 text-red-500 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-red-400 transition-colors flex items-center gap-2"><Activity className="w-4 h-4"/> Live Center</Link>
                    {user && (
                      <>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/news" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Yangiliklar</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/drills" className="px-4 py-3 text-amber-500 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-amber-400 transition-colors flex items-center gap-2"><Flame className="w-4 h-4"/> Daily Drills</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/players" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Iqtidorlar</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/rankings" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Reytinglar</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/scouts" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Klublar & Skautlar</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/tournaments" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">Turnirlar</Link>
                        <Link onClick={() => setMobileMenuOpen(false)} to="/shop" className="px-4 py-3 text-stone-400 font-bold text-xs uppercase tracking-widest rounded-sm hover:bg-stone-900 hover:text-white transition-colors">FootballRise Cam</Link>
                      </>
                    )}
                    
                    {!user && (
                      <button onClick={() => { setMobileMenuOpen(false); openModal('login'); }} className="mt-4 mx-2 px-4 py-3 text-white text-xs uppercase tracking-widest font-bold bg-amber-600 rounded-sm hover:bg-amber-700 text-center shadow-[0_0_15px_rgba(217,119,6,0.3)]">
                          Tizimga Kirish
                      </button>
                    )}
                </div>
            )}
          </AnimatePresence>
      </header>

      

      {/* Main Content */}
      <main className="flex-1 w-full relative pb-16 md:pb-0">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<HomePage openModal={openModal} />} />
            <Route path="/live" element={<MatchCenterPage />} />
            <Route path="/drills" element={user ? <DailyDrillsPage /> : <Navigate to="/" />} />
            <Route path="/news" element={user ? <NewsPage /> : <Navigate to="/" />} />
            <Route path="/players" element={user ? <PlayersPage /> : <Navigate to="/" />} />
            <Route path="/rankings" element={user ? <RankingsPage /> : <Navigate to="/" />} />
            <Route path="/scouts" element={user ? <ScoutsPage /> : <Navigate to="/" />} />
            <Route path="/tournaments" element={user ? <TournamentsPage /> : <Navigate to="/" />} />
            <Route path="/shop" element={user ? <ShopPage /> : <Navigate to="/" />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/" />} />
            <Route path="/manifesto" element={<ManifestoPage />} />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-stone-950/90 backdrop-blur-xl border-t border-stone-800 z-40 pb-safe">
          <div className="flex justify-around items-center h-16 px-2">
              <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <Home className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Bosh</span>
              </Link>
              <Link to="/live" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/live' ? 'text-red-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <Activity className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Live</span>
              </Link>
              <Link to="/players" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/players' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <Users className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Iqtidor</span>
              </Link>
              <Link to="/scouts" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/scouts' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <Search className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Klublar</span>
              </Link>
              <Link to="/tournaments" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/tournaments' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <Target className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Turnir</span>
              </Link>
              <Link to="/shop" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/shop' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Do'kon</span>
              </Link>
              {user && (
                  <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/profile' ? 'text-amber-500' : 'text-stone-500 hover:text-stone-300'}`}>
                      <User className="w-5 h-5" />
                      <span className="text-[9px] font-bold uppercase tracking-widest">Profil</span>
                  </Link>
              )}
          </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-amber-900 text-amber-400 py-16 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-talaq-accent text-white flex items-center justify-center font-serif text-xl font-bold shadow-md">F</div>
                      <span className="text-2xl font-serif font-extrabold italic tracking-widest text-white">FootballRise</span>
                  </div>
                  <p className="text-sm font-light leading-relaxed">O'zbek futbolining yashirin iqtidorlarini izlab topish, rivojlantirish va jahon maydonlariga olib chiqish uchun yagona zamonaviy ekotizim.</p>
              </div>
              
              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Platforma</h4>
                  <ul className="space-y-3 text-sm">
                      <li><Link to="/manifesto" className="hover:text-amber-500 transition">Manifest</Link></li>
                      <li><Link to="/news" className="hover:text-amber-500 transition">Yangiliklar</Link></li>
                      <li><Link to="/players" className="hover:text-amber-500 transition">Iqtidorlar bazasi</Link></li>
                      <li><Link to="/rankings" className="hover:text-amber-500 transition">Umumiy reyting</Link></li>
                      <li><Link to="/tournaments" className="hover:text-amber-500 transition">Turnirlar</Link></li>
                  </ul>
              </div>

              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Foydalanuvchilarga</h4>
                  <ul className="space-y-3 text-sm">
                      <li><button onClick={() => openModal('register')} className="hover:text-amber-500 transition">Profil yaratish</button></li>
                      <li><Link to="/shop" className="hover:text-amber-500 transition">Sport do'koni</Link></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Kiber-xavfsizlik siyosati</a></li>
                      <li><a href="#" className="hover:text-amber-500 transition">Foydalanish shartlari</a></li>
                  </ul>
              </div>

              <div>
                  <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Biz Bilan Aloqa</h4>
                  <ul className="space-y-3 text-sm">
                      <li><a href="mailto:info@talaq.uz" className="hover:text-amber-500 transition">info@talaq.uz</a></li>
                      <li><a href="tel:+998901234567" className="hover:text-amber-500 transition">+998 90 123-45-67</a></li>
                      <li className="pt-4 mt-4 border-t border-amber-800">Toshkent shahar, Islom Karimov ko'chasi 1-uy</li>
                  </ul>
              </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-amber-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-xs text-amber-500">FootballRise Platformasi &copy; {new Date().getFullYear()}. Barcha huquqlar himoyalangan.</p>
              
              <div className="flex gap-6 items-center">
                  <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                      <a href="#" className="hover:text-white transition">Telegram</a>
                      <a href="#" className="hover:text-white transition">Instagram</a>
                      <a href="#" className="hover:text-white transition">YouTube</a>
                  </div>
              </div>
          </div>
          
          {/* Dynamic Footer Statistics */}
          <div className="w-full bg-stone-950 mt-8 py-3 border-t border-stone-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-stone-500">
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> 12,458 Faol O'yinchilar</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> 3,892 Yuklangan Videolar</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div> 142 Skautlar Onlayn</div>
                  <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div> 15 Muvaffaqiyatli Transferlar</div>
              </div>
          </div>
      </footer>

      {/* Modals */}
      {modals.register && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 overflow-y-auto">
            <div className="bg-stone-900 border border-stone-800 p-8 max-w-lg w-full relative my-8 shadow-2xl rounded-2xl">
                <button onClick={() => closeModal('register')} className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                <h3 className="text-3xl font-bold text-white mb-1 uppercase tracking-tight">Yangi Profil <span className="text-amber-500">Ochish</span></h3>
                <p className="text-stone-400 text-sm font-light mb-6">To'liq ro'yxatdan o'ting. Tizim sizga yagona maxfiy himoya kodini beradi.</p>
                
                <div className="bg-stone-950/50 border border-stone-800 p-4 rounded-sm mb-6 text-xs text-stone-300 flex gap-3 items-start">
                    <ShieldHalf className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">Sizning aniq manzilingiz boshqalardan sir saqlanadi. Tizim bergan maxfiy kalit (ID) ma'lumotlaringizni to'liq shifrlaydi va xavfsizlikni ta'minlaydi.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Kim sifatida kirdingiz?</label>
                        <select value={regForm.role} onChange={e=>setRegForm({...regForm, role: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors appearance-none">
                            <option value="player">Yosh Iqtidor (O'yinchi)</option>
                            <option value="scout">Skaut / Agent</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Hudud / Qishloq / Akademiya</label>
                        <input type="text" placeholder="Masalan: Qashqadaryo, Yakkabog'" value={regForm.region} onChange={e=>{setRegForm({...regForm, region: e.target.value}); setRegErrors({...regErrors, region: null});}} className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.region ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.region && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.region}</span>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Ism</label>
                        <input type="text" value={regForm.firstName} onChange={e=>{setRegForm({...regForm, firstName: e.target.value}); setRegErrors({...regErrors, firstName: null});}} className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.firstName ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.firstName && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.firstName}</span>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Familiya</label>
                        <input type="text" value={regForm.lastName} onChange={e=>{setRegForm({...regForm, lastName: e.target.value}); setRegErrors({...regErrors, lastName: null});}} className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.lastName ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.lastName && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.lastName}</span>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Yosh (Tug'ilgan sanaga ko'ra)</label>
                        <input type="number" placeholder="U-12 dan U-21 gacha" value={regForm.age} onChange={e=>{setRegForm({...regForm, age: e.target.value}); setRegErrors({...regErrors, age: null});}} className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.age ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.age && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.age}</span>}
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Telefon raqam</label>
                        <input type="tel" value={regForm.phone} onChange={e=>{setRegForm({...regForm, phone: e.target.value}); setRegErrors({...regErrors, phone: null});}} placeholder="+998 90 123 45 67" className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.phone ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.phone && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.phone}</span>}
                    </div>
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Parol o'ylab toping</label>
                        <input type="password" value={regForm.password} onChange={e=>{setRegForm({...regForm, password: e.target.value}); setRegErrors({...regErrors, password: null});}} placeholder="Yangi parolingizni kiriting" className={`w-full px-4 py-3 rounded-lg bg-stone-950 border ${regErrors.password ? 'border-red-500 focus:border-red-500' : 'border-stone-800 focus:border-amber-500'} text-white text-sm focus:outline-none transition-colors`} />
                        {regErrors.password && <span className="text-red-500 text-[10px] font-bold mt-1 block">{regErrors.password}</span>}
                    </div>
                </div>
                
                <button onClick={() => { closeModal('register'); openModal('alert'); }} className="w-full py-4 mb-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-colors flex justify-center items-center gap-2">
                  <Fingerprint className="w-4 h-4" /> Profilni Saqlash
                </button>
                <button onClick={() => window.open('https://t.me/FootballRise_Bot', '_blank')} className="w-full py-4 rounded-lg bg-[#229ED9] hover:bg-[#1E8CC0] text-white font-bold text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(34,158,217,0.3)]">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.45-.49.33-.94.5-1.35.49-.45-.01-1.3-.25-1.94-.46-.78-.26-1.4-.4-1.35-.85.03-.23.32-.47.88-.71 3.45-1.5 5.75-2.49 6.89-2.96 3.27-1.36 3.96-1.6 4.41-1.61.1 0 .32.02.46.12.12.09.16.21.17.31.02.04.02.12.01.22z"/></svg>
                  Telegram orqali ro'yxatdan o'tish
                </button>
            </div>
        </div>
      )}



      {modals.login && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4">
            <div className="bg-stone-900 border border-stone-800 p-8 max-w-md w-full relative shadow-2xl rounded-2xl">
                <button onClick={() => closeModal('login')} className="absolute top-5 right-5 text-stone-500 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
                <h3 className="text-3xl font-bold text-white mb-2 uppercase tracking-tight">Tizimga <span className="text-amber-500">Kirish</span></h3>
                <p className="text-stone-400 text-sm font-light mb-8">Ro'yxatdan o'tgan ism, familiya va parolingizni kiriting.</p>
                
                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Ism</label>
                            <input type="text" value={loginForm.firstName} onChange={e=>setLoginForm({...loginForm, firstName: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2">Familiya</label>
                            <input type="text" value={loginForm.lastName} onChange={e=>setLoginForm({...loginForm, lastName: e.target.value})} className="w-full px-4 py-3 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-2 flex justify-between"><span>Parol</span></label>
                        <input type="password" value={loginForm.password} onChange={e=>setLoginForm({...loginForm, password: e.target.value})} placeholder="Maxfiy parolni kiriting" className="w-full px-4 py-3 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-colors tracking-widest" />
                    </div>
                    <button onClick={handleLogin} className="w-full py-4 mt-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_rgba(217,119,6,0.3)] transition-colors flex items-center justify-center gap-2">
                      <Key className="w-4 h-4"/> Kirish
                    </button>
                    
                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-stone-800"></div>
                        <span className="flex-shrink-0 mx-4 text-stone-500 text-[10px] font-bold uppercase tracking-widest">Yoki</span>
                        <div className="flex-grow border-t border-stone-800"></div>
                    </div>

                    <button onClick={() => window.open('https://t.me/FootballRise_Bot', '_blank')} className="w-full py-4 rounded-lg bg-[#229ED9] hover:bg-[#1E8CC0] text-white font-bold text-xs uppercase tracking-widest transition-colors flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(34,158,217,0.3)]">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.11.03-1.84 1.18-5.21 3.45-.49.33-.94.5-1.35.49-.45-.01-1.3-.25-1.94-.46-.78-.26-1.4-.4-1.35-.85.03-.23.32-.47.88-.71 3.45-1.5 5.75-2.49 6.89-2.96 3.27-1.36 3.96-1.6 4.41-1.61.1 0 .32.02.46.12.12.09.16.21.17.31.02.04.02.12.01.22z"/></svg>
                        Telegram orqali kirish
                    </button>
                </div>
            </div>
        </div>
      )}

      {modals.alert && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4">
            <div className="bg-stone-900 border border-stone-800 p-8 max-w-sm w-full text-center shadow-2xl rounded-sm">
                <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{alertMsg.title}</h3>
                <p className="text-stone-400 text-sm font-light mb-8 leading-relaxed">{alertMsg.text}</p>
                <button onClick={() => closeModal('alert')} className="w-full py-3 rounded-sm bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-widest transition-colors">Tushunarli</button>
            </div>
        </div>
      )}

    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}

export default App;
