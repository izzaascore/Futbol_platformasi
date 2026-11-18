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
INTENT_BECOME_PRO = "BECOME_PRO"
INTENT_SURPRISE_SKEPTICISM = "SURPRISE_SKEPTICISM"
INTENT_SCOUTS_INFO = "SCOUTS_INFO"
INTENT_PRICING_FREE = "PRICING_FREE"
INTENT_VIDEO_GUIDE = "VIDEO_GUIDE"
INTENT_AGE_LIMIT = "AGE_LIMIT"
INTENT_LOCATION_INFO = "LOCATION_INFO"
INTENT_TRAINING_ADVICE = "TRAINING_ADVICE"
INTENT_CASUAL_CHAT = "CASUAL_CHAT"

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

    # 1. Professional futbolchi bo'lish, kelajak va skautlar e'tibori
    if any(k in clean for k in ["pro futbolchi", "professional futbolchi", "futbolchi bo'la", "futbolchi bola", "futbolchi bo'lish", "futbolchi bolish", "pro bo'lish", "pro bolish", "katta futbol", "kelajagim", "istiqbolim", "ko'rikka", "prosmotr", "ko'rik"]):
        return INTENT_BECOME_PRO

    # 2. Ajablanish, ishonchsizlik va qiziqish ("yoge", "rostdanmi")
    if any(k in clean for k in ["yoge", "yo'g'e", "yoge?", "yo'g'e?", "rostdanmi", "rostanammi", "rostan ham", "jiddiymi", "hazillashyapsanmi", "ishonmayman", "aldamayapsanmi", "haqiqatdanmi", "nahotki", "rostmi"]):
        return INTENT_SURPRISE_SKEPTICISM

    # 3. Skautlar, klublar va kimlar ko'rishi
    if any(k in clean for k in ["skautlar kim", "qaysi klublar", "qaysi skautlar", "kimlar ko'radi", "kimlar koradi", "superliga", "pro liga", "agentlar", "murabbiylar ko'radimi", "klublar bormi", "paxtakor", "nasaf", "bunyodkor", "navbahor", "skaut"]):
        return INTENT_SCOUTS_INFO

    # 4. Narx, to'lov va bepullik
    if any(k in clean for k in ["tekinmi", "bepulmi", "pul to'laymanmi", "pul tolaymanmi", "narxi qancha", "qancha turadi", "to'lov bormi", "tolov bormi", "qancha to'lash kerak", "pullikmi", "to'lov qanday", "narxlar"]):
        return INTENT_PRICING_FREE

    # 5. Gol videosi talablari va qoidalari
    if ("video" in clean and any(w in clean for w in ["qanaqa", "qanday", "talab", "format", "yukla", "yubor", "qaysi", "qanaqangi", "bolishi", "bo'lishi"])) or \
       ("gol" in clean and any(w in clean for w in ["yukla", "yubor", "joyla", "qo'y", "qoy", "qanday", "qanaqa"])):
        return INTENT_VIDEO_GUIDE

    # 6. Yosh chegaralari va toifalar
    if any(k in clean for k in ["necha yosh", "yosh chegarasi", "yoshim", "yosh toifasi", "kichkinaman", "kattalar ham", "yosh chegarasi bormi", "yoshim to'g'ri", "yosh kattami"]):
        return INTENT_AGE_LIMIT

    # 7. Viloyatlar va shaharlar
    if any(k in clean for k in ["viloyat", "qayerda joylashgan", "man samarqand", "man farg'ona", "vodiy", "andijon", "namangan", "buxoro", "qashqadaryo", "surxondaryo", "xorazm", "nukus", "navoiy", "jizzax", "qishloq", "shaharlar", "qaysi hudud"]):
        return INTENT_LOCATION_INFO

    # 8. Futbol mashg'ulotlari va mahorat oshirish
    if any(k in clean for k in ["mashq", "mashg'ulot", "trenirovka", "zarba", "zarbani kuchaytirish", "tezlikni oshirish", "dribling", "fint", "fintlar", "qanday o'ynash", "o'sish uchun", "butsa tanlash"]):
        return INTENT_TRAINING_ADVICE

    # 9. Xayrlashuv va yaxshi tilaklar
    if any(k in clean for k in ["hayr", "xayr", "ko'rishguncha", "korishguncha", "omad", "ketdim", "salomat bo'ling", "tinch bo'ling", "yaxshi qoling", "yaxshi boring", "bay", "bye", "mayli hayr"]):
        return INTENT_FAREWELL

    # 10. Minnatdorchilik va tasanno
    if any(k in clean for k in ["rahmat", "katta rahmat", "tashakkur", "spasibo", "tushundim", "zo'r", "zor", "gap yo'q", "boldi rahmat", "barakalla", "minnatdorman", "tashakkurnoma", "yaxshi bo'ldi", "yaxshi boldi"]):
        return INTENT_GRATITUDE

    # 11. Agentlar jamoasi va mas'uliyat haqida
    if any(k in clean for k in ["kim masul", "kim mas'ul", "qaysi agent", "agentlar kim", "agent jamoasi", "mahoraga kim", "rustam kim", "farrux kim", "abdulbosit kim", "ikrom kim", "qaysi agent masul", "kim javob beradi", "masul agent"]):
        return INTENT_AGENTS_INFO

    # 12. Loyiha egasi, asoschisi va rahbar haqida savollar
    if any(k in clean for k in ["loyihani egasi", "loyiha egasi", "ega kim", "egasi kim", "boshliq kim", "rahbar kim", "asoschi kim", "loyiha kimniki", "kim yaratgan", "futuro nima", "loyiha haqida", "platforma haqida", "kim boshqaradi", "platforma kimniki"]):
        return INTENT_OWNER_INFO

    # 13. Javob kelish vaqti va tezlik
    if any(k in clean for k in ["qancha vaqtda javob", "qachon javob", "tez javob", "qachon yozasiz", "javob keladi", "qancha vaqtda keladi", "qancha kutaman", "javob vaqti", "tezroq javob"]):
        return INTENT_RESPONSE_TIME

    # 14. Boshqa o'yinchilar, jamoa a'zolari va boshqalarni ko'rish
    if any(k in clean for k in ["mandan boshqa", "boshqa odamlar", "boshqalarni", "o'yinchilar bormi", "odamlar ham bormi", "raqiblar", "o'yinchilarni ko'rmoqchi", "kimlar bor", "boshqa o'yinchilar", "odamlar bormi", "futbolchilar bormi"]):
        return INTENT_COMMUNITY_PLAYERS

    # 15. Reyting, ball, OVR va video ta'siri haqida
    if any(k in clean for k in ["nega reytingim", "reyting qanday", "video qo'ymadim", "video qoymadim", "reytingim 82", "reytingim 85", "ovr qanday", "ball qanday", "ball qanday beriladi", "reyting oshirish", "ochko qanday", "ovr nima", "reyting nima"]):
        return INTENT_RATING_INFO

    # 16. Jamoa tarkibi, 10 kishi, 11-13 kishi, texnik mag'lubiyat
    if any(k in clean for k in ["10 kishi", "11 kishi", "12 kishi", "13 kishi", "tarkib", "jamoa nechta", "nechta odam", "jamoa qoidasi", "odam yetmasa", "odam topish", "reglament"]):
        return INTENT_TEAM_RULES

    # 17. Turnirlar sanasi, o'yinlar qachon
    if any(k in clean for k in ["turnir qachon", "turnirlar", "musobaqa", "kubok", "qachon start", "qachon boshlanadi", "start oladi", "turnir bormi", "chempionat", "o'yinlar qachon"]):
        return INTENT_TOURNAMENT

    # 18. Boshqa o'yinchi bilan ko'rishish, chat, bog'lana olmayapman
    if any(k in clean for k in ["bilan ko'rishib", "bilan gaplashmoqchi", "bilan ko'rishmoqchi", "bog'lana olmayapman", "aloqaga chiqmoqchi", "topib bering", "bilan bog'lanish", "chat qilsak", "xona och", "topolmayapman"]):
        return INTENT_CONNECT_PLAYER

    # 19. Muhim shaxsiy murojaatlar (pul, nohaqlik, homiy, shikoyat)
    if any(k in clean for k in ["shikoyat", "pul", "to'lov", "nohaqlik", "hakam sotilgan", "homiy", "sponsor", "aldashdi", "jiddiy masala", "admin bilan gaplashmoqchiman"]):
        return INTENT_ADMIN_ALERT

    # 20. SOS Matchmaker: Odam yetmayapti, futbolga odam kerak
    if any(k in clean for k in ["odam yetmayapti", "odam kerak", "o'yinchi kerak", "futbolga odam", "tarkib to'lmayapti", "zaxira kerak", "bitta odam kerak", "ikkita odam kerak", "matchmaker", "sos e'lon"]):
        return INTENT_MATCHMAKER_SOS

    # 21. AI Pre-Match: Kim yutadi, ehtimollik qanaqa, o'yin bashorati
    if any(k in clean for k in ["kim yutadi", "yutish ehtimoli", "pre-match", "prematch", "o'yin bashorati", "kim kuchli", "ehtimollik qanaqa", "tahlil qilib ber", "taktik tahlil", "bashorat qil"]):
        return INTENT_PREMATCH_AI

    # 22. Yordam va bot qanday ishlashi
    if any(k in clean for k in ["yordam", "nima qila olasan", "bot nima qiladi", "qanday foydalanaman", "help", "nima qilishim kerak", "yo'riqnoma", "qo'llanma"]):
        return INTENT_HELP

    # 23. Do'stona kichik muloqot va replikalar
    if any(k in clean for k in ["nima gap", "tinchlikmi", "ishlar qalay", "tushunarli", "gaplashaylik", "zerikdim", "aytingchi", "eshitaman"]):
        return INTENT_CASUAL_CHAT

    # 24. Salomlashish, start va umumiy kirish
    if any(k in clean for k in ["salom", "assalom", "privet", "qalaysiz", "qalaysan", "charchamang", "tinchmisiz", "qalay", "start/", "/start", "start", "boshlash", "menyu", "bormisiz", "valeykum", "ilova haqida bilmayman", "ilovani bilmayman"]):
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

