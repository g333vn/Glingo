# 🏗️ Authentication System - Architecture Guide

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   LoginPage      │  │  RegisterPage    │                   │
│  │  (Beautiful UI)  │  │  (Form + Valid)  │                   │
│  └────────┬─────────┘  └────────┬─────────┘                   │
│           │                     │                             │
│           └──────────┬──────────┘                             │
│                      │                                        │
│           ┌──────────▼────────────┐                          │
│           │  useAuthActions()     │                          │
│           │  ┌──────────────────┐ │                          │
│           │  │ handleLogin      │ │                          │
│           │  │ handleRegister   │ │                          │
│           │  │ handleLogout     │ │                          │
│           │  │ handleUpdateProf │ │                          │
│           │  └────────┬─────────┘ │                          │
│           └───────────┬───────────┘                          │
│                       │                                      │
│           ┌───────────▼──────────────┐                      │
│           │   AuthContext (Global)   │                      │
│           │  ┌────────────────────┐  │                      │
│           │  │ user               │  │                      │
│           │  │ profile            │  │                      │
│           │  │ isAuthenticated    │  │                      │
│           │  │ isLoading          │  │                      │
│           │  │ login()            │  │                      │
│           │  │ register()         │  │                      │
│           │  │ logout()           │  │                      │
│           │  │ updateProfile()    │  │                      │
│           │  │ hasPermission()    │  │                      │
│           │  │ isAdmin()          │  │                      │
│           │  └────────┬───────────┘  │                      │
│           └───────────┬───────────────┘                      │
│                       │                                      │
│           ┌───────────▼───────────┐                         │
│           │ Services Layer        │                         │
│           ├───────────────────────┤                         │
│           │ authService.js        │ ──┐                     │
│           │ (Sign up/in/out)      │   │                     │
│           │                       │   │                     │
│           │ userMgmtService.js    │ ──┼─ Wrap Supabase     │
│           │ (Admin operations)    │   │  API Calls          │
│           │                       │   │                     │
│           │ supabaseClient.js     │ ──┘                     │
│           │ (Config & Init)       │                         │
│           └───────────┬───────────┘                         │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        │ HTTPS/REST API
                        │
┌───────────────────────▼──────────────────────────────────────┐
│              SUPABASE BACKEND (Cloud)                         │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │  auth.users      │  │   profiles       │                  │
│  │  (Email/Pass)    │  │   (Extended      │                  │
│  │  (Session)       │  │    User Data)    │                  │
│  │  (JWT Tokens)    │  │   (Roles)        │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ activity_logs    │  │   RLS Policies   │                  │
│  │ (Audit Trail)    │  │  (Row Security)  │                  │
│  │ (Actions)        │  │  (Permissions)   │                  │
│  │ (Timestamps)     │  │  (Data Access)   │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                │
│  ┌──────────────────┐                                         │
│  │  storage/avatars │                                         │
│  │  (File Upload)   │                                         │
│  │  (CDN)           │                                         │
│  └──────────────────┘                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Sign Up Flow

```
User fills form (email, password, name)
         │
         ▼
validateForm() ─ checks email, password length, terms
         │
         ├─ Invalid: Show error
         │
         ├─ Valid: Continue
         │
         ▼
handleRegister() in useAuthActions
         │
         ▼
authService.signUp({ email, password, displayName })
         │
         ▼
supabase.auth.signUp()
         │
         ├─ ✅ Success
         │   └─ auth.users record created
         │   └─ Session token generated
         │   └─ Trigger: handle_new_user() fires
         │       └─ profiles record auto-created
         │       └─ Role set to 'user'
         │   └─ Email verification sent
         │   └─ Return success
         │
         └─ ❌ Error
             └─ Return error message
             └─ Show to user
```

### 2. Sign In Flow

