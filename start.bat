@echo off
echo Platformani ishga tushirish (Backend, Bot, Frontend, Monitor)...

:: ABDULBOSIT - Self-Healing Monitor (Backend + Auto-Patch)
start "ABDULBOSIT (Backend + Monitor)" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe self_healing_monitor.py"

:: Telegram Botni ishga tushirish (yangi oynada)
start "Telegram Bot" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe bot.py"

:: Frontendni ishga tushirish (yangi oynada)
start "Frontend (React)" cmd /k "cd /d %~dp0\frontend && npm run dev"

:: Obsidian Watcherni ishga tushirish (yangi oynada)
start "Obsidian Watcher" cmd /k "cd /d %~dp0 && .venv\Scripts\python.exe sync_watcher.py"

echo Barcha serverlar ishga tushirildi!
echo ABDULBOSIT endi barcha loglarni kuzatyapti va xatoliklarni o'zi tuzatyapti.
