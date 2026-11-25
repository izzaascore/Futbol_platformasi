import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT_DIR / "backend"
for p in [str(BACKEND_DIR), str(ROOT_DIR)]:
    if p not in sys.path:
        sys.path.insert(0, p)

import asyncio
import logging
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command, StateFilter
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import (
    ReplyKeyboardMarkup,
    KeyboardButton,
    ReplyKeyboardRemove,
    InlineKeyboardMarkup,
    InlineKeyboardButton,
    WebAppInfo,
    MenuButtonWebApp
)
import os
import httpx
from dotenv import load_dotenv

load_dotenv(ROOT_DIR / '.env')

logging.basicConfig(level=logging.INFO)

DEFAULT_BOT_TOKEN = "9026677560:AAGN8_bXDm5GgxQcE3AW5w4tEVN3MH1UDfU"
RAW_BOT_TOKEN = (os.getenv("BOT_TOKEN") or os.getenv("TELEGRAM_BOT_TOKEN") or DEFAULT_BOT_TOKEN).strip()
BOT_TOKEN = RAW_BOT_TOKEN if (":" in RAW_BOT_TOKEN and not RAW_BOT_TOKEN.startswith("1234567890")) else DEFAULT_BOT_TOKEN

# Jonli API va WebApp manzili:
API_BASE_URL = os.getenv("API_BASE_URL", "https://futbol-platform.onrender.com")
# Jonli WebApp manzili:
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://futbol-platformasi-alpha.vercel.app")
# Admin Telegram ID (muhim shaxsiy xabarlar uchun):
ADMIN_TELEGRAM_ID = (os.getenv("ADMIN_TELEGRAM_ID") or "8692713738").strip()
# Botning API uchun kaliti (admin huquqi bermaydi). Railway Variables da BOT_API_KEY ni o'rnating.
BOT_API_KEY = os.getenv("BOT_API_KEY", "").strip()
BOT_HEADERS = {"X-Bot-Key": BOT_API_KEY} if BOT_API_KEY else {}

from app.services.ai_assistant import (
    classify_intent,
    get_team_rules_response,
    get_tournament_status_response,
    search_player_by_name,
    create_virtual_room,
    close_virtual_room,
    get_room_peer,
    search_obsidian_knowledge_base,
    save_to_knowledge_base,
    register_pending_question,
    resolve_pending_question,
    USER_ACTIVE_ROOMS,
    INTENT_TEAM_RULES,
    INTENT_TOURNAMENT,
    INTENT_CONNECT_PLAYER,
    INTENT_ADMIN_ALERT,
    INTENT_MATCHMAKER_SOS,
    INTENT_PREMATCH_AI,
    INTENT_BECOME_PRO,
    INTENT_SURPRISE_SKEPTICISM,
    INTENT_SCOUTS_INFO,
    INTENT_PRICING_FREE,
    INTENT_VIDEO_GUIDE,
    INTENT_AGE_LIMIT,
    INTENT_LOCATION_INFO,
    INTENT_TRAINING_ADVICE,
    INTENT_CASUAL_CHAT,
    INTENT_FAREWELL,
    INTENT_GREETING,
    INTENT_GRATITUDE,
    INTENT_OWNER_INFO,
    INTENT_RESPONSE_TIME,
    INTENT_COMMUNITY_PLAYERS,
    INTENT_RATING_INFO,
    INTENT_AGENTS_INFO,
    INTENT_HELP,
    INTENT_GENERAL,
    get_sos_callouts_response,
    get_prematch_ai_response,
    get_become_pro_response,
    get_surprise_skepticism_response,
    get_scouts_info_response,
    get_pricing_free_response,
    get_video_guide_response,
    get_age_limit_response,
    get_location_info_response,
    get_training_advice_response,
    get_casual_chat_response,
    get_farewell_response,
    get_greeting_response,
    get_gratitude_response,
    get_owner_info_response,
    get_response_time_response,
    get_community_players_response,
    get_rating_info_response,
    get_agents_info_response,
    get_help_response,
    get_mahoraga_general_response
)

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()


# --- FSM HOLATLARI ---

class RegistrationState(StatesGroup):
    phone = State()
    full_name = State()
    age = State()
    city = State()
    position = State()
    preferred_foot = State()


class SubmitGoalState(StatesGroup):
    waiting_for_video = State()
    waiting_for_caption = State()


# --- TUGMALAR (Keyboards) ---

def get_webapp_inline_kb():
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="⚡ Futuro Mini App (Ilovani ochish)", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

