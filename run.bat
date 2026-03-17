@echo off
echo Starting server and dev...

start "" /b cmd /c "npm run server"
set SERVER_PID=%!

start "" /b cmd /c "npm run dev"
set DEV_PID=%!

echo Press Ctrl+C to stop...

:loop
timeout /t 1 >nul
goto loop