def get_become_pro_response(user_name: str = "Do'stim") -> str:
    return (
        f"⚽️ <b>Ha, albatta! {user_name}, Futuro aynan shuning uchun yaratilgan!</b>\n\n"
        "Bizning asosiy maqsadimiz — O'zbekistondagi har bir iqtidorli yosh futbolchini mahalla va havaskorlikdan <b>katta professional futbolga</b> olib chiqishdir! 🚀\n\n"
        "<b>Qanday qilib professional futbolchi bo'lasiz?</b>\n"
        "1. 📹 <b>Gollaringiz videosini yuklang:</b> O'yin yoki mashg'ulotdagi eng chiroyli gollaringizni '⚽️ Gol videosini yuborish' tugmasi orqali yuborasiz.\n"
        "2. 📈 <b>Reytingingizni (OVR) oshirasiz:</b> Har bir tasdiqlangan gol profilingizga <b>+2 ball</b> beradi. Reytingingiz qancha baland bo'lsa, O'zbekiston peshqadamlari jadvalida shuncha yuqorilab borasiz.\n"
        "3. 🎯 <b>Professional skautlar e'tiboriga tushasiz:</b> Platformamizni professional akademiyalar, Superliga va Pro-liga skautlari kuzatib boradi. Ular aynan eng yuqori reytingli o'yinchilarni saralaydi.\n"
        "4. 🤝 <b>Rasmiy taklif olasiz:</b> Mahoratingiz skautlarga ma'qul kelsa, siz bilan bot orqali bog'lanishadi yoki ko'rikka (prosmotr) taklif qilishadi!\n\n"
        "💡 <i>Hamma narsa o'z qo'lingizda — intizom, mehnat va to'xtovsiz mashg'ulot! Profilingizni to'ldiring va birinchi golingiz videosini yuboring!</i>"
    )


