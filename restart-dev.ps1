# PowerShell script to restart dev server properly
# Usage: .\restart-dev.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔄 Restarting Dev Server" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop dev server (if running)
Write-Host "🛑 Step 1: Stopping dev server..." -ForegroundColor Yellow

# Tìm process đang dùng port 5173 (Vite default port)
try {
    $connection = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($connection) {
        $processId = $connection | Select-Object -ExpandProperty OwningProcess -Unique | Select-Object -First 1
        if ($processId) {
            $process = Get-Process -Id $processId -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   Found process: $($process.ProcessName) (PID: $processId)" -ForegroundColor Gray
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ Stopped process on port 5173" -ForegroundColor Green
                Start-Sleep -Seconds 2
            }
        }
    } else {
        Write-Host "   ℹ️  No process found on port 5173 (server may not be running)" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️  Could not check port 5173: $_" -ForegroundColor Yellow
}

Write-Host ""

# Step 2: Clear cache
Write-Host "🧹 Step 2: Clearing cache..." -ForegroundColor Yellow

$viteCache = "node_modules\.vite"
$distFolder = "dist"

if (Test-Path $viteCache) {
    Remove-Item -Recurse -Force $viteCache -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cleared node_modules/.vite" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  node_modules/.vite not found (already cleared?)" -ForegroundColor Gray
}

if (Test-Path $distFolder) {
    Remove-Item -Recurse -Force $distFolder -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cleared dist folder" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  dist folder not found (already cleared?)" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Start dev server
Write-Host "🚀 Step 3: Starting dev server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: After server starts:" -ForegroundColor Yellow
Write-Host "   1. Hard reload browser: Ctrl+Shift+R" -ForegroundColor White
Write-Host "   2. Clear storage in Console: localStorage.clear()" -ForegroundColor White
Write-Host "   3. Check Console for [AUTH] logs" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Start dev server
npm run dev

