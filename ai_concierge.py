"""
FootballRise Autonomous AI Concierge ("Mahoraga Adaptive Engine")
Arxitektura:
- Rustam: Intent Classifier & Orchestrator
- Farrux: Reglament, Qoidalar va Futbol mantig'i
- Abdulbosit: Ma'lumotlar bazasi tahlili va Xavfsizlik
- Ikrom: P2P Virtual Xona (Chat Bridge) va 24/7 Monitoring
"""

import re
import httpx
from datetime import datetime

# ==============================================================
# P2P VIRTUAL XONALAR (ANONIM CHAT BRIDGE) XOTIRASI
# ==============================================================
# user_id -> room_id
USER_ACTIVE_ROOMS = {}
# room_id -> { 'user1': int, 'user1_name': str, 'user2': int, 'user2_name': str, 'created_at': datetime }
ROOMS_STORE = {}

# ==============================================================
# 1. AGENT RUSTAM: INTENT CLASSIFIER (MAHORAGA ADAPTATION)
# ==============================================================

INTENT_TEAM_RULES = "TEAM_RULES"
INTENT_TOURNAMENT = "TOURNAMENT"
INTENT_CONNECT_PLAYER = "CONNECT_PLAYER"
INTENT_ADMIN_ALERT = "ADMIN_ALERT"
INTENT_GENERAL = "GENERAL"

def classify_intent(text: str) -> str:
    """
    Rustam agenti matnni tahlil qilib, uning toifasini aniqlaydi.
    """
    clean = text.lower().strip()

    # 1. Jamoa tarkibi, 10 kishi, 11-13 kishi, texnik mag'lubiyat
    if any(k in clean for k in ["10 kishi", "11 kishi", "12 kishi", "13 kishi", "tarkib", "jamoa nechta", "nechta odam", "jamoa qoidasi", "odam yetmasa", "odam topish"]):
        return INTENT_TEAM_RULES

    # 2. Turnirlar sanasi, o'yinlar qachon
    if any(k in clean for k in ["turnir qachon", "turnirlar", "musobaqa", "kubok", "qachon start", "qachon boshlanadi", "start oladi", "turnir bormi", "chempionat"]):
        return INTENT_TOURNAMENT

    # 3. Boshqa o'yinchi bilan ko'rishish, chat, bog'lana olmayapman
    if any(k in clean for k in ["bilan ko'rishib", "bilan gaplashmoqchi", "bilan ko'rishmoqchi", "bog'lana olmayapman", "aloqaga chiqmoqchi", "topib bering", "bilan bog'lanish", "chat qilsak", "xona och", "topolmayapman"]):
        return INTENT_CONNECT_PLAYER

    # 4. Muhim shaxsiy murojaatlar (pul, nohaqlik, homiy, shikoyat)
    if any(k in clean for k in ["shikoyat", "pul", "to'lov", "nohaqlik", "hakam sotilgan", "homiy", "sponsor", "rahbariyat", "prezident", "shaxsan", "aldashdi", "jiddiy masalasi"]):
        return INTENT_ADMIN_ALERT

    return INTENT_GENERAL


# ==============================================================
# 2. AGENT FARRUX: QOIDALAR VA FUTBOL MANTIG'I
# ==============================================================

def get_team_rules_response(text: str) -> str:
    clean = text.lower()
    is_ten_players = "10" in clean or "o'nta" in clean

    msg = (
        "⚽️ <b>FootballRise Rasmiy Musobaqa Reglamenti:</b>\n\n"
        "1. <b>Tarkib soni:</b> Rasmiy o'yinlarda jamoa qaydnomasida kamida <b>11 nafardan 13 nafargacha</b> o'yinchi bo'lishi shart (11 asosiy + 2 zaxira).\n"
    )

    if is_ten_players:
        msg += (
            "2. ⚠️ <b>10 nafar o'yinchi bo'lsa nima bo'ladi?</b>\n"
            "   • 10 kishi bilan o'yinga tushishga <b>qat'iyan ruxsat berilmaydi</b>!\n"
            "   • Siz zudlik bilan qo'shimcha o'yinchi topishingiz yoki erkin agentlarni chaqirishingiz kerak.\n"
            "   • Belgilangan vaqtda tarkib to'liq bo'lmasa, jamoaga <b>avtomatik texnik mag'lubiyat (0:3)</b> yoziladi!\n\n"
        )
    else:
        msg += (
            "2. <b>Tarkib yetishmovchiligi:</b> 11 nafardan kam bo'lgan jamoalar musobaqaga kiritilmaydi va texnik mag'lubiyat qayd etiladi.\n\n"
        )

    msg += (
        "💡 <i>Maslahat: Platformaning 'Iqtidorlar' (Mini App) bo'limiga kirib, o'z hududingizdagi erkin futbolchilarni jamoangizga taklif qilishingiz mumkin!</i>"
    )
    return msg


