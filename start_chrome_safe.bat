@echo off
echo Starting Chrome with Port 6000 Enabled
echo =====================================
echo.
echo This will start Chrome with unsafe ports enabled
echo so you can access localhost:6000 for email verification
echo.
echo Close this window after Chrome starts
echo.

REM Try different Chrome installation paths
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome in Program Files
    start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --explicitly-allowed-ports=6000
) else if exist "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome in Program Files (x86)
    start "" "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe" --explicitly-allowed-ports=6000
) else if exist "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" (
    echo Found Chrome in Local AppData
    start "" "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe" --explicitly-allowed-ports=6000
) else (
    echo Chrome not found in common locations
    echo Please run this command manually:
    echo chrome.exe --explicitly-allowed-ports=6000
    echo.
    echo Or use Microsoft Edge or Firefox instead
)

echo.
echo Chrome should now be starting...
echo You can now click verification links without ERR_UNSAFE_PORT errors
echo.
pause
