@echo off
echo FootballRise serverlari (port 8000 va 5173) to'xtatilmoqda...
powershell -Command "8000, 5173 | ForEach-Object { $p = $_; Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue; Write-Host \"Port $p (PID $($_.OwningProcess)) to'xtatildi.\" } }"
echo ============================================
echo FootballRise serverlari to'xtatildi!
echo Boshqa Python va Node dasturlaringizga tegilmadi.
echo Endi start.bat orqali toza ishga tushirishingiz mumkin.
echo ============================================
pause