def get_surprise_skepticism_response(user_name: str = "Do'stim") -> str:
    return (
        f"😄 <b>Yo'g'-e emas, haqiqat, {user_name}!</b>\n\n"
        "Bu hazil yoki shunchaki gap emas — <b>Futuro</b> O'zbekiston yosh futbolchilari uchun maxsus yaratilgan professional raqamli skauting ekotizimidir! ⚡️\n\n"
        "Bu yerda:\n"
        "• Hech qanday tanish-bilishchilik yo'q — faqat o'yin mahoratingiz va tasdiqlangan videolaringiz gapiradi.\n"
        "• Barcha reytinglar shaffof va ochiq hisoblanadi.\n"
        "• O'zbekistonning istalgan nuqtasidan turib katta futbolga qadam qo'yish imkoniyatingiz bor.\n\n"
        "<i>Ishonmasangiz, <b>🏆 Reyting</b> tugmasini bosing yoki <b>⚡️ Futuro Mini App</b> ilovasini ochib, boshqa o'yinchilarning profillarini ko'ring!</i>"
    )


def get_scouts_info_response() -> str:
    return (
        "🎯 <b>Futuro Skautlar Tizimi Qanday Ishlaydi?</b>\n\n"
        "Platformamiz O'zbekistonning yetakchi futbol akademiyalari (Paxtakor, Bunyodkor, Nasaf, Navbahor va boshqalar) hamda mustaqil professional skautlar bilan hamkorlik qiladi.\n\n"
        "• Skautlar reyting peshqadamlarini viloyat, yosh toifasi (U-14, U-16, U-18) va amplua bo'yicha saralashadi.\n"
        "• Har bir o'yinchining video dalillarini tahlil qilib, iqtidorlilarga Agent Ikrom orqali virtual aloqa taklifini yuborishadi.\n\n"
        "<i>Sizning vazifangiz — gollaringizni muntazam yuklab, reytingingizni eng yuqori darajada ushlab turish!</i>"
    )


