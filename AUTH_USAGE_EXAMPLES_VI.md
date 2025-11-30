# 📚 Hệ Thống Xác Thực - Ví Dụ Sử Dụng

Tài liệu này chứa các ví dụ thực tế cách sử dụng hệ thống authentication.

## 🎯 Mục Lục

1. [Sử Dụng Auth Cơ Bản](#sử-dụng-auth-cơ-bản)
2. [Component Login/Register](#component-loginregister)
3. [Protected Routes](#protected-routes)
4. [Quản Lý User Admin](#quản-lý-user-admin)
5. [Quản Lý Profile](#quản-lý-profile)
6. [Xử Lý Lỗi](#xử-lý-lỗi)
7. [Ghi Log Hoạt Động](#ghi-log-hoạt-động)

---

## Sử Dụng Auth Cơ Bản

### Kiểm Tra User Đã Đăng Nhập

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Đang tải trạng thái xác thực...</div>;
  }

  if (!isAuthenticated) {
    return <div>Vui lòng đăng nhập trước</div>;
  }

  return (
    <div>
      <h1>Chào mừng, {profile?.display_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {profile?.role}</p>
    </div>
  );
}
```

### Lấy Thông Tin User

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function UserInfo() {
  const { user, profile, isAdmin, isEditor } = useAuth();

  return (
    <div>
      <p>User ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Tên Hiển Thị: {profile?.display_name}</p>
      <p>Là Admin: {isAdmin() ? 'Có' : 'Không'}</p>
      <p>Là Editor: {isEditor() ? 'Có' : 'Không'}</p>
      <p>Tham Gia: {new Date(profile?.created_at).toLocaleDateString()}</p>
    </div>
  );
}
```

### Kiểm Tra Permissions

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedFeature() {
  const { hasPermission, isAdmin } = useAuth();

  // Kiểm tra permission cụ thể
  if (hasPermission('edit-content')) {
    return <EditForm />;
  }

  // Kiểm tra role
  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <div>Bạn không có quyền truy cập tính năng này</div>;
}
```

---

## Component Login/Register

### Form Login Đơn Giản

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function SimpleLoginForm() {
  const navigate = useNavigate();
  const { handleLogin, isSubmitting, actionError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleLogin(email, password);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {actionError && <div className="error">{actionError}</div>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang đăng nhập...' : 'Đăng Nhập'}
      </button>
    </form>
  );
}
```

### Form Đăng Ký Đơn Giản

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function SimpleRegisterForm() {
  const navigate = useNavigate();
  const { handleRegister, isSubmitting, actionError } = useAuthActions();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleRegister(email, password, displayName);

    if (result.success) {
      // Hiển thị thông báo thành công
      alert('Đăng ký thành công! Vui lòng kiểm tra email của bạn.');
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {actionError && <div className="error">{actionError}</div>}

      <input
        type="text"
        placeholder="Họ và Tên"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        disabled={isSubmitting}
      />

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubmitting}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng Ký'}
      </button>
    </form>
  );
}
```

### Nút Logout

```jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function LogoutButton() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    const result = await logout();

    if (result.success) {
      navigate('/login');
    }

    setIsLoading(false);
  };

  return (
    <button onClick={handleLogout} disabled={isLoading}>
      {isLoading ? 'Đang đăng xuất...' : 'Đăng Xuất'}
    </button>
  );
}
```

---

## Protected Routes

### Component ProtectedRoute

```jsx
// src/components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole = 'user' }) {
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

  if (requiredRole === 'editor' && !['admin', 'editor'].includes(profile?.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
```

### Sử Dụng Protected Routes

```jsx
// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AdminPanel from './pages/AdminPanel.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

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

## Quản Lý User Admin

### Danh Sách User Với Actions

```jsx
import { useUserManagement } from '../hooks/useUserManagement.jsx';

export function UsersList() {
  const {
    users,
    total,
    isLoading,
    error,
    page,
    limit,
    search,
    handleSearch,
    handlePageChange,
    changeUserRole,
    banUserAction,
    deleteUserAction,
  } = useUserManagement({ initialLimit: 20 });

  if (isLoading) return <div>Đang tải users...</div>;
  if (error) return <div>Lỗi: {error}</div>;

  return (
    <div>
      <h1>Quản Lý User</h1>

      {/* Tìm kiếm */}
      <input
        type="text"
        placeholder="Tìm kiếm users..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Bảng Users */}
      <table>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trạng Thái</th>
            <th>Hành Động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_banned ? 'Bị Cấm' : 'Hoạt Động'}</td>
              <td>
                <button
                  onClick={() => changeUserRole(user.user_id, 'admin')}
                >
                  Làm Admin
                </button>
                <button
                  onClick={() => changeUserRole(user.user_id, 'user')}
                >
                  Hạ Cấp
                </button>
                <button
                  onClick={() => banUserAction(user.user_id)}
                >
                  {user.is_banned ? 'Bỏ Cấm' : 'Cấm'}
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

      {/* Phân trang */}
      <div>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Trước
        </button>
        <span>
          Trang {page} của {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= Math.ceil(total / limit)}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
```

### Thao Tác Hàng Loạt

```jsx
import { useState } from 'react';
import * as userService from '../services/userManagementService.js';

export function BulkUserActions() {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkChangeRole = async (newRole) => {
    setIsProcessing(true);
    const { success, updated, failed } = await userService.bulkChangeRoles(
      selectedUsers,
      newRole
    );

    if (success) {
      alert(`Đã cập nhật ${updated} users thành ${newRole}`);
      setSelectedUsers([]);
    } else {
      alert(`Không thể cập nhật ${failed} users`);
    }

    setIsProcessing(false);
  };

  const handleBulkBan = async () => {
    setIsProcessing(true);
    const { success, updated } = await userService.bulkBanUsers(selectedUsers);

    if (success) {
      alert(`Đã cấm ${updated} users`);
      setSelectedUsers([]);
    }

    setIsProcessing(false);
  };

  return (
    <div>
      <p>Đã chọn: {selectedUsers.length} users</p>
      <button
        onClick={() => handleBulkChangeRole('editor')}
        disabled={selectedUsers.length === 0 || isProcessing}
      >
        Làm Editors
      </button>
      <button
        onClick={handleBulkBan}
        disabled={selectedUsers.length === 0 || isProcessing}
      >
        Cấm Đã Chọn
      </button>
    </div>
  );
}
```

---

## Quản Lý Profile

### Form Chỉnh Sửa Profile

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function EditProfileForm() {
  const { profile } = useAuth();
  const { handleUpdateProfile, isSubmitting } = useAuthActions();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // Tải giá trị hiện tại
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setLocation(profile.location || '');
    }
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleUpdateProfile({
      display_name: displayName,
      bio,
      location,
    });

    if (result.success) {
      alert('Profile đã được cập nhật thành công!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Tên Hiển Thị</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label>Tiểu Sử</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label>Địa Điểm</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
      </button>
    </form>
  );
}
```

### Form Đổi Password

```jsx
import { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function ChangePasswordForm() {
  const { handleUpdatePassword, isSubmitting, actionError } = useAuthActions();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('Passwords không khớp');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password phải tối thiểu 6 ký tự');
      return;
    }

    const result = await handleUpdatePassword(newPassword);

    if (result.success) {
      setSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {actionError && <div className="error">{actionError}</div>}
      {success && <div className="success">Password đã được đổi thành công!</div>}

      <input
        type="password"
        placeholder="Password Mới"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <input
        type="password"
        placeholder="Xác Nhận Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Đang cập nhật...' : 'Đổi Password'}
      </button>
    </form>
  );
}
```

---

## Xử Lý Lỗi

### Xử Lý Lỗi Toàn Cục

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function AuthErrorDisplay() {
  const { error } = useAuth();

  if (!error) return null;

  return (
    <div className="alert alert-error" role="alert">
      <strong>Lỗi:</strong> {error}
    </div>
  );
}
```

### Xử Lý Lỗi Cấp Component

```jsx
import { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function FormWithErrorHandling() {
  const { handleLogin, actionError, clearError } = useAuthActions();
  const [localError, setLocalError] = useState('');

  const handleChange = () => {
    // Xóa lỗi khi user bắt đầu gõ
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (email, password) => {
    // Validate cục bộ trước
    if (!email || !password) {
      setLocalError('Email và password là bắt buộc');
      return;
    }

    const result = await handleLogin(email, password);

    if (!result.success) {
      setLocalError(result.error || 'Đăng nhập thất bại');
    }
  };

  return (
    <form>
      {actionError && <div className="error">{actionError}</div>}
      {localError && <div className="error">{localError}</div>}

      <input onChange={handleChange} />
      <input onChange={handleChange} />

      <button onClick={() => handleSubmit('', '')}>Đăng Nhập</button>
    </form>
  );
}
```

---

## Ghi Log Hoạt Động

### Ghi Log Hoạt Động User

```jsx
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export async function logActivity(action, resource_type, resource_id, details = {}) {
  const { user } = useAuth();

  if (!user?.id) {
    console.warn('Không thể ghi log - user chưa xác thực');
    return;
  }

  try {
    const { error } = await supabase.from('activity_logs').insert([
      {
        user_id: user.id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address: null, // Bạn có thể lấy từ service
        user_agent: navigator.userAgent,
      },
    ]);

    if (error) {
      console.error('Lỗi ghi log hoạt động:', error);
    }
  } catch (err) {
    console.error('Lỗi không mong đợi khi ghi log:', err);
  }
}
```

### Sử Dụng Trong Components

```jsx
import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { logActivity } from '../utils/activityLogger.js';

export function Dashboard() {
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      logActivity('view_page', 'dashboard', user.id, {
        page: 'dashboard',
        timestamp: new Date().toISOString(),
      });
    }
  }, [user?.id]);

  return <div>Dashboard</div>;
}
```

---

## 🎉 Tóm Tắt

Hệ thống authentication hoàn toàn trong tầm tay bạn! Các ví dụ trên bao gồm:

- ✅ Sử dụng auth cơ bản
- ✅ Form Login/Register
- ✅ Protected routes
- ✅ Quản lý user
- ✅ Chỉnh sửa profile
- ✅ Xử lý lỗi
- ✅ Ghi log hoạt động

Tham khảo `AUTH_SYSTEM_SETUP_VI.md` để biết thêm chi tiết về thiết lập.

