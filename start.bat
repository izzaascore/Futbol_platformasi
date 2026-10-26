@echo off
echo ===============================================================
echo   FootballRise - Platformani ishga tushirish
echo   (Backend, Bot, Frontend, Monitor, Doc Sync)
echo ===============================================================

:: ABDULBOSIT - Self-Healing Monitor (Backend + Auto-Patch)
start "ABDULBOSIT (Backend + Monitor)" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe scripts\monitor.py"

:: Telegram Botni ishga tushirish (yangi oynada)
start "Telegram Bot" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe bot\bot.py"

:: Frontendni ishga tushirish (yangi oynada)
start "Frontend (React)" cmd /k "cd /d %~dp0\frontend && npm.cmd run dev"

:: Obsidian Watcherni ishga tushirish (yangi oynada)
start "Obsidian Watcher" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe scripts\doc_sync.py"

echo ===============================================================
echo   Barcha serverlar muvaffaqiyatli ishga tushirildi!
echo   ABDULBOSIT loglarni kuzatyapti va o'zini-o'zi tiklaydi.
echo ===============================================================
