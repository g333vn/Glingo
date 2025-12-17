# Script để fix màn hình trắng
Write-Host "🔧 Đang fix màn hình trắng..." -ForegroundColor Yellow

# Bước 1: Clear Vite cache
Write-Host "`n📦 Đang xóa Vite cache..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "✅ Đã xóa node_modules\.vite" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Không tìm thấy node_modules\.vite" -ForegroundColor Gray
}

# Bước 2: Clear dist folder
Write-Host "`n📦 Đang xóa dist folder..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist" -ErrorAction SilentlyContinue
    Write-Host "✅ Đã xóa dist" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Không tìm thấy dist" -ForegroundColor Gray
}

# Bước 3: Kiểm tra .env.local
Write-Host "`n🔍 Kiểm tra .env.local..." -ForegroundColor Cyan
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "VITE_SUPABASE_URL" -and $envContent -match "VITE_SUPABASE_ANON_KEY") {
        Write-Host "✅ .env.local đã được cấu hình" -ForegroundColor Green
    } else {
        Write-Host "⚠️  .env.local thiếu cấu hình" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Không tìm thấy .env.local" -ForegroundColor Red
    Write-Host "   Tạo file .env.local với:" -ForegroundColor Yellow
    Write-Host "   VITE_SUPABASE_URL=https://your-project.supabase.co" -ForegroundColor Gray
    Write-Host "   VITE_SUPABASE_ANON_KEY=your-anon-key" -ForegroundColor Gray
}

# Bước 4: Kiểm tra các file quan trọng
Write-Host "`n🔍 Kiểm tra các file quan trọng..." -ForegroundColor Cyan
$importantFiles = @(
    "src/contexts/AuthContext.jsx",
    "src/services/supabaseClient.js",
    "src/services/authService.js",
    "src/main.jsx"
)

$allExist = $true
foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - KHÔNG TỒN TẠI" -ForegroundColor Red
        $allExist = $false
    }
}

# Bước 5: Kiểm tra package.json
Write-Host "`n🔍 Kiểm tra dependencies..." -ForegroundColor Cyan
if (Test-Path "package.json") {
    $packageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($packageJson.dependencies.'@supabase/supabase-js') {
        Write-Host "✅ @supabase/supabase-js đã được cài đặt" -ForegroundColor Green
    } else {
        Write-Host "❌ @supabase/supabase-js chưa được cài đặt" -ForegroundColor Red
        Write-Host "   Chạy: npm install" -ForegroundColor Yellow
    }
}

# Tóm tắt
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📋 TÓM TẮT:" -ForegroundColor Yellow
Write-Host "="*50 -ForegroundColor Cyan

if ($allExist) {
    Write-Host "✅ Tất cả file quan trọng đã tồn tại" -ForegroundColor Green
} else {
    Write-Host "❌ Một số file quan trọng bị thiếu" -ForegroundColor Red
}

Write-Host "`n🚀 Bước tiếp theo:" -ForegroundColor Yellow
Write-Host "1. Khởi động lại dev server: npm run dev" -ForegroundColor White
Write-Host "2. Mở browser console (F12) để xem lỗi" -ForegroundColor White
Write-Host "3. Hard reload: Ctrl+Shift+R" -ForegroundColor White
Write-Host "`n✨ Hoàn thành!" -ForegroundColor Green

