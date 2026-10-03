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
    InlineKeyboardButton
)
import httpx

logging.basicConfig(level=logging.INFO)

BOT_TOKEN = "BOT_TOKENINGIZNI_YOZING"
API_BASE_URL = "http://127.0.0.1:8000"  # FastAPI manzili

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

def get_main_menu():
    kb = [
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
            f"Salom, {current_player['full_name']}! 👋\n"
            "Platforma menyusidan birini tanlang:",
            reply_markup=get_main_menu()
        )
    else:
        # Auto-Sync: Ism va familiyani avtomatik olamiz
        full_name = message.from_user.full_name
        await state.update_data(full_name=full_name)
        
        kb = [[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]]
        markup = ReplyKeyboardMarkup(keyboard=kb, resize_keyboard=True, one_time_keyboard=True)

        await message.answer(
            f"Assalomu alaykum, {full_name}! ⚽\n\n"
            "Platformaga xush kelibsiz. Tizim Telegram ma'lumotlaringizni (User ID va Ism) avtomatik sinxronizatsiya qildi.\n\n"
            "To'liq xavfsizlik va unikal profil yaratish uchun telefon raqamingizni tasdiqlang:",
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


async def main():
    print("Bot ishga tushdi...")
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())