@echo off
echo Starting server and dev...

start "SERVER" cmd /k npm run server
start "DEV" cmd /k npm run dev

echo Press Ctrl+C to stop everything...

pause

taskkill /FI "WINDOWTITLE eq SERVER" /T /F
taskkill /FI "WINDOWTITLE eq DEV" /T /F