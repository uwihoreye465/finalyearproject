@echo off
echo Starting Chrome with unsafe ports enabled...
echo This will allow Chrome to access port 6000
echo.
echo Close this window after Chrome starts
echo.
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --explicitly-allowed-ports=6000
echo Chrome started with unsafe ports enabled
pause
