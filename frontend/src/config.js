// Centralized API configuration for FootballRise with Smart Host Detection
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }
  return 'https://web-production-dc0f4.up.railway.app';
};

export const API_URL = getApiUrl();
export const TELEGRAM_BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'FootballRiseBot';

// ---------------------------------------------------------------
// Admin panel manzili. Oddiy foydalanuvchi bu manzilni bilmaydi.
// Vercel -> Settings -> Environment Variables:  VITE_ADMIN_PATH = o'zingiz o'ylab topgan uzun so'z
// (masalan: k7x2p9-panel). "admin" kabi oson so'z qo'ymang.
// O'rnatilmasa PRODUCTIONDA admin panel umuman ochilmaydi (xavfsiz standart).
// Lokal ishlab chiqishda (npm run dev) standart "admin".
// ---------------------------------------------------------------
const rawAdminPath = String(import.meta.env.VITE_ADMIN_PATH || 'admin')
  .trim()
  .replace(/^\/+|\/+$/g, '');
export const ADMIN_PATH = /^[A-Za-z0-9_-]+$/.test(rawAdminPath) ? rawAdminPath : 'admin';
export const ADMIN_BASE = `/${ADMIN_PATH}`;
