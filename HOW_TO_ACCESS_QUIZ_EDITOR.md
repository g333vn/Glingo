# 🔒 Cách Truy Cập Admin Dashboard và Quiz Editor

## ⚠️ Lưu ý quan trọng

**Admin Dashboard được bảo vệ!** Chỉ quản trị viên mới có thể truy cập.

---

## 📍 Cách truy cập

### Bước 1: Đăng nhập

1. Click nút **"Đăng nhập"** ở Header (góc phải)
2. Hoặc truy cập: `/login`
3. Nhập thông tin:
   - **Username:** `admin`
   - **Password:** `admin123`
4. Click "Đăng nhập"

### Bước 2: Truy cập Admin Dashboard

**Sau khi đăng nhập:**
- Truy cập: `/admin` → Vào Admin Dashboard
- Hoặc truy cập: `/admin/quiz-editor` → Vào Quiz Editor trực tiếp

**Development (Local):**
```
http://localhost:5173/admin
```

**Production:**
```
https://your-domain.com/admin
```

### Bước 3: Sử dụng Admin Dashboard

- **Dashboard:** Xem tổng quan và thống kê
- **Quiz Editor:** Tạo và quản lý quiz (click vào sidebar)
- **Các module khác:** Sẽ được thêm sau (Users, Content, Settings)

### Bước 4: Đăng xuất

- Click nút **"Đăng xuất"** ở Header
- Hoặc click "Đăng xuất" trong Admin Dashboard sidebar

---

## 🔐 Thay đổi mật khẩu

Mật khẩu được lưu trong file `src/data/users.js`:

```javascript
{
  id: 1,
  username: 'admin',
  password: 'admin123', // Thay đổi password này!
  role: 'admin',
  // ...
}
```

**Cách thay đổi:**
1. Mở file `src/data/users.js`
2. Tìm user `admin`
3. Thay đổi `password: 'admin123'` thành mật khẩu mới
4. Lưu file và rebuild app

---

## 🛡️ Bảo mật

- ✅ Link đã được ẩn khỏi Footer (không công khai)
- ✅ Yêu cầu password để truy cập
- ✅ Session chỉ lưu trong browser (không persistent)
- ✅ Tự động logout khi đóng browser

**⚠️ Lưu ý:** Đây là bảo vệ cơ bản. Để bảo mật cao hơn, nên:
- Sử dụng authentication server-side
- Hoặc environment variables cho password
- Hoặc JWT tokens

---

## 💡 Tips

### Tip 1: Bookmark
- Bookmark URL này để truy cập nhanh sau này
- Hoặc thêm vào bookmark bar của browser

### Tip 2: Shortcut
- Có thể tạo shortcut trên desktop (Windows) hoặc dock (Mac)
- Hoặc thêm vào home screen (mobile)

### Tip 3: Nhớ URL
- URL pattern: `/admin/quiz-editor`
- Dễ nhớ: "admin" + "quiz-editor"

---

## ⚠️ Lưu ý

- Tool này không yêu cầu đăng nhập (hiện tại)
- Có thể truy cập từ bất kỳ đâu trong app
- Link có trong Footer để dễ tìm

---

## 🎯 Quick Access

**Nhấn Ctrl+L (hoặc Cmd+L trên Mac)** và gõ:
```
/admin/quiz-editor
```

Rồi Enter! ✨

