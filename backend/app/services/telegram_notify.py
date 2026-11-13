import os
import json
import logging
from datetime import datetime
from pathlib import Path
import urllib.request
import urllib.parse

logger = logging.getLogger("telegram_notify")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
LOGS_DIR = ROOT_DIR / "logs"
ADMIN_CHATS_FILE = DATA_DIR / "admin_chats.json"
BACKUP_LOG_FILE = LOGS_DIR / "feedback_backup.jsonl"


def get_bot_token() -> str:
    token = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
    if not token or token == "your_bot_token_here" or token.startswith("1234567890"):
        return "9026677560:AAGN8_bXDm5GgxQcE3AW5w4tEVN3MH1UDfU"
    return token


def register_admin_chat(chat_id: int | str):
    """Admin chat ID sini ro'yxatga olib qo'yish."""
    try:
        DATA_DIR.mkdir(exist_ok=True)
        chats = set()
        if ADMIN_CHATS_FILE.exists():
            with open(ADMIN_CHATS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    chats.update(str(c) for c in data)
        chats.add(str(chat_id))
        with open(ADMIN_CHATS_FILE, "w", encoding="utf-8") as f:
            json.dump(list(chats), f, indent=2)
    except Exception as e:
        logger.warning(f"Admin chat saqlashda ogohlantirish: {e}")


def get_target_admin_chats(bot_token: str) -> set[str]:
    """Barcha faol admin chat ID larini yig'ish."""
    target_chats = set()

    # 1. Muhit o'zgaruvchisidan (.env / Render)
    env_admin = (os.getenv("ADMIN_TELEGRAM_ID") or "").strip()
    if env_admin:
        for cid in env_admin.split(","):
            if cid.strip():
                target_chats.add(cid.strip())

    # 2. Saqlangan fayldan
    if ADMIN_CHATS_FILE.exists():
        try:
            with open(ADMIN_CHATS_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, list):
                    for cid in data:
                        target_chats.add(str(cid))
        except Exception:
            pass

    # 3. Agar hali hech kim ro'yxatdan o'tmagan bo'lsa, getUpdates orqali botga /start bosganlarni avtomatik aniqlash
    if not target_chats and bot_token:
        try:
            url = f"https://api.telegram.org/bot{bot_token}/getUpdates"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as resp:
                updates = json.loads(resp.read().decode("utf-8")).get("result", [])
                for u in updates:
                    msg = u.get("message") or u.get("my_chat_member") or {}
                    chat = msg.get("chat") or {}
                    cid = chat.get("id")
                    if cid:
                        target_chats.add(str(cid))
                        register_admin_chat(cid)
        except Exception as e:
            logger.debug(f"getUpdates tekshirishda xatolik: {e}")

    return target_chats


def notify_admin_about_feedback(text: str, page: str | None = None, user_info: str | None = None, feedback_id: int | None = None):
    """
    Foydalanuvchi saytda qoldirgan har qanday fikrni:
    1) Lokal faylga (logs/feedback_backup.jsonl) zaxira sifatida yozadi.
    2) Telegram bot orqali darhol adminga yuboradi.
    """
    # 1. Zaxira faylga yozish
    try:
        LOGS_DIR.mkdir(exist_ok=True)
        record = {
            "id": feedback_id,
            "timestamp": datetime.now().isoformat(),
            "page": page,
            "user": user_info,
            "text": text,
        }
        with open(BACKUP_LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as e:
        logger.warning(f"Zaxira faylga yozishda xatolik: {e}")

    # 2. Telegram orqali yuborish
    bot_token = get_bot_token()
    if not bot_token:
        return False

    targets = get_target_admin_chats(bot_token)
    if not targets:
        logger.info("Telegram admin chat ID hali ulanmagan. Foydalanuvchi botga /start bosishi kutilmoqda.")
        return False

    # Xabar matnini tayyorlash
    header = "⚡️ <b>YANGI FOYDALANUVCHI FIKRI KELDI!</b>\n\n"
    meta = f"🆔 <b>Fikr ID:</b> #{feedback_id or 'Yangi'}\n"
    meta += f"📍 <b>Sahifa:</b> <code>{page or '/'}</code>\n"
    if user_info:
        meta += f"👤 <b>Kimdan:</b> {user_info}\n"
    meta += f"⏰ <b>Vaqt:</b> {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}\n\n"
    
    # Telegram xabar limiti 4096 belgi
    intro = header + meta + "📝 <b>Matn:</b>\n"
    max_body_len = 3800 - len(intro)
    
    if len(text) > max_body_len:
        preview_text = text[:max_body_len] + "\n\n<i>...(matn uzunligi sababli to'liq qismi ma'lumotlar bazasida saqlandi)...</i>"
    else:
        preview_text = text

    full_message = intro + f"<i>{preview_text}</i>"

    success = False
    for chat_id in targets:
        try:
            url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
            payload = json.dumps({
                "chat_id": chat_id,
                "text": full_message,
                "parse_mode": "HTML"
            }).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=8) as r:
                if r.status == 200:
                    success = True
        except Exception:
            # Agar HTML parseda xato bo'lsa oddiy matn sifatida
            try:
                payload = json.dumps({
                    "chat_id": chat_id,
                    "text": f"YANGI FIKR KELDI!\nSahifa: {page}\nVaqt: {datetime.now()}\n\n{text[:3500]}"
                }).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                urllib.request.urlopen(req, timeout=8)
                success = True
            except Exception as e2:
                logger.warning(f"Telegram yuborishda xato ({chat_id}): {e2}")

    return success