def get_pricing_free_response() -> str:
    return (
        "🟢 <b>Futuro Mutlaqo BEPUL Platforma!</b>\n\n"
        "• Profil ochish — <b>0 so'm (Tekin)</b>\n"
        "• Gol videolarini yuborish va reyting olish — <b>0 so'm (Tekin)</b>\n"
        "• Reyting va boshqa o'yinchilarni kuzatish — <b>0 so'm (Tekin)</b>\n"
        "• Mini App'dan to'liq foydalanish — <b>0 so'm (Tekin)</b>\n\n"
        "Biz yosh iqtidorlardan pul olmaymiz — bizning maqsadimiz iste'dodlarni kashf etish va ularga katta yo'l ochishdir! ⚽️"
    )


def get_video_guide_response() -> str:
    return (
        "📹 <b>Gol Videosini Yuborish Bo'yicha Yo'riqnoma:</b>\n\n"
        "1. <b>Qanday video qabul qilinadi?</b>\n"
        "   • Futbol maydonida, mini-futbol yoki mashg'ulotda urilgan haqiqiy gollar.\n"
        "   • Chiroyli jarima zarbalari, ajoyib kombinatsiyalar, dribling yoki kuchli zarbalar.\n"
        "2. <b>Format va davomiyligi:</b>\n"
        "   • Telegram orqali oddiy video fayl ko'rinishida yuboriladi.\n"
        "   • Davomiyligi: 10 soniyadan 60 soniyagacha (zarba va to'p to'rga tushishi aniq ko'rinsin).\n"
        "3. <b>Qanday yuboriladi?</b>\n"
        "   • Pastki menyudagi <b>'⚽️ Gol videosini yuborish'</b> tugmasini bosing va videoni jo'nating!\n\n"
        "<i>Har bir tasdiqlangan gol sizga darhol +2 OVR ball beradi!</i>"
    )