```
User submits email & password
         │
         ▼
validateForm()
         │
         ├─ Invalid: Show error
         │
         ├─ Valid: Continue
         │
         ▼
handleLogin() in useAuthActions
         │
         ▼
authService.signIn({ email, password })
         │
         ▼
supabase.auth.signInWithPassword()
         │
         ├─ ✅ Success
         │   └─ Session token issued
         │   └─ Stored in localStorage
         │   └─ SIGNED_IN event fires
         │   └─ AuthContext detects change
         │   └─ loadUserProfile() called
         │       └─ Fetch from profiles table
         │       └─ Update user state
         │   └─ Components re-render
         │   └─ Redirect to dashboard
         │
         └─ ❌ Error
             └─ Invalid credentials
             └─ User not found
             └─ Email not verified
             └─ Show error
```

### 3. Session Restoration (Page Reload)

```
Page reloads
         │
         ▼
AuthContext mounts
         │
         ▼
Check Supabase config
         │
         ├─ Not configured: setIsLoading(false)
         │
         ├─ Configured: Continue
         │
         ▼
onAuthStateChange() listener starts
         │
         ▼
INITIAL_SESSION event fires
         │
         ├─ ✅ Session found
         │   └─ loadUserProfile(session.user)
         │   └─ Fetch from profiles table
         │   └─ setUser() + setProfile()
         │   └─ setIsLoading(false)
         │
         └─ ❌ No session
             └─ setUser(null)
             └─ setProfile(null)
             └─ setIsLoading(false)
             └─ Show login page
```

### 4. Admin User Update Flow

```
Admin clicks "Change Role"
         │
         ▼
changeUserRole(userId, newRole)
         │
         ▼
userService.changeUserRole()
         │
         ▼
authService.updateUserRole()
         │
         ▼
supabase.from('profiles').update()
         │
         ├─ ✅ Success
         │   └─ Profile updated in DB
         │   └─ RLS allows (admin check)
         │   └─ Return updated user
         │   └─ Update local state
         │   └─ UI refreshes
         │
         └─ ❌ Error
             └─ RLS denied (not admin)
             └─ Database error
             └─ Show error message
```

---

## Component Hierarchy

```
App
├─ AuthProvider
│  ├─ LoginPage
│  │  └─ useAuthActions
│  │     └─ authService.signIn()
│  │
│  ├─ RegisterPage
│  │  └─ useAuthActions
│  │     └─ authService.signUp()
│  │
│  ├─ ProtectedRoute
│  │  └─ Dashboard
│  │     └─ useAuth()
│  │        └─ useAuthActions()
│  │
│  ├─ AdminPanel
│  │  ├─ UsersList
│  │  │  └─ useUserManagement()
│  │  │     └─ userService.getAllUsers()
│  │  │
│  │  ├─ UserDetail
│  │  │  └─ useUserManagement()
│  │  │     └─ userService.changeUserRole()
│  │  │     └─ userService.banUser()
│  │  │
│  │  └─ ProfileForm
│  │     └─ useAuthActions()
│  │        └─ handleUpdateProfile()
│  │
│  └─ ProfilePage
│     └─ useAuth()
│     └─ useAuthActions()
```

---

## State Management Flow

### Global State (AuthContext)

```
AuthContext State:
├─ user
│  ├─ id (UUID from Supabase)
│  ├─ email
│  └─ emailConfirmed
│
├─ profile
│  ├─ user_id
│  ├─ display_name
│  ├─ email
│  ├─ role (admin|editor|user)
│  ├─ avatar_url
│  ├─ bio
│  ├─ is_banned
│  ├─ created_at
│  ├─ updated_at
│  └─ last_login_at
│
├─ isLoading (boolean)
├─ error (string|null)
└─ isAuthenticated (boolean - derived from user)

Actions:
├─ login(email, password)
├─ register(email, password, displayName)
├─ logout()
├─ updateProfile(updates)
├─ updatePassword(newPassword)
├─ requestPasswordReset(email)
└─ Helper Methods:
   ├─ hasPermission(permission)
   ├─ isAdmin()
   └─ isEditor()
```

