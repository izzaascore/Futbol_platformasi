import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Sparkles, ArrowRight, ShieldCheck, 
  Package, Clock, CheckCircle2, ChevronRight, Send, Bell
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phoneNotify, setPhoneNotify] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [notifyError, setNotifyError] = useState('');
  const [notifySending, setNotifySending] = useState(false);

  // Attempt to fetch any real products from backend, otherwise empty list
  useEffect(() => {
    fetch(`${API_URL}/api/shop/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        } else {
          setProducts([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });
  }, []);

  const handleSubscribeNotify = async (e) => {
    e.preventDefault();
    if (!phoneNotify.trim() || notifySending) return;
    setNotifyError('');
    setNotifySending(true);
    try {
      const res = await fetch(`${API_URL}/api/shop/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNotify.trim() }),
      });
      if (res.ok) {
        setNotifySuccess(true);
        setTimeout(() => {
          setNotifySuccess(false);
          setPhoneNotify('');
        }, 3000);
      } else if (res.status === 422) {
        setNotifyError("Telefon raqami noto'g'ri. Masalan: +998 90 123 45 67");
      } else if (res.status === 429) {
        setNotifyError("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
      } else {
        setNotifyError("Xatolik yuz berdi. Keyinroq urinib ko'ring.");
      }
    } catch {
      setNotifyError("Server bilan aloqa yo'q. Internetni tekshiring.");
    } finally {
      setNotifySending(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-white relative selection:bg-white selection:text-black overflow-hidden pb-24">
        
        {/* Stadium Background Atmosphere */}
        <div className="absolute top-0 left-0 w-full h-[550px] bg-stadium opacity-30 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[550px] bg-grid pointer-events-none" />
        <div className="glass-glow absolute top-10 left-1/2 -translate-x-1/2 opacity-35 blur-3xl pointer-events-none w-[650px] h-[350px]"></div>

        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4 bg-white/5 px-4 py-1.5 rounded-full border border-white/20 backdrop-blur-xl">
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-stone-200 uppercase">
                FUTURO RASMIY DO'KONI
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white uppercase mb-4">
              RASMIY <span className="text-gradient">MERCH & ANJOMLAR</span>
            </h1>
            
            <p className="text-stone-300 font-normal max-w-xl text-sm leading-relaxed">
              Klublar, akademiyalar va futbolchilar uchun rasmiy sifat sertifikatiga ega anjomlar ekotizimi.
            </p>
          </motion.div>

          {/* If there are real products in the backend, render them; otherwise render the Coming Soon showcase */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-white/30 transition duration-300 flex flex-col justify-between"
                >
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-stone-900 mb-4">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-lg text-white uppercase truncate">{item.name}</h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">{item.description}</p>
                    <div className="text-lg font-heading font-black text-white mt-3">
                      {item.price?.toLocaleString('uz-UZ')} so'm
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Honest, Luxury "Coming Soon" Empty State */
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="max-w-3xl mx-auto rounded-3xl bg-white/[0.03] border border-white/15 p-8 sm:p-12 backdrop-blur-2xl shadow-card text-center relative overflow-hidden"
            >
              {/* Subtle Ambient Glow inside */}
              <div className="absolute -top-24 -left-24 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-white/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                
                {/* Icon Capsule */}
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-glow">
                  <Package className="w-8 h-8 text-white" />
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] font-heading font-black text-white uppercase tracking-wider mb-3">
                  <Clock className="w-3.5 h-3.5" />
                  Yangi Mavsum Kolleksiyasi Tayyorlanmoqda
                </div>

                <h2 className="font-heading font-black text-2xl sm:text-4xl uppercase tracking-tight text-white mb-4">
                  Hozircha Sotuvda Mahsulotlar Mavjud Emas
                </h2>

                <p className="text-stone-300 text-xs sm:text-sm max-w-lg leading-relaxed mb-8">
                  Biz platformada sun'iy va soxta mahsulotlarni ko'rsatmaymiz. Yangi mavsum uchun rasmiy Futuro liboslari, to'plari va professional anjomlari sotuvga chiqarilishi bilanoq ushbu bo'limda e'lon qilinadi.
                </p>

                {/* Notification Form */}
                <div className="w-full max-w-md p-6 rounded-2xl bg-[#030303]/80 border border-white/10 mb-8">
                  <h4 className="font-heading font-black text-xs uppercase tracking-widest text-white mb-2 flex items-center justify-center gap-2">
                    <Bell className="w-4 h-4 text-white" />
                    Do'kon Ishga Tushganda Xabar Olish
                  </h4>
                  <p className="text-[11px] text-stone-400 mb-4">
                    Telefon raqamingizni qoldiring, yangi kolleksiya chiqqanda sizga SMS yoki Telegram orqali xabar yuboramiz.
                  </p>

                  {notifySuccess ? (
                    <div className="py-3 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Rahmat! Raqamingiz ro'yxatga kiritildi.
                    </div>
                  ) : (
                    <>
                    <form onSubmit={handleSubscribeNotify} className="flex gap-2">
                      <input 
                        type="tel" 
                        required
                        value={phoneNotify}
                        onChange={(e) => setPhoneNotify(e.target.value)}
                        placeholder="+998 90 123 45 67"
                        className="flex-grow px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 text-xs focus:outline-none focus:border-white transition"
                      />
                      <button
                        type="submit"
                        disabled={notifySending}
                        className="px-5 py-2.5 rounded-xl bg-white disabled:opacity-50 hover:bg-stone-200 text-black font-heading font-black text-xs uppercase tracking-wider transition shadow-glow flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Yuborish
                      </button>
                    </form>
                    {notifyError && <p role="alert" className="mt-2 text-xs text-red-400">{notifyError}</p>}
                    </>
                  )}
                </div>

                {/* Action Buttons to navigate elsewhere */}
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <Link
                    to="/"
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/20 text-xs font-bold uppercase tracking-wider transition"
                  >
                    Bosh Sahifaga Qaytish
                  </Link>
                  <Link
                    to="/players"
                    className="px-6 py-3 rounded-xl bg-white hover:bg-stone-200 text-black text-xs font-heading font-black uppercase tracking-wider transition shadow-glow flex items-center gap-2"
                  >
                    Iqtidorlarni Ko'rish
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

              </div>
            </motion.div>
          )}

        </div>

      </div>
    </PageTransition>
  );
}
