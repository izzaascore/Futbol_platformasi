from pathlib import Path
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
INTENT_MATCHMAKER_SOS = "MATCHMAKER_SOS"
INTENT_PREMATCH_AI = "PREMATCH_AI"

# Yangi avtonom intellekt yo'nalishlari:
INTENT_FAREWELL = "FAREWELL"
INTENT_GREETING = "GREETING"
INTENT_GRATITUDE = "GRATITUDE"
INTENT_OWNER_INFO = "OWNER_INFO"
INTENT_RESPONSE_TIME = "RESPONSE_TIME"
INTENT_COMMUNITY_PLAYERS = "COMMUNITY_PLAYERS"
INTENT_RATING_INFO = "RATING_INFO"
INTENT_AGENTS_INFO = "AGENTS_INFO"
INTENT_HELP = "HELP"
INTENT_GENERAL = "GENERAL"

def classify_intent(text: str) -> str:
    """
    Rustam agenti matnni tahlil qilib, uning toifasini aniqlaydi.
    Aniqlikni oshirish uchun tor yo'nalishli savollar umumiy salomlashishdan oldin tekshiriladi.
    """
    clean = text.lower().strip()

    # 1. Xayrlashuv va yaxshi tilaklar
    if any(k in clean for k in ["hayr", "xayr", "ko'rishguncha", "korishguncha", "omad", "ketdim", "salomat bo'ling", "tinch bo'ling", "yaxshi qoling", "yaxshi boring", "bay", "bye", "mayli hayr"]):
        return INTENT_FAREWELL

    # 2. Minnatdorchilik va tasanno
    if any(k in clean for k in ["rahmat", "katta rahmat", "tashakkur", "spasibo", "tushundim", "zo'r", "zor", "gap yo'q", "boldi rahmat", "barakalla", "minnatdorman", "tashakkurnoma", "yaxshi bo'ldi", "yaxshi boldi"]):
        return INTENT_GRATITUDE

    # 3. Agentlar jamoasi va mas'uliyat haqida
    if any(k in clean for k in ["kim masul", "kim mas'ul", "qaysi agent", "agentlar kim", "agent jamoasi", "mahoraga kim", "rustam kim", "farrux kim", "abdulbosit kim", "ikrom kim", "qaysi agent masul", "kim javob beradi", "masul agent"]):
        return INTENT_AGENTS_INFO

    # 4. Loyiha egasi, asoschisi va rahbar haqida savollar
    if any(k in clean for k in ["loyihani egasi", "loyiha egasi", "ega kim", "egasi kim", "boshliq kim", "rahbar kim", "asoschi kim", "loyiha kimniki", "kim yaratgan", "futuro nima", "loyiha haqida", "platforma haqida", "kim boshqaradi", "platforma kimniki"]):
        return INTENT_OWNER_INFO

    # 5. Javob kelish vaqti va tezlik
    if any(k in clean for k in ["qancha vaqtda javob", "qachon javob", "tez javob", "qachon yozasiz", "javob keladi", "qancha vaqtda keladi", "qancha kutaman", "javob vaqti", "tezroq javob"]):
        return INTENT_RESPONSE_TIME

    # 6. Boshqa o'yinchilar, jamoa a'zolari va boshqalarni ko'rish
    if any(k in clean for k in ["mandan boshqa", "boshqa odamlar", "boshqalarni", "o'yinchilar bormi", "odamlar ham bormi", "raqiblar", "o'yinchilarni ko'rmoqchi", "kimlar bor", "boshqa o'yinchilar", "odamlar bormi", "futbolchilar bormi"]):
        return INTENT_COMMUNITY_PLAYERS

    # 7. Reyting, ball, OVR va video ta'siri haqida
    if any(k in clean for k in ["nega reytingim", "reyting qanday", "video qo'ymadim", "video qoymadim", "reytingim 82", "reytingim 85", "ovr qanday", "ball qanday", "ball qanday beriladi", "reyting oshirish", "ochko qanday", "ovr nima", "reyting nima"]):
        return INTENT_RATING_INFO

    # 8. Jamoa tarkibi, 10 kishi, 11-13 kishi, texnik mag'lubiyat
    if any(k in clean for k in ["10 kishi", "11 kishi", "12 kishi", "13 kishi", "tarkib", "jamoa nechta", "nechta odam", "jamoa qoidasi", "odam yetmasa", "odam topish", "reglament"]):
        return INTENT_TEAM_RULES

    # 9. Turnirlar sanasi, o'yinlar qachon
    if any(k in clean for k in ["turnir qachon", "turnirlar", "musobaqa", "kubok", "qachon start", "qachon boshlanadi", "start oladi", "turnir bormi", "chempionat", "o'yinlar qachon"]):
        return INTENT_TOURNAMENT

    # 10. Boshqa o'yinchi bilan ko'rishish, chat, bog'lana olmayapman
    if any(k in clean for k in ["bilan ko'rishib", "bilan gaplashmoqchi", "bilan ko'rishmoqchi", "bog'lana olmayapman", "aloqaga chiqmoqchi", "topib bering", "bilan bog'lanish", "chat qilsak", "xona och", "topolmayapman"]):
        return INTENT_CONNECT_PLAYER

    # 11. Muhim shaxsiy murojaatlar (pul, nohaqlik, homiy, shikoyat)
    if any(k in clean for k in ["shikoyat", "pul", "to'lov", "nohaqlik", "hakam sotilgan", "homiy", "sponsor", "aldashdi", "jiddiy masala", "admin bilan gaplashmoqchiman"]):
        return INTENT_ADMIN_ALERT

    # 12. SOS Matchmaker: Odam yetmayapti, futbolga odam kerak
    if any(k in clean for k in ["odam yetmayapti", "odam kerak", "o'yinchi kerak", "futbolga odam", "tarkib to'lmayapti", "zaxira kerak", "bitta odam kerak", "ikkita odam kerak", "matchmaker", "sos e'lon"]):
        return INTENT_MATCHMAKER_SOS

    # 13. AI Pre-Match: Kim yutadi, ehtimollik qanaqa, o'yin bashorati
    if any(k in clean for k in ["kim yutadi", "yutish ehtimoli", "pre-match", "prematch", "o'yin bashorati", "kim kuchli", "ehtimollik qanaqa", "tahlil qilib ber", "taktik tahlil", "bashorat qil"]):
        return INTENT_PREMATCH_AI

    # 14. Yordam va bot qanday ishlashi
    if any(k in clean for k in ["yordam", "nima qila olasan", "bot nima qiladi", "qanday foydalanaman", "help", "nima qilishim kerak", "yo'riqnoma", "qo'llanma"]):
        return INTENT_HELP

    # 15. Salomlashish, start va umumiy kirish
    if any(k in clean for k in ["salom", "assalom", "privet", "qalaysiz", "qalaysan", "charchamang", "tinchmisiz", "qalay", "nima gap", "start/", "/start", "start", "boshlash", "menyu", "bormisiz", "valeykum", "ilova haqida bilmayman", "ilovani bilmayman"]):
        return INTENT_GREETING

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
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
        vault_dir = str(root_dir / vault_dir)

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
        fname_lower = filename.lower()
        # Ichki loglar va texnik arxitektura fayllarini filtrlaymiz (foydalanuvchiga ko'rsatilmaydi)
        if any(bad in fname_lower for bad in ["log", "heal", "scan", "api_", "malumotlar_bazasi", "frontend_", "vazifalar", "readme"]):
            continue

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
            # Texnik skaner loglari bo'lsa o'tkazib yuboramiz
            if any(tech in sec_lower for tech in ["tekshirilgan fayllar", "manbaa fayllar skaneri", "xatoliklar:", "endpoint:"]):
                continue

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

    # Kamida 3 ball to'plangan bo'lsa natija ishonchli hisoblanadi
    if best_score >= 3 and best_section:
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
        root_dir = Path(__file__).resolve().parent.parent.parent.parent
        vault_dir = str(root_dir / vault_dir)

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


