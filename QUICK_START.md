# ⚡ Quick Start - Authentication System

## 1️⃣ Setup Supabase (5 min)

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Copy URL & ANON KEY

### Create `.env.local`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run Database Setup
1. Open Supabase Dashboard → SQL Editor
2. Copy all code from `supabase_setup.sql`
3. Paste & Execute

## 2️⃣ Wrap App with AuthProvider

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

## 3️⃣ Use in Components

### Show User Data
```jsx
import { useAuth } from './contexts/AuthContext.jsx';

export function MyComponent() {
  const { user, profile } = useAuth();
  return <h1>Welcome {profile?.display_name}</h1>;
}
```

### Login/Logout
```jsx
import { useAuthActions } from './hooks/useAuthActions.jsx';

export function MyForm() {
  const { handleLogin, isSubmitting } = useAuthActions();
  
  return (
    <button onClick={() => handleLogin('user@example.com', 'password')}>
      {isSubmitting ? 'Logging in...' : 'Login'}
    </button>
  );
}
```

### Protect Routes
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

## 4️⃣ Admin Management

```jsx
import { useUserManagement } from './hooks/useUserManagement.jsx';

export function UserList() {
  const { users, changeUserRole, banUserAction } = useUserManagement();
  
  return users.map(user => (
    <div key={user.user_id}>
      {user.display_name}
      <button onClick={() => changeUserRole(user.user_id, 'admin')}>
        Make Admin
      </button>
    </div>
  ));
}
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `AuthContext.jsx` | Global auth state |
| `authService.js` | Supabase API wrapper |
| `userManagementService.js` | Admin operations |
| `useAuthActions.jsx` | Login/register hooks |
| `useUserManagement.jsx` | Admin management hooks |
| `supabaseClient.js` | Supabase config |

---

## ✅ Checklist

- [ ] Create Supabase project
- [ ] Set env variables
- [ ] Run `supabase_setup.sql`
- [ ] Wrap app with `AuthProvider`
- [ ] Test login page
- [ ] Test register page
- [ ] Test protected routes

---

## 🆘 Quick Troubleshoot

| Problem | Solution |
|---------|----------|
| "Supabase not configured" | Check `.env.local` has both URL & KEY |
| Login fails silently | Check console for errors |
| User profile not loading | Verify `profiles` table exists in Supabase |
| Email not verified | Check Supabase email settings |

---

## 📚 Full Docs

- `AUTH_SYSTEM_SETUP.md` - Complete setup guide
- `AUTH_USAGE_EXAMPLES.md` - Code examples
- `supabase_setup.sql` - Database schema

---

**That's it! You're ready to go.** 🚀

Next steps:
1. Test login with a test user
2. Check user appears in Supabase dashboard
3. Try admin management features
4. Deploy to production

Happy coding! 💪