def get_main_menu():
    kb = [
        [KeyboardButton(text="📱 Futuro Ilovasi (Mini App)", web_app=WebAppInfo(url=WEBAPP_URL))],
        [KeyboardButton(text="👤 Profilim"), KeyboardButton(text="⚽ Gol videosini yuborish")],
        [KeyboardButton(text="🏆 Reyting"), KeyboardButton(text="💬 Fikr / Muammo bildirish")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_guest_profile_menu():
    login_url = f"{WEBAPP_URL}/login"
    register_url = f"{WEBAPP_URL}/register"
    kb = [
        [
            KeyboardButton(text="🔐 Profilga kirish", web_app=WebAppInfo(url=login_url)),
            KeyboardButton(text="📝 Profil yaratish", web_app=WebAppInfo(url=register_url))
        ],
        [
            KeyboardButton(text="🤖 Botda ro'yxatdan o'tish"),
            KeyboardButton(text="📱 Mini App (Bosh sahifa)", web_app=WebAppInfo(url=WEBAPP_URL))
        ],
        [KeyboardButton(text="🔙 Asosiy menyu")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_registered_profile_menu():
    profile_url = f"{WEBAPP_URL}/profile"
    login_url = f"{WEBAPP_URL}/login"
    kb = [
        [KeyboardButton(text="📱 Mini App'da profilni ko'rish", web_app=WebAppInfo(url=profile_url))],
        [
            KeyboardButton(text="⚽ Gol videosini yuborish"),
            KeyboardButton(text="🔐 Profilga kirish (Web)", web_app=WebAppInfo(url=login_url))
        ],
        [KeyboardButton(text="🔙 Asosiy menyu")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_position_kb():
    kb = [
        [KeyboardButton(text="Hujumchi"), KeyboardButton(text="Yarim himoyachi")],
        [KeyboardButton(text="Himoyachi"), KeyboardButton(text="Darvozabon")],
        [KeyboardButton(text="❌ Bekor qilish")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_foot_kb():
    kb = [
        [KeyboardButton(text="O'ng"), KeyboardButton(text="Chap"), KeyboardButton(text="Har ikkisi")],
        [KeyboardButton(text="❌ Bekor qilish")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_cancel_kb():
    return ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="❌ Bekor qilish")]],
        resize_keyboard=True
    )


# --- /start HANDLER ---
# Har qanday holatda (FSM holati nima bo'lishidan qat'i nazar) /start bosilganda darhol javob beradi
@dp.message(CommandStart(), StateFilter("*"))
@dp.message(Command("start"), StateFilter("*"))
@dp.message(F.text.func(lambda t: t and t.strip().lower() in ["/start", "/start@futbol_platormabot"]), StateFilter("*"))
async def start_handler(message: types.Message, state: FSMContext):
    # Har qanday tiqilib qolgan holatni bir zumda tozalaymiz
    await state.clear()
    user_id = message.from_user.id
    full_name = message.from_user.full_name or "Futbolchi"

    # Admin xabarnomalari uchun ushbu chatni ro'yxatga olamiz
    try:
        from app.services.telegram_notify import register_admin_chat
        register_admin_chat(user_id)
    except Exception:
        pass

    # Bazadan o'yinchini xavfsiz va tezkor (asinxron thread + timeout bilan) tekshiramiz
    current_player = None
    try:
        def _get_player_sync():
            from app.core.database import SessionLocal
            from app.models.models import Player
            with SessionLocal() as db:
                p = db.query(Player).filter(Player.telegram_id == user_id).first()
                if p:
                    return {
                        "full_name": p.full_name,
                        "position": p.position or "Hujumchi",
                        "rating": min(99, 82 + (p.goals_verified or 0) * 2),
                        "goals_verified": p.goals_verified or 0
                    }
            return None

        current_player = await asyncio.wait_for(asyncio.to_thread(_get_player_sync), timeout=1.2)
    except Exception as e:
        print(f"[DB Check in /start]: {e}")

    if current_player:
        await message.answer(
            f"Assalomu alaykum, <b>{current_player['full_name']}</b>! 👋⚽️\n\n"
            f"🎯 <b>Pozitsiya:</b> {current_player['position']}\n"
            f"🏆 <b>OVR Reyting:</b> {current_player['rating']}\n"
            f"⚽️ <b>Tasdiqlangan gollar:</b> {current_player['goals_verified']} ta\n\n"
            "Pastdagi bosh menyu tugmalari orqali platformadan to'liq foydalanishingiz mumkin:",
            parse_mode="HTML",
            reply_markup=get_main_menu()
        )
    else:
        await message.answer(
            f"Assalomu alaykum, <b>{full_name}</b>! ⚽️\n\n"
            "<b>Futuro — O'zbekiston Futbol Iqtidorlari Ekotizimi</b>ga xush kelibsiz!\n\n"
            "Bu yerda siz o'z gollaringiz va mahoratingiz videosini yuborishingiz, milliy reytingda ko'tarilishingiz va professional skautlar e'tiboriga tushishingiz mumkin.\n\n"
            "👇 <i>Pastdagi bosh menyu tugmalaridan birini tanlang:</i>",
            parse_mode="HTML",
            reply_markup=get_main_menu()
        )

    await message.answer(
        "📱 <b>Futuro Ilovasi (Mini App)</b>ni to'g'ridan-to'g'ri Telegram ichida ochish uchun bosing:",
        parse_mode="HTML",
        reply_markup=get_webapp_inline_kb()
    )


# --- GLOBAL CANCEL / BEKOR HANDLER ---
# Har qanday holatda (FSM qaysi bosqichda bo'lishidan qat'i nazar) bekor qilish
@dp.message(Command("bekor", "cancel", "menu", "menyu"), StateFilter("*"))
@dp.message(
    F.text.casefold().in_([
        "bekor", "bekor qilish", "/bekor", "/cancel", "отмена", "orqaga", 
        "❌ bekor qilish", "bosh menyu", "menyu", "🔙 asosiy menyu", "asosiy menyu", "chiqish"
    ]),
    StateFilter("*")
)
async def global_cancel_handler(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "👇 Asosiy menyudasiz:",
        reply_markup=get_main_menu()
    )


# --- RO'YXATDAN O'TISH BOSQICHLARI ---

@dp.message(
    F.text.in_([
        "📝 Botda profil yaratish", "Botda profil yaratish", 
        "Profil yaratish", "Ro'yxatdan o'tish", "/register"
    ]), 
    StateFilter("*")
)
async def start_registration(message: types.Message, state: FSMContext):
    await state.clear()
    
    # Avval tekshiramiz: balki allaqachon ro'yxatdan o'tgandir
    try:
        from app.core.database import SessionLocal
        from app.models.models import Player
        with SessionLocal() as db:
            p = db.query(Player).filter(Player.telegram_id == message.from_user.id).first()
            if p:
                await message.answer(
                    f"Siz allaqachon <b>{p.full_name}</b> nomi bilan ro'yxatdan o'tgansiz! ⚽\n\n"
                    "Profilingizni ko'rish uchun <b>👤 Profilim</b> tugmasini bosing.",
                    parse_mode="HTML",
                    reply_markup=get_registered_profile_menu()
                )
                return
    except Exception:
        pass

    default_name = message.from_user.full_name or "Futbolchi"
    await state.set_state(RegistrationState.full_name)
    name_kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text=default_name)],
            [KeyboardButton(text="❌ Bekor qilish")]
        ],
        resize_keyboard=True
    )
    await message.answer(
        "📝 <b>Profil yaratish — 1/4 bosqich:</b>\n\n"
        "Ism va familiyangizni yozing:\n"
        f"(Yoki pastdagi <b>'{default_name}'</b> tugmasini bosing)",
        parse_mode="HTML",
        reply_markup=name_kb
    )


@dp.message(RegistrationState.full_name)
async def process_name(message: types.Message, state: FSMContext):
    name = message.text.strip()
    await state.update_data(full_name=name)
    age_kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="15"), KeyboardButton(text="16"), KeyboardButton(text="17")],
            [KeyboardButton(text="18"), KeyboardButton(text="19"), KeyboardButton(text="20")],
            [KeyboardButton(text="❌ Bekor qilish")]
        ],
        resize_keyboard=True
    )
    await message.answer(
        f"Ajoyib, <b>{name}</b>! 👍\n\n"
        "2/4. Yoshingiz nechida? (Tugmalardan tanlang yoki yozing):",
        parse_mode="HTML",
        reply_markup=age_kb
    )
    await state.set_state(RegistrationState.age)


