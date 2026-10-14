import asyncio
import logging
from aiogram import Bot, Dispatcher, F, types
from aiogram.filters import CommandStart, Command
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

load_dotenv()

logging.basicConfig(level=logging.INFO)

RAW_BOT_TOKEN = os.getenv("BOT_TOKEN", "").strip()
# Aiogram validatsiyasi uchun to'g'ri formatli zaxira token:
BOT_TOKEN = RAW_BOT_TOKEN if (RAW_BOT_TOKEN and ":" in RAW_BOT_TOKEN) else "1234567890:AAH_DUMMY_TOKEN_PLEASE_REPLACE"
# Jonli Railway API manzili:
API_BASE_URL = os.getenv("API_BASE_URL", "https://web-production-dc0f4.up.railway.app")
# Jonli Vercel Mini App manzili:
WEBAPP_URL = os.getenv("WEBAPP_URL", "https://futbol-platformasi-alpha.vercel.app")
# Admin Telegram ID (muhim shaxsiy xabarlar uchun):
ADMIN_TELEGRAM_ID = os.getenv("ADMIN_TELEGRAM_ID", "")

from ai_concierge import (
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
    get_sos_callouts_response,
    get_prematch_ai_response,
    INTENT_GENERAL
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
        [InlineKeyboardButton(text="⚡ FootballRise Mini App (Ilovani ochish)", web_app=WebAppInfo(url=WEBAPP_URL))]
    ])

def get_main_menu():
    kb = [
        [KeyboardButton(text="📱 FootballRise Ilovasi (Mini App)", web_app=WebAppInfo(url=WEBAPP_URL))],
        [KeyboardButton(text="👤 Profilim"), KeyboardButton(text="⚽ Gol videosini yuborish")],
        [KeyboardButton(text="🏆 Reyting (Top o'yinchilar)")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True)


def get_position_kb():
    kb = [
        [KeyboardButton(text="Hujumchi"), KeyboardButton(text="Yarim himoyachi")],
        [KeyboardButton(text="Himoyachi"), KeyboardButton(text="Darvozabon")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)


def get_foot_kb():
    kb = [
        [KeyboardButton(text="O'ng"), KeyboardButton(text="Chap"), KeyboardButton(text="Har ikkisi")]
    ]
    return ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)


# --- /start HANDLER ---

@dp.message(CommandStart())
async def start_handler(message: types.Message, state: FSMContext):
    user_id = message.from_user.id

    # API dan o'yinchini tekshiramiz
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_BASE_URL}/players")
            players = res.json() if res.status_code == 200 else []
            # telegram_id orqali qidiramiz
            current_player = next((p for p in players if p.get("telegram_id") == user_id), None)
        except Exception as e:
            await message.answer("⚠️ Server bilan aloqa o'rnatib bo'lmadi. Keyinroq urinib ko'ring.")
            return

    if current_player:
        await message.answer(
            f"Salom, {current_player['full_name']}! 👋\n\n"
            "FootballRise platformasiga xush kelibsiz. Quyidagi tugma orqali ilovani to'g'ridan-to'g'ri Telegram ichida ochishingiz mumkin:",
            reply_markup=get_webapp_inline_kb()
        )
        await message.answer("Yoki bot menyusidan foydalaning:", reply_markup=get_main_menu())
    else:
        # Auto-Sync: Ism va familiyani avtomatik olamiz
        full_name = message.from_user.full_name
        await state.update_data(full_name=full_name)
        
        await message.answer(
            f"Assalomu alaykum, {full_name}! ⚽\n\n"
            "FootballRise platformasiga xush kelibsiz. Ilovani Telegram ichida to'g'ridan-to'g'ri ochishingiz mumkin:",
            reply_markup=get_webapp_inline_kb()
        )

        kb = [[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]]
        markup = ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

        await message.answer(
            "Yoki bot orqali profil yaratish uchun telefon raqamingizni tasdiqlang:",
            reply_markup=markup
        )
        await state.set_state(RegistrationState.phone)

# --- RO'YXATDAN O'TISH BOSQICHLARI ---

@dp.message(RegistrationState.phone, F.contact)
async def process_phone(message: types.Message, state: FSMContext):
    phone = message.contact.phone_number
    await state.update_data(phone=phone)
    await message.answer("Yoshingizni kiriting (faqat raqam, masalan: 17):", reply_markup=ReplyKeyboardRemove())
    await state.set_state(RegistrationState.age)

@dp.message(RegistrationState.phone)
async def process_phone_invalid(message: types.Message):
    await message.answer("Iltimos, pastdagi '📱 Telefon raqamni yuborish' tugmasini bosing.")

@dp.message(RegistrationState.full_name)
async def process_name(message: types.Message, state: FSMContext):
    await state.update_data(full_name=message.text.strip())
    await message.answer("Yoshingizni kiriting (faqat raqam, masalan: 17):")
    await state.set_state(RegistrationState.age)


