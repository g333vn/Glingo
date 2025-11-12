# 🔧 Hướng Dẫn Truy Cập Admin Panel

## ❌ Lỗi 404 "Không tìm thấy trang"

Nếu bạn gặp lỗi **404 - Không tìm thấy trang** khi truy cập `/admin/content`, hãy làm theo các bước sau:

---

## ✅ Bước 1: Kiểm Tra URL

**URL đúng phải là:**
```
http://192.168.1.233:5173/admin/content
```

**KHÔNG phải:**
- `http://192.168.1.233:5173/admin-content` ❌
- `http://192.168.1.233:5173/content` ❌
- `http://192.168.1.233:5173/admincontent` ❌

---

## ✅ Bước 2: Đăng Nhập với Tài Khoản Admin

Trước khi truy cập Admin Panel, bạn **phải đăng nhập** với tài khoản admin:

1. **Truy cập trang Login:**
   ```
   http://192.168.1.233:5173/login
   ```

2. **Đăng nhập với:**
   - **Username**: `admin`
   - **Password**: `admin123`

3. **Sau khi đăng nhập thành công**, bạn sẽ thấy:
   - Tên user ở header: "Xin chào, Admin!"
   - Nút "Admin Panel" ở header
   - Nút "Đăng xuất"

---

## ✅ Bước 3: Truy Cập Admin Panel

**Cách 1: Click vào nút "Admin Panel" trên Header**
- Sau khi đăng nhập, click vào nút **"🔧 Admin Panel"** trên header
- Nó sẽ đưa bạn đến `/admin` (Dashboard)

**Cách 2: Truy cập trực tiếp qua URL**
```
http://192.168.1.233:5173/admin
http://192.168.1.233:5173/admin/content
http://192.168.1.233:5173/admin/users
http://192.168.1.233:5173/admin/quiz-editor
```

---

## ✅ Bước 4: Clear Cache & Hard Refresh

Nếu vẫn gặp lỗi 404, hãy làm theo:

### Trên Desktop (Chrome/Edge/Firefox):
1. Nhấn **Ctrl + Shift + R** (Windows/Linux)
2. Hoặc **Ctrl + F5**
3. Hoặc mở DevTools (F12) → Right-click vào nút Reload → Chọn **"Empty Cache and Hard Reload"**

### Trên Mobile:
1. Mở Settings → Clear browsing data
2. Chọn **Cached images and files**
3. Clear data
4. Reload page

---

## ✅ Bước 5: Restart Dev Server

Nếu vẫn không được, hãy restart dev server:

### Trên Windows (PowerShell):
```powershell
# Trong terminal đang chạy npm run dev
# Nhấn Ctrl + C để dừng server

# Sau đó chạy lại:
cd "E:\Projects\elearning - cur"
npm run dev
```

### Kiểm tra:
```powershell
# Sau khi server chạy lại, bạn sẽ thấy:
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.233:5173/
```

---

## 🧪 Test Routing

Hãy test các routes sau để đảm bảo routing hoạt động:

### ✅ Routes Công Khai (Không cần login):
- `http://192.168.1.233:5173/` → Trang chủ ✅
- `http://192.168.1.233:5173/about` → Trang About ✅
- `http://192.168.1.233:5173/login` → Trang Login ✅
- `http://192.168.1.233:5173/level` → Trang Level ✅
- `http://192.168.1.233:5173/jlpt` → Trang JLPT ✅

### 🔒 Routes Bảo Vệ (Cần login admin):
- `http://192.168.1.233:5173/admin` → Admin Dashboard 🔒
- `http://192.168.1.233:5173/admin/content` → Content Management 🔒
- `http://192.168.1.233:5173/admin/users` → User Management 🔒
- `http://192.168.1.233:5173/admin/quiz-editor` → Quiz Editor 🔒

**Nếu chưa login:**
- Bạn sẽ bị redirect về `/login`

**Nếu đã login nhưng không phải admin:**
- Bạn sẽ thấy message: "🚫 Không có quyền truy cập"

---

## 🐛 Debug: Kiểm Tra Console

Nếu vẫn gặp lỗi, hãy mở **DevTools Console** (F12):

### Lỗi thường gặp:

#### 1. **"Module not found: Modal.jsx"**
```
❌ Error: Cannot find module './components/Modal.jsx'
```
**Giải pháp**: File `Modal.jsx` đã được tạo tại `src/components/Modal.jsx`. Restart dev server.

#### 2. **"User is null"**
```
❌ TypeError: Cannot read properties of null (reading 'role')
```
**Giải pháp**: Bạn chưa login. Truy cập `/login` và đăng nhập.

#### 3. **"404 Not Found"**
```
❌ 404 - Không tìm thấy trang
```
**Giải pháp**: 
- Kiểm tra URL có đúng không (có dấu `/` chính xác)
- Clear cache và hard refresh
- Restart dev server

---

## 📋 Checklist

Hãy kiểm tra lại:

- [ ] Đã đăng nhập với tài khoản `admin / admin123`
- [ ] URL chính xác: `http://192.168.1.233:5173/admin/content`
- [ ] Dev server đang chạy (`npm run dev`)
- [ ] Đã clear cache và hard refresh (Ctrl + Shift + R)
- [ ] Console không có lỗi (F12)
- [ ] Build thành công (`npm run build` không có lỗi)

---

## 🚀 Nếu Tất Cả Đều Đúng

Nếu đã làm theo tất cả các bước trên mà vẫn gặp lỗi 404:

1. **Chụp màn hình** lỗi trong Console (F12)
2. **Chụp màn hình** URL bar
3. **Chụp màn hình** Network tab (F12 → Network)
4. Gửi cho tôi để debug thêm!

---

## 💡 Gợi Ý

**Thử truy cập từ trang chủ:**
1. Mở `http://192.168.1.233:5173/`
2. Click "Đăng nhập" ở header
3. Đăng nhập với `admin / admin123`
4. Sau khi đăng nhập, click nút **"🔧 Admin Panel"** trên header
5. Trong Admin Dashboard, click vào **"📚 Quản lý Nội dung"** trong sidebar

---

**Hãy thử và cho tôi biết kết quả!** 🎯