@dp.message(RegistrationState.age)
async def process_age(message: types.Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("Iltimos, yoshingizni faqat raqamlarda kiriting (masalan: 17):")
        return

    age_val = int(message.text)
    if age_val < 7 or age_val > 55:
        await message.answer("Iltimos, to'g'ri yoshingizni kiriting (7 dan 55 gacha):")
        return

    await state.update_data(age=age_val)
    city_kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Toshkent"), KeyboardButton(text="Samarqand")],
            [KeyboardButton(text="Farg'ona"), KeyboardButton(text="Andijon")],
            [KeyboardButton(text="Namangan"), KeyboardButton(text="Buxoro")],
            [KeyboardButton(text="❌ Bekor qilish")]
        ],
        resize_keyboard=True
    )
    await message.answer(
        "3/4. Qaysi shahar yoki viloyatdansiz? (Tanlang yoki yozing):",
        reply_markup=city_kb
    )
    await state.set_state(RegistrationState.city)


@dp.message(RegistrationState.city)
async def process_city(message: types.Message, state: FSMContext):
    await state.update_data(city=message.text.strip())
    await message.answer(
        "4/4. Qaysi pozitsiyada o'ynaysiz?",
        reply_markup=get_position_kb()
    )
    await state.set_state(RegistrationState.position)


@dp.message(RegistrationState.position)
async def process_position(message: types.Message, state: FSMContext):
    await state.update_data(position=message.text.strip())
    await message.answer(
        "Asosiy zarba oyog'ingiz qaysi?",
        reply_markup=get_foot_kb()
    )
    await state.set_state(RegistrationState.preferred_foot)


@dp.message(RegistrationState.preferred_foot)
async def process_foot(message: types.Message, state: FSMContext):
    foot = message.text.strip()
    await state.update_data(preferred_foot=foot)
    data = await state.get_data()

    full_name = data.get("full_name") or message.from_user.full_name or "Futbolchi"
    age = data.get("age", 18)
    city = data.get("city", "Toshkent")
    position = data.get("position", "Hujumchi")
    preferred_foot = foot

    # 1. Bevosita lokal DB ga saqlaymiz (0 millisekund, 100% kafolatli)
    try:
        from app.core.database import SessionLocal
        from app.models.models import Player
        with SessionLocal() as db:
            p = db.query(Player).filter(Player.telegram_id == message.from_user.id).first()
            if not p:
                p = Player(
                    telegram_id=message.from_user.id,
                    full_name=full_name,
                    age=age,
                    city=city,
                    position=position,
                    preferred_foot=preferred_foot,
                    goals_claimed=0,
                    goals_verified=0
                )
                db.add(p)
            else:
                p.full_name = full_name
                p.age = age
                p.city = city
                p.position = position
                p.preferred_foot = preferred_foot
            db.commit()
    except Exception as e:
        print(f"[Direct DB save in registration]: {e}")

    # 2. API ga ham jo'natamiz
    try:
        payload = {
            "telegram_id": message.from_user.id,
            "full_name": full_name,
            "phone": "",
            "age": age,
            "city": city,
            "position": position,
            "preferred_foot": preferred_foot,
            "goals_claimed": 0
        }
        async with httpx.AsyncClient(timeout=3) as client:
            await client.post(f"{API_BASE_URL}/players", json=payload, headers=BOT_HEADERS)
    except Exception:
        pass

    await state.clear()
    await message.answer(
        f"🎉 <b>Tabriklaymiz, {full_name}!</b>\n\n"
        "Profilingiz muvaffaqiyatli yaratildi va bazaga kiritildi! ⚽\n\n"
        f"🎯 <b>Pozitsiya:</b> {position}\n"
        f"📍 <b>Shahar:</b> {city}\n"
        f"👟 <b>Zarba oyog'i:</b> {preferred_foot}\n\n"
        "Endi gollaringiz videosini yuborib milliy reytingda ko'tarilishingiz mumkin!",
        parse_mode="HTML",
        reply_markup=get_main_menu()
    )


# --- PROFILNI KO'RISH ---

