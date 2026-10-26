import React, { useState } from 'react';
import { MessageSquarePlus, X, Send, CheckCircle2, AlertCircle, Lightbulb, Bug, MessageCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://web-production-dc0f4.up.railway.app';

export default function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState('taklif');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 3) {
      setErrorMessage("Iltimos, fikringizni to'liqroq yozing (kamida 3 belgi).");
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: message.trim(),
          category,
          contact: contact.trim() || null,
          author_name: authorName.trim() || null,
          page_url: window.location.pathname
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || "Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }

      setStatus('success');
      setMessage('');
      setTimeout(() => {
        setStatus(null);
        setIsOpen(false);
      }, 2500);
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'taklif', label: 'Taklif', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'xato', label: 'Xatolik', icon: <Bug className="w-3.5 h-3.5" /> },
    { id: 'fikr', label: 'Fikr', icon: <MessageCircle className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Floating Action Pill */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-stone-950/90 border border-white/20 hover:border-white/50 text-white shadow-2xl backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer text-xs font-semibold tracking-wide"
        >
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <MessageSquarePlus className="w-4 h-4 text-stone-300 group-hover:text-white transition" />
          <span>Fikr bildirish</span>
        </button>
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-stone-950 border border-white/15 rounded-2xl p-6 shadow-2xl text-white">
            
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-5">
              <h3 className="text-lg font-bold font-heading tracking-tight flex items-center gap-2">
                <MessageSquarePlus className="w-5 h-5 text-white" />
                Fikr va taklifingiz
              </h3>
              <p className="text-xs text-stone-400 mt-1">
                Futuro platformasini yanada mukammal qilish uchun fikringiz biz uchun muhim.
              </p>
            </div>

            {/* Success State */}
            {status === 'success' ? (
              <div className="py-8 text-center flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                <h4 className="text-base font-semibold">Katta rahmat!</h4>
                <p className="text-xs text-stone-400 max-w-xs">
                  Fikr-mulohazangiz qabul qilindi. Tez orada ko'rib chiqamiz.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Category Pills */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-2">
                    Xabar turi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition ${
                          category === cat.id
                            ? 'bg-white text-black border-white shadow-md'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:border-white/30'
                        }`}
                      >
                        {cat.icon}
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1.5">
                    Xabaringiz <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Qanday o'zgarishlar kiritishni tavsiya qilasiz yoki qanday muammoga duch keldingiz?"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-white focus:outline-none text-xs text-white placeholder-stone-500 transition resize-none"
                    required
                  />
                </div>

                {/* Contact & Name (Optional) */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                      Ismingiz (ixtiyoriy)
                    </label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Masalan: Sardor"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-white focus:outline-none text-xs text-white placeholder-stone-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                      Aloqa (TG / Tel)
                    </label>
                    <input
                      type="text"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      placeholder="@username yoki tel"
                      className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-white focus:outline-none text-xs text-white placeholder-stone-500 transition"
                    />
                  </div>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-white hover:bg-stone-200 text-black font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Fikrni yuborish</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