# ==============================================================
# 7. AGENT RUSTAM: SOS MATCHMAKER & PRE-MATCH AI INTEGRATSIYASI
# ==============================================================

async def get_sos_callouts_response(api_base_url: str) -> str:
    """
    Ochiq SOS e'lonlarni olib kelib, bot foydalanuvchisiga taqdim etadi.
    """
    callouts = []
    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"{api_base_url}/api/match-callouts?status=open")
            if res.status_code == 200:
                callouts = res.json()
    except Exception:
        pass

    if not callouts:
        return (
            "⚡️ <b>SOS: Futbolga Odam Qidirish Markazi:</b>\n\n"
            "Ayni vaqtda faol e'lonlar mavjud emas.\n\n"
            "Agar o'z jamoangizga shoshilinch o'yinchi kerak bo'lsa, "
            "bot menyusidagi <b>'⚡️ FootballRise Mini App' -> 'Matchmaker'</b> bo'limi orqali 30 soniyada e'lon bering! "
            "Shahardagi barcha erkin futbolchilar e'loningizni ko'radi."
        )

    msg = "⚡️ <b>Ayni Vaqtdagi Qaynoq SOS O'yinlar (Odam Yetmayapti):</b>\n\n"
    for c in callouts[:3]:
        title = c.get("title", "O'yin")
        stadium = c.get("stadium_name", "Noma'lum stadion")
        m_time = c.get("match_time", "Bugun")
        needed = c.get("players_needed", 1)
        pos = c.get("position_needed", "Ixtiyoriy")
        price = c.get("price_per_person", 0)
        price_str = f"{price:,} so'm" if price > 0 else "Tekin"

        msg += (
            f"⚽️ <b>{title}</b>\n"
            f"📍 Stadion: {stadium}\n"
            f"⏰ Vaqt: <b>{m_time}</b>\n"
            f"🏃‍♂️ Kerak: <b>{needed} nafar ({pos})</b> | 💵 To'lov: {price_str}\n\n"
        )

    msg += "👉 <i>Qo'shilish uchun bot menyusidagi <b>'⚡️ FootballRise Mini App' -> 'Matchmaker'</b> bo'limiga kiring va 'Men boraman!' tugmasini bosing!</i>"
    return msg


