# 🔐 Hướng Dẫn Setup Hệ Thống Xác Thực

## 📋 Tổng Quan

Hệ thống authentication hoàn toàn mới, được xây dựng lại từ đầu với Supabase integration. Cấu trúc sạch sẽ, mô-đun hóa, và dễ bảo trì.

### ✨ Tính Năng Chính

- ✅ **Supabase Authentication** - Xác thực email/password an toàn
- ✅ **User Profiles** - Dữ liệu user mở rộng trong database
- ✅ **Role-Based Access Control** - Các role admin, editor, user
- ✅ **Activity Logging** - Theo dõi hành động của user
- ✅ **Admin Management** - Hệ thống quản lý user đầy đủ
- ✅ **Automatic Profile Creation** - Tự động tạo profile khi đăng ký
- ✅ **Password Reset** - Đặt lại password qua email
- ✅ **Modern UI** - Trang login/register đẹp, responsive

---

## 🚀 Quick Setup

### 1. Biến Môi Trường

Tạo file `.env.local` tại root của project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Lấy từ Supabase Dashboard: Settings → API

### 2. Setup Database Supabase

1. Đăng nhập vào Supabase Dashboard
2. Mở SQL Editor
3. Copy toàn bộ code từ `supabase_setup.sql`
4. Paste vào SQL Editor và chạy

Hoặc chạy từng phần:
- Tạo bảng `profiles`
- Tạo bảng `activity_logs`
- Tạo indexes
- Bật RLS policies

### 3. Cài Đặt Dependencies

```bash
npm install
# hoặc
yarn install
```

Các package đã có trong `package.json`:
- `@supabase/supabase-js` - Supabase client

### 4. Cập Nhật App.jsx

Chắc chắn AuthProvider được wrap quanh toàn bộ app:

```jsx
import { AuthProvider } from './contexts/AuthContext.jsx';

function App() {
  return (
    <AuthProvider>
      {/* Your routes here */}
    </AuthProvider>
  );
}
```

---

## 📁 Cấu Trúc File

```
src/
├── contexts/
│   └── AuthContext.jsx          # 🎯 State xác thực toàn cục & actions
├── services/
│   ├── authService.js           # ⚙️ Supabase auth API
│   ├── userManagementService.js # 👥 Quản lý user Admin
│   └── supabaseClient.js        # 🔌 Cấu hình Supabase client
├── hooks/
│   ├── useAuthActions.jsx       # 🎣 Hooks login/register/logout
│   └── useUserManagement.jsx    # 👥 Hooks quản lý Admin
├── pages/
│   ├── LoginPage.jsx            # 📝 Form login
│   ├── LoginPage.css
│   ├── RegisterPage.jsx         # 📝 Form đăng ký
│   └── RegisterPage.css
└── ...
```

---

## 🔐 Luồng Xác Thực

### Luồng Đăng Ký

```
User gửi form
  ↓
register() trong useAuthActions
  ↓
authService.signUp() → Supabase auth.signUp()
  ↓
Supabase tạo entry auth.users
  ↓
Trigger: handle_new_user() → Tự động tạo entry profiles
  ↓
User nhận email xác nhận
  ↓
Thành công: User có thể login
```

### Luồng Đăng Nhập

```
User gửi email/password
  ↓
login() trong useAuthActions
  ↓
authService.signIn() → Supabase auth.signInWithPassword()
  ↓
Session được tạo, lưu trong localStorage
  ↓
AuthContext phát hiện thay đổi auth state
  ↓
AuthContext lấy user profile
  ↓
loadUserProfile() → Lấy từ bảng profiles
  ↓
User state được cập nhật trong context
  ↓
Components re-render với dữ liệu user
```

### Luồng Đăng Xuất

```
User click logout
  ↓
logout() trong AuthContext
  ↓
authService.signOut() → Supabase auth.signOut()
  ↓
Session bị xóa khỏi localStorage
  ↓
SIGNED_OUT event được kích hoạt
  ↓
AuthContext đặt user = null
  ↓
Chuyển hướng đến trang login
```

---

## 🎯 Ví Dụ Sử Dụng

### Sử Dụng Auth Trong Components

#### Login/Register

```jsx
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function MyLoginComponent() {
  const { handleLogin, isSubmitting, actionError } = useAuthActions();

  const handleSubmit = async (email, password) => {
    const result = await handleLogin(email, password);
    if (result.success) {
      // Chuyển đến dashboard
    }
  };

  return (
    <>
      {actionError && <div>{actionError}</div>}
      <button onClick={() => handleSubmit('user@example.com', 'password')}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>
    </>
  );
}
```

