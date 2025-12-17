# 🚀 Các Bước Tiếp Theo Sau Khi Chạy SQL Script

Sau khi chạy xong `supabase_setup_safe.sql`, làm theo các bước sau:

---

## ✅ Bước 1: Xác Minh Database (2 phút)

### Kiểm Tra Trong Supabase Dashboard

1. Vào **Supabase Dashboard** → **Table Editor**
2. Kiểm tra các bảng đã được tạo:
   - ✅ `profiles` - Bảng user profiles
   - ✅ `activity_logs` - Bảng ghi log hoạt động
3. Vào **Authentication** → **Policies**
4. Kiểm tra RLS policies đã được tạo (nên có 4 policies cho `profiles`)

### Kiểm Tra Bằng SQL (Tùy Chọn)

```sql
-- Kiểm tra cấu trúc bảng profiles
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Kiểm tra số lượng policies
SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles';
```

---

## ✅ Bước 2: Kiểm Tra File `.env.local` (1 phút)

### Tạo/Cập Nhật File `.env.local`

Tạo file `.env.local` ở **root của project** (cùng cấp với `package.json`):

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Lấy thông tin từ:**
- Supabase Dashboard → **Settings** → **API**
- Copy **Project URL** → `VITE_SUPABASE_URL`
- Copy **anon public key** → `VITE_SUPABASE_ANON_KEY`

### Lưu Ý Quan Trọng

- ✅ File phải tên chính xác: `.env.local` (có dấu chấm ở đầu)
- ✅ Không có khoảng trắng quanh dấu `=`
- ✅ Không có dấu ngoặc kép quanh giá trị
- ✅ Khởi động lại dev server sau khi tạo/sửa file

---

## ✅ Bước 3: Kiểm Tra File Code Có Tồn Tại (2 phút)

### Kiểm Tra Các File Quan Trọng

Đảm bảo các file sau tồn tại:

```
✅ src/services/supabaseClient.js
✅ src/services/authService.js
✅ src/services/userManagementService.js
✅ src/contexts/AuthContext.jsx
✅ src/hooks/useAuthActions.jsx
✅ src/hooks/useUserManagement.jsx
✅ src/pages/LoginPage.jsx
✅ src/pages/RegisterPage.jsx
```

### Kiểm Tra AuthProvider Đã Được Setup

Mở file `src/main.jsx` và kiểm tra:

```jsx
// Phải có dòng này
import { AuthProvider } from './contexts/AuthContext.jsx';

// Và RouterProvider phải được wrap bởi AuthProvider
<AuthProvider>
  <RouterProvider router={router} />
</AuthProvider>
```

**Nếu chưa có:** Xem hướng dẫn trong `QUICK_START_VI.md`

---

## ✅ Bước 4: Khởi Động Dev Server (1 phút)

```bash
# Dừng server hiện tại (nếu đang chạy)
# Nhấn Ctrl+C

# Khởi động lại
npm run dev
```

### Kiểm Tra Console Log

Mở browser console (F12) và tìm:

```
✅ [supabaseClient] Connection OK
✅ [AuthContext] Auth state initialized
```

**Nếu thấy lỗi:**
- `Supabase not configured` → Kiểm tra lại `.env.local`
- `Failed to fetch` → Kiểm tra URL trong `.env.local`

---

## ✅ Bước 5: Test Đăng Ký User Mới (3 phút)

### Test Trong Browser

1. Mở browser → `http://localhost:5173/register` (hoặc port của bạn)
2. Điền form:
   - **Tên Hiển Thị:** "Test User"
   - **Email:** "test@example.com"
   - **Password:** "TestPassword123"
   - **Xác Nhận Password:** "TestPassword123"
3. Click **"Register"** hoặc **"Đăng Ký"**
4. Kiểm tra:
   - ✅ Thấy thông báo thành công
   - ✅ Redirect đến trang login (sau 2-3 giây)

### Kiểm Tra Trong Supabase

1. Vào **Supabase Dashboard** → **Table Editor** → **profiles**
2. User mới sẽ xuất hiện với:
   - `user_id` (UUID)
   - `email`: "test@example.com"
   - `display_name`: "Test User"
   - `role`: "user"

---

## ✅ Bước 6: Test Đăng Nhập (2 phút)

### Test Trong Browser

