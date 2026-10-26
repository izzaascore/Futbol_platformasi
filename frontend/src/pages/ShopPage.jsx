import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Video, Battery, Wifi, ArrowRight, ShieldCheck, 
  Zap, Share2, Check, X, Plus, Minus, Trash2, Truck, CreditCard, 
  Phone, MapPin, Sparkles, Star, ChevronRight, CheckCircle2, 
  Package, Clock, Award, Filter
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { API_URL } from '../config';

// CATEGORIES CONFIG
const CATEGORIES = [
  { id: 'all', label: '🌟 Barchasi' },
  { id: 'smart', label: '🛰 Smart AI Gadjetlar', badge: 'AI' },
  { id: 'equip', label: '⚽️ Ekipirovka & To\'plar', badge: 'Pro' },
  { id: 'kit', label: '🎽 Liboslar & Forma' },
  { id: 'boots', label: '👟 Butsalar' }
];

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart State (saved in localStorage for persistence)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('footballrise_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selected Product for Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('form'); // 'form' | 'success'
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Order Form
  const [orderForm, setOrderForm] = useState({
    customer_name: '',
    customer_phone: '+998 ',
    shipping_city: 'Toshkent',
    shipping_address: '',
    payment_method: 'click'
  });

  // Save Cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('footballrise_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // Fetch Products
  useEffect(() => {
    setLoading(true);
    fetch(`${API_URL}/api/shop/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Cart Functions
  const addToCart = (product, e) => {
    if (e) e.stopPropagation();
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((count, item) => count + item.qty, 0);
  const freeShippingThreshold = 500000;
  const isFreeShipping = cartTotal >= freeShippingThreshold || cartTotal === 0;

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Handle Order Submit
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setCheckoutLoading(true);

    const payload = {
      customer_name: orderForm.customer_name,
      customer_phone: orderForm.customer_phone,
      shipping_city: orderForm.shipping_city,
      shipping_address: orderForm.shipping_address,
      payment_method: orderForm.payment_method,
      total_price: cartTotal,
      items_json: JSON.stringify(cart.map(c => ({
        id: c.id,
        name: c.name,
        price: c.price,
        qty: c.qty,
        image_url: c.image_url
      })))
    };

    try {
      const res = await fetch(`${API_URL}/api/shop/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const orderData = await res.json();
        setConfirmedOrder(orderData);
        setCheckoutStep('success');
        clearCart();
      } else {
        alert("Buyurtmani rasmiylashtirishda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    } catch (err) {
      console.error(err);
      alert("Server bilan ulanishda xatolik!");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="w-full bg-[#030303] min-h-screen font-sans text-stone-200 relative selection:bg-amber-500/30 overflow-hidden pb-32">
        
        {/* Dynamic Global Background Gradient */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-amber-500/10 via-amber-900/5 to-transparent rounded-full blur-[140px]" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[160px]" />
        </div>

        {/* ============================================================== */}
        {/* 1. CINEMATIC HERO: SMART TECH SHOWCASE */}
        {/* ============================================================== */}
        <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 bg-gradient-to-b from-stone-900/90 to-stone-950/90 border border-white/10/80 rounded-3xl p-6 sm:p-10 lg:p-14 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            
            {/* Left Content */}
            <div className="max-w-xl z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-widest text-amber-400">
                  Futuro Official Store
                </span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white leading-[1.05] mb-5">
                Kelajak <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">
                  Futbol Texnologiyasi.
                </span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base font-light leading-relaxed mb-8">
                Oddiy do'kon emas — professional futbolchilar va akademiyalar uchun AI kameralar, GPS tahlil nimchalari, FIFA standartidagi to'plar va uglerod qalqonlar ekotizimi.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <a
                  href="#catalog"
                  className="px-7 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center gap-2 group"
                >
                  <span>Kolleksiyani Ko'rish</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>

                <div className="flex items-center gap-3 px-4 py-2 bg-[#030303]/60 border border-white/10 rounded-xl text-xs text-stone-400 font-bold">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>24 soatda O'zbekiston bo'ylab yetkazish</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Hero Product (Cam Pro 4K) */}
            <div className="w-full lg:w-1/2 relative flex justify-center items-center z-10">
              <div className="relative w-full max-w-[420px] aspect-[4/3] rounded-3xl overflow-hidden border border-amber-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.9)] group">
                <img 
                  src="/images/camera.jpg" 
                  alt="Futuro Cam Pro 4K"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent" />
                
                {/* Floating Specs Pill */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#030303]/90 border border-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase text-amber-400 backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>AI Tracking 4K 60FPS</span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">Cam Pro 4K</h3>
                    <p className="text-amber-400 font-black text-sm">3,450,000 UZS</p>
                  </div>
                  <button
                    onClick={() => {
                      const cam = products.find(p => p.name.includes("Cam")) || {
                        id: 1,
                        name: "Futuro Cam Pro 4K (AI Tracking)",
                        price: 3450000,
                        image_url: "/images/camera.jpg"
                      };
                      addToCart(cam);
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/20"
                  >
                    + Xarid Qilish
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================== */}
        {/* 2. CATEGORIES FILTER & SEARCH BAR */}
        {/* ============================================================== */}
        <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 z-10 relative">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none w-full md:w-auto">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    activeCategory === cat.id
                      ? 'bg-amber-500 text-stone-950 shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-white/[0.04]/90 text-stone-400 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-black ${
                      activeCategory === cat.id ? 'bg-black/30 text-stone-950' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Mahsulotlarni izlash..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-stone-500 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

          </div>

          {/* ============================================================== */}
          {/* 3. PRODUCT GRID (INTERACTIVE 3D TILT CARDS) */}
          {/* ============================================================== */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
                Mahsulotlar yuklanmoqda...
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 bg-white/[0.04]/40 rounded-3xl border border-white/10">
              <ShoppingBag className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <p className="text-stone-400 text-sm font-bold">Ushbu toifada hozircha mahsulot topilmadi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -6 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  onClick={() => setQuickViewProduct(product)}
                  className="bg-white/[0.04]/90 hover:bg-white/[0.04] border border-white/10/80 hover:border-amber-500/50 rounded-3xl p-4 flex flex-col justify-between transition-all shadow-xl hover:shadow-[0_15px_40px_rgba(245,158,11,0.15)] group cursor-pointer relative"
                >
                  {/* Badge */}
                  {product.badge && (
                    <div className="absolute top-6 left-6 z-10 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-amber-500/40 text-[10px] font-black uppercase tracking-wider text-amber-400 shadow-lg">
                      {product.badge}
                    </div>
                  )}

                  {/* Stock Tag */}
                  <div className="absolute top-6 right-6 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[9px] font-black uppercase text-stone-400 border border-white/10">
                    {product.stock ? `${product.stock} dona qoldi` : 'Mavjud'}
                  </div>

                  {/* Image Container */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-[#030303] flex items-center justify-center shadow-inner">
                    <img
                      src={product.image_url || "/images/camera.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Content */}
                  <div>
                    {/* Rating & Category */}
                    <div className="flex items-center justify-between text-[11px] text-stone-400 font-bold mb-1.5">
                      <span className="uppercase text-amber-500/80 tracking-wider font-mono">
                        {product.category || 'Ekipirovka'}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>4.9</span>
                      </div>
                    </div>

                    <h4 className="text-white font-black text-sm uppercase tracking-tight line-clamp-1 group-hover:text-amber-400 transition-colors mb-2">
                      {product.name}
                    </h4>

                    <p className="text-stone-400 text-xs font-light line-clamp-2 leading-relaxed mb-4">
                      {product.description}
                    </p>
                  </div>

                  {/* Footer & Buttons */}
                  <div className="pt-3 border-t border-white/10/80 flex items-center justify-between">
                    <div>
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-200">
                        {product.price.toLocaleString('uz-UZ')}
                      </span>
                      <span className="text-[10px] text-stone-500 font-bold ml-1 uppercase">UZS</span>
                    </div>

                    <button
                      onClick={(e) => addToCart(product, e)}
                      className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-1 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Savat</span>
                    </button>
                  </div>

                </motion.div>
              ))}
            </div>
          )}

        </section>

        {/* ============================================================== */}
        {/* 4. FLOATING CART ACTION BAR (STICKY BOTTOM BAR) */}
        {/* ============================================================== */}
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-xl bg-white/[0.04]/95 border border-amber-500/60 rounded-2xl p-3 sm:p-4 backdrop-blur-2xl shadow-[0_15px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(245,158,11,0.25)] flex items-center justify-between text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-stone-950 font-black relative">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full text-white text-[10px] font-black flex items-center justify-center border-2 border-stone-900">
                    {cartCount}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-white">
                    {cartCount} ta mahsulot
                  </div>
                  <div className="text-amber-400 font-black text-sm">
                    {cartTotal.toLocaleString('uz-UZ')} UZS
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Savatcha
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setIsCheckoutOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all"
                >
                  <span>Rasmiylashtirish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* 5. SLIDE-OVER SHOPPING CART DRAWER */}
        {/* ============================================================== */}
        <AnimatePresence>
          {isCartOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCartOpen(false)}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
              />

              {/* Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] bg-[#030303] border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl overflow-y-auto"
              >
                <div>
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <h3 className="text-lg font-black uppercase tracking-tight text-white">Savatchangiz</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold">
                        {cartCount}
                      </span>
                    </div>

                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Free Shipping Alert */}
                  <div className="p-3 bg-white/[0.04] border border-white/10 rounded-xl mb-6 flex items-center gap-3">
                    <Truck className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="text-xs">
                      {isFreeShipping ? (
                        <span className="text-emerald-400 font-bold">Tabriklaymiz! Siz uchun yetkazib berish BEPUL! 🎉</span>
                      ) : (
                        <span className="text-stone-300">
                          Yana <b className="text-amber-400">{(freeShippingThreshold - cartTotal).toLocaleString('uz-UZ')} UZS</b> lik xarid qiling va bepul yetkazishga ega bo'ling!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items List */}
                  {cart.length === 0 ? (
                    <div className="text-center py-20 text-stone-500">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-xs uppercase font-bold tracking-wider">Savatchangiz bo'sh</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map(item => (
                        <div
                          key={item.id}
                          className="flex items-center gap-3 bg-white/[0.04]/80 p-3 rounded-2xl border border-white/10/80"
                        >
                          <img
                            src={item.image_url || "/images/camera.jpg"}
                            alt={item.name}
                            className="w-16 h-16 rounded-xl object-cover bg-[#030303] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="text-white text-xs font-bold truncate">{item.name}</h5>
                            <p className="text-amber-400 text-xs font-black mt-0.5">
                              {item.price.toLocaleString('uz-UZ')} UZS
                            </p>

                            {/* Qty Controls */}
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateQty(item.id, -1)}
                                className="w-6 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-black text-white w-5 text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => updateQty(item.id, 1)}
                                className="w-6 h-6 rounded-md bg-stone-800 hover:bg-stone-700 text-white flex items-center justify-center text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-500 hover:text-red-400 p-1.5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Drawer Footer */}
                {cart.length > 0 && (
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center text-sm font-bold text-stone-400 mb-2">
                      <span>Yetkazib berish:</span>
                      <span className={isFreeShipping ? "text-emerald-400" : "text-white"}>
                        {isFreeShipping ? "BEPUL" : "30,000 UZS"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-base font-black text-white mb-6">
                      <span>Jami summa:</span>
                      <span className="text-xl text-amber-400 font-mono">
                        {cartTotal.toLocaleString('uz-UZ')} UZS
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsCartOpen(false);
                        setIsCheckoutOpen(true);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Xaridni Rasmiylashtirish</span>
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* 6. CHECKOUT MODAL (CLICK, PAYME, UZUM, NAQD) */}
        {/* ============================================================== */}
        <AnimatePresence>
          {isCheckoutOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="absolute top-5 right-5 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                {checkoutStep === 'form' ? (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight">Buyurtmani Tasdiqlash</h3>
                        <p className="text-xs text-stone-400">Jami to'lov: <b className="text-amber-400">{cartTotal.toLocaleString('uz-UZ')} UZS</b></p>
                      </div>
                    </div>

                    <form onSubmit={handleOrderSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                          Ism va Familiyangiz *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Masalan: Abdulbosit Erkinov"
                          value={orderForm.customer_name}
                          onChange={e => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                          className="w-full px-4 py-3 bg-[#030303] border border-white/10 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                            Telefon Raqamingiz *
                          </label>
                          <input
                            required
                            type="text"
                            placeholder="+998 90 123 45 67"
                            value={orderForm.customer_phone}
                            onChange={e => setOrderForm({ ...orderForm, customer_phone: e.target.value })}
                            className="w-full px-4 py-3 bg-[#030303] border border-white/10 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                            Shahar / Viloyat *
                          </label>
                          <select
                            value={orderForm.shipping_city}
                            onChange={e => setOrderForm({ ...orderForm, shipping_city: e.target.value })}
                            className="w-full px-3 py-3 bg-[#030303] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                          >
                            <option value="Toshkent">Toshkent shahri</option>
                            <option value="Farg'ona">Farg'ona</option>
                            <option value="Andijon">Andijon</option>
                            <option value="Namangan">Namangan</option>
                            <option value="Samarqand">Samarqand</option>
                            <option value="Buxoro">Buxoro</option>
                            <option value="Qashqadaryo">Qashqadaryo</option>
                            <option value="Xorazm">Xorazm</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-1">
                          Yetkazib berish manzili *
                        </label>
                        <input
                          required
                          type="text"
                          placeholder="Tuman, ko'cha, uy raqami yoki mo'ljal"
                          value={orderForm.shipping_address}
                          onChange={e => setOrderForm({ ...orderForm, shipping_address: e.target.value })}
                          className="w-full px-4 py-3 bg-[#030303] border border-white/10 rounded-xl text-xs text-white placeholder-stone-600 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Payment Method Selector */}
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                          To'lov Tizimini Tanlang
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'click', label: '🔵 Click Up', desc: 'Tezkor to\'lov' },
                            { id: 'payme', label: '🟢 Payme', desc: 'Karta orqali' },
                            { id: 'uzum', label: '🟣 Uzum Pay', desc: 'Muddatli / Karta' },
                            { id: 'cod', label: '💵 Qabul qilganda', desc: 'Kuryerga naqd' }
                          ].map(pay => (
                            <button
                              key={pay.id}
                              type="button"
                              onClick={() => setOrderForm({ ...orderForm, payment_method: pay.id })}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                orderForm.payment_method === pay.id
                                  ? 'border-amber-500 bg-amber-500/10 text-white'
                                  : 'border-white/10 bg-[#030303] text-stone-400 hover:border-white/20'
                              }`}
                            >
                              <div className="text-xs font-bold text-white">{pay.label}</div>
                              <div className="text-[10px] text-stone-500">{pay.desc}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={checkoutLoading}
                        className="w-full mt-6 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-center gap-2"
                      >
                        {checkoutLoading ? "Buyurtma yuborilmoqda..." : `Buyurtmani Tasdiqlash (${cartTotal.toLocaleString('uz-UZ')} UZS)`}
                      </button>
                    </form>
                  </>
                ) : (
                  // Success State (Digital Receipt)
                  <div className="text-center py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <h3 className="text-2xl font-black uppercase text-white mb-2">Buyurtma Qabul Qilindi!</h3>
                    <p className="text-xs text-stone-400 mb-6 max-w-sm mx-auto">
                      Buyurtmangiz raqami: <b className="text-amber-400">#{confirmedOrder?.id || 1042}</b>. Kuryerimiz tez orada siz bilan telefon orqali bog'lanadi.
                    </p>

                    <div className="bg-[#030303] p-4 rounded-2xl border border-white/10 text-left text-xs space-y-2 mb-6">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Qabul qiluvchi:</span>
                        <span className="font-bold text-white">{confirmedOrder?.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Yetkazish manzili:</span>
                        <span className="font-bold text-white">{confirmedOrder?.shipping_city}, {confirmedOrder?.shipping_address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">To'lov usuli:</span>
                        <span className="font-bold text-amber-400 uppercase">{confirmedOrder?.payment_method}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-sm font-black">
                        <span>Jami summa:</span>
                        <span className="text-emerald-400">{confirmedOrder?.total_price?.toLocaleString('uz-UZ')} UZS</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        setCheckoutStep('form');
                      }}
                      className="w-full py-3.5 bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Do'konga Qaytish
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ============================================================== */}
        {/* 7. PRODUCT QUICK VIEW MODAL */}
        {/* ============================================================== */}
        <AnimatePresence>
          {quickViewProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white/[0.04] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-2xl w-full text-white shadow-2xl relative overflow-hidden"
              >
                <button
                  onClick={() => setQuickViewProduct(null)}
                  className="absolute top-5 right-5 text-stone-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-[#030303] border border-white/10 shadow-inner">
                    <img 
                      src={quickViewProduct.image_url || "/images/camera.jpg"} 
                      alt={quickViewProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    {quickViewProduct.badge && (
                      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider inline-block mb-3">
                        {quickViewProduct.badge}
                      </span>
                    )}

                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">
                      {quickViewProduct.name}
                    </h3>

                    <div className="text-2xl font-black text-amber-400 mb-4 font-mono">
                      {quickViewProduct.price.toLocaleString('uz-UZ')} <span className="text-xs text-stone-400">UZS</span>
                    </div>

                    <p className="text-stone-300 text-xs leading-relaxed font-light mb-6">
                      {quickViewProduct.description}
                    </p>

                    <div className="space-y-2 border-t border-white/10 pt-4 mb-6 text-xs text-stone-400">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>12 oy rasmiy ishlab chiqaruvchi kafolati</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span>O'zbekiston bo'ylab 24 soatda tezkor yetkazib berish</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(quickViewProduct);
                        setQuickViewProduct(null);
                      }}
                      className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Savatga Qo'shish</span>
                    </button>
                  </div>
                </div>

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
