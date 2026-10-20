@echo off
REM ============================================================
REM  BASTION one-click setup for Windows
REM  Usage:  scripts\setup-windows.bat          (MySQL, database "bastion")
REM          scripts\setup-windows.bat sqlite   (no MySQL needed)
REM ============================================================
setlocal
cd /d "%~dp0.."

where php >nul 2>nul || (echo [X] PHP was not found in PATH. Install PHP 8.2+ or XAMPP and add it to PATH. & exit /b 1)
where composer >nul 2>nul || (echo [X] Composer was not found. Install it from https://getcomposer.org & exit /b 1)
where npm >nul 2>nul || (echo [X] Node.js/npm was not found. Install Node 18+ from https://nodejs.org & exit /b 1)

echo.
echo === [1/4] Backend: installing PHP packages ===
cd backend
call composer install
if errorlevel 1 (echo [X] composer install failed & exit /b 1)

if not exist .env copy .env.example .env >nul
call php artisan key:generate --force

if /I "%1"=="sqlite" (
  echo === Using SQLite ^(no MySQL needed^) ===
  powershell -NoProfile -Command "(Get-Content .env) -replace '^DB_CONNECTION=.*','DB_CONNECTION=sqlite' -replace '^DB_DATABASE=','# DB_DATABASE=' | Set-Content .env"
  if not exist database\database.sqlite type nul > database\database.sqlite
) else (
  echo === Using MySQL: creating database "bastion" if the mysql command is available ===
  where mysql >nul 2>nul && mysql -u root -e "CREATE DATABASE IF NOT EXISTS bastion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci" || echo [!] Could not create the database automatically. Open phpMyAdmin and create an empty database named "bastion", then run this script again.
)

echo.
echo === [2/4] Backend: creating tables and demo data ===
call php artisan migrate:fresh --seed --force
if errorlevel 1 (echo [X] Migration failed. Check that MySQL is running and DB_USERNAME / DB_PASSWORD in backend\.env are correct. & exit /b 1)

echo.
echo === [3/4] Frontend: installing packages ===
cd ..\frontend
if not exist .env copy .env.example .env >nul
call npm install
if errorlevel 1 (echo [X] npm install failed & exit /b 1)

echo.
echo === [4/4] Done! ===
echo Start both servers with:  scripts\start-windows.bat
echo Then open http://localhost:5173
echo Demo logins ^(password Password123!^):  admin@bastion.test   officer@bastion.test
endlocal
