@echo off
echo Barcha serverlar to'xtatilmoqda...
powershell -Command "Get-Process | Where-Object {$_.ProcessName -eq 'python' -or $_.ProcessName -eq 'node'} | Stop-Process -Force"
powershell -Command "netstat -ano | findstr :8000 | ForEach-Object { $pid = $_.Split(' ')[-1]; if($pid -ne '0') { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } }"
echo ============================================
echo Barcha serverlar to'xtatildi!
echo Endi start.bat ni bosib toza ishga tushiring.
echo ============================================
pause
