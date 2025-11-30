# 🔧 Sửa Lỗi Màn Hình Trắng

## 🚨 Nguyên Nhân Thường Gặp

Màn hình trắng thường do:
1. ❌ Lỗi JavaScript trong console
2. ❌ Dev server không chạy hoặc crash
3. ❌ Lỗi import/export trong code
4. ❌ Thiếu file `.env.local`
5. ❌ Lỗi với AuthProvider hoặc context

---

## ✅ Bước 1: Kiểm Tra Console (QUAN TRỌNG NHẤT)

### Mở Browser Console

1. Mở trang `localhost:5173`
2. Nhấn **F12** để mở DevTools
3. Vào tab **Console**
4. **Tìm lỗi màu đỏ**

### Các Lỗi Thường Gặp

#### Lỗi 1: "Cannot find module"
```
Error: Cannot find module './contexts/AuthContext.jsx'
```
**Giải pháp:** File không tồn tại hoặc đường dẫn sai

#### Lỗi 2: "Supabase not configured"
```
[Supabase] ⚠️ Missing configuration: VITE_SUPABASE_URL
```
**Giải pháp:** Tạo file `.env.local` (xem Bước 2)

#### Lỗi 3: "Failed to fetch"
```
Failed to fetch: https://xxx.supabase.co
```
**Giải pháp:** Kiểm tra URL trong `.env.local`

#### Lỗi 4: "Cannot read property of undefined"
```
TypeError: Cannot read property 'user' of undefined
```
**Giải pháp:** Lỗi trong code, cần fix

---

## ✅ Bước 2: Kiểm Tra File `.env.local`

### Tạo File `.env.local`

1. Ở **root của project** (cùng cấp với `package.json`)
2. Tạo file tên: `.env.local` (có dấu chấm ở đầu)
3. Thêm nội dung:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Lấy Thông Tin Từ Supabase

1. Vào **Supabase Dashboard**
2. **Settings** → **API**
3. Copy **Project URL** → `VITE_SUPABASE_URL`
4. Copy **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Lưu Ý

- ✅ File phải tên chính xác: `.env.local`
- ✅ Không có khoảng trắng quanh dấu `=`
- ✅ Không có dấu ngoặc kép
- ✅ **Phải restart dev server** sau khi tạo/sửa

---

## ✅ Bước 3: Kiểm Tra Dev Server

### Kiểm Tra Server Đang Chạy

Mở terminal và kiểm tra:

```bash
# Server phải đang chạy
# Nên thấy dòng:
# ➜  Local:   http://localhost:5173/
```

### Nếu Server Không Chạy

```bash
# Dừng server (nếu đang chạy)
# Nhấn Ctrl+C

# Khởi động lại
npm run dev
```

### Kiểm Tra Lỗi Trong Terminal

Nếu thấy lỗi trong terminal khi start server:
- ❌ `Cannot find module` → Chạy `npm install`
- ❌ `Port already in use` → Đổi port hoặc kill process
- ❌ Syntax error → Fix lỗi trong code

---

## ✅ Bước 4: Clear Cache và Restart

### Clear Vite Cache

```bash
# Dừng server (Ctrl+C)

# Xóa cache
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Hoặc Linux/Mac:
rm -rf node_modules/.vite dist

# Khởi động lại
npm run dev
```

### Hard Reload Browser

1. Mở trang web
2. Nhấn **Ctrl + Shift + R** (Windows/Linux)
3. Hoặc **Cmd + Shift + R** (Mac)

---

## ✅ Bước 5: Kiểm Tra File Quan Trọng

### Kiểm Tra File Có Tồn Tại

```bash
# Kiểm tra các file quan trọng
ls src/contexts/AuthContext.jsx
ls src/services/supabaseClient.js
ls src/services/authService.js
ls src/main.jsx
```

### Kiểm Tra Import Trong main.jsx

Mở `src/main.jsx` và kiểm tra:

```jsx
// Phải có:
import { AuthProvider } from './contexts/AuthContext.jsx';

// Và RouterProvider phải được wrap:
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

---

## ✅ Bước 6: Test Trong Incognito Window

1. Mở **Incognito Window** (Ctrl+Shift+N)
2. Mở **Console** (F12) ngay
3. Vào `localhost:5173`
4. Xem console có lỗi gì không

Nếu incognito hoạt động → Vấn đề là cache browser

---

## 🔍 Debug Chi Tiết

### Kiểm Tra Trong Console

Mở Console (F12) và chạy:

```javascript
// Kiểm tra environment variables
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing');

// Kiểm tra React
console.log('React version:', React.version);

// Kiểm tra localStorage
console.log('LocalStorage:', localStorage);
```

### Kiểm Tra Network Tab

1. Mở **DevTools** (F12)
2. Vào tab **Network**
3. Reload trang (F5)
4. Kiểm tra:
   - ✅ `index.html` load thành công (status 200)
   - ✅ `main.js` load thành công
   - ❌ Nếu có file fail → Xem lỗi gì

---

## 🆘 Quick Fix Checklist

Làm theo thứ tự:

- [ ] **Mở Console (F12)** → Tìm lỗi đỏ
- [ ] **Kiểm tra `.env.local`** → Có file và đúng format?
- [ ] **Restart dev server** → `Ctrl+C` rồi `npm run dev`
- [ ] **Hard reload browser** → `Ctrl+Shift+R`
- [ ] **Clear cache** → Xóa `node_modules/.vite`
- [ ] **Test incognito** → Mở cửa sổ ẩn danh

---

## 📋 Các Lỗi Cụ Thể

### Lỗi: "Supabase not configured"

**Nguyên nhân:** Thiếu `.env.local`

**Giải pháp:**
1. Tạo file `.env.local` ở root
2. Thêm `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`
3. Restart dev server

### Lỗi: "Cannot find module"

**Nguyên nhân:** File không tồn tại hoặc đường dẫn sai

**Giải pháp:**
1. Kiểm tra file có tồn tại không
2. Kiểm tra đường dẫn import có đúng không
3. Chạy `npm install` nếu thiếu package

### Lỗi: "Failed to fetch"

**Nguyên nhân:** URL Supabase sai hoặc không truy cập được

**Giải pháp:**
1. Kiểm tra URL trong `.env.local`
2. Kiểm tra internet connection
3. Kiểm tra Supabase project có active không

### Lỗi: "Cannot read property of undefined"

**Nguyên nhân:** Code cố truy cập property của object undefined

**Giải pháp:**
1. Xem lỗi trong console để biết dòng nào
2. Thêm optional chaining: `user?.email` thay vì `user.email`
3. Thêm null check trước khi dùng

---

## 💡 Mẹo

1. **Luôn mở Console trước** khi debug
2. **Đọc lỗi cẩn thận** - thường có thông tin hữu ích
3. **Test trong incognito** để loại trừ cache
4. **Restart server** sau khi sửa `.env.local`

---

## 📞 Nếu Vẫn Không Được

1. Copy **toàn bộ lỗi** trong console
2. Copy **output của terminal** khi chạy `npm run dev`
3. Kiểm tra file `.env.local` có đúng không
4. Tham khảo `NEXT_STEPS_AFTER_SQL_VI.md` để setup lại từ đầu

---

**Bắt đầu với Bước 1: Mở Console và tìm lỗi!** 🔍