async def get_prematch_ai_response(api_base_url: str, text: str) -> str:
    """
    Match bashorati / stavka so'ralganda to'g'ri futbol etikasi bilan javob beradi.
    """
    return (
        "⚽️ <b>Futuro — Haqiqiy Futbol Maydoni!</b>\n\n"
        "Platformamizda o'yinlar hisobini bashorat qilish yoki stavka tizimlari mavjud emas. "
        "Bizning asosiy maqsadimiz — yosh iqtidorlarni kashf etish, jamoaga o'yinchi topish va haqiqiy futbol o'ynash!\n\n"
        "👉 <i>Jonli o'yinlar va turnirlarni Mini App'dagi <b>Match Center</b> bo'limida kuzatishingiz mumkin.</i>"
    )


# ==============================================================
# 8. MAHORAGA ENGINE: AVTONOM MULOQOT VA JAVOBLAR GENERATORI
# ==============================================================

def get_farewell_response(user_name: str = "Do'stim") -> str:
    return (
        f"👋 <b>Ko'rishguncha, {user_name}!</b>\n\n"
        "Vaqtingizni ajratib Futuro platformasiga tashrif buyurganingiz uchun katta rahmat! ⚽️\n\n"
        "Sizni maydonda va platformamizda yangi gollar, yuqori reytinglar bilan yana intizorlik bilan kutib qolamiz. "
        "Sog'-salomat bo'ling, omad va g'alabalar doim yor bo'lsin! 🏆"
    )


