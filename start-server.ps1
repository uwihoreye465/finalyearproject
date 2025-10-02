# PowerShell script to start FindSinnerSystem server
Write-Host "🔧 FIXING PORT 6000 ISSUE..." -ForegroundColor Yellow
Write-Host ""

# Check if port 6000 is in use
Write-Host "🔍 Checking if port 6000 is in use..." -ForegroundColor Cyan
$portCheck = netstat -ano | findstr :6000

if ($portCheck) {
    Write-Host "⚠️  Port 6000 is currently in use!" -ForegroundColor Red
    Write-Host ""
    Write-Host "🛑 Killing all processes using port 6000..." -ForegroundColor Yellow
    
    # Kill all processes using port 6000
    $processes = netstat -ano | findstr :6000 | ForEach-Object {
        $parts = $_ -split '\s+'
        $pid = $parts[-1]
        if ($pid -match '^\d+$') {
            Write-Host "  Killing process $pid..." -ForegroundColor Yellow
            taskkill /PID $pid /F 2>$null
        }
    }
    
    Write-Host "✅ All processes killed!" -ForegroundColor Green
    Write-Host ""
    Start-Sleep 2
} else {
    Write-Host "✅ Port 6000 is free!" -ForegroundColor Green
    Write-Host ""
}

# Change to the correct directory
Set-Location "C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem"

Write-Host "🚀 Starting FindSinnerSystem server..." -ForegroundColor Green
Write-Host ""

# Start the server
node server.js

Write-Host ""
Write-Host "🎉 Server startup complete!" -ForegroundColor Green
Read-Host "Press Enter to continue"