@echo off
echo ========================================
echo    QuizBattle - Multiplayer Quiz O'yini
echo ========================================
echo.
echo Serverlar ishga tushirilmoqda...
echo.

start "Quiz Server" cmd /k "cd /d "%~dp0server" && npm install && npm start"
timeout /t 3 /nobreak > nul
start "Quiz Client" cmd /k "cd /d "%~dp0client" && npm install && npm start"

echo.
echo Server: http://localhost:3001
echo Client: http://localhost:3000
echo.
echo Brauzer avtomatik ochiladi...