def get_gratitude_response(user_name: str = "Do'stim") -> str:
    return (
        f"🤝 <b>Arzimaydi, {user_name}!</b>\n\n"
        "Futuro agentlar jamoasi doimo sizga yordam berishdan mamnun! "
        "Har qanday savol yoki qiziqqan mavzuingiz bo'lsa, istalgan vaqtda yozavering. "
        "Futboldagi orzularingizga yetishingizda sizga kuch-quvvat tilaymiz! ⚡️⚽️"
    )


def get_greeting_response(user_name: str = "Do'stim") -> str:
    return (
        f"👋 <b>Assalomu alaykum, {user_name}!</b>\n\n"
        "<b>Futuro</b> — O'zbekiston yosh futbol iqtidorlari ekotizimiga xush kelibsiz! ⚽️\n\n"
        "Men <b>Agent Rustam</b> — platformaning bosh koordinatori va concierge mas'uliman. "
        "Bizning avtonom agentlar jamoamiz sizga quyidagi yo'nalishlarda yordam beradi:\n\n"
        "• 👤 <b>Profil:</b> O'yinchi kartangizni ko'rish yoki yangi profil yaratish\n"
        "• ⚽️ <b>Gol yuborish:</b> Chiroyli gollaringizni yuklab, reytingingizga +2 OVR ball qo'shish\n"
        "• 🏆 <b>Reyting:</b> O'zbekiston bo'yicha eng sara iqtidorlar ro'yxatini kuzatish\n"
        "• ⚡️ <b>Matchmaker SOS:</b> Futbolga odam yetishmaganda o'yinchi topish yoki jamoaga qo'shilish\n"
        "• 📱 <b>Futuro Mini App:</b> Telegram ichida to'liq interaktiv ilovani ochish\n\n"
        "<i>Qanday savolingiz yoki taklifingiz bor? Bemalol yozing, bir zumda javob beramiz!</i>"
    )


def get_owner_info_response() -> str:
    return (
        "🏢 <b>Futuro Platformasi va Rahbariyat Haqida:</b>\n\n"
        "• <b>Asoschi va Rahbar:</b> <b>Aziz Xolqo'ziyev</b> (@azizbek011x)\n"
        "• <b>Loyiha maqsadi:</b> O'zbekiston bo'ylab mahallalar va akademiyalardagi yosh iqtidorli futbolchilarni kashf etish, "
        "ularning professional statistikasini yuritish hamda skautlar va professional klublar e'tiboriga olib chiqish.\n"
        "• <b>Tizim boshqaruvi:</b> 24/7 avtonom AI agentlar jamoasi (Rustam, Farrux, Abdulbosit, Ikrom) va Mahoraga adaptiv intellekti tomonidan yuritiladi.\n\n"
        "💡 <i>Platforma bo'yicha shaxsiy taklif yoki hamkorlik niyatida bo'lsangiz, 'Fikr / Muammo bildirish' bo'limi orqali to'g'ridan-to'g'ri xabar qoldirishingiz mumkin!</i>"
    )


def get_response_time_response() -> str:
    return (
        "⚡️ <b>Javob Berish Tezligi Haqida:</b>\n\n"
        "Bizning agentlar jamoamiz (Rustam, Farrux, Abdulbosit, Ikrom) <b>24/7 rejimida uzluksiz</b> ishlaydi!\n\n"
        "• Botdagi savollaringizga AI agentlarimiz <b>bir necha soniya ichida (lahzada)</b> mustaqil javob beradi.\n"
        "• Agar xabaringiz alohida shaxsiy masala yoki rasmiy shikoyat bo'lib, loyiha rahbariga yo'naltirilsa — "
        "rahbarimiz imkon qadar qisqa fursatda shaxsan aloqaga chiqadi yoki bot orqali javob yo'llaydi.\n\n"
        "<i>Ixtiyoriy savolingizni berishingiz mumkin, biz doim onlaynmiz!</i>"
    )


