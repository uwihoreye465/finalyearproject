@echo off
echo 🚀 Starting FindSinnerSystem Server...
echo.

REM Check if port 6000 is already in use
netstat -ano | findstr :6000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 6000 is already in use!
    echo 🔍 Finding process using port 6000...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6000') do (
        echo 🛑 Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    echo ✅ Port 6000 is now free!
    echo.
)

echo 🚀 Starting server on port 6000...
echo.
node server.js

pause