def get_age_limit_response() -> str:
    return (
        "👶👦 <b>Yosh Chegaralari va Toifalar:</b>\n\n"
        "Futuro platformasida yosh chegarasi qat'iy cheklanmagan, lekin skautlar asosan quyidagi toifalarni kuzatadilar:\n\n"
        "• <b>U-14 (10–14 yosh):</b> Boshlang'ich iqtidorlar va akademiyalar uchun nomzodlar\n"
        "• <b>U-16 (15–16 yosh):</b> Professional o'smirlar ligasi o'yinchilari\n"
        "• <b>U-18 (17–18 yosh):</b> O'rinbosarlar va dubl tarkiblarga tavsiya etiluvchi yoshlar\n"
        "• <b>20+ va Havaskorlar:</b> Mini App orqali SOS o'yinlar va jamoalarga qo'shilishi mumkin.\n\n"
        "<i>Qaysi yoshda bo'lsangiz ham, o'z mahoratingizni ko'rsatishdan to'xtamang!</i>"
    )


def get_location_info_response() -> str:
    return (
        "📍 <b>O'zbekistonning Barcha Hududlari Uchun!</b>\n\n"
        "Siz qaysi viloyat, shahar yoki qishloqda bo'lishingizdan qat'i nazar (Toshkent, Samarqand, Farg'ona, Andijon, Qashqadaryo, Xorazm, Buxoro, Surxondaryo, Namangan, Jizzax, Navoiy, Qoraqalpog'iston) — bemalol qatnashishingiz mumkin!\n\n"
        "Platformaning go'zalligi shundaki — skautlar eng chekka hududdagi iqtidorlarni ham video va statistika orqali kashf etadi. "
        "Siz faqat o'z maydoningizdagi gollarni videoga oling va yuboring! ⚡️"
    )


def get_training_advice_response() -> str:
    return (
        "⚽️ <b>Agent Farrux & Rustamdan Professional Futbol Maslahatlari:</b>\n\n"
        "Mahoratingizni tezroq oshirish uchun 4 ta oltin qoida:\n"
        "1. <b>Devor bilan mashq:</b> Har kuni 15–20 daqiqa ikkala oyoqda to'pni devorga urib, birinchi teginishni (first touch) mukammallashtiring.\n"
        "2. <b>Zarba aniqligi:</b> Kuchdan ko'ra darvoza burchaklariga aniq yo'naltirishni mashq qiling.\n"
        "3. <b>Jismoniy quvvat:</b> Tezlik va chaqqonlik (koordinatsiya) ustida ishlang.\n"
        "4. <b>Videolaringizni tahlil qiling:</b> Maydondagi harakatlaringizni chetdan ko'rish kamchiliklarni to'g'rilashga yordam beradi.\n\n"
        "<i>Mashg'ulotdagi natijalaringizni video qilib platformamizga yuklab boring!</i>"
    )


