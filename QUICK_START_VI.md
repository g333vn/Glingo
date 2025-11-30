# ⚡ Quick Start - Hệ Thống Xác Thực

## 1️⃣ Setup Supabase (5 phút)

### Tạo Supabase Project
1. Truy cập [supabase.com](https://supabase.com)
2. Tạo project mới
3. Copy URL & ANON KEY

### Tạo `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Chạy Database Setup
1. Mở Supabase Dashboard → SQL Editor
2. Copy toàn bộ code từ `supabase_setup.sql`
3. Paste & Chạy

## 2️⃣ Wrap App với AuthProvider

```jsx
// src/App.jsx
import { AuthProvider } from './contexts/AuthContext.jsx';

export default function App() {
  return (
    <AuthProvider>
      {/* Your routes */}
    </AuthProvider>
  );
}
```

## 3️⃣ Sử Dụng Trong Components

### Hiển Thị Dữ Liệu User
```jsx
import { useAuth } from './contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile } = useAuth();
  return <h1>Chào mừng {profile?.display_name}</h1>;
}
```

### Login/Logout
```jsx
import { useAuthActions } from './hooks/useAuthActions.jsx';

export function MyForm() {
  const { handleLogin, isSubmitting } = useAuthActions();
  
  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
    </button>
  );
}
```

### Bảo Vệ Routes
```jsx
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 4️⃣ Quản Lý Admin

```jsx
import { useUserManagement } from './hooks/useUserManagement.jsx';

export function UserList() {
  const { users, changeUserRole, banUserAction } = useUserManagement();
  
  return users.map(user => (
    <div key={user.user_id}>
      {user.display_name}
      <button onClick={() => changeUserRole(user.user_id, 'admin')}>
        Làm Admin
      </button>
    </div>
  ));
}
```

---

## 📁 File Quan Trọng

| File | Mục Đích |
|------|---------|
| `AuthContext.jsx` | State xác thực toàn cục |
| `authService.js` | Wrapper Supabase API |
| `userManagementService.js` | Thao tác Admin |
| `useAuthActions.jsx` | Hooks login/register |
| `useUserManagement.jsx` | Hooks quản lý admin |
| `supabaseClient.js` | Cấu hình Supabase |

---

## ✅ Checklist

- [ ] Tạo Supabase project
- [ ] Đặt biến môi trường
- [ ] Chạy `supabase_setup.sql`
- [ ] Wrap app với `AuthProvider`
- [ ] Test trang login
- [ ] Test trang register
- [ ] Test protected routes

---

## 🆘 Xử Lý Nhanh

| Vấn Đề | Giải Pháp |
|---------|----------|
| "Supabase not configured" | Kiểm tra `.env.local` có cả URL & KEY |
| Login thất bại im lặng | Kiểm tra console để tìm lỗi |
| User profile không load | Xác minh bảng `profiles` tồn tại trong Supabase |
| Email chưa được xác minh | Kiểm tra cài đặt email trong Supabase |

---

## 📚 Tài Liệu Đầy Đủ

- `AUTH_SYSTEM_SETUP_VI.md` - Hướng dẫn setup đầy đủ
- `AUTH_USAGE_EXAMPLES_VI.md` - Ví dụ code
- `supabase_setup.sql` - Schema database

---

**Vậy thôi! Bạn đã sẵn sàng.** 🚀

Bước tiếp theo:
1. Test login với user test
2. Kiểm tra user xuất hiện trong Supabase dashboard
3. Thử các tính năng quản lý admin
4. Deploy lên production

Chúc code vui vẻ! 💪

