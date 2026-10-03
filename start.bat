@echo off
echo Platformani ishga tushirish (Backend, Bot, Frontend)...

:: Backendni ishga tushirish (yangi oynada)
start "Backend (FastAPI)" cmd /k "call .venv\Scripts\activate.bat && uvicorn main:app --reload --port 8000"

:: Telegram Botni ishga tushirish (yangi oynada)
start "Telegram Bot" cmd /k "call .venv\Scripts\activate.bat && python bot.py"

:: Frontendni ishga tushirish (yangi oynada)
start "Frontend (React)" cmd /k "cd frontend && npm run dev"

echo Barcha serverlar ishga tushirildi! Siz ishni davom ettirishingiz mumkin.
