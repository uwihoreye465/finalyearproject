# FindSinnerSystem API Server Startup Script
# This script automatically kills any existing server processes and starts the server

Write-Host "🔍 Checking for existing server processes on port 6000..." -ForegroundColor Yellow

# Check if port 6000 is in use
$portInUse = Get-NetTCPConnection -LocalPort 6000 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Port 6000 is already in use. Killing existing processes..." -ForegroundColor Red
    
    # Get processes using port 6000
    $processes = Get-NetTCPConnection -LocalPort 6000 | Select-Object -ExpandProperty OwningProcess
    
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🗑️  Killing process $pid ($($process.ProcessName))..." -ForegroundColor Red
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        catch {
            Write-Host "⚠️  Could not kill process $pid" -ForegroundColor Yellow
        }
    }
    
    # Wait a moment for processes to be killed
    Start-Sleep -Seconds 2
    
    Write-Host "✅ Port 6000 is now free." -ForegroundColor Green
} else {
    Write-Host "✅ Port 6000 is available." -ForegroundColor Green
}

Write-Host "🚀 Starting FindSinnerSystem API server..." -ForegroundColor Cyan
npm start