### Local State (Components)

```
LoginPage:
├─ email
├─ password
├─ showPassword
├─ formErrors
└─ (From useAuthActions):
   ├─ isSubmitting
   └─ actionError

RegisterPage:
├─ email
├─ displayName
├─ password
├─ confirmPassword
├─ agreeTerms
├─ showPassword
├─ formErrors
├─ passwordStrength
├─ successMessage
└─ (From useAuthActions):
   ├─ isSubmitting
   └─ actionError

UsersList:
└─ (From useUserManagement):
   ├─ users
   ├─ total
   ├─ page
   ├─ isLoading
   ├─ error
   ├─ search
   └─ role filter
```

---

## Security Architecture

### RLS (Row Level Security) Policies

```
profiles table:
├─ SELECT
│  ├─ User can view own profile: auth.uid() = user_id
│  └─ Admin can view all: role = 'admin'
│
├─ UPDATE
│  ├─ User can update own: auth.uid() = user_id
│  └─ Admin can update any: role = 'admin'
│
└─ DELETE
   └─ Admin can delete: role = 'admin'

activity_logs table:
├─ SELECT
│  ├─ User can view own: auth.uid() = user_id
│  └─ Admin can view all: role = 'admin'
│
└─ INSERT
   └─ User can log own: auth.uid() = user_id

storage/avatars:
├─ SELECT: Public (anyone can view)
├─ INSERT: Authenticated users
├─ UPDATE: Owner can update
└─ DELETE: Owner can delete
```

### Authentication Flow

```
1. Password
   ├─ Hashed by Supabase (bcrypt)
   ├─ Salted
   ├─ Never sent to frontend
   └─ Never stored in localStorage

2. Session Token (JWT)
   ├─ Issued after login
   ├─ Stored in localStorage
   ├─ Auto-refreshed before expiry
   ├─ Used for API calls
   └─ Cleared on logout

3. Email Verification
   ├─ Sent after signup
   ├─ Optional/Configurable
   ├─ Prevents spam accounts
   └─ Can block unverified users

4. Activity Logging
   ├─ Tracks all actions
   ├─ Stores user_id, action, timestamp
   ├─ Useful for audit trail
   └─ Can detect suspicious activity
```

---

## Database Schema Relationships

```
auth.users (Supabase managed)
└─ 1:1 ─── profiles (our table)
   ├─ user_id (FK)
   ├─ email
   ├─ display_name
   ├─ role
   ├─ avatar_url
   ├─ bio
   ├─ location
   ├─ phone_number
   ├─ is_banned
   ├─ created_at
   ├─ updated_at
   └─ last_login_at

activity_logs (our table)
└─ N:1 ─── profiles
   ├─ user_id (FK)
   ├─ id (PK)
   ├─ action
   ├─ resource_type
   ├─ resource_id
   ├─ details (JSON)
   ├─ ip_address
   ├─ user_agent
   └─ created_at

storage/avatars (our bucket)
└─ Referenced by profiles.avatar_url
   ├─ Public read access
   ├─ User can upload
   └─ CDN delivered
```

---

## Request/Response Cycle

### Login Request

```
Frontend:
1. User fills form
2. validateForm() ✓
3. POST /auth/signInWithPassword
   {
     email: "user@example.com",
     password: "password123"
   }

Backend (Supabase):
1. Check credentials
2. Generate JWT token
3. Return session
   {
     user: { id, email, ... },
     session: { access_token, refresh_token },
     ...
   }

Frontend:
1. Store session in localStorage
2. SIGNED_IN event fires
3. loadUserProfile(user.id)
4. Fetch profiles table
5. Update AuthContext
6. Redirect to dashboard
```

### Get User Profile Request