@dp.message(F.text.in_(["👤 Profilim", "/profil", "/profile", "Profilim"]), StateFilter("*"))
async def show_profile(message: types.Message, state: FSMContext):
    await state.clear()
    user = None
    # 1. Lokal DB dan bir zumda tekshirish (0 millisekund kechikish)
    try:
        from app.core.database import SessionLocal
        from app.models.models import Player
        with SessionLocal() as db:
            p = db.query(Player).filter(Player.telegram_id == message.from_user.id).first()
            if p:
                user = {
                    "full_name": p.full_name,
                    "age": p.age or "18",
                    "city": p.city or "Toshkent",
                    "position": p.position or "Hujumchi",
                    "preferred_foot": p.preferred_foot or "O'ng",
                    "goals_verified": p.goals_verified or 0,
                    "goals_claimed": p.goals_claimed or 0,
                    "rating": min(99, 82 + (p.goals_verified or 0) * 2)
                }
    except Exception as e:
        print(f"[Profile DB Error]: {e}")

    # 2. Agar lokal DB da topilmasa, API orqali tezkor tekshirish
    if not user:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                res = await client.get(f"{API_BASE_URL}/players?telegram_id={message.from_user.id}")
                if res.status_code == 200 and res.json():
                    p_data = res.json()[0]
                    user = {
                        "full_name": p_data.get("full_name"),
                        "age": p_data.get("age", "18"),
                        "city": p_data.get("city", "Toshkent"),
                        "position": p_data.get("position", "Hujumchi"),
                        "preferred_foot": p_data.get("preferred_foot", "O'ng"),
                        "goals_verified": p_data.get("goals_verified", 0),
                        "goals_claimed": p_data.get("goals_claimed", 0),
                        "rating": p_data.get("rating", 85)
                    }
        except Exception:
            pass

    if not user:
        login_url = f"{WEBAPP_URL}/login"
        register_url = f"{WEBAPP_URL}/register"
        ikb = InlineKeyboardMarkup(inline_keyboard=[
            [InlineKeyboardButton(text="🔐 Profilga kirish (Login)", web_app=WebAppInfo(url=login_url))],
            [InlineKeyboardButton(text="📝 Yangi profil yaratish", web_app=WebAppInfo(url=register_url))],
            [InlineKeyboardButton(text="⚡ Futuro Mini App (Bosh sahifa)", web_app=WebAppInfo(url=WEBAPP_URL))]
        ])
        await message.answer(
            f"Salom, <b>{message.from_user.full_name}</b>! 👋\n\n"
            "⚠️ <b>Profilingiz hali bazada mavjud emas yoki tizimga kirmagansiz.</b>\n\n"
            "• Agar profilingiz bo'lsa: <b>🔐 Profilga kirish</b> tugmasini bosing\n"
            "• Yangi profil ochish uchun: <b>📝 Profil yaratish</b> yoki bot orqali ro'yxatdan o'ting\n\n"
            "👇 <i>Pastdagi menyudan kerakli bo'limni tanlang:</i>",
            parse_mode="HTML",
            reply_markup=get_guest_profile_menu()
        )
        await message.answer(
            "👇 <b>Tezkor kirish yoki yangi profil yaratish:</b>",
            parse_mode="HTML",
            reply_markup=ikb
        )
        return

    profile_text = (
        f"📋 <b>Futbolchi Profili</b>\n\n"
        f"👤 <b>Ism:</b> {user['full_name']}\n"
        f"🎂 <b>Yosh:</b> {user['age']}\n"
        f"📍 <b>Shahar:</b> {user['city']}\n"
        f"⚡ <b>Pozitsiya:</b> {user['position']}\n"
        f"👟 <b>Zarba oyog'i:</b> {user['preferred_foot']}\n"
        f"🏆 <b>OVR Reyting:</b> {user.get('rating', 85)}\n\n"
        f"✅ <b>Tasdiqlangan gollar:</b> {user.get('goals_verified', 0)} ta\n"
        f"📊 <b>Kutilayotgan gollar:</b> {user.get('goals_claimed', 0)} ta\n\n"
        "👇 <i>Pastdagi menyudan foydalaning:</i>"
    )
    await message.answer(profile_text, parse_mode="HTML", reply_markup=get_registered_profile_menu())


# --- PROFILGA KIRISH (LOGIN) HANDLER ---

@dp.message(F.text.in_(["🔐 Profilga kirish", "Profilga kirish", "/login", "Kirish", "🔐 Profilga kirish (Web)"]), StateFilter("*"))
async def login_instruction_handler(message: types.Message, state: FSMContext):
    await state.clear()
    login_url = f"{WEBAPP_URL}/login"
    ikb = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="🔐 Futuro profiliga kirish (Mini App)", web_app=WebAppInfo(url=login_url))],
        [InlineKeyboardButton(text="🌐 Sayt orqali ochish", url=login_url)]
    ])
    await message.answer(
        "🔐 <b>Futuro Profiliga Kirish:</b>\n\n"
        "O'z profilingiz, statistikangiz va gollaringizni boshqarish uchun pastdagi tugmani bosing va tizimga kiring:\n\n"
        "<i>(Ism, familiyangiz va parolingiz orqali yoki Telegram orqali 1 ta bosishda tezkor kirishingiz mumkin)</i>",
        parse_mode="HTML",
        reply_markup=ikb
    )



# --- VIDEO YUBORISH JARAYONI ---

@dp.message(F.text.in_(["⚽ Gol videosini yuborish", "Gol videosini yuborish", "/gol", "/video"]), StateFilter("*"))
async def start_submit_goal(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer(
        "📹 <b>Gol yoki xavfli vaziyat aks etgan qisqa videoni yuboring:</b>\n"
        "(Video telegram orqali to'g'ridan-to'g'ri video formatida yuborilishi kerak)\n\n"
        "Bekor qilish uchun: pastdagi <b>❌ Bekor qilish</b> tugmasini bosing yoki /bekor deb yozing.",
        parse_mode="HTML",
        reply_markup=get_cancel_kb()
    )
    await state.set_state(SubmitGoalState.waiting_for_video)


@dp.message(SubmitGoalState.waiting_for_video, F.video)
async def process_video(message: types.Message, state: FSMContext):
    # Telegramdagi eng yaxshi usul: faylni o'zimizda saqlamaymiz, file_id saqlaymiz!
    file_id = message.video.file_id
    await state.update_data(video_url=file_id)

    caption_kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="O'tkazib yuborish")],
            [KeyboardButton(text="❌ Bekor qilish")]
        ],
        resize_keyboard=True
    )
    await message.answer(
        "Videoga qisqacha tavsif yozing (masalan: <i>'Mahalla ligasi chorak finali, jarima zarbasidan'</i>):\n"
        "Yoki <b>O'tkazib yuborish</b> tugmasini bosing.",
        parse_mode="HTML",
        reply_markup=caption_kb
    )
    await state.set_state(SubmitGoalState.waiting_for_caption)


