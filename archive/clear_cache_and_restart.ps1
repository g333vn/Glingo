# PowerShell script to clear cache and restart dev server
# Run: .\clear_cache_and_restart.ps1

Write-Host "🧹 Clearing Vite cache..." -ForegroundColor Yellow

# Clear Vite cache
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
    Write-Host "✅ Cleared node_modules/.vite" -ForegroundColor Green
} else {
    Write-Host "ℹ️  node_modules/.vite not found (already cleared?)" -ForegroundColor Gray
}

# Clear dist folder
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Cleared dist folder" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
Write-Host "⚠️  If server is already running, press Ctrl+C first!" -ForegroundColor Yellow
Write-Host ""

# Start dev server
npm run dev

