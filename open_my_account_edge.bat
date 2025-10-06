@echo off
echo Starting Microsoft Edge with unsafe port 6000 enabled...
echo.
echo This will allow Edge to access localhost:6000
echo.
start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --explicitly-allowed-ports=6000 --new-window http://localhost:6000/my_account.html
echo.
echo Edge should now open with your my_account.html page!
echo If Edge doesn't open, try running this as Administrator.
pause