@dp.message(RegistrationState.age)
async def process_age(message: types.Message, state: FSMContext):
    if not message.text.isdigit():
        await message.answer("Iltimos, yoshingizni faqat raqamlarda kiriting:")
        return

    await state.update_data(age=int(message.text))
    await message.answer("Qaysi shahar yoki viloyatdansiz? (Masalan: Toshkent yoki Qo'qon):")
    await state.set_state(RegistrationState.city)


@dp.message(RegistrationState.city)
async def process_city(message: types.Message, state: FSMContext):
    await state.update_data(city=message.text.strip())
    await message.answer("Qaysi pozitsiyada o'ynaysiz?", reply_markup=get_position_kb())
    await state.set_state(RegistrationState.position)


@dp.message(RegistrationState.position)
async def process_position(message: types.Message, state: FSMContext):
    await state.update_data(position=message.text.strip())
    await message.answer("Asosiy zarba oyog'ingiz qaysi?", reply_markup=get_foot_kb())
    await state.set_state(RegistrationState.preferred_foot)


@dp.message(RegistrationState.preferred_foot)
async def process_foot(message: types.Message, state: FSMContext):
    await state.update_data(preferred_foot=message.text.strip())
    data = await state.get_data()

    payload = {
        "telegram_id": message.from_user.id,
        "full_name": data.get("full_name", message.from_user.full_name),
        "phone": data.get("phone", ""),
        "age": data["age"],
        "city": data["city"],
        "position": data["position"],
        "preferred_foot": data["preferred_foot"],
        "goals_claimed": 0
    }

    # API ga yuboramiz
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(f"{API_BASE_URL}/players", json=payload)
            if res.status_code == 200:
                await message.answer(
                    "🎉 Profilingiz muvaffaqiyatli yaratildi!\n"
                    "Endi gollaringiz videosini yuborishingiz mumkin.",
                    reply_markup=get_main_menu()
                )
            else:
                await message.answer("Xatolik yuz berdi. Iltimos qaytadan /start bosing.")
        except Exception:
            await message.answer("Serverda xatolik yuz berdi. Backend ishlayotganiga ishonch hosil qiling.")

    await state.clear()


# --- PROFILNI KO'RISH ---

@dp.message(F.text == "👤 Profilim")
async def show_profile(message: types.Message):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_BASE_URL}/players")
            players = res.json()
            user = next((p for p in players if p.get("telegram_id") == message.from_user.id), None)
        except Exception:
            await message.answer("Ma'lumotlarni yuklab bo'lmadi.")
            return

    if not user:
        await message.answer("Profilingiz topilmadi. /start buyrug'ini bosing.")
        return

    profile_text = (
        f"📋 <b>Futbolchi Profili</b>\n\n"
        f"👤 <b>Ism:</b> {user['full_name']}\n"
        f"🎂 <b>Yosh:</b> {user['age']}\n"
        f"📍 <b>Shahar:</b> {user['city']}\n"
        f"⚡ <b>Pozitsiya:</b> {user['position']}\n"
        f"👟 <b>Zarba oyog'i:</b> {user['preferred_foot']}\n\n"
        f"✅ <b>Tasdiqlangan gollar:</b> {user['goals_verified']} ta\n"
        f"📊 <b>Umumiy aytilgan gollar:</b> {user['goals_claimed']} ta"
    )
    await message.answer(profile_text, parse_mode="HTML")


# --- VIDEO YUBORISH JARAYONI ---

@dp.message(F.text == "⚽ Gol videosini yuborish")
async def start_submit_goal(message: types.Message, state: FSMContext):
    await message.answer(
        "📹 <b>Gol yoki xavfli vaziyat aks etgan qisqa videoni yuboring:</b>\n"
        "(Video telegram orqali to'g'ridan-to'g'ri video formatida yuborilishi kerak)",
        parse_mode="HTML",
        reply_markup=ReplyKeyboardRemove()
    )
    await state.set_state(SubmitGoalState.waiting_for_video)


@dp.message(SubmitGoalState.waiting_for_video, F.video)
async def process_video(message: types.Message, state: FSMContext):
    # Telegramdagi eng yaxshi usul: faylni o'zimizda saqlamaymiz, file_id saqlaymiz!
    file_id = message.video.file_id
    await state.update_data(video_url=file_id)

    await message.answer(
        "Videoga qisqacha tavsif yozing (masalan: <i>'Mahalla ligasi chorak finali, jarima zarbasidan'</i>):\n"
        "Yoki <b>O'tkazib yuborish</b> deb yozing.",
        parse_mode="HTML"
    )
    await state.set_state(SubmitGoalState.waiting_for_caption)


@dp.message(SubmitGoalState.waiting_for_video)
async def process_video_invalid(message: types.Message):
    await message.answer("Iltimos, faqat <b>video fayl</b> yuboring!", parse_mode="HTML")


