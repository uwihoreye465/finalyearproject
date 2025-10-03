@echo off
echo 🔧 FIXING PORT 6000 ISSUE...
echo.

REM Check if port 6000 is in use
echo 🔍 Checking if port 6000 is in use...
netstat -ano | findstr :6000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 6000 is currently in use!
    echo.
    echo 🛑 Killing all processes using port 6000...
    
    REM Kill all processes using port 6000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6000') do (
        echo   Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    
    echo ✅ All processes killed!
    echo.
    Start-Sleep 2
) else (
    echo ✅ Port 6000 is free!
    echo.
)

echo 🚀 Starting FindSinnerSystem server...
echo.
cd /d "C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem"
node server.js

echo.
echo 🎉 Server startup complete!
pause
