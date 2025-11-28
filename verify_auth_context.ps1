# PowerShell script to verify AuthContext installation
# Run: .\verify_auth_context.ps1

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🔍 Quick Check - AuthContext Installation" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check 1: File exists?
$filePath = "src/contexts/AuthContext.jsx"
if (-not (Test-Path $filePath)) {
    Write-Host "❌ FAIL: File NOT found at $filePath" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Fix: Copy AuthContext.jsx to $filePath" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PASS: File exists" -ForegroundColor Green

# Check 2: Has v2 markers?
$content = Get-Content $filePath -Raw
if ($content -notmatch "FIXED v2") {
    Write-Host "❌ FAIL: File does NOT contain v2 markers" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Fix: Replace file with new version" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PASS: File contains v2 markers" -ForegroundColor Green

# Check 3: Has INITIAL_SESSION priority?
if ($content -notmatch "INITIAL_SESSION là event QUAN TRỌNG NHẤT") {
    Write-Host "❌ FAIL: Missing INITIAL_SESSION priority logic" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Fix: Replace file completely" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PASS: Has INITIAL_SESSION priority logic" -ForegroundColor Green

# Check 4: Has immediate logout?
if ($content -notmatch "logging out immediately") {
    Write-Host "❌ FAIL: Missing immediate logout logic" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Fix: Replace file completely" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PASS: Has immediate logout logic" -ForegroundColor Green

# Check 5: Has [AUTH][Supabase] logs?
if ($content -notmatch "\[AUTH\]\[Supabase\].*Auth state changed") {
    Write-Host "❌ FAIL: Missing [AUTH][Supabase] logs" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Fix: Replace file completely" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ PASS: Has [AUTH][Supabase] logs" -ForegroundColor Green

# Check 6: File size (should be ~15-18 KB)
$fileSize = (Get-Item $filePath).Length
if ($fileSize -lt 10000 -or $fileSize -gt 25000) {
    Write-Host "⚠️  WARNING: File size is $fileSize bytes (expected ~15-18 KB)" -ForegroundColor Yellow
} else {
    Write-Host "✅ PASS: File size is $fileSize bytes (~$([math]::Round($fileSize/1024, 1)) KB)" -ForegroundColor Green
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 ALL CHECKS PASSED!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. ⚠️  RESTART dev server: Ctrl+C then npm run dev" -ForegroundColor White
Write-Host "2. 🌐 Hard reload browser: Ctrl+Shift+R" -ForegroundColor White
Write-Host "3. 🧹 Clear cache in Console: localStorage.clear()" -ForegroundColor White
Write-Host "4. 🔍 Check Console for [AUTH] logs" -ForegroundColor White
Write-Host ""
Write-Host "Expected first log:" -ForegroundColor Yellow
Write-Host '  [AUTH] Supabase is configured, relying on INITIAL_SESSION event...' -ForegroundColor Gray
Write-Host ""

