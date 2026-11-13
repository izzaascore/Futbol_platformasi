import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from aiogram import Bot

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

token = os.getenv("BOT_TOKEN")
print("Token starts with:", token[:10] if token else None)

async def check_bot():
    bot = Bot(token=token)
    try:
        me = await bot.get_me()
        print("Bot info:", me.username, me.id)
        webhook_info = await bot.get_webhook_info()
        print("Webhook info:", webhook_info)
    except Exception as e:
        print("Bot error:", e)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(check_bot())