def get_community_players_response() -> str:
    return (
        "🌟 <b>Futuro Jamiyati va O'yinchilar:</b>\n\n"
        "Albatta! Platformamizda O'zbekistonning turli viloyatlaridan yuzlab iqtidorli yosh futbolchilar ro'yxatdan o'tgan.\n\n"
        "Boshqa futbolchilarning profili, statistikasi va kiritgan gollarini ko'rish uchun:\n"
        "1. <b>🏆 Reyting</b> tugmasini bosing — eng sara to'purarlar va yetakchilar ro'yxatini ko'rasiz.\n"
        "2. <b>📱 Futuro Ilovasi (Mini App)</b>ni ochib, pastki menyudagi <b>'O'yinchilar'</b> bo'limiga kiring. "
        "U yerda barcha iqtidorlarning OVR kartasi, ampluasi, yoshi, shahri va videolari jamlangan!\n\n"
        "<i>Siz ham o'z videolaringizni yuklab, milliy reyting peshqadamlar safiga qo'shiling!</i>"
    )


def get_rating_info_response() -> str:
    return (
        "📊 <b>Futuro Reyting Tizimi (OVR) Qanday Ishlaydi?</b>\n\n"
        "• <b>Boshlang'ich ball:</b> Har bir ro'yxatdan o'tgan o'yinchiga dastlab <b>82–85 OVR</b> oralig'ida boshlang'ich reyting beriladi. "
        "Shuning uchun hali video yuklamagan bo'lsangiz ham profilingizda boshlang'ich ball ko'rinadi — bu tabiiy holat!\n"
        "• <b>Reytingni oshirish:</b> Reytingingizni ko'tarish uchun <b>⚽️ Gol videosini yuborish</b> tugmasidan foydalaning. "
        "Har bir qabul qilingan va tasdiqlangan chiroyli gol uchun reytingingizga <b>+2 ball</b> qo'shiladi!\n"
        "• <b>Skautlar e'tibori:</b> Reytingingiz qancha yuqori bo'lsa, O'zbekistonning milliy reytingida shuncha yuqorilab, professional murabbiylar e'tiboriga tushasiz! 🚀"
    )


def get_agents_info_response() -> str:
    return (
        "🤖 <b>Futuro Agentlar Jamoasi va Mas'uliyat Taqsimoti:</b>\n\n"
        "Platformada foydalanuvchilarga xizmat ko'rsatish uchun quyidagi ixtisoslashgan AI agentlar jamoasi mas'ul qilingan:\n\n"
        "1. 🛡 <b>Agent Rustam (Botga Bosh Mas'ul):</b>\n"
        "   • Botning asosiy boshqaruvchisi, qabulxona koordinatori (Receptionist) va tartib nazoratchisi.\n"
        "   • Xabarlarni qabul qiladi, niyatni tahlil qiladi va bir zumda yechim beradi.\n\n"
        "2. ⚖️ <b>Agent Farrux:</b>\n"
        "   • Rasmiy musobaqa reglamentlari, jamoa tarkibi (kamida 11-13 kishi talabi) va futbol qoidalari bo'yicha mas'ul.\n\n"
        "3. 📊 <b>Agent Abdulbosit:</b>\n"
        "   • Futbolchilar statistikasi, jonli turnirlar jadvali va Obsidian RAG bilimlar bazasi boshqaruvchisi.\n\n"
        "4. 🌐 <b>Agent Ikrom:</b>\n"
        "   • Foydalanuvchilar o'rtasida P2P anonim aloqa xonalarini tashkil etuvchi xavfsiz chat moderatori.\n\n"
        "5. ⚡️ <b>Mahoraga Adaptiv Intellekti:</b>\n"
        "   • Barcha agentlarni birlashtiruvchi, doimiy o'rganuvchi va har qanday vaziyatga moslashuvchi mustaqil intellekt yadrosi!\n\n"
        "<i>Xulosa: Botga bevosita mas'ul agent — <b>Agent Rustam</b> va unga yordam beruvchi Mahoraga intellektidir!</i>"
    )