1. Mở `http://localhost:5173/login`
2. Điền:
   - **Email:** "test@example.com"
   - **Password:** "TestPassword123"
3. Click **"Login"** hoặc **"Đăng Nhập"**
4. Kiểm tra:
   - ✅ Redirect đến dashboard hoặc trang chính
   - ✅ Thấy tên user hiển thị
   - ✅ Console log: `[AuthContext] User restored`

### Kiểm Tra Session

1. Mở **Browser DevTools** (F12)
2. Vào tab **Application** → **Local Storage**
3. Tìm key: `sb-<project-id>-auth-token`
4. Nên thấy session token được lưu

---

## ✅ Bước 7: Test Session Persistence (1 phút)

1. Trong khi đã đăng nhập, **refresh trang** (F5)
2. Kiểm tra:
   - ✅ Vẫn đăng nhập (không bị logout)
   - ✅ User info vẫn hiển thị
   - ✅ Console log: `[AuthContext] Initial session found`

---

## ✅ Bước 8: Test Protected Routes (2 phút)

### Tạo ProtectedRoute Component (Nếu Chưa Có)

Tạo file `src/components/ProtectedRoute.jsx`:

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

### Test Protected Route

1. Đăng xuất (nếu đang đăng nhập)
2. Thử truy cập trực tiếp: `http://localhost:5173/dashboard`
3. Kiểm tra:
   - ✅ Redirect đến `/login`
4. Đăng nhập lại
5. Truy cập `/dashboard` lại
6. Kiểm tra:
   - ✅ Có thể truy cập được

---

## ✅ Bước 9: Tạo User Admin (3 phút)

### Cách 1: Qua Supabase Dashboard

1. Vào **Supabase Dashboard** → **Table Editor** → **profiles**
2. Tìm user bạn vừa tạo
3. Click vào row để edit
4. Đổi `role` từ `user` → `admin`
5. Save

### Cách 2: Qua SQL Editor

```sql
-- Tìm user_id của bạn
SELECT user_id, email, role FROM profiles;

-- Đổi role thành admin (thay YOUR_USER_ID)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'test@example.com';
```

### Test Admin Features

1. Logout và login lại với user admin
2. Kiểm tra:
   - ✅ Có thể truy cập `/admin` (nếu có)
   - ✅ Có thể xem danh sách users

---

## ✅ Bước 10: Kiểm Tra Hoàn Chỉnh (2 phút)

### Checklist Cuối Cùng

- [ ] Database đã setup (bảng `profiles`, `activity_logs`)
- [ ] `.env.local` đã cấu hình đúng
- [ ] Dev server chạy không lỗi
- [ ] Console không có lỗi đỏ
- [ ] Đăng ký user mới thành công
- [ ] User xuất hiện trong Supabase
- [ ] Đăng nhập thành công
- [ ] Session persist sau khi refresh
- [ ] Protected routes hoạt động
- [ ] Admin user có thể truy cập admin features

---

## 🎉 Hoàn Thành!

Nếu tất cả các bước trên đều ✅, bạn đã setup thành công!

### Bước Tiếp Theo:

1. **Tùy chỉnh UI:** Chỉnh sửa `LoginPage.jsx` và `RegisterPage.jsx` theo ý muốn
2. **Thêm tính năng:** Xem `AUTH_USAGE_EXAMPLES_VI.md` để biết cách thêm tính năng
3. **Deploy:** Khi sẵn sàng, deploy lên production

---

## 🆘 Nếu Gặp Lỗi

### Lỗi Thường Gặp

| Lỗi | Giải Pháp |
|-----|-----------|
| `Supabase not configured` | Kiểm tra `.env.local` có đúng không |
| `Failed to fetch` | Kiểm tra URL trong `.env.local` |
| `Invalid API key` | Kiểm tra anon key trong `.env.local` |
| `Table profiles does not exist` | Chạy lại SQL script |
| `Column email does not exist` | Sử dụng `supabase_setup_safe.sql` |

### Tài Liệu Tham Khảo

- `FIX_SQL_ERROR_VI.md` - Sửa lỗi SQL
- `AUTH_SYSTEM_SETUP_VI.md` - Setup đầy đủ
- `QUICK_START_VI.md` - Quick start guide

---

**Chúc bạn thành công!** 🚀

