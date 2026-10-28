import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Bell, CheckCircle2, Circle, RefreshCw } from 'lucide-react';
import { API_URL } from '../../config';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
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

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [fb, nt] = await Promise.all([
        fetch(`${API_URL}/api/admin/feedback?only_open=${onlyOpen}`, { headers: authHeaders() }),
        fetch(`${API_URL}/api/admin/shop-notify`, { headers: authHeaders() }),
      ]);
      if (!fb.ok || !nt.ok) throw new Error('load failed');
      setItems(await fb.json());
      setNotify(await nt.json());
    } catch {
      setError("Ma'lumotni yuklab bo'lmadi. Qayta kirib ko'ring.");
    } finally {
      setLoading(false);
    }
  }, [onlyOpen]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/feedback/${id}/toggle`, { method: 'PATCH', headers: authHeaders() });
      if (res.ok) {
        const { is_done } = await res.json();
        setItems((prev) => {
          const next = prev.map((f) => (f.id === id ? { ...f, is_done } : f));
          return onlyOpen ? next.filter((f) => !f.is_done) : next;
        });
      }
    } catch { /* tarmoq xatosi: keyingi yuklashda yangilanadi */ }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-5 h-5" /> Foydalanuvchi fikrlari
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

      {error && <div className="text-sm text-red-400">{error}</div>}

      <div className="space-y-3">
        {!loading && items.length === 0 && !error && (
          <div className="text-sm text-stone-500">Hozircha fikrlar yo'q.</div>
        )}
        {items.map((f) => (
          <div key={f.id} className={`p-4 rounded-xl border ${f.is_done ? 'border-white/5 opacity-60' : 'border-white/15'} bg-white/[0.03]`}>
            <div className="flex items-start justify-between gap-3">
              {/* React matnni avtomatik escape qiladi (XSS xavfi yo'q) */}
              <p className="text-sm whitespace-pre-wrap break-words flex-1">{f.text}</p>
              <button type="button" onClick={() => toggle(f.id)} aria-label={f.is_done ? 'Qayta ochish' : "Ko'rildi deb belgilash"} className="text-stone-400 hover:text-white">
                {f.is_done ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 text-[11px] text-stone-500 flex flex-wrap gap-x-3">
              <span>{fmt(f.created_at)}</span>
              <span>{f.source === 'telegram' ? `Telegram${f.telegram_id ? ` (${f.telegram_id})` : ''}` : `Sayt${f.page ? ` ${f.page}` : ''}`}</span>
              {f.user && <span>{f.user}</span>}
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4" /> Do'kon xabarnomasi ({notify.count})
        </h3>
        {notify.items.length === 0 ? (
          <div className="text-sm text-stone-500">Hozircha raqamlar yo'q.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {notify.items.map((n) => (
              <span key={n.id} className="px-3 py-1.5 rounded-lg bg-white/5 text-xs font-mono">{n.phone}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
