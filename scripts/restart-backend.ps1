# Restart Backend Server Script for Windows
# Stops existing server and starts a fresh instance

Write-Host "=== Restarting Backend Server ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop existing server
Write-Host "Step 1: Stopping existing backend server..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "  ✓ Killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "  ✗ Failed to kill process $pid" -ForegroundColor Red
        }
    }
    Start-Sleep -Seconds 2
} else {
    Write-Host "  No existing server found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 2: Starting fresh backend server..." -ForegroundColor Yellow
Write-Host "  Running: npm run server" -ForegroundColor Gray
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 2: Start new server
npm run server
