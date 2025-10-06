@echo off
echo Starting Chrome with unsafe port 6000 enabled...
echo.
echo This will allow Chrome to access localhost:6000
echo.
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --explicitly-allowed-ports=6000 --new-window http://localhost:6000/my_account.html
echo.
echo Chrome should now open with your my_account.html page!
echo If Chrome doesn't open, try running this as Administrator.
pause

