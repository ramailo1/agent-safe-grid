# Stop Backend Server Script for Windows
# Kills all processes on port 3001

Write-Host "Stopping backend server on port 3001..." -ForegroundColor Yellow

# Find and kill processes on port 3001
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force
            Write-Host "Killed process $pid" -ForegroundColor Green
        } catch {
            Write-Host "Failed to kill process $pid" -ForegroundColor Red
        }
    }
    Write-Host "Backend server stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "No processes found on port 3001" -ForegroundColor Yellow
}