def get_casual_chat_response(text: str, user_name: str = "Do'stim") -> str:
    clean = text.lower()
    if any(w in clean for w in ["tinchlikmi", "nima gap", "ishlar qalay", "charchamang"]):
        return (
            f"🤝 <b>Rahmat, {user_name}! Hamma ishlar a'lo darajada!</b>\n\n"
            "Futuro agentlar jamoasi 24/7 rejimida maydonlar va futbolchilarni kuzatmoqda. "
            "Sizda nima yangiliklar? Bugun futbol bormi yoki mashg'ulot o'tkazdingizmi? ⚽️"
        )
    if any(w in clean for w in ["tushunarli", "tushundim"]):
        return (
            f"👍 <b>Juda soz, {user_name}!</b>\n\n"
            "Agar yangi savol tug'ilsa yoki video yuklashni xohlasangiz, istalgan paytda yozing! 🚀"
        )
    return (
        f"😊 <b>Siz bilan suhbatlashishdan mamnunmiz, {user_name}!</b>\n\n"
        "Futuro jamoasi doimo sizning xizmatingizda. Futbolga oid nima savolingiz yoki maqsadingiz bo'lsa, bemalol aytavering! ⚽️"
    )


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
    clean = text.lower().strip()

    # 1. Ruxsat yoki imkoniyat so'ralganda
    if any(q in clean for q in ["mumkinmi", "bo'ladimi", "boladimi", "mumkunmi", "ruxsat"]):
        return (
            f"✅ <b>Albatta bo'ladi, {user_name}!</b>\n\n"
            f"Futuro platformasida o'z futbol mahoratingizni ko'rsatish va rivojlanish uchun barcha imkoniyatlar yaratilgan.\n\n"
            "• Profilingizni ko'rish yoki ochish uchun: <b>👤 Profilim</b>\n"
            "• Gollar videosini yuklash uchun: <b>⚽️ Gol videosini yuborish</b>\n"
            "• Butun O'zbekiston bo'yicha reytingni ko'rish uchun: <b>🏆 Reyting</b>\n"
            "• Maydonlar va o'yinlar uchun: <b>⚡️ Futuro Mini App</b> ilovasini oching!"
        )

    # 2. Qanday qilish usuli so'ralganda
    if any(q in clean for q in ["qanday", "qanaqa", "qanday qilib", "qanaqasiga"]):
        return (
            f"💡 <b>{user_name}, buning yo'li juda oson:</b>\n\n"
            "1. Bot menyusidagi kerakli bo'limni tanlang (Profil, Gol yuborish yoki Reyting).\n"
            "2. Bot sizga qadam-baqadam yo'l ko'rsatadi.\n"
            "3. Shuningdek, <b>⚡️ Futuro Mini App</b> tugmasini bosib, barcha funksiyalarni qulay vizual ekranda boshqarishingiz mumkin!\n\n"
            "<i>Aniqroq savolingiz bo'lsa, bemalol yozing — agentlarimiz darhol tushuntiradi.</i>"
        )

    # 3. Joylashuv yoki qayerdan topish so'ralganda
    if any(q in clean for q in ["qayerda", "qayerdan", "qayoqda"]):
        return (
            f"📍 <b>Bu bo'limlar to'g'ridan-to'g'ri shu bot ichida va Mini App'da joylashgan, {user_name}!</b>\n\n"
            "• O'z o'yinchi profilingiz: <b>👤 Profilim</b> tugmasida\n"
            "• Yetakchilar jadvali: <b>🏆 Reyting</b> tugmasida\n"
            "• Stadionlar xaritasi va o'yinlar: <b>📱 Futuro Mini App</b> ichida!\n\n"
            "Bosh menyudagi tugmalardan birini tanlang."
        )

    # 4. Kim mas'ul yoki kimlar qatnashadi so'ralganda
    if any(q in clean for q in ["kim", "kimlar", "kimga"]):
        return (
            f"👥 <b>Futuro Jamiyati va Mutasaddilari:</b>\n\n"
            "Platformamizda minglab yosh futbolchilar, professional skautlar va doimiy yordam beruvchi AI agentlar jamoasi (Rustam, Farrux, Abdulbosit, Ikrom) jamlangan.\n\n"
            "<i>Siz ham o'z profilingizni faollashtirib, jamiyatimizning to'laqonli a'zosiga aylaning!</i>"
        )

    # 5. Qisqa replikalar yoki hayratlar
    if len(clean.split()) <= 2:
        return (
            f"⚽️ <b>{user_name}, savolingizni to'liqroq yozsangiz bir zumda yordam beramiz!</b>\n\n"
            "Men Agent Rustam va Mahoraga adaptiv intellektiman. Futuro platformasi, profilingiz, gollaringiz, reyting yoki futbol bo'yicha har qanday savolingizga javob berishga tayyorman!\n\n"
            "<i>Masalan: 'qanday qilib gol yuklayman', 'pro futbolchi bo'lish yo'li' yoki 'skautlar kimlar' deb so'rang!</i>"
        )

    # 6. Boshqa ixtiyoriy matnlar uchun tabiiy javob
    return (
        f"🤖 <b>Agent Rustam & Mahoraga:</b>\n\n"
        f"Hurmatli {user_name}, fikringizni qabul qildik!\n\n"
        "Futuro — sizning futbol mahoratingizni yangi bosqichga olib chiquvchi maydon. "
        "Har qanday maqsad yoki savolingiz bo'lsa, botimiz orqali profilingizni yuritib, gollaringizni yuklab boring. "
        "Biz sizning natijalaringizni professional darajada ko'rsatishga tayyormiz!\n\n"
        "<i>Kerakli amalni pastdagi bosh menyu tugmalari orqali boshlashingiz mumkin! ⚡️</i>"
    )
