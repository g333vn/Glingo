# 🔐 Hệ Thống Đăng Nhập và Phân Quyền

## 📋 Tổng quan

Hệ thống đăng nhập cơ bản với các cấp người dùng:
- **Admin**: Toàn quyền (có thể truy cập Quiz Editor)
- **Editor**: Có thể chỉnh sửa quiz
- **User**: Chỉ xem (người dùng thường)

---

## 👥 Tài khoản mặc định

### Admin
- **Username:** `admin`
- **Password:** `admin123`
- **Quyền:** Toàn quyền (quiz-editor, manage-users, view-all)

### Editor
- **Username:** `editor`
- **Password:** `editor123`
- **Quyền:** Chỉnh sửa quiz (quiz-editor, view-all)

### User
- **Username:** `user1`
- **Password:** `user123`
- **Quyền:** Chỉ xem (view-all)

---

## 🚀 Cách sử dụng

### 1. Đăng nhập

1. Click nút **"Đăng nhập"** ở Header (góc phải)
2. Hoặc truy cập: `/login`
3. Nhập username và password
4. Click "Đăng nhập"

### 2. Truy cập Quiz Editor (chỉ Admin)

1. Đăng nhập với tài khoản **admin**
2. Truy cập: `/admin/quiz-editor`
3. Nếu chưa đăng nhập hoặc không phải admin, sẽ tự động redirect về `/login`

### 3. Đăng xuất

1. Click nút **"Đăng xuất"** ở Header
2. Hoặc click "Đăng xuất" trong Quiz Editor

---

## 🔧 Quản lý Users

### Thêm user mới

Mở file `src/data/users.js` và thêm user mới:

```javascript
{
  id: 4,
  username: 'newuser',
  password: 'password123',
  role: 'user', // hoặc 'admin', 'editor'
  name: 'New User',
  email: 'newuser@example.com'
}
```

### Thay đổi password

Mở file `src/data/users.js` và thay đổi password:

```javascript
{
  id: 1,
  username: 'admin',
  password: 'newpassword123', // Thay đổi ở đây
  // ...
}
```

### Thay đổi role

Mở file `src/data/users.js` và thay đổi role:

```javascript
{
  id: 2,
  username: 'user1',
  role: 'admin', // Thay đổi từ 'user' thành 'admin'
  // ...
}
```

---

## 🛡️ Bảo vệ Routes

### ProtectedRoute Component

Sử dụng `ProtectedRoute` để bảo vệ routes:

```javascript
// Bảo vệ bằng role
<ProtectedRoute requiredRole="admin">
  <QuizEditorPage />
</ProtectedRoute>

// Bảo vệ bằng permission
<ProtectedRoute requiredPermission="quiz-editor">
  <SomePage />
</ProtectedRoute>
```

### Routes được bảo vệ

- `/admin/quiz-editor` - Chỉ admin mới truy cập được

---

## 📝 Permissions

### Admin
- `quiz-editor`: Truy cập Quiz Editor
- `manage-users`: Quản lý users (chưa implement)
- `view-all`: Xem tất cả

### Editor
- `quiz-editor`: Truy cập Quiz Editor
- `view-all`: Xem tất cả

### User
- `view-all`: Chỉ xem

---

## 💾 Lưu trữ

- **localStorage**: Lưu thông tin user đã đăng nhập
- **Session**: Tự động logout khi đóng browser (có thể thay đổi)

---

## 🔒 Bảo mật

### Hiện tại (Client-side)
- ✅ Password được lưu trong code (có thể thay đổi)
- ✅ Session lưu trong localStorage
- ✅ Routes được bảo vệ bằng ProtectedRoute

### Cải thiện (Tùy chọn)
- ⚠️ Sử dụng environment variables cho password
- ⚠️ Hash password (bcrypt, etc.)
- ⚠️ Server-side authentication
- ⚠️ JWT tokens
- ⚠️ Database để lưu users

---

## 🐛 Troubleshooting

### Lỗi: "Cannot read property 'role' of null"
- **Nguyên nhân:** User chưa đăng nhập
- **Cách fix:** Đăng nhập trước khi truy cập protected routes

### Lỗi: "useAuth must be used within AuthProvider"
- **Nguyên nhân:** Component không được wrap trong AuthProvider
- **Cách fix:** Đảm bảo App được wrap trong AuthProvider (đã có sẵn)

### Lỗi: "Không có quyền truy cập"
- **Nguyên nhân:** User không có role/permission cần thiết
- **Cách fix:** Đăng nhập với tài khoản có quyền phù hợp

---

## ✅ Checklist

- [ ] Đã tạo tài khoản admin
- [ ] Đã thay đổi password mặc định
- [ ] Đã test đăng nhập với các role khác nhau
- [ ] Đã test truy cập Quiz Editor (chỉ admin)
- [ ] Đã test logout
- [ ] Đã kiểm tra Header hiển thị user info

---

**Lưu ý:** Đây là hệ thống authentication cơ bản, phù hợp cho dự án nhỏ. Để bảo mật cao hơn, nên implement server-side authentication.

