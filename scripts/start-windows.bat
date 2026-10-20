@echo off
REM Starts the Laravel API (port 8000) and the React app (port 5173) in two windows.
setlocal
start "BASTION API (Laravel)" cmd /k "cd /d %~dp0..\backend && php artisan serve"
start "BASTION Web (React)" cmd /k "cd /d %~dp0..\frontend && npm run dev"
timeout /t 6 >nul
start http://localhost:5173
endlocal