def get_help_response() -> str:
    return (
        "ℹ️ <b>Futuro Botidan Foydalanish Bo'yicha Yo'riqnoma:</b>\n\n"
        "Pastki menyu tugmalari orqali platformaning asosiy funksiyalaridan foydalanishingiz mumkin:\n\n"
        "• <b>👤 Profilim:</b> O'yinchi kartangizni ko'rish yoki botning o'zida 1 daqiqada yangi profil yaratish.\n"
        "• <b>⚽️ Gol videosini yuborish:</b> Urgan gollaringizni yuborib, reytingingizni har bir gol uchun +2 ballga ko'tarish.\n"
        "• <b>🏆 Reyting:</b> O'zbekistonning eng sara yosh futbolchilari yetakchilar jadvali.\n"
        "• <b>💬 Fikr / Muammo bildirish:</b> Loyiha rahbariga to'g'ridan-to'g'ri fikr yoki taklif yo'llash.\n"
        "• <b>📱 Futuro Ilovasi (Mini App):</b> Katta ekranli to'liq futbol ilovasi (stadionlar, matchmaker, jonli o'yinlar).\n\n"
        "<i>Shuningdek, futbolga oid istalgan savolingizni shunchaki matn ko'rinishida yozing — AI agentlarimiz javob beradi!</i>"
    )


def get_mahoraga_general_response(text: str, user_name: str = "Do'stim") -> str:
    clean = text.lower()

    if any(w in clean for w in ["qoyil", "malades", "gap yo", "super", "yaxshi", "ok", "hop", "mayli"]):
        return (
            f"👍 <b>Rahmat, {user_name}!</b>\n\n"
            "Sizga xizmat ko'rsatishdan mamnunmiz. Agar biron ma'lumot yoki yordam kerak bo'lsa, "
            "doimo shu yerdamiz! ⚽️"
        )

    if any(w in clean for w in ["butsa", "to'p", "top", "stadion", "forma", "mashg'ulot", "trenirovka"]):
        return (
            f"⚽️ <b>Futbol Mashg'ulotlari va Jihozlar (Agent Farrux & Rustam):</b>\n\n"
            "Futbolda yuqori cho'qqilarga erishish uchun muntazam mashg'ulot va to'g'ri rejim juda muhim!\n"
            "Platformamizdagi o'z gollaringizni muntazam joylab boring, "
            "bu sizning maydondagi o'sishingizni ko'rsatadi va professional klublar diqqatini tortadi.\n\n"
            "<i>Yangi gollaringiz bo'lsa, '⚽️ Gol videosini yuborish' tugmasi orqali yuboring!</i>"
        )

    return (
        f"🤖 <b>Futuro Avtonom Yordamchisi (Agent Rustam & Mahoraga):</b>\n\n"
        f"Hurmatli {user_name}, murojaatingizni qabul qildik!\n\n"
        "Futuro platformasida siz:\n"
        "• O'z futbolchi profilingizni ochishingiz\n"
        "• Gollaringiz videosini yuklab reytingingizni oshirishingiz\n"
        "• Turnirlar va musobaqalar jadvalini kuzatishingiz\n"
        "• Mini App orqali shahringizdagi o'yinlarga qo'shilishingiz mumkin.\n\n"
        "<i>Agar platforma yoki futbol qoidalari bo'yicha aniq savolingiz bo'lsa, bemalol so'rang — jamoamiz yordam berishga tayyor!</i>"
    )
