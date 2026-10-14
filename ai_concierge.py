"""
FootballRise Autonomous AI Concierge ("Mahoraga Adaptive Engine")
Arxitektura:
- Rustam: Intent Classifier & Orchestrator
- Farrux: Reglament, Qoidalar va Futbol mantig'i
- Abdulbosit: Ma'lumotlar bazasi tahlili, RAG (Obsidian Sync) va Uzluksiz O'rganish (Continuous Learning)
- Ikrom: P2P Virtual Xona (Chat Bridge) va 24/7 Monitoring
"""

import os
import re
import glob
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
# HUMAN-IN-THE-LOOP (ADMIN JAVOBLARINI KUTISH VA TIZIMGA O'RGATISH)
# ==============================================================
# admin_message_id -> { 'user_id': int, 'user_name': str, 'question': str, 'created_at': datetime }
PENDING_ADMIN_QUESTIONS = {}

def register_pending_question(admin_msg_id: int, user_id: int, user_name: str, question: str):
    PENDING_ADMIN_QUESTIONS[admin_msg_id] = {
        "user_id": user_id,
        "user_name": user_name,
        "question": question,
        "created_at": datetime.utcnow()
    }

def resolve_pending_question(admin_msg_id: int):
    return PENDING_ADMIN_QUESTIONS.pop(admin_msg_id, None)


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


# ==============================================================
# 5. AGENT ABDULBOSIT: RAG (OBSIDIAN BILIMLAR BAZASI QIDIRUVI)
# ==============================================================

def search_obsidian_knowledge_base(query: str, vault_dir: str = None) -> tuple[str, str] | None:
    """
    RAG (Retrieval-Augmented Generation):
    Obsidian papkasidagi barcha .md hujjatlarni o'qib, foydalanuvchi savoliga eng mos bo'limni topadi.
    Topilsa (javob_matni, manba_fayli) qaytaradi, topilmasa None.
    """
    if vault_dir is None:
        vault_dir = os.getenv("OBSIDIAN_VAULT_PATH", "docs/obsidian_sync")

    if not os.path.isabs(vault_dir):
        # Nisbiy yo'l bo'lsa, loyiha ildiziga nisbatan tekshiramiz
        base_dir = os.path.dirname(os.path.abspath(__file__))
        vault_dir = os.path.join(base_dir, vault_dir)

    if not os.path.isdir(vault_dir):
        return None

    stopwords = {
        "va", "bilan", "uchun", "haqida", "qanday", "nima", "qanaqa", "qachon", "bormi",
        "kerak", "men", "siz", "bu", "shu", "faqat", "ham", "yoki", "esa", "qayerda",
        "kim", "qilsa", "bo'ladi", "mumkin", "iltimos", "salom", "qanaqa"
    }
    
    # Savoldagi kalit so'zlarni ajratib olish
    words = [re.sub(r'[^\w]', '', w.lower()) for w in query.split()]
    keywords = [w for w in words if len(w) >= 3 and w not in stopwords]

    if not keywords:
        return None

    best_score = 0
    best_section = None
    best_source = None

    md_files = glob.glob(os.path.join(vault_dir, "*.md"))
    for file_path in md_files:
        filename = os.path.basename(file_path)
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
        except Exception:
            continue

        # Hujjatni sarlavhalar yoki paragraflar bo'yicha ajratish
        raw_sections = re.split(r'\n(?=#{1,4}\s)', content)
        for sec in raw_sections:
            sec_clean = sec.strip()
            if len(sec_clean) < 20:
                continue

            sec_lower = sec_clean.lower()
            score = 0

            # Sarlavha satrida kalit so'z uchrashiga yuqori ball
            first_line = sec_clean.split("\n", 1)[0].lower()
            for kw in keywords:
                if kw in first_line:
                    score += 4
                elif kw in sec_lower:
                    score += 1

            # To'liq birikma yoki savol jumlasi uchrashiga qo'shimcha bonus
            if query.lower() in sec_lower:
                score += 5

            if score > best_score:
                best_score = score
                best_section = sec_clean
                best_source = filename

    # Kamida 2 ball to'plangan bo'lsa natija ishonchli hisoblanadi
    if best_score >= 2 and best_section:
        if len(best_section) > 1200:
            best_section = best_section[:1200] + "..."
        return best_section, best_source

    return None


# ==============================================================
# 6. AGENT ABDULBOSIT: CONTINUOUS LEARNING (UZLUKSIZ O'RGANISH)
# ==============================================================

def save_to_knowledge_base(question: str, answer: str, vault_dir: str = None) -> bool:
    """
    Admin tomonidan berilgan yangi javobni 'Bilimlar_Bazasi_FAQ.md' ga saqlab,
    tizimni keyingi safar mustaqil javob bera oladigan darajaga moslaydi.
    """
    if vault_dir is None:
        vault_dir = os.getenv("OBSIDIAN_VAULT_PATH", "docs/obsidian_sync")

    if not os.path.isabs(vault_dir):
        base_dir = os.path.dirname(os.path.abspath(__file__))
        vault_dir = os.path.join(base_dir, vault_dir)

    os.makedirs(vault_dir, exist_ok=True)
    faq_file = os.path.join(vault_dir, "Bilimlar_Bazasi_FAQ.md")

    now_str = datetime.now().strftime("%Y-%m-%d %H:%M")
    is_new = not os.path.exists(faq_file)

    try:
        with open(faq_file, "a", encoding="utf-8") as f:
            if is_new:
                f.write(
                    "# 📚 FootballRise Avtonom Bilimlar Bazasi (FAQ)\n\n"
                    "Ushbu fayl Admin javoblari va agentlarning o'rganishlari asosida avtomatik shakllanadi.\n\n"
                )
            f.write(f"### ❓ [{now_str}] {question.strip()}\n\n")
            f.write(f"**Javob:** {answer.strip()}\n\n")
            f.write("---\n\n")
        return True
    except Exception as e:
        print(f"Error saving to knowledge base: {e}")
        return False