@dp.message(SubmitGoalState.waiting_for_caption)
async def process_caption(message: types.Message, state: FSMContext):
    desc = message.text.strip()
    if desc.lower() == "o'tkazib yuborish":
        desc = "Tavsif yo'q"

    data = await state.get_data()
    video_url = data.get("video_url")

    # Avval futbolchining API dagi ID sini olamiz
    async with httpx.AsyncClient() as client:
        res = await client.get(f"{API_BASE_URL}/players")
        players = res.json()
        current_player = next((p for p in players if p.get("telegram_id") == message.from_user.id), None)

        if not current_player:
            await message.answer("Xatolik yuz berdi. Qaytadan /start bosing.", reply_markup=get_main_menu())
            await state.clear()
            return

        payload = {
            "video_url": video_url,
            "description": desc
        }
        submit_res = await client.post(
            f"{API_BASE_URL}/players/{current_player['id']}/submit-goal",
            json=payload
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

@dp.message(F.text == "🏆 Reyting (Top o'yinchilar)")
async def show_leaderboard(message: types.Message):
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{API_BASE_URL}/players")
            players = res.json()
        except Exception:
            await message.answer("Reytingni yuklab bo'lmadi.")
            return

    # Tasdiqlangan gollar bo'yicha saralash
    sorted_players = sorted(players, key=lambda x: x.get("goals_verified", 0), reverse=True)[:10]

    if not sorted_players:
        await message.answer("Platforma test jarayonida  ma'lum vaqtdan keyin futbolchialar reytingi yangilanib boradi")
        return

    text = "🏆 <b>Eng ko'p tasdiqlangan gol urganlar TOP-10:</b>\n\n"
    for i, p in enumerate(sorted_players, 1):
        medal = "🥇" if i == 1 else "🥈" if i == 2 else "🥉" if i == 3 else f"{i}."
        text += f"{medal} <b>{p['full_name']}</b> ({p['city'] or 'Nomaʼlum'}) — <b>{p['goals_verified']} ta gol</b>\n"

    await message.answer(text, parse_mode="HTML")


# ==============================================================
# P2P VIRTUAL XONANI TARK ETISH
# ==============================================================
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

    # A) Jamoa tarkibi va 10-13 kishi qoidalari
    if intent == INTENT_TEAM_RULES:
        reply = get_team_rules_response(text)
        await message.answer(reply, parse_mode="HTML")
        return

    # B) Turnirlar grafigi va holati (Boshlanganmi yoki yangimi)
    elif intent == INTENT_TOURNAMENT:
        reply = await get_tournament_status_response(API_BASE_URL)
        await message.answer(reply, parse_mode="HTML")
        return

    # C) Falonchi o'yinchi bilan ko'rishish / bog'lanish / topish
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

    # G) Boshqa noma'lum / noodatiy savollar (RAG -> Human-in-the-Loop)
    else:
        # 1-qadam: Obsidian Bilimlar Bazasidan qidiramiz (RAG)
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

        # 2-qadam: Agar bazada ham topilmasa — Mahoraga Human-in-the-Loop (Adminga yuborish)
        await message.answer(
            "🤔 <b>Juda qiziq va noodatiy savol bo'ldi!</b>\n\n"
            "Bu savol bo'yicha eng aniq ma'lumotni olish uchun uni to'g'ridan-to'g'ri loyiha rahbariga (Adminga) yo'naltirdim. "
            "Rahbarimiz javob yozishi bilan sizga shu yerning o'zida yetkazaman va kelgusi safar uchun tizim buni avtomatik o'rganib oladi! ⚡️",
            parse_mode="HTML"
        )

        if ADMIN_TELEGRAM_ID:
            try:
                admin_msg = await bot.send_message(
                    ADMIN_TELEGRAM_ID,
                    f"❓ <b>NOODATIY SAVOL KELDI (Human-in-the-Loop):</b>\n\n"
                    f"👤 <b>Foydalanuvchi:</b> {user_name} ({username})\n"
                    f"🆔 <b>ID:</b> <code>{user_id}</code>\n"
                    f"📝 <b>Savol:</b>\n<i>{text}</i>\n\n"
                    f"✍️ <i>Ushbu xabarga <b>Reply (Javob)</b> qilib javob yozsangiz, bot javobingizni foydalanuvchiga yetkazadi "
                    f"hamda 'Bilimlar_Bazasi_FAQ.md' ga avtomatik qo'shib tizimga o'rgatadi!</i>",
                    parse_mode="HTML"
                )
                register_pending_question(admin_msg.message_id, user_id, user_name, text)
            except Exception as e:
                print(f"Admin forward error: {e}")
        return


async def main():
    print("Bot ishga tushdi...")
    if BOT_TOKEN and BOT_TOKEN != "BOT_TOKENINGIZNI_YOZING":
        try:
            await bot.set_chat_menu_button(
                menu_button=MenuButtonWebApp(text="Ilova", web_app=WebAppInfo(url=WEBAPP_URL))
            )
            print("Telegram Chat Menu tugmasi (Mini App) sozlandi!")
        except Exception as e:
            print(f"Chat Menu sozlashda ogohlantirish: {e}")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())