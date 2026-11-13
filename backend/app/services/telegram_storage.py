import os
import httpx
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
RAW_BOT_TOKEN = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or "").strip()
IS_REAL_TOKEN = bool(
    RAW_BOT_TOKEN 
    and ":" in RAW_BOT_TOKEN 
    and not RAW_BOT_TOKEN.startswith("1234567890") 
    and RAW_BOT_TOKEN != "your_bot_token_here"
)
BOT_TOKEN = RAW_BOT_TOKEN if IS_REAL_TOKEN else ""
ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID", "8692713738").strip()


async def backup_video_to_telegram(file_bytes: bytes, filename: str, caption: str = "") -> str | None:
    """
    Videoni Telegram bulutiga zaxira (backup) sifatida yuklaydi.
    Telegram qaytargan permanent 'file_id' ni qaytaradi.
    Telegram fayllarni hech qachon o'chirmaydi.
    """
    if not BOT_TOKEN or not ADMIN_TELEGRAM_ID:
        return None

    try:
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendDocument"
        async with httpx.AsyncClient(timeout=60) as client:
            files = {
                "document": (filename, file_bytes, "application/octet-stream")
            }
            data = {
                "chat_id": ADMIN_TELEGRAM_ID,
                "caption": f"💾 #BACKUP_VIDEO: {caption or filename}"
            }
            res = await client.post(url, data=data, files=files)
            if res.status_code == 200:
                result = res.json().get("result", {})
                doc = result.get("document") or result.get("video")
                if doc and "file_id" in doc:
                    file_id = doc["file_id"]
                    print(f"✅ [Telegram Cloud Storage] Video zaxiraga olindi! file_id: {file_id[:20]}...")
                    return file_id
            else:
                print(f"⚠️ [Telegram Cloud Storage] Telegramga yuklashda xatolik: {res.text}")
    except Exception as e:
        print(f"⚠️ [Telegram Cloud Storage Error]: {e}")

    return None


async def restore_video_from_telegram(file_id: str, target_path: str) -> bool:
    """
    Render diskidan o'chib ketgan videoni Telegram bulutidan qayta yuklab oladi
    va 'target_path' ga joylashtiradi (Self-Healing Storage).
    """
    if not BOT_TOKEN or not file_id:
        return False

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            # 1. getFile
            info_url = f"https://api.telegram.org/bot{BOT_TOKEN}/getFile?file_id={file_id}"
            res = await client.get(info_url)
            if res.status_code != 200:
                print(f"⚠️ [Telegram Restore] getFile xatosi: {res.text}")
                return False

            file_path_tg = res.json().get("result", {}).get("file_path")
            if not file_path_tg:
                return False

            # 2. Fayl baytlarini yuklab olish
            download_url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{file_path_tg}"
            file_res = await client.get(download_url)
            if file_res.status_code == 200:
                target_file = Path(target_path)
                target_file.parent.mkdir(parents=True, exist_ok=True)
                with open(target_file, "wb") as f:
                    f.write(file_res.content)
                print(f"🎉 [Telegram Restore] Video Render diskiga qaytarildi: {target_path}")
                return True
    except Exception as e:
        print(f"⚠️ [Telegram Restore Error]: {e}")

    return False