```
Frontend:
1. Need user profile
2. GET /rest/v1/profiles?user_id=eq.UUID
   Headers: Authorization: Bearer <JWT>

Backend (Supabase):
1. Verify JWT token
2. Check RLS policy
   - Can user access this profile?
3. Return data or 403

Frontend:
1. Receive profile data
2. Update state
3. Re-render component
4. Show user info
```

---

## Error Handling Flow

```
Error Occurs
│
├─ AuthService catches it
│  └─ Logs to console with [AuthService] prefix
│  └─ Returns { success: false, error: message }
│
├─ useAuthActions catches it
│  └─ Sets actionError state
│  └─ Returns { success: false, error: message }
│
├─ Component handles it
│  ├─ Show error message to user
│  ├─ Allow user to retry
│  ├─ Clear error on new attempt
│  └─ Log to analytics (optional)
│
└─ User sees friendly error message
   ├─ "Invalid email or password"
   ├─ "Email already registered"
   ├─ "Network error - please try again"
   └─ etc.
```

---

## Deployment Architecture

```
Development (localhost)
├─ Frontend: http://localhost:5173
├─ Supabase: your-project.supabase.co
└─ localStorage: session tokens

Production (Vercel/Netlify)
├─ Frontend: https://yourapp.com
├─ Supabase: your-project.supabase.co
├─ CORS: Configured in Supabase
├─ localStorage: session tokens
├─ HTTPS: Required (secure cookies)
└─ Environment: Production secrets

Supabase (Cloud)
├─ Auth: Email/password + JWT
├─ Database: PostgreSQL
├─ RLS: Enabled & configured
├─ Backups: Daily automatic
└─ Monitoring: Built-in
```

---

## Performance Considerations

### Optimization Strategies

```
1. Lazy Loading
   ├─ Import auth services dynamically
   ├─ Lazy load user management
   └─ Code split on routes

2. Memoization
   ├─ useCallback for functions
   ├─ useAuth() custom hook
   └─ Prevent unnecessary renders

3. Database Queries
   ├─ Select only needed columns
   ├─ Use indexes for common queries
   ├─ Limit result sets with pagination
   └─ Cache user profile

4. Network
   ├─ Session stored in localStorage
   ├─ Reduces auth calls on reload
   ├─ Auto-refresh tokens
   └─ CDN for avatars

5. Rendering
   ├─ Conditional rendering
   ├─ Loading skeletons
   ├─ Debounce search
   └─ Virtual lists for large user lists
```

---

## Monitoring & Debugging

### Console Logs Pattern

```
[AuthContext] - Global state changes
[authService] - Supabase API calls
[UserManagement] - Admin operations
[supabaseClient] - Client initialization

Examples:
[AuthContext] Auth state changed: SIGNED_IN
[authService] Sign in successful: user@example.com
[UserManagement] Fetched users: 45
[supabaseClient] Connection OK
```

### Browser DevTools

```
1. localStorage
   └─ sb-glingo-auth-token
      ├─ access_token (JWT)
      ├─ refresh_token
      └─ expires_at

2. Network Tab
   ├─ POST /auth/v1/token
   ├─ POST /rest/v1/profiles
   ├─ GET /rest/v1/profiles?...
   └─ Watch for 401/403 errors

3. React DevTools
   ├─ AuthContext values
   ├─ Component state
   └─ useAuth() hook values

4. Console
   ├─ Search for [AuthContext] logs
   ├─ Watch for errors
   └─ Test functions directly
```

---

## This Architecture Provides

✅ **Scalability** - Easy to add more features
✅ **Security** - RLS, JWT, password hashing
✅ **Maintainability** - Clean separation of concerns
✅ **Performance** - Optimized queries & caching
✅ **Reliability** - Error handling & logging
✅ **Usability** - Beautiful UI & smooth UX
✅ **Documentation** - Well-documented code
✅ **Testing** - Easy to test each layer

**You have a production-ready authentication system!** 🚀

