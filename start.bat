@echo off
title AstroGuru Bot
color 0A
echo.
echo  ================================
echo   AstroGuru Bot - Запуск
echo  ================================
echo.

cd /d "%~dp0"

:: Add Node.js to PATH
set PATH=C:\Program Files\nodejs;%PATH%

:: Check Node.js
where node >nul 2>nul
if errorlevel 1 (
    echo [ОШИБКА] Node.js не найден! Установите с https://nodejs.org
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo Устанавливаю зависимости...
    npm install
)

:: Check .env
if not exist ".env" (
    echo [ОШИБКА] Файл .env не найден!
    echo Создайте .env из .env.example и заполните BOT_TOKEN
    pause
    exit /b 1
)

echo Запускаю бота...
echo Для остановки нажмите Ctrl+C
echo.

node node_modules\ts-node\dist\bin.js src\index.ts

pause
