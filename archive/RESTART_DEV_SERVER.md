# 🔄 Hướng Dẫn Restart Dev Server Đúng Cách

## ⚠️ QUAN TRỌNG: Phải làm đúng thứ tự!

---

## 📋 CÁCH 1: Restart Thủ Công (Khuyến nghị)

### Step 1: Stop Dev Server

1. **Tìm terminal đang chạy dev server**
   - Terminal có dòng: `VITE v5.x.x  ready in xxx ms`
   - Hoặc có dòng: `➜  Local:   http://localhost:5173/`

2. **Click vào terminal đó** (để focus)

3. **Nhấn `Ctrl + C`** (Windows/Linux) hoặc `Cmd + C` (Mac)
   - Đợi đến khi thấy prompt `PS E:\Projects\elearning - cur>` hoặc `$`
   - **QUAN TRỌNG**: Đợi server stop hoàn toàn, không thấy process nào đang chạy

4. **Verify server đã stop:**
   - Không còn thông báo "ready" trong terminal
   - Có thể nhập command mới trong terminal

---

### Step 2: Clear Cache (Trước khi restart)

**Option A: Dùng script (Nhanh nhất)**
```powershell
# Windows PowerShell:
.\clear_cache_and_restart.ps1
```

**Option B: Manual (Nếu không có script)**
```powershell
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Mac/Linux:
rm -rf node_modules/.vite
rm -rf dist
```

**Verify cache đã clear:**
```powershell
# Check xem folder đã bị xóa chưa
Test-Path node_modules\.vite
# Phải trả về: False
```

---

### Step 3: Start Dev Server

**Trong cùng terminal đã stop server:**

```bash
npm run dev
```

**Hoặc nếu dùng yarn:**
```bash
yarn dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**⚠️ QUAN TRỌNG:**
- Phải thấy dòng "ready in xxx ms"
- Phải thấy URL Local
- **KHÔNG** có errors màu đỏ

---

### Step 4: Verify Server Đã Start

1. **Mở browser** → Vào `http://localhost:5173/`
2. **Mở Console (F12)**
3. **Check logs:**
   ```
   [AUTH] Supabase is configured, relying on INITIAL_SESSION event...
   ```

**Nếu KHÔNG thấy logs:**
- Hard reload: `Ctrl + Shift + R`
- Clear browser cache (xem Step 5)

---

### Step 5: Hard Reload Browser

**Sau khi server đã start:**

1. **Mở trang web** (`http://localhost:5173/`)

2. **Mở Console (F12)**

3. **Hard reload:**
   - **Windows/Linux:** `Ctrl + Shift + R`
   - **Mac:** `Cmd + Shift + R`
   - **Hoặc:** Right-click nút Reload → "Empty Cache and Hard Reload"

4. **Clear storage (Trong Console):**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

## 📋 CÁCH 2: Dùng Script Tự Động

### Tạo script `restart-dev.ps1`:

```powershell
# restart-dev.ps1
Write-Host "🛑 Stopping dev server..." -ForegroundColor Yellow

# Tìm và kill process đang chạy trên port 5173 (Vite default)
$process = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($process) {
    Stop-Process -Id $process -Force
    Write-Host "✅ Stopped process on port 5173" -ForegroundColor Green
    Start-Sleep -Seconds 2
}

Write-Host "🧹 Clearing cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "✅ Cache cleared" -ForegroundColor Green

Write-Host "🚀 Starting dev server..." -ForegroundColor Cyan
npm run dev
```

### Chạy script:

```powershell
.\restart-dev.ps1
```

**⚠️ Lưu ý:** Script này sẽ kill process trên port 5173, có thể ảnh hưởng đến process khác!

---

## 📋 CÁCH 3: Dùng NPM Scripts (Nếu có)

### Thêm vào `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:clean": "rm -rf node_modules/.vite dist && vite",
    "dev:restart": "npm run dev:clean"
  }
}
```

### Chạy:

```bash
npm run dev:clean
```

**Hoặc Windows:**
```json
{
  "scripts": {
    "dev:clean": "powershell -Command \"Remove-Item -Recurse -Force node_modules\\.vite, dist -ErrorAction SilentlyContinue\" && vite"
  }
}
```

---

## 🔍 TROUBLESHOOTING

### ❌ Vấn đề 1: Server không stop

**Triệu chứng:**
- Nhấn `Ctrl+C` nhưng server vẫn chạy
- Port 5173 vẫn bị chiếm

**Giải pháp:**
```powershell
# Tìm process đang dùng port 5173
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess

# Kill process (thay PID bằng số process ID)
Stop-Process -Id <PID> -Force

# Hoặc kill tất cả node processes (CẨN THẬN!)
Get-Process node | Stop-Process -Force
```

---

### ❌ Vấn đề 2: Cache không clear

**Triệu chứng:**
- Đã xóa `node_modules/.vite` nhưng vẫn thấy file cũ

**Giải pháp:**
```powershell
# Xóa với force
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Verify
Test-Path node_modules\.vite
# Phải trả về: False

# Restart server
npm run dev
```

---

### ❌ Vấn đề 3: Server start nhưng không load file mới

**Triệu chứng:**
- Server đã start
- Nhưng vẫn không thấy [AUTH] logs

**Giải pháp:**
1. **Check file có đúng không:**
   ```powershell
   Get-Content src/contexts/AuthContext.jsx | Select-String "\[AUTH\]"
   ```

2. **Clear browser cache:**
   - Hard reload: `Ctrl + Shift + R`
   - Hoặc Incognito mode

3. **Check Network tab:**
   - F12 → Network tab
   - Reload trang
   - Tìm `AuthContext.jsx`
   - Check Response có `[AUTH]` không

---

### ❌ Vấn đề 4: Port đã được sử dụng

**Triệu chứng:**
```
Error: Port 5173 is already in use
```

**Giải pháp:**
```powershell
# Option 1: Kill process trên port 5173
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Option 2: Dùng port khác
npm run dev -- --port 5174
```

---

## ✅ CHECKLIST: Restart Đúng Cách

- [ ] Stop dev server (Ctrl+C)
- [ ] Đợi server stop hoàn toàn
- [ ] Clear cache (`node_modules/.vite` và `dist`)
- [ ] Start server lại (`npm run dev`)
- [ ] Verify server đã start (thấy "ready in xxx ms")
- [ ] Hard reload browser (Ctrl+Shift+R)
- [ ] Clear browser storage (localStorage.clear())
- [ ] Check Console có [AUTH] logs không

---

## 🎯 QUICK REFERENCE

### Restart nhanh (1 command):
```powershell
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite, dist -ErrorAction SilentlyContinue; npm run dev

# Mac/Linux:
rm -rf node_modules/.vite dist && npm run dev
```

### Restart với script:
```powershell
.\clear_cache_and_restart.ps1
```

### Restart manual (an toàn nhất):
1. `Ctrl+C` (stop server)
2. `Remove-Item -Recurse -Force node_modules\.vite`
3. `npm run dev`
4. `Ctrl+Shift+R` (hard reload browser)

---

## 📞 Nếu vẫn không được:

1. **Check terminal output** khi start `npm run dev`
2. **Check browser Console** (F12) có errors không
3. **Check Network tab** xem file có load đúng không
4. **Test trong Incognito mode** để loại trừ extension

