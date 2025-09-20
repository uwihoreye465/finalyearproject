@echo off
echo 🔍 Checking for existing server processes on port 6000...

:: Check if port 6000 is in use
netstat -ano | findstr :6000 >nul
if %errorlevel% == 0 (
    echo ⚠️  Port 6000 is already in use. Killing existing processes...
    
    :: Get the process ID using port 6000
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :6000') do (
        echo 🗑️  Killing process %%a...
        taskkill /PID %%a /F >nul 2>&1
    )
    
    :: Wait a moment for the process to be killed
    timeout /t 2 /nobreak >nul
    
    echo ✅ Port 6000 is now free.
) else (
    echo ✅ Port 6000 is available.
)

echo 🚀 Starting FindSinnerSystem API server...
npm start