#### Truy Cập User Hiện Tại

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div>Đang tải...</div>;
  if (!isAuthenticated) return <div>Vui lòng đăng nhập</div>;

  return (
    <div>
      <h1>Chào mừng {profile?.display_name}</h1>
      <p>Role: {profile?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

#### Kiểm Tra Permissions

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedFeature() {
  const { hasPermission, isAdmin, isEditor } = useAuth();

  if (!isAdmin()) return <div>Chỉ dành cho Admin</div>;

  if (hasPermission('edit-content')) {
    return <EditForm />;
  }

  return <div>Không có quyền</div>;
}
```

#### Cập Nhật Profile

```jsx
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function ProfileEdit() {
  const { handleUpdateProfile, isSubmitting } = useAuthActions();

  const handleSave = async () => {
    const result = await handleUpdateProfile({
      display_name: 'Tên Mới',
      bio: 'Tiểu sử của tôi',
    });

    if (result.success) {
      console.log('Profile đã được cập nhật');
    }
  };

  return <button onClick={handleSave}>{isSubmitting ? 'Đang lưu...' : 'Lưu'}</button>;
}
```

### Quản Lý User Admin

```jsx
import { useUserManagement } from '../hooks/useUserManagement.jsx';

export function UserManagementPage() {
  const {
    users,
    total,
    isLoading,
    page,
    handlePageChange,
    search,
    handleSearch,
    changeUserRole,
    banUserAction,
    deleteUserAction,
  } = useUserManagement({
    initialLimit: 20,
  });

  if (isLoading) return <div>Đang tải...</div>;

  return (
    <div>
      <input
        placeholder="Tìm kiếm users..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <table>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button
                  onClick={() => changeUserRole(user.user_id, 'admin')}
                >
                  Làm Admin
                </button>
                <button
                  onClick={() => banUserAction(user.user_id)}
                >
                  Cấm
                </button>
                <button
                  onClick={() => deleteUserAction(user.user_id)}
                >
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <pagination>Trang {page} của {Math.ceil(total / 20)}</pagination>
    </div>
  );
}
```

---

## 🛡️ Bảo Mật

### Row Level Security (RLS)

Tất cả RLS policies đã được thiết lập trong `supabase_setup.sql`:

- **Users** có thể xem/cập nhật profile của chính họ
- **Admins** có thể xem/cập nhật bất kỳ profile nào
- **Activity logs** được bảo vệ bởi user_id

### Bảo Mật Password

- Passwords không được lưu trữ ở frontend
- Supabase xử lý password hashing & salting
- Đặt lại password qua email

### Xác Minh Email

- Supabase tự động gửi email verification
- Users phải xác thực email trước khi login (có thể tắt)

---

## 📊 Schema Database

### Bảng profiles

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,          -- Liên kết với auth.users
  email TEXT UNIQUE,                 -- Email user
  display_name TEXT,                 -- Tên hiển thị
  role TEXT DEFAULT 'user',          -- admin, editor, user
  is_banned BOOLEAN DEFAULT FALSE,   -- Trạng thái cấm
  avatar_url TEXT,                   -- URL avatar
  bio TEXT,                          -- Tiểu sử user
  phone_number TEXT,                 -- Số điện thoại
  location TEXT,                     -- Địa điểm
  last_login_at TIMESTAMP,           -- Thời gian đăng nhập cuối
  created_at TIMESTAMP,              -- Thời gian tạo tài khoản
  updated_at TIMESTAMP,              -- Cập nhật cuối
);
```

### Bảng activity_logs

```sql
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,                      -- User thực hiện hành động
  action TEXT,                       -- VD: 'login', 'logout', 'create'
  resource_type TEXT,                -- VD: 'user', 'lesson'
  resource_id TEXT,                  -- VD: user_id, lesson_id
  details JSONB,                     -- Dữ liệu bổ sung
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP,
);
```

---

## 🔗 Protected Routes

Sử dụng component `ProtectedRoute`:

```jsx
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requiredRole="user">
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

---

## 🧪 Testing

### Tài Khoản User Test

Tạo test accounts trực tiếp từ Supabase Dashboard:

1. Supabase Dashboard → Authentication
2. Tạo user mới với email/password
3. Test login/logout

### Test Chức Năng Admin

```jsx
// Lấy tất cả users (admin)
const { users } = await useUserManagement();

// Thay đổi role user (admin)
await changeUserRole(userId, 'editor');

// Cấm user (admin)
await banUserAction(userId);

// Xóa user (admin)
await deleteUserAction(userId);
```

---

## 🐛 Xử Lý Lỗi

### Vấn Đề: "Supabase not configured"

**Giải Pháp:** Kiểm tra `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### Vấn Đề: User login thành công nhưng không load profile

**Giải Pháp:** Kiểm tra:
1. Bảng Profiles tồn tại
2. User profile được tạo (kiểm tra Supabase data browser)
3. RLS policies cho phép select

### Vấn Đề: Password reset không gửi email

**Giải Pháp:**
1. Kiểm tra cài đặt email Supabase
2. Xác minh callback URL trong redirect link

### Vấn Đề: Lỗi CORS

**Giải Pháp:** Kiểm tra Supabase → Settings → API:
- Allowed Origins chứa local URL hoặc domain

---

## 📚 Tài Nguyên Bổ Sung

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [ ] Supabase project đã tạo
- [ ] Biến môi trường đã đặt
- [ ] Script setup database đã chạy
- [ ] AuthProvider đã wrap quanh app
- [ ] Trang Login/Register đã test
- [ ] Tạo user profile đã xác minh
- [ ] Quản lý Admin đã test
- [ ] Kiểm soát truy cập dựa trên role hoạt động
- [ ] Đặt lại password đã cấu hình
- [ ] Xác minh email đã bật (tùy chọn)

---

## 📝 Ghi Chú

- Hệ thống tự động tạo profile khi user đăng ký
- Roles: `admin`, `editor`, `user`
- Activity logging có sẵn cho audit trail
- Tất cả dữ liệu đồng bộ với Supabase theo thời gian thực
- Hỗ trợ chế độ offline (localStorage fallback)

Chúc mừng! Bạn có một hệ thống authentication chuyên nghiệp! 🚀