# ⚡ ALOHIDA BEKOR: video kutish paytida /bekor yoki tugma bosilsa
@dp.message(SubmitGoalState.waiting_for_video, Command("bekor", "cancel"))
@dp.message(SubmitGoalState.waiting_for_video, F.text.casefold().in_(["bekor", "bekor qilish", "❌ bekor qilish", "orqaga", "menyu"]))
async def cancel_video_state(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("❌ Amal bekor qilindi.\n\n👇 Bosh menyudan kerakli bo'limni tanlang:", reply_markup=get_main_menu())


@dp.message(SubmitGoalState.waiting_for_video)
async def process_video_invalid(message: types.Message):
    await message.answer(
        "Iltimos, faqat <b>video fayl</b> yuboring!\n"
        "Bekor qilish uchun pastdagi <b>❌ Bekor qilish</b> tugmasini bosing.",
        parse_mode="HTML",
        reply_markup=get_cancel_kb()
    )


# ⚡ ALOHIDA BEKOR: caption kutish paytida
@dp.message(SubmitGoalState.waiting_for_caption, Command("bekor", "cancel"))
@dp.message(SubmitGoalState.waiting_for_caption, F.text.casefold().in_(["bekor", "bekor qilish", "❌ bekor qilish", "orqaga", "menyu"]))
async def cancel_caption_state(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("❌ Amal bekor qilindi.\n\n👇 Bosh menyudan kerakli bo'limni tanlang:", reply_markup=get_main_menu())


@dp.message(SubmitGoalState.waiting_for_caption)
async def process_caption(message: types.Message, state: FSMContext):
    desc = message.text.strip()
    if desc.lower() == "o'tkazib yuborish":
        desc = "Tavsif yo'q"

    data = await state.get_data()
    video_url = data.get("video_url")

    # Avval futbolchining API dagi ID sini olamiz
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/players?telegram_id={message.from_user.id}")
        players = res.json() if res.status_code == 200 else []
        current_player = players[0] if players else None

        if not current_player:
            await message.answer("Xatolik yuz berdi. Qaytadan /start bosing.", reply_markup=get_main_menu())
            await state.clear()
            return

        payload = {
            "video_url": video_url,
            "description": desc
        }
        headers = BOT_HEADERS
        submit_res = await client.post(
            f"{API_BASE_URL}/api/bot/players/{current_player['id']}/submit-goal",
            json=payload,
            headers=headers
        )

        if submit_res.status_code == 200:
            await message.answer(
                "✅ <b>Videongiz qabul qilindi va tekshiruvga yuborildi!</b>\n\n"
                "Moderatorlar videoni ko'rib chiqib tasdiqlagach, profilingizdagi "
                "<b>Tasdiqlangan gollar</b> soni oshadi.",
                parse_mode="HTML",
                reply_markup=get_main_menu()
            )
        else:
            await message.answer("Video yuklashda xatolik yuz berdi.", reply_markup=get_main_menu())

    await state.clear()


# --- TOP O'YINCHILAR REYTINGI ---

@dp.message(F.text.in_(["🏆 Reyting", "🏆 Reyting (Top o'yinchilar)", "Reyting", "/reyting", "/leaderboard"]), StateFilter("*"))
async def show_leaderboard(message: types.Message, state: FSMContext):
    await state.clear()
    players = []
    # 1. Lokal DB dan bir zumda olish (0 ms)
    try:
        from app.core.database import SessionLocal
        from app.models.models import Player
        with SessionLocal() as db:
            db_players = db.query(Player).all()
            players = [
                {
                    "full_name": p.full_name,
                    "city": p.city,
                    "goals_verified": p.goals_verified or 0
                }
                for p in db_players
            ]
    except Exception:
        players = []

    if not players:
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                res = await client.get(f"{API_BASE_URL}/players")
                if res.status_code == 200:
                    players = res.json()
        except Exception:
            pass

    # Tasdiqlangan gollar bo'yicha saralash
    sorted_players = sorted(players, key=lambda x: x.get("goals_verified", 0), reverse=True)[:10]

    if not sorted_players:
        await message.answer(
            "🏆 <b>Futuro Milliy Reytingi</b>\n\n"
            "Platforma yangi boshlanmoqda. Birinchi bo'lib gol videongizni yuboring va reytingning 1-o'rniga chiqing!",
            parse_mode="HTML",
            reply_markup=get_main_menu()
        )
        return

    text = "🏆 <b>Eng ko'p tasdiqlangan gol urganlar TOP-10:</b>\n\n"
    for i, p in enumerate(sorted_players, 1):
        medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
        text += f"{medal} <b>{p['full_name']}</b> ({p.get('city') or 'Nomaʼlum'}) — <b>{p.get('goals_verified', 0)} ta gol</b>\n"

    await message.answer(text, parse_mode="HTML", reply_markup=get_main_menu())


# ==============================================================
# P2P VIRTUAL XONANI TARK ETISH
# ==============================================================
# ==============================================================
# FIKR-MULOHAZA: /fikr
# ==============================================================
class FeedbackState(StatesGroup):
    waiting_text = State()


@dp.message(F.text.in_(["💬 Fikr / Muammo bildirish", "Fikr / Muammo bildirish", "/fikr", "/muammo", "/shikoyat"]), StateFilter("*"))
@dp.message(Command("fikr"), StateFilter("*"))
@dp.message(Command("muammo"), StateFilter("*"))
@dp.message(Command("shikoyat"), StateFilter("*"))
async def feedback_start(message: types.Message, state: FSMContext):
    await state.clear()
    await state.set_state(FeedbackState.waiting_text)
    await message.answer(
        "💬 <b>Fikr, taklif yoki muammo bildirish:</b>\n\n"
        "Platformada qanday muammo yoki xatolik ko'rdingiz? Nimani to'g'irlashimiz yoki qo'shishimiz kerak?\n\n"
        "📝 <i>Fikringizni matn ko'rinishida yozing yoki to'g'ridan-to'g'ri skrinshot (rasm) qilib yuboring!</i>\n\n"
        "Bekor qilish uchun: pastdagi <b>❌ Bekor qilish</b> tugmasini bosing yoki /bekor deb yozing.",
        parse_mode="HTML",
        reply_markup=get_cancel_kb()
    )


@dp.message(FeedbackState.waiting_text, Command("bekor"))
async def feedback_cancel(message: types.Message, state: FSMContext):
    await state.clear()
    await message.answer("Bekor qilindi.", reply_markup=get_main_menu())


async def _persist_bot_feedback(text: str, user_id: int) -> None:
    """Botdan kelgan fikrni bazaga to'g'ridan-to'g'ri saqlaydi; aks holda API orqali urinib ko'radi."""
    saved = False
    try:
        from app.core.database import SessionLocal
        from app.models.models import Feedback, User

        def _save_sync():
            with SessionLocal() as db:
                linked_user = db.query(User).filter(User.telegram_id == user_id).first()
                fb = Feedback(
                    text=text.strip(),
                    page="telegram_bot",
                    source="telegram",
                    user_id=linked_user.id if linked_user else None,
                    telegram_id=user_id,
                )
                db.add(fb)
                db.commit()

        await asyncio.to_thread(_save_sync)
        saved = True
    except Exception as db_err:
        print(f"Bot feedback DB save fallback notice: {db_err}")

    if not saved and BOT_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(
                    f"{API_BASE_URL}/api/bot/feedback",
                    json={"text": text.strip(), "telegram_id": user_id},
                    headers=BOT_HEADERS,
                )
        except Exception as api_err:
            print(f"Bot feedback API error: {api_err}")


@dp.message(FeedbackState.waiting_text, F.photo)
async def feedback_receive_photo(message: types.Message, state: FSMContext):
    caption = message.caption or "Rasm / Skrinshot orqali muammo yuborildi"
    user_id = message.from_user.id
    user_name = message.from_user.full_name
    username = f"@{message.from_user.username}" if message.from_user.username else "username yo'q"
    photo_id = message.photo[-1].file_id

    # 1. Adminga to'g'ridan-to'g'ri Telegramdan skrinshotni yuboramiz
    target_admin = ADMIN_TELEGRAM_ID or "8692713738"
    try:
        await bot.send_photo(
            target_admin,
            photo=photo_id,
            caption=(
                f"📸 <b>BOTDAN YANGI SKRINSHOT / MUAMMO KELDI!</b>\n\n"
                f"👤 <b>Kimdan:</b> {user_name} ({username})\n"
                f"🆔 <b>Telegram ID:</b> <code>{user_id}</code>\n"
                f"📝 <b>Izoh / Muammo:</b>\n<i>{caption}</i>"
            ),
            parse_mode="HTML"
        )
    except Exception as e:
        print(f"Admin photo alert error: {e}")

    # 2. Bazaga / API ga saqlaymiz (BOT_API_KEY bo'lmasa ham ishlaydi)
    await _persist_bot_feedback(f"[Skrinshot/Rasm]: {caption}", user_id)

    await state.clear()
    await message.answer(
        "✅ <b>Katta rahmat!</b>\n\n"
        "Skrinshot va xabaringiz to'g'ridan-to'g'ri platforma rahbariga yetkazildi. Tez orada ko'rib chiqiladi!",
        parse_mode="HTML",
        reply_markup=get_main_menu()
    )


@dp.message(FeedbackState.waiting_text, F.text)
async def feedback_receive(message: types.Message, state: FSMContext):
    text = (message.text or "").strip()
    if text.lower() in ["/start", "/start@futbol_platormabot"]:
        await start_handler(message, state)
        return
    if text.startswith("/"):
        await message.answer("Fikringizni oddiy matn ko'rinishida yozing yoki /bekor ni bosing.")
        return
    if len(text) < 3:
        await message.answer("Fikr kamida 3 ta belgidan iborat bo'lishi kerak. Qayta yozing yoki /bekor.")
        return

    user_id = message.from_user.id
    user_name = message.from_user.full_name
    username = f"@{message.from_user.username}" if message.from_user.username else "username yo'q"

    # 1. Adminga to'g'ridan-to'g'ri Telegramdan xabar yuboramiz
    target_admin = ADMIN_TELEGRAM_ID or "8692713738"
    try:
        await bot.send_message(
            target_admin,
            f"📬 <b>BOTDAN YANGI FIKR / MUAMMO KELDI!</b>\n\n"
            f"👤 <b>Kimdan:</b> {user_name} ({username})\n"
            f"🆔 <b>Telegram ID:</b> <code>{user_id}</code>\n\n"
            f"📝 <b>Matn:</b>\n<i>{text}</i>",
            parse_mode="HTML"
        )
    except Exception as e:
        print(f"Admin alert error: {e}")

    # 2. Bazaga / API ga saqlaymiz
    await _persist_bot_feedback(text, user_id)

    await state.clear()
    await message.answer(
        "✅ <b>Rahmat! Fikr-mulohazangiz qabul qilindi.</b>\n"
        "Xabaringiz to'g'ridan-to'g'ri platforma rahbariga yetkazildi!",
        parse_mode="HTML",
        reply_markup=get_main_menu()
    )


@dp.message(FeedbackState.waiting_text)
async def feedback_wrong_type(message: types.Message):
    await message.answer("Iltimos, matn yoki rasm/skrinshot yuboring yoki /bekor ni bosing.")


@dp.message(Command("leave_room"))
async def leave_room_handler(message: types.Message):
    user_id = message.from_user.id
    closed = close_virtual_room(user_id)
    if closed:
        peer_id = closed["user2"] if closed["user1"] == user_id else closed["user1"]
        await message.answer("🚪 Siz virtual xonani tark etdingiz. Suhbat yakunlandi.", reply_markup=get_main_menu())
        try:
            await bot.send_message(peer_id, "🚪 Suhbatdoshingiz xonani tark etdi. Virtual xona yopildi.", reply_markup=get_main_menu())
        except Exception:
            pass
    else:
        await message.answer("Siz hozirda hech qanday virtual xonada emassiz.")


# ==============================================================
# VIRTUAL XONAGA TAKLIFNI QABUL / RAD ETISH CALLBACKLARI
# ==============================================================
@dp.callback_query(F.data.startswith("accept_room:"))
async def accept_room_callback(query: types.CallbackQuery):
    parts = query.data.split(":")
    requester_id = int(parts[1])
    requester_name = parts[2]
    target_id = query.from_user.id
    target_name = query.from_user.full_name

    create_virtual_room(requester_id, requester_name, target_id, target_name)
    await query.message.edit_text(
        f"🟢 <b>Virtual Xona faollashdi!</b>\n\n"
        f"Siz hozir <b>{requester_name}</b> bilan maxfiy suhbatdasiz. Yozgan xabarlaringiz bot orqali uzatiladi.\n"
        f"Xonadan chiqish uchun istalgan vaqt /leave_room buyrug'ini yuboring.",
        parse_mode="HTML"
    )

    try:
        await bot.send_message(
            requester_id,
            f"🟢 <b>{target_name} taklifingizni qabul qildi!</b>\n\n"
            f"Virtual Xona ochildi. Endi bot orqali xabar yozishingiz mumkin. "
            f"Chiqish uchun: /leave_room",
            parse_mode="HTML"
        )
    except Exception:
        pass
    await query.answer()


@dp.callback_query(F.data.startswith("reject_room:"))
async def reject_room_callback(query: types.CallbackQuery):
    requester_id = int(query.data.split(":")[1])
    await query.message.edit_text("❌ Xonaga kirish taklifi rad etildi.")
    try:
        await bot.send_message(
            requester_id,
            "ℹ️ O'yinchi hozirda suhbatlashish imkoniga ega emasligini bildirdi (Taklif rad etildi)."
        )
    except Exception:
        pass
    await query.answer()


# ==============================================================
# CONTINUOUS LEARNING: ADMIN REPLY HANDLER (HUMAN-IN-THE-LOOP)
# ==============================================================
@dp.message(F.reply_to_message)
async def admin_reply_feedback_handler(message: types.Message):
    if not ADMIN_TELEGRAM_ID or str(message.from_user.id) != str(ADMIN_TELEGRAM_ID):
        return

    reply_to_id = message.reply_to_message.message_id
    pending = resolve_pending_question(reply_to_id)
    if pending:
        target_user_id = pending["user_id"]
        target_user_name = pending["user_name"]
        orig_question = pending["question"]
        admin_answer = message.text.strip()

        # 1. Foydalanuvchiga admin javobini yetkazish
        try:
            await bot.send_message(
                target_user_id,
                f"💬 <b>Loyiha rahbari savolingizga javob berdi:</b>\n\n"
                f"❓ <i>Savolingiz:</i> {orig_question}\n\n"
                f"✅ <b>Javob:</b>\n{admin_answer}",
                parse_mode="HTML"
            )
        except Exception as e:
            await message.reply(f"⚠️ Foydalanuvchiga yuborishda xatolik: {e}")

        # 2. Abdulbosit agenti: Obsidian FAQ bazasiga o'rganish sifatida qo'shish
        save_to_knowledge_base(orig_question, admin_answer)

        await message.reply(
            f"🎉 <b>Muvaffaqiyatli!</b>\n\n"
            f"1. Javob <b>{target_user_name}</b> ga yetkazildi.\n"
            f"2. <b>Agent Abdulbosit:</b> Savol-javob <code>docs/obsidian_sync/Bilimlar_Bazasi_FAQ.md</code> bazasiga saqlandi! "
            f"Endi bot xuddi shu yoki o'xshash savol berilganda mustaqil javob bera oladi (Continuous Learning).",
            parse_mode="HTML"
        )


# ==============================================================
# AGENT RUSTAM & AUTONOMOUS ADAPTIVE CONCIERGE (MAHORAGA ENGINE)
# ==============================================================
@dp.message(F.text)
async def adaptive_ai_handler(message: types.Message, state: FSMContext):
    user_id = message.from_user.id
    user_name = message.from_user.full_name
    username = f"@{message.from_user.username}" if message.from_user.username else user_name
    text = message.text.strip()

    # 1. Agar foydalanuvchi faol P2P Virtual Xonada bo'lsa - xabarni suhbatdoshiga uzatamiz!
    peer_id, peer_name = get_room_peer(user_id)
    if peer_id:
        try:
            await bot.send_message(
                peer_id,
                f"💬 <b>{user_name}:</b>\n{text}",
                parse_mode="HTML"
            )
        except Exception:
            await message.answer("⚠️ Suhbatdoshga xabar yetib bormadi (u botni bloklagan bo'lishi mumkin).")
        return

    # 2. Rustam agenti xabarning niyatini (Intent) tahlil qiladi
    intent = classify_intent(text)

    # 1. Professional futbolchi bo'lish, kelajak va skautlar
    if intent == INTENT_BECOME_PRO:
        reply = get_become_pro_response(user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 2. Ajablanish, ishonchsizlik va qiziqish ("yoge", "rostdanmi")
    elif intent == INTENT_SURPRISE_SKEPTICISM:
        reply = get_surprise_skepticism_response(user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 3. Skautlar, klublar va kimlar ko'rishi
    elif intent == INTENT_SCOUTS_INFO:
        reply = get_scouts_info_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 4. Narx, to'lov va bepullik
    elif intent == INTENT_PRICING_FREE:
        reply = get_pricing_free_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 5. Gol videosi talablari va qoidalari
    elif intent == INTENT_VIDEO_GUIDE:
        reply = get_video_guide_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 6. Yosh chegaralari va toifalar
    elif intent == INTENT_AGE_LIMIT:
        reply = get_age_limit_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 7. Viloyatlar va shaharlar
    elif intent == INTENT_LOCATION_INFO:
        reply = get_location_info_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 8. Futbol mashg'ulotlari va mahorat oshirish
    elif intent == INTENT_TRAINING_ADVICE:
        reply = get_training_advice_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 9. Do'stona kichik muloqot va replikalar
    elif intent == INTENT_CASUAL_CHAT:
        reply = get_casual_chat_response(text, user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 10. Xayrlashuv va yaxshi tilaklar
    elif intent == INTENT_FAREWELL:
        reply = get_farewell_response(user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 11. Minnatdorchilik va tasanno
    elif intent == INTENT_GRATITUDE:
        reply = get_gratitude_response(user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 12. Agentlar jamoasi va kim mas'ulligi
    elif intent == INTENT_AGENTS_INFO:
        reply = get_agents_info_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 13. Salomlashish, start va umumiy kirish
    elif intent == INTENT_GREETING:
        reply = get_greeting_response(user_name)
        await message.answer(reply, parse_mode="HTML")
        return

    # 14. Loyiha egasi va rahbar haqida
    elif intent == INTENT_OWNER_INFO:
        reply = get_owner_info_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 15. Javob berish tezligi
    elif intent == INTENT_RESPONSE_TIME:
        reply = get_response_time_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 16. Boshqa o'yinchilar va jamiyat
    elif intent == INTENT_COMMUNITY_PLAYERS:
        reply = get_community_players_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 17. Reyting va OVR qoidalari
    elif intent == INTENT_RATING_INFO:
        reply = get_rating_info_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 18. Bot yordam va yo'riqnoma
    elif intent == INTENT_HELP:
        reply = get_help_response()
        await message.answer(reply, parse_mode="HTML")
        return

    # 19. Jamoa tarkibi va 10-13 kishi qoidalari
    elif intent == INTENT_TEAM_RULES:
        reply = get_team_rules_response(text)
        await message.answer(reply, parse_mode="HTML")
        return

    # 20. Turnirlar grafigi va holati (Boshlanganmi yoki yangimi)
    elif intent == INTENT_TOURNAMENT:
        reply = await get_tournament_status_response(API_BASE_URL)
        await message.answer(reply, parse_mode="HTML")
        return

    # 21. Falonchi o'yinchi bilan ko'rishish / bog'lanish / topish
    elif intent == INTENT_CONNECT_PLAYER:
        await message.answer(
            "🧠 <b>Agent Rustam tahlili:</b>\n"
            "Sizning o'yinchi bilan bog'lanish bo'yicha so'rovingiz qabul qilindi. "
            "Ma'lumotlar bazasidan o'yinchi profili tekshirilmoqda...",
            parse_mode="HTML"
        )

        clean_text = text.lower()
        stopwords = ["bilan", "ko'rishib", "gaplashmoqchiman", "gaplashmoqchidim", "bog'lana", "olmayapman", "aloqa", "topib", "bering", "salom", "iltimos"]
        words = [w for w in text.split() if w.lower() not in stopwords and len(w) > 2]
        query_player = " ".join(words) if words else text

        player = await search_player_by_name(API_BASE_URL, query_player)
        if player and player.get("telegram_id"):
            target_tg_id = player["telegram_id"]
            player_full_name = player.get("full_name", "Futbolchi")

            invite_kb = InlineKeyboardMarkup(inline_keyboard=[
                [
                    InlineKeyboardButton(text="✅ Roziman, xonaga kirish", callback_data=f"accept_room:{user_id}:{user_name[:15]}"),
                    InlineKeyboardButton(text="❌ Rad etish", callback_data=f"reject_room:{user_id}")
                ]
            ])

            try:
                await bot.send_message(
                    target_tg_id,
                    f"⚡️ <b>Hurmatli {player_full_name}!</b>\n\n"
                    f"Siz bilan <b>{user_name}</b> ({username}) maxsus virtual xonada bog'lanmoqchi va suhbatlashishni so'ramoqda.\n\n"
                    f"<i>Suhbatga rozimisiz? Ikkala tomon uchun ham shaxsiy raqamlar sir saqlanadi.</i>",
                    parse_mode="HTML",
                    reply_markup=invite_kb
                )
                await message.answer(
                    f"🎯 <b>{player_full_name}</b> muvaffaqiyatli topildi!\n"
                    f"Unga maxsus virtual xonaga taklifnoma yuborildi. U tasdiqlashi bilan "
                    f"ikkalangiz uchun bot ichida anonim suhbat xonasi ochiladi.",
                    parse_mode="HTML"
                )
            except Exception:
                await message.answer(
                    f"🎯 <b>{player_full_name}</b> topildi, lekin u hali botni faollashtirmagan. "
                    f"Murojaatingiz ma'murlar e'tiboriga yetkazildi!",
                    parse_mode="HTML"
                )
        else:
            await message.answer(
                "🔍 <b>Rustam Agent xulosasi:</b>\n"
                "Siz so'ragan futbolchi profil bo'yicha qidirildi. "
                "Hozirda u bilan to'g'ridan-to'g'ri bog'lanish uchun so'rov tizimga kiritildi. "
                "Shuningdek, ushbu murojaat platforma rahbariga yetkazildi!",
                parse_mode="HTML"
            )

        if ADMIN_TELEGRAM_ID:
            try:
                await bot.send_message(
                    ADMIN_TELEGRAM_ID,
                    f"🤝 <b>Yangi Aloqa So'rovi (Matchmaking):</b>\n"
                    f"Kimdan: {user_name} ({username})\n"
                    f"So'rov matni: {text}",
                    parse_mode="HTML"
                )
            except Exception:
                pass
        return

    # D) Muhim shaxsiy masala / shikoyat / pul
    elif intent == INTENT_ADMIN_ALERT:
        if ADMIN_TELEGRAM_ID:
            try:
                await bot.send_message(
                    ADMIN_TELEGRAM_ID,
                    f"🚨 <b>MUHIM SHAXSIY MUROJAAT:</b>\n\n"
                    f"👤 <b>Foydalanuvchi:</b> {user_name} ({username})\n"
                    f"🆔 <b>ID:</b> <code>{user_id}</code>\n"
                    f"📝 <b>Murojaat matni:</b>\n<i>{text}</i>",
                    parse_mode="HTML"
                )
            except Exception as e:
                print(f"Admin alert error: {e}")

        await message.answer(
            "⚡️ <b>Agent Rustam (Boshqaruvchi):</b>\n\n"
            "Sizning murojaatingiz <b>yuqori ustuvorlikdagi shaxsiy masala</b> sifatida qayd etildi va "
            "to'g'ridan-to'g'ri platforma rahbariyatiga yetkazildi. "
            "Tez orada siz bilan shaxsan aloqaga chiqiladi.",
            parse_mode="HTML"
        )
        return

    # E) SOS Matchmaker: Odam yetmayapti / O'yinchi qidirish
    elif intent == INTENT_MATCHMAKER_SOS:
        reply = await get_sos_callouts_response(API_BASE_URL)
        await message.answer(reply, parse_mode="HTML")
        return

    # F) AI Pre-Match: Kim yutadi / Ehtimollik tahlili
    elif intent == INTENT_PREMATCH_AI:
        reply = await get_prematch_ai_response(API_BASE_URL, text)
        await message.answer(reply, parse_mode="HTML")
        return

    # G) Noma'lum / Erkin so'rovlar: Obsidian RAG -> Mahoraga Avtonom Javob
    else:
        # 1-qadam: Obsidian Bilimlar Bazasidan qidiramiz (FAQ)
        rag_result = search_obsidian_knowledge_base(text)
        if rag_result:
            answer_content, source_file = rag_result
            await message.answer(
                f"🧠 <b>Bilimlar Bazasi (Agent Abdulbosit):</b>\n\n"
                f"{answer_content}\n\n"
                f"📚 <i>Manba: Obsidian/{source_file}</i>",
                parse_mode="HTML"
            )
            return

        # 2-qadam: Mahoraga adaptiv intellekti mustaqil javob beradi!
        reply = get_mahoraga_general_response(text, user_name)
        await message.answer(reply, parse_mode="HTML")
        return


async def main():
    if not IS_REAL_TOKEN:
        print("[Telegram Bot] Haqiqiy BOT_TOKEN kiritilmagan. Bot sokin kutish rejimida (Graceful Idle).")
        print("[Eslatma] Botni ishga tushirish uchun .env fayliga BOT_TOKEN=<tokeningiz> ni yozing.")
        print("[Tizim] Platformaning qolgan barcha qismlari (Backend, Frontend) xatosiz ishlashda davom etmoqda.")
        while True:
            await asyncio.sleep(3600)
        return

    print("[Telegram Bot] Muvaffaqiyatli ishga tushdi...")
    try:
        await bot.delete_webhook(drop_pending_updates=False)
        await bot.set_chat_menu_button(
            menu_button=MenuButtonWebApp(text="Ilova", web_app=WebAppInfo(url=WEBAPP_URL))
        )
        print("Telegram Chat Menu tugmasi (Mini App) sozlandi!")
    except Exception as e:
        print(f"Chat Menu sozlashda ogohlantirish: {e}")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())