import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, CheckCircle2 } from 'lucide-react';
import { API_URL, ADMIN_PATH, ADMIN_BASE } from '../config';

const MAX_LEN = 1000;

export default function FeedbackButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);

  // Admin panelda va kirish sahifalarida ko'rsatmaymiz
  const hidden = (ADMIN_PATH && location.pathname.startsWith(ADMIN_BASE)) ||
    location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (hidden) return null;

  const close = () => {
    setOpen(false);
    setTimeout(() => { setDone(false); setError(''); }, 200);
  };

  const submit = async (e) => {
    e.preventDefault();
    const value = text.trim();
    if (value.length < 3 || sending) return;
    setSending(true);
    setError('');
    try {
      const headers = { 'Content-Type': 'application/json' };
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ text: value, page: location.pathname.slice(0, 100) }),
      });
      if (res.ok) {
        setDone(true);
        setText('');
        setTimeout(close, 2200);
      } else if (res.status === 429) {
        setError("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
      } else if (res.status === 422) {
        setError('Fikr kamida 3 ta belgidan iborat bo\'lishi kerak.');
      } else {
        setError("Xatolik yuz berdi. Keyinroq urinib ko'ring.");
      }
    } catch {
      setError("Server bilan aloqa yo'q. Internetni tekshiring.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Fikr bildirish"
        className="fixed right-4 bottom-24 md:bottom-6 z-[60] flex items-center gap-2 px-4 py-3 rounded-full bg-white text-black text-xs font-heading font-black uppercase tracking-wider shadow-lg hover:bg-stone-200 transition"
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Fikr bildirish</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={close}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Fikr bildirish"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-[#0a0a0a] border border-white/15 p-5 text-white"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-black text-sm uppercase tracking-wider">Fikringiz bizga muhim</h2>
              <button type="button" onClick={close} aria-label="Yopish" className="p-1 text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="py-6 flex flex-col items-center gap-2 text-emerald-400 text-sm font-bold">
                <CheckCircle2 className="w-8 h-8" />
                Rahmat! Fikringiz qabul qilindi.
              </div>
            ) : (
              <form onSubmit={submit}>
                <p className="text-xs text-stone-400 mb-3">
                  Nima yoqmadi, nima ishlamadi yoki nimani qo'shishimiz kerak? Qisqa yozsangiz ham bo'ladi.
                </p>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
                  rows={5}
                  maxLength={MAX_LEN}
                  placeholder="Fikringizni shu yerga yozing..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-white/40 resize-none"
                />
                <div className="flex items-center justify-between mt-1 mb-3 text-[11px] text-stone-500">
                  <span role="alert" className="text-red-400">{error}</span>
                  <span>{text.length}/{MAX_LEN}</span>
                </div>
                <button
                  type="submit"
                  disabled={sending || text.trim().length < 3}
                  className="w-full px-5 py-3 rounded-xl bg-white hover:bg-stone-200 disabled:opacity-40 disabled:cursor-not-allowed text-black font-heading font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  {sending ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