# ==============================================================
# 3. AGENT ABDULBOSIT: JONLI MA'LUMOTLAR VA TURNIR STATISTIKASI
# ==============================================================

async def get_tournament_status_response(api_base_url: str) -> str:
    """
    API orqali turnirlarning haqiqiy jonli holatini olib keladi.
    """
    tournaments = []
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{api_base_url}/tournaments")
            if res.status_code == 200:
                tournaments = res.json()
    except Exception:
        pass

    if not tournaments:
        return (
            "🏆 <b>Turnirlar Grafigi (Reja asosida):</b>\n\n"
            "• <b>Qashqadaryo BOSM Kubogi:</b> Hozirda pley-off bosqichi davom etmoqda!\n"
            "• <b>U-16 Respublika SSOR Ligasi:</b> Yaqin kunlarda start oladi (Toshkent, Paxtakor stadioni).\n\n"
            "📱 Barcha o'yinlar hisobi va jadvallarni botdagi <b>'⚡️ FootballRise Mini App' -> 'Live Center'</b> bo'limida jonli kuzatib borishingiz mumkin!"
        )

    msg = "🏆 <b>FootballRise Jonli Turnirlar Markazi:</b>\n\n"
    for t in tournaments[:3]:
        name = t.get("name", "Noma'lum Turnir")
        status = t.get("status", "Rejada")
        start = t.get("start_date", "Yaqinda")
        loc = t.get("location", "O'zbekiston")

        if "aktiv" in status.lower() or "davom" in status.lower():
            msg += f"🟢 <b>{name}</b> — <i>Ayni vaqtda davom etmoqda!</i>\n📍 Joy: {loc}\n\n"
        else:
            msg += f"⏳ <b>{name}</b>\n📅 Boshlanishi: {start} | 📍 {loc}\nHolat: {status}\n\n"

    msg += "👉 <i>Mini App ichidagi 'Turnirlar' bo'limida o'z jamoangiz bilan ro'yxatdan o'tishingiz mumkin!</i>"
    return msg


# ==============================================================
# 4. AGENT IKROM: O'YINCHI BILAN BOG'LANISH VA P2P VIRTUAL XONA
# ==============================================================

async def search_player_by_name(api_base_url: str, query: str):
    """
    Ism yoki familiyaga qarab o'yinchini bazadan qidirish.
    """
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{api_base_url}/players")
            if res.status_code == 200:
                players = res.json()
                clean_q = query.lower()
                for p in players:
                    full_name = p.get("full_name", "").lower()
                    if clean_q in full_name or any(part in full_name for part in clean_q.split()):
                        return p
    except Exception:
        pass
    return None


def create_virtual_room(user1_id: int, user1_name: str, user2_id: int, user2_name: str) -> str:
    """
    Ikki foydalanuvchi uchun maxfiy xona ochish.
    """
    room_id = f"room_{user1_id}_{user2_id}_{int(datetime.utcnow().timestamp())}"
    ROOMS_STORE[room_id] = {
        "user1": user1_id,
        "user1_name": user1_name,
        "user2": user2_id,
        "user2_name": user2_name,
        "created_at": datetime.utcnow()
    }
    USER_ACTIVE_ROOMS[user1_id] = room_id
    USER_ACTIVE_ROOMS[user2_id] = room_id
    return room_id


def close_virtual_room(user_id: int):
    """
    Xonani yopish.
    """
    room_id = USER_ACTIVE_ROOMS.get(user_id)
    if not room_id or room_id not in ROOMS_STORE:
        return None

    room_data = ROOMS_STORE.pop(room_id, None)
    if room_data:
        USER_ACTIVE_ROOMS.pop(room_data["user1"], None)
        USER_ACTIVE_ROOMS.pop(room_data["user2"], None)
        return room_data
    return None


def get_room_peer(user_id: int):
    """
    Xonadagi ikkinchi suhbatdoshni topish.
    """
    room_id = USER_ACTIVE_ROOMS.get(user_id)
    if not room_id or room_id not in ROOMS_STORE:
        return None, None

    room = ROOMS_STORE[room_id]
    if room["user1"] == user_id:
        return room["user2"], room["user1_name"]
    else:
        return room["user1"], room["user2_name"]
