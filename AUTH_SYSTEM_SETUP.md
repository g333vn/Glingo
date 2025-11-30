# 🔐 Authentication System Setup Guide

## 📋 Overview

Hệ thống authentication hoàn toàn mới, được xây dựng lại từ đầu với Supabase integration. Cấu trúc sạch sẽ, mô-đun hóa, và dễ bảo trì.

### ✨ Key Features

- ✅ **Supabase Authentication** - Secure email/password authentication
- ✅ **User Profiles** - Extended user data in database
- ✅ **Role-Based Access Control** - admin, editor, user roles
- ✅ **Activity Logging** - Track user actions
- ✅ **Admin Management** - Full user management system
- ✅ **Automatic Profile Creation** - Auto-create profile on signup
- ✅ **Password Reset** - Email-based password reset
- ✅ **Modern UI** - Beautiful, responsive login/register pages

---

## 🚀 Quick Setup

### 1. Environment Variables

Tạo file `.env.local` tại root của project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Lấy từ Supabase Dashboard: Settings → API

### 2. Supabase Database Setup

1. Đăng nhập vào Supabase Dashboard
2. Mở SQL Editor
3. Copy toàn bộ code từ `supabase_setup.sql`
4. Paste vào SQL Editor và chạy

Hoặc chạy từng phần:
- Tạo `profiles` table
- Tạo `activity_logs` table
- Tạo indexes
- Enable RLS policies

### 3. Install Dependencies

```bash
npm install
# hoặc
yarn install
```

Các package đã có trong `package.json`:
- `@supabase/supabase-js` - Supabase client

### 4. Update App.jsx

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

## 📁 File Structure

```
src/
├── contexts/
│   └── AuthContext.jsx          # 🎯 Global auth state & actions
├── services/
│   ├── authService.js           # ⚙️ Supabase auth API
│   ├── userManagementService.js # 👥 Admin user management
│   └── supabaseClient.js        # 🔌 Supabase client config
├── hooks/
│   ├── useAuthActions.jsx       # 🎣 Login/register/logout hooks
│   └── useUserManagement.jsx    # 👥 Admin management hooks
├── pages/
│   ├── LoginPage.jsx            # 📝 Login form
│   ├── LoginPage.css
│   ├── RegisterPage.jsx         # 📝 Registration form
│   └── RegisterPage.css
└── ...
```

---

## 🔐 Authentication Flow

### Sign Up Flow

```
User submits form
  ↓
register() in useAuthActions
  ↓
authService.signUp() → Supabase auth.signUp()
  ↓
Supabase creates auth.users entry
  ↓
Trigger: handle_new_user() → Auto-create profiles entry
  ↓
User receives email confirmation
  ↓
Success: User can login
```

### Sign In Flow

```
User submits email/password
  ↓
login() in useAuthActions
  ↓
authService.signIn() → Supabase auth.signInWithPassword()
  ↓
Session created, stored in localStorage
  ↓
AuthContext detects auth state change
  ↓
AuthContext fetches user profile
  ↓
loadUserProfile() → Fetch from profiles table
  ↓
User state updated in context
  ↓
Components re-render with user data
```

### Sign Out Flow

```
User clicks logout
  ↓
logout() in AuthContext
  ↓
authService.signOut() → Supabase auth.signOut()
  ↓
Session cleared from localStorage
  ↓
SIGNED_OUT event fires
  ↓
AuthContext sets user = null
  ↓
Redirect to login page
```

---

## 🎯 Usage Examples

### Using Auth in Components

#### Login/Register

```jsx
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function MyLoginComponent() {
  const { handleLogin, isSubmitting, actionError } = useAuthActions();

  const handleSubmit = async (email, password) => {
    const result = await handleLogin(email, password);
    if (result.success) {
      // Navigate to dashboard
    }
  };

  return (
    <>
      {actionError && <div>{actionError}</div>}
      <button onClick={() => handleSubmit('user@example.com', 'password')}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </>
  );
}
```

#### Access Current User

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please login</div>;

  return (
    <div>
      <h1>Welcome {profile?.display_name}</h1>
      <p>Role: {profile?.role}</p>
      <p>Email: {user?.email}</p>
    </div>
  );
}
```

#### Check Permissions

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedFeature() {
  const { hasPermission, isAdmin, isEditor } = useAuth();

  if (!isAdmin()) return <div>Admin only</div>;

  if (hasPermission('edit-content')) {
    return <EditForm />;
  }

  return <div>No permission</div>;
}
```

