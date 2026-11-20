import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Bell, CheckCircle2, Circle, RefreshCw, Send, X, CornerDownRight } from 'lucide-react';
import { API_URL } from '../../config';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };
};

const fmt = (iso) => {
  try { return new Date(iso).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' }); }
  catch { return ''; }
};

export default function FeedbackInbox() {
  const [items, setItems] = useState([]);
  const [notify, setNotify] = useState({ count: 0, items: [] });
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Telegram reply modal state
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [replyStatus, setReplyStatus] = useState('');

  // Independent fetch logic: Shop-notify failure will NOT crash Feedback inbox!
  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    // 1. Fetch Feedback
    try {
      const fbRes = await fetch(`${API_URL}/api/admin/feedback?only_open=${onlyOpen}`, { 
        headers: authHeaders() 
      });
      if (fbRes.ok) {
        const data = await fbRes.json();
        setItems(Array.isArray(data) ? data : []);
      } else {
        setError("Foydalanuvchi fikrlarini yuklab bo'lmadi.");
      }
    } catch (e) {
      setError("Foydalanuvchi fikrlarini yuklab bo'lmadi.");
    }

    // 2. Fetch Shop Notify (mustaqil, xato bersa ham sahifa qulamaydi)
    try {
      const ntRes = await fetch(`${API_URL}/api/admin/shop-notify`, { 
        headers: authHeaders() 
      });
      if (ntRes.ok) {
        const ntData = await ntRes.json();
        setNotify(ntData && typeof ntData.count === 'number' ? ntData : { count: 0, items: [] });
      }
    } catch (e) {
      console.warn("Shop-notify yuklashda xatolik:", e);
    } finally {
      setLoading(false);
    }
  }, [onlyOpen]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/feedback/${id}/toggle`, { 
        method: 'PATCH', 
        headers: authHeaders() 
      });
      if (res.ok) {
        const { is_done } = await res.json();
        setItems((prev) => {
          const next = prev.map((f) => (f.id === id ? { ...f, is_done } : f));
          return onlyOpen ? next.filter((f) => !f.is_done) : next;
        });
      }
    } catch { /* tarmoq xatosi: keyingi yuklashda yangilanadi */ }
  };

  const handleSendTelegramReply = async (e) => {
    e.preventDefault();
    if (!replyTarget || !replyText.trim()) return;
    setSendingReply(true);
    setReplyStatus('');

    try {
      const res = await fetch(`${API_URL}/api/admin/send-telegram-message`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          telegram_id: replyTarget.telegram_id,
          message: replyText.trim(),
          feedback_id: replyTarget.id
        })
      });

      if (res.ok) {
        setReplyStatus("✓ Xabar foydalanuvchining Telegram botiga yetkazildi!");
        // Mark feedback as done locally
        setItems((prev) => prev.map((f) => f.id === replyTarget.id ? { ...f, is_done: true } : f));
        setTimeout(() => {
          setReplyTarget(null);
          setReplyText('');
          setReplyStatus('');
        }, 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        setReplyStatus(err.detail || "Xatolik: Xabar yuborilmadi.");
      }
    } catch (e) {
      setReplyStatus("Server bilan ulanish xatosi.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Foydalanuvchi fikrlari & Xabarnomalar
        </h2>
        <div className="flex items-center gap-3">
          <label className="text-xs text-stone-400 flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} />
            Faqat ko'rilmaganlar
          </label>
          <button type="button" onClick={load} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Yangilash">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/50 p-3 rounded-lg">{error}</div>}

      <div className="space-y-3">
        {!loading && items.length === 0 && !error && (
          <div className="text-sm text-stone-500 py-8 text-center bg-white/[0.02] rounded-xl border border-white/5">
            Hozircha foydalanuvchilardan fikr yoki murojaatlar kelib tushmagan.
          </div>
        )}
        {items.map((f) => (
          <div key={f.id} className={`p-4 rounded-xl border ${f.is_done ? 'border-white/5 opacity-60' : 'border-white/15'} bg-white/[0.03] transition-all`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm whitespace-pre-wrap break-words flex-1 leading-relaxed text-stone-200">{f.text}</p>
              <button 
                type="button" 
                onClick={() => toggle(f.id)} 
                title={f.is_done ? 'Qayta ochish' : "Bajarildi deb belgilash"} 
                className="text-stone-400 hover:text-white flex-shrink-0"
              >
                {f.is_done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-stone-600" />}
              </button>
            </div>

            <div className="mt-3 text-[11px] text-stone-400 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
              <div className="flex flex-wrap items-center gap-x-3">
                <span className="font-mono text-stone-500">{fmt(f.created_at)}</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-stone-300 font-mono">
                  {f.source === 'telegram' ? `Telegram${f.telegram_id ? ` (ID: ${f.telegram_id})` : ''}` : `Sayt${f.page ? ` (${f.page})` : ''}`}
                </span>
                {f.user && <span className="font-bold text-amber-400">{f.user}</span>}
              </div>

              {/* Two-Way Sync Button: Foydalanuvchining Telegramiga to'g'ridan-to'g'ri javob yozish */}
              {f.telegram_id && (
                <button
                  type="button"
                  onClick={() => {
                    setReplyTarget(f);
                    setReplyText('');
                    setReplyStatus('');
                  }}
                  className="px-2.5 py-1 bg-sky-950/70 hover:bg-sky-900 border border-sky-800 text-sky-400 text-[10px] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 transition-colors"
                >
                  <CornerDownRight className="w-3.5 h-3.5" /> Telegram orqali javob yozish
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Do'kon xabarnomasi bo'limi */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-3 text-stone-300">
          <Bell className="w-4 h-4 text-amber-500" /> Do'kon Mahsulotlari Kutayotgan Xaridorlar ({notify.count})
        </h3>
        {notify.items.length === 0 ? (
          <div className="text-xs text-stone-500">Hozircha yangi tovar xabarnomasi so'rovlari yo'q.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {notify.items.map((n) => (
              <span key={n.id} className="px-3 py-1.5 rounded-lg bg-stone-900 border border-white/10 text-xs font-mono text-stone-300">
                📞 {n.phone} {n.product_id ? `(Mahsulot #${n.product_id})` : ''}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Telegram Reply Modal */}
      {replyTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-sky-500/30 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button 
              onClick={() => setReplyTarget(null)} 
              className="absolute top-4 right-4 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest mb-3">
              <Send className="w-4 h-4" /> Telegram Bot orqali javob berish
            </div>

            <div className="bg-[#030303] border border-white/10 rounded-xl p-3 mb-4 text-xs">
              <div className="text-stone-500 text-[10px] uppercase font-bold mb-1">Murojaat matni:</div>
              <p className="text-stone-300 italic">{replyTarget.text}</p>
              <div className="text-[10px] text-stone-500 mt-2 font-mono">Telegram ID: {replyTarget.telegram_id}</div>
            </div>

            <form onSubmit={handleSendTelegramReply} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-1">
                  Sizning javobingiz (Foydalanuvchiga Telegramda yetkaziladi):
                </label>
                <textarea 
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Hurmatli foydalanuvchi, siz bildirgan muammo/taklif bo'yicha..."
                  className="w-full bg-[#030303] border border-white/20 focus:border-sky-500 rounded-xl p-3 text-xs text-white placeholder-stone-600 focus:outline-none"
                  required
                />
              </div>

              {replyStatus && (
                <div className={`text-xs font-bold ${replyStatus.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {replyStatus}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setReplyTarget(null)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold uppercase rounded-lg"
                >
                  Bekor qilish
                </button>
                <button 
                  type="submit"
                  disabled={sendingReply || !replyText.trim()}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-black uppercase tracking-wider rounded-lg flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className={`w-3.5 h-3.5 ${sendingReply ? 'animate-pulse' : ''}`} />
                  {sendingReply ? "Yuborilmoqda..." : "Yuborish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
