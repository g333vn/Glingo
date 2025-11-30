# 📚 Authentication System - Usage Examples

Tài liệu này chứa các ví dụ thực tế cách sử dụng hệ thống authentication.

## 🎯 Mục Lục

1. [Basic Auth Usage](#basic-auth-usage)
2. [Login/Register Components](#loginregister-components)
3. [Protected Routes](#protected-routes)
4. [Admin User Management](#admin-user-management)
5. [Profile Management](#profile-management)
6. [Error Handling](#error-handling)
7. [Activity Logging](#activity-logging)

---

## Basic Auth Usage

### Check if User is Logged In

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading auth state...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please login first</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile?.display_name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Role: {profile?.role}</p>
    </div>
  );
}
```

### Get User Information

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function UserInfo() {
  const { user, profile, isAdmin, isEditor } = useAuth();

  return (
    <div>
      <p>User ID: {user?.id}</p>
      <p>Email: {user?.email}</p>
      <p>Display Name: {profile?.display_name}</p>
      <p>Is Admin: {isAdmin() ? 'Yes' : 'No'}</p>
      <p>Is Editor: {isEditor() ? 'Yes' : 'No'}</p>
      <p>Joined: {new Date(profile?.created_at).toLocaleDateString()}</p>
    </div>
  );
}
```

### Check Permissions

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedFeature() {
  const { hasPermission, isAdmin } = useAuth();

  // Check specific permission
  if (hasPermission('edit-content')) {
    return <EditForm />;
  }

  // Check role
  if (isAdmin()) {
    return <AdminPanel />;
  }

  return <div>You don't have permission to access this</div>;
}
```

---

## Login/Register Components

### Simple Login Form

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
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Simple Register Form

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
      // Show success message
      alert('Registration successful! Please check your email.');
      navigate('/login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {actionError && <div className="error">{actionError}</div>}

      <input
        type="text"
        placeholder="Full Name"
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
        {isSubmitting ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}
```

### Logout Button

```jsx
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
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
```

---

## Protected Routes

### ProtectedRoute Component

```jsx
// src/components/ProtectedRoute.jsx
import { useAuth } from '../contexts/AuthContext.jsx';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole = 'user' }) {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
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

### Using Protected Routes

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

## Admin User Management

### User List with Actions

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

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>User Management</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search users..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.user_id}>
              <td>{user.display_name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_banned ? 'Banned' : 'Active'}</td>
              <td>
                <button
                  onClick={() => changeUserRole(user.user_id, 'admin')}
                >
                  Make Admin
                </button>
                <button
                  onClick={() => changeUserRole(user.user_id, 'user')}
                >
                  Downgrade
                </button>
                <button
                  onClick={() => banUserAction(user.user_id)}
                >
                  {user.is_banned ? 'Unban' : 'Ban'}
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

      {/* Pagination */}
      <div>
        <button
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>
        <span>
          Page {page} of {Math.ceil(total / limit)}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= Math.ceil(total / limit)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
```

### Bulk Operations

```jsx
import { userService } from '../services/userManagementService.js';

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
      alert(`Updated ${updated} users to ${newRole}`);
      setSelectedUsers([]);
    } else {
      alert(`Failed to update ${failed} users`);
    }

    setIsProcessing(false);
  };

  const handleBulkBan = async () => {
    setIsProcessing(true);
    const { success, updated } = await userService.bulkBanUsers(selectedUsers);

    if (success) {
      alert(`Banned ${updated} users`);
      setSelectedUsers([]);
    }

    setIsProcessing(false);
  };

  return (
    <div>
      <p>Selected: {selectedUsers.length} users</p>
      <button
        onClick={() => handleBulkChangeRole('editor')}
        disabled={selectedUsers.length === 0 || isProcessing}
      >
        Make Editors
      </button>
      <button
        onClick={handleBulkBan}
        disabled={selectedUsers.length === 0 || isProcessing}
      >
        Ban Selected
      </button>
    </div>
  );
}
```

---

## Profile Management

### Edit Profile Form

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function EditProfileForm() {
  const { profile, updateProfile } = useAuth();
  const { handleUpdateProfile, isSubmitting } = useAuthActions();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // Load current values
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
      alert('Profile updated successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label>Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label>Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
```

### Change Password Form

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
      alert('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
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
      {success && <div className="success">Password changed successfully!</div>}

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isSubmitting}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Updating...' : 'Change Password'}
      </button>
    </form>
  );
}
```

---

## Error Handling

### Global Error Handling

```jsx
import { useAuth } from '../contexts/AuthContext.jsx';

export function AuthErrorDisplay() {
  const { error } = useAuth();

  if (!error) return null;

  return (
    <div className="alert alert-error" role="alert">
      <strong>Error:</strong> {error}
    </div>
  );
}
```

### Component-level Error Handling

```jsx
import { useState } from 'react';
import { useAuthActions } from '../hooks/useAuthActions.jsx';

export function FormWithErrorHandling() {
  const { handleLogin, actionError, clearError } = useAuthActions();
  const [localError, setLocalError] = useState('');

  const handleChange = () => {
    // Clear errors when user starts typing
    clearError();
    setLocalError('');
  };

  const handleSubmit = async (email, password) => {
    // Validate locally first
    if (!email || !password) {
      setLocalError('Email and password are required');
      return;
    }

    const result = await handleLogin(email, password);

    if (!result.success) {
      setLocalError(result.error || 'Login failed');
    }
  };

  return (
    <form>
      {actionError && <div className="error">{actionError}</div>}
      {localError && <div className="error">{localError}</div>}

      <input onChange={handleChange} />
      <input onChange={handleChange} />

      <button onClick={() => handleSubmit('', '')}>Login</button>
    </form>
  );
}
```

---

## Activity Logging

### Log User Activity

```jsx
import { supabase } from '../services/supabaseClient.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export async function logActivity(action, resource_type, resource_id, details = {}) {
  const { user } = useAuth();

  if (!user?.id) {
    console.warn('Cannot log activity - user not authenticated');
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
        ip_address: null, // You can get this from a service
        user_agent: navigator.userAgent,
      },
    ]);

    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (err) {
    console.error('Unexpected error logging activity:', err);
  }
}
```

### Usage in Components

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

## 🎉 Summary

Hệ thống authentication hoàn toàn trong tầm tay bạn! Các ví dụ trên bao gồm:

- ✅ Basic auth usage
- ✅ Login/Register forms
- ✅ Protected routes
- ✅ User management
- ✅ Profile editing
- ✅ Error handling
- ✅ Activity logging

Tham khảo `AUTH_SYSTEM_SETUP.md` để biết thêm chi tiết về thiết lập.

