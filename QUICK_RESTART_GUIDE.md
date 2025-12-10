# 🔄 Hướng Dẫn Restart Dev Server - QUICK GUIDEba

## ⚡ CÁCH NHANH NHẤT (3 bước)

### 1️⃣ Stop Server
```
Nhấn Ctrl+C trong terminal đang chạy dev server
```

### 2️⃣ Clear Cache & Start
```powershell
# Chạy script tự động:
.\restart-dev.ps1

# HOẶC manual:
Remove-Item -Recurse -Force node_modules\.vite
npm run dev
```

### 3️⃣ Hard Reload Browser
```
Ctrl + Shift + R
```

---

## 📋 CÁCH CHI TIẾT

### Step 1: Stop Dev Server

1. **Tìm terminal đang chạy server**
   - Terminal có dòng: `VITE v5.x.x  ready in xxx ms`
   - Hoặc: `➜  Local:   http://localhost:5173/`

2. **Click vào terminal đó**

3. **Nhấn `Ctrl + C`**
   - Đợi đến khi thấy prompt: `PS E:\Projects\elearning - cur>`
   - **QUAN TRỌNG**: Đợi server stop hoàn toàn!

---

### Step 2: Clear Cache

**Option A: Dùng script (Khuyến nghị)**
```powershell
.\restart-dev.ps1
```

**Option B: Manual**
```powershell
Remove-Item -Recurse -Force node_modules\.vite
Remove-Item -Recurse -Force dist
```

---

### Step 3: Start Server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

### Step 4: Hard Reload Browser

1. **Mở browser** → `http://localhost:5173/`
2. **Mở Console (F12)**
3. **Hard reload:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
4. **Clear storage (Trong Console):**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

---

## ✅ CHECKLIST

- [ ] Stop server (Ctrl+C)
- [ ] Clear cache (script hoặc manual)
- [ ] Start server (npm run dev)
- [ ] Hard reload browser (Ctrl+Shift+R)
- [ ] Clear storage (localStorage.clear())
- [ ] Check Console có [AUTH] logs

---

## 🎯 EXPECTED LOGS

Sau khi restart đúng cách, bạn sẽ thấy trong Console:

```
[AUTH] Supabase is configured, relying on INITIAL_SESSION event...
[AUTH][Supabase] Auth state changed: INITIAL_SESSION
```

---

## ❌ TROUBLESHOOTING

### Server không stop?
```powershell
# Kill process trên port 5173
Get-NetTCPConnection -LocalPort 5173 | Select-Object OwningProcess | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### Vẫn không thấy [AUTH] logs?
1. Test trong **Incognito mode** (Ctrl+Shift+N)
2. Check **Network tab** xem file có load đúng không
3. Verify file: `.\verify_auth_context.ps1`

---

## 📞 Nếu vẫn lỗi:

1. Screenshot terminal output khi start `npm run dev`
2. Screenshot Console (F12)
3. Output của: `.\verify_auth_context.ps1`

