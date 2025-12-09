# 🔄 HƯỚNG DẪN CLEAR CACHE - QUAN TRỌNG!

## ✅ ĐÃ FIX XONGCode đã được fix và deploy. **BẮT BUỘC PHẢI CLEAR CACHE** để fix hoạt động.

---

## 🚨 BƯỚC 1: Clear Browser Cache (BẮT BUỘC!)

### Chrome/Edge:
1. Mở production site
2. Mở DevTools: **F12**
3. **Right-click vào nút Refresh** (⟳)
4. Chọn: **"Empty Cache and Hard Reload"** (hoặc "Xóa bộ nhớ đệm và tải lại trang")

**HOẶC:**

1. Nhấn **Ctrl+Shift+Delete**
2. Chọn **"Cached images and files"**
3. Click **"Clear data"**
4. Reload page

### Firefox:
1. Nhấn **Ctrl+Shift+Delete**
2. Chọn **"Cache"**
3. Click **"Clear Now"**
4. Reload page

---

## 🚨 BƯỚC 2: Clear Service Worker Cache (BẮT BUỘC!)

1. Mở DevTools (F12)
2. Vào tab **"Application"** (Chrome/Edge) hoặc **"Storage"** (Firefox)
3. Sidebar bên trái → **"Service Workers"**
4. Click **"Unregister"** cho tất cả service workers
5. Sidebar bên trái → **"Cache Storage"**
6. Right-click → **"Delete"** cho tất cả cache
7. Reload page

**HOẶC dễ hơn:**

1. DevTools (F12) → Application tab
2. Click **"Clear storage"** (bên trái)
3. Click **"Clear site data"**
4. Reload page

---

## 🚨 BƯỚC 3: Verify Fix

Sau khi clear cache:

1. Reload page
2. Mở Console (F12)
3. Check:
   - ❌ **KHÔNG** có lỗi `Cannot read properties of undefined (reading 'version')`
   - ✅ App hiển thị bình thường
   - ✅ Không còn blank screen

---

## 📝 Thay Đổi Kỹ Thuật

### Trước:
- React ở chunk riêng (`react-vendor-*.js`)
- Load bất đồng bộ → gây lỗi loading order

### Sau:
- React ở **entry chunk** (`index-*.js`)
- Load đồng bộ → React LUÔN có sẵn trước
- **antd-vendor** bây giờ lớn hơn (367KB) vì chứa React

---

## ⚠️ Nếu Vẫn Lỗi

### Check 1: Cache đã clear chưa?
```
DevTools → Application → Clear storage → Clear site data
```

### Check 2: Có đúng bản mới nhất không?
```
DevTools → Network tab → Reload page
→ Check file index-*.js có hash mới không?
→ Expected: index-Bblhurgv.js (hash mới)
```

### Check 3: Service Worker
```
DevTools → Application → Service Workers
→ Check status: "activated and is running"
→ Nếu có version cũ: Click "skipWaiting"
```

---

## 🎯 Kết Quả Mong Đợi

Sau khi clear cache:
- ✅ Blank screen → **App hiển thị bình thường**
- ✅ Console không còn lỗi
- ✅ Tất cả tính năng hoạt động

**Lưu ý:** Nếu không clear cache, sẽ vẫn dùng bản cũ và vẫn lỗi!