#### Update Profile

```jsx
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function ProfileEdit() {
  const { handleUpdateProfile, isSubmitting } = useAuthActions();

  const handleSave = async () => {
    const result = await handleUpdateProfile({
      display_name: 'New Name',
      bio: 'My bio',
    });

    if (result.success) {
      console.log('Profile updated');
    }
  };

  return <button onClick={handleSave}>{isSubmitting ? 'Saving...' : 'Save'}</button>;
}
```

### Admin User Management

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <input
        placeholder="Search users..."
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
                  Make Admin
                </button>
                <button
                  onClick={() => banUserAction(user.user_id)}
                >
                  Ban
                </button>
                <button
                  onClick={() => deleteUserAction(user.user_id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <pagination>Page {page} of {Math.ceil(total / 20)}</pagination>
    </div>
  );
}
```

---

## 🛡️ Security

### Row Level Security (RLS)

Tất cả RLS policies đã được thiết lập trong `supabase_setup.sql`:

- **Users** can view/update their own profile
- **Admins** can view/update any profile
- **Activity logs** protected by user_id

### Password Security

- Passwords không được lưu trữ ở frontend
- Supabase handles password hashing & salting
- Password reset via email

### Email Verification

- Supabase tự động gửi email verification
- Users phải xác thực email trước khi login (có thể disable)

---

## 📊 Database Schema

### profiles table

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY,          -- Links to auth.users
  email TEXT UNIQUE,                 -- User email
  display_name TEXT,                 -- Display name
  role TEXT DEFAULT 'user',          -- admin, editor, user
  is_banned BOOLEAN DEFAULT FALSE,   -- Ban status
  avatar_url TEXT,                   -- Avatar URL
  bio TEXT,                          -- User bio
  phone_number TEXT,                 -- Phone
  location TEXT,                     -- Location
  last_login_at TIMESTAMP,           -- Last login time
  created_at TIMESTAMP,              -- Account creation
  updated_at TIMESTAMP,              -- Last update
);
```

### activity_logs table

```sql
CREATE TABLE activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,                      -- User who did the action
  action TEXT,                       -- e.g., 'login', 'logout', 'create'
  resource_type TEXT,                -- e.g., 'user', 'lesson'
  resource_id TEXT,                  -- e.g., user_id, lesson_id
  details JSONB,                     -- Additional data
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP,
);
```

---

## 🔗 Protected Routes

Sử dụng `ProtectedRoute` component:

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

### Test User Accounts

Tạo test accounts trực tiếp từ Supabase Dashboard:

1. Supabase Dashboard → Authentication
2. Tạo new user với email/password
3. Test login/logout

### Test Admin Functions

```jsx
// Get all users (admin)
const { users } = await useUserManagement();

// Change user role (admin)
await changeUserRole(userId, 'editor');

// Ban user (admin)
await banUserAction(userId);

// Delete user (admin)
await deleteUserAction(userId);
```

---

## 🐛 Troubleshooting

### Issue: "Supabase not configured"

**Solution:** Kiểm tra `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### Issue: User login successful nhưng không load profile

**Solution:** Kiểm tra:
1. Profiles table tồn tại
2. User profile được tạo (check Supabase data browser)
3. RLS policies cho phép select

### Issue: Password reset không gửi email

**Solution:**
1. Kiểm tra Supabase email settings
2. Verify callback URL trong redirect link

### Issue: CORS errors

**Solution:** Kiểm tra Supabase → Settings → API:
- Allowed Origins chứa local URL hoặc domain

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Environment variables set
- [ ] Database setup script run
- [ ] AuthProvider wrapped around app
- [ ] Login/Register pages tested
- [ ] User profile creation verified
- [ ] Admin management tested
- [ ] Role-based access working
- [ ] Password reset configured
- [ ] Email verification enabled (optional)

---

## 📝 Notes

- Hệ thống tự động create profile khi user signup
- Roles: `admin`, `editor`, `user`
- Activity logging available cho audit trail
- All data synced with Supabase in real-time
- Support offline mode (localStorage fallback)

Chúc mừng! Bạn có một hệ thống authentication chuyên nghiệp! 🚀

