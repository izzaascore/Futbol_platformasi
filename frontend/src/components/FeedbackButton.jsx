import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageSquare, X, Send, CheckCircle2, Image as ImageIcon, Trash2 } from 'lucide-react';
import { API_URL, ADMIN_PATH, ADMIN_BASE } from '../config';

const MAX_WORDS = 1000;

export default function FeedbackButton() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  const handleTextChange = (e) => {
    const val = e.target.value;
    const currentWords = val.trim() ? val.trim().split(/\s+/).filter(Boolean) : [];
    if (currentWords.length <= MAX_WORDS || val.length < text.length) {
      setText(val);
      if (error) setError('');
    } else {
      setError("Maksimal 1000 ta so'z kiritish mumkin.");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("Faqat rasm fayllari (.jpg, .png, .webp) qabul qilinadi");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("Rasm hajmi 8MB dan oshmasligi kerak");
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          setSelectedImage(file);
          setPreviewUrl(URL.createObjectURL(file));
          setError('');
          break;
        }
      }
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

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
    setTimeout(() => {
      setDone(false);
      setError('');
      removeImage();
    }, 200);
  };

  const submit = async (e) => {
    e.preventDefault();
    let value = text.trim();
    if (value.length < 3 || wordCount < 1 || sending) return;
    if (wordCount > MAX_WORDS) {
      setError("Fikr ko'pi bilan 1000 ta so'zdan iborat bo'lishi mumkin.");
      return;
    }
    setSending(true);
    setError('');
    try {
      // 1. Agar rasm tanlangan bo'lsa, avval rasmni yuklaymiz
      let attachedImageUrl = null;
      if (selectedImage) {
        try {
          const imgFormData = new FormData();
          imgFormData.append('file', selectedImage);
          const imgRes = await fetch(`${API_URL}/api/feedback/upload-image`, {
            method: 'POST',
            body: imgFormData
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            attachedImageUrl = imgData.url;
            value += `\n\n[📸 Ilova qilingan skrinshot/rasm]: ${attachedImageUrl}`;
          }
        } catch (imgErr) {
          console.warn("Rasm yuklashda xatolik, matnning o'zi yuborilmoqda:", imgErr);
        }
      }

      // 2. Fikrni yuborish
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
        removeImage();
        setTimeout(close, 2200);
      } else {
        const data = await res.json().catch(() => ({}));
        let msg = data.detail;
        if (Array.isArray(msg) && msg.length > 0) {
          msg = msg[0].msg || JSON.stringify(msg[0]);
        }
        if (res.status === 429) {
          setError("Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring.");
        } else if (res.status === 422) {
          setError(typeof msg === 'string' ? msg : "Matn talabga mos emas.");
        } else {
          setError(typeof msg === 'string' ? msg : "Xatolik yuz berdi. Keyinroq urinib ko'ring.");
        }
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
                  Nima yoqmadi, nima ishlamadi yoki nimani qo'shishimiz kerak? Rasm yoki skrinshot ham biriktirishingiz mumkin.
                </p>
                <textarea
                  ref={textareaRef}
                  value={text}
                  onChange={handleTextChange}
                  onPaste={handlePaste}
                  rows={5}
                  placeholder="Fikringizni shu yerga yozing (skrinshotni Ctrl+V orqali ham qo'yish mumkin)..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder-stone-500 text-sm focus:outline-none focus:border-white/40 resize-none"
                />

                {/* Image Attachment Input & Preview */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />

                {previewUrl ? (
                  <div className="mt-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/20 flex-shrink-0" />
                      <div className="truncate text-xs">
                        <span className="text-white font-medium block truncate max-w-[200px]">{selectedImage?.name || "Skrinshot"}</span>
                        <span className="text-stone-400 text-[10px]">{(selectedImage?.size ? (selectedImage.size / 1024).toFixed(0) + " KB" : "")}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-white/5 transition"
                      title="Rasmni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 transition"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rasm / Skrinshot biriktirish</span>
                    </button>
                    <span className="text-[10px] text-stone-500 hidden sm:inline">yoki Ctrl+V</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-3 mb-3 text-[11px] text-stone-500">
                  <span role="alert" className="text-red-400">{error}</span>
                  <span className={wordCount >= MAX_WORDS ? 'text-amber-400 font-bold' : ''}>
                    {wordCount} / {MAX_WORDS} so'z
                  </span>
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
