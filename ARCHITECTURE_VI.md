# 🏗️ Hệ Thống Xác Thực - Hướng Dẫn Kiến Trúc

## Tổng Quan Hệ Thống

```
┌────────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │   LoginPage      │  │  RegisterPage    │                   │
│  │  (Giao diện đẹp) │  │  (Form + Valid)  │                   │
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
│           │   AuthContext (Toàn Cục)  │                      │
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
│           │ Tầng Services         │                         │
│           ├───────────────────────┤                         │
│           │ authService.js        │ ──┐                     │
│           │ (Đăng ký/đăng nhập/xuất)│   │                     │
│           │                       │   │                     │
│           │ userMgmtService.js    │ ──┼─ Wrap Supabase     │
│           │ (Thao tác Admin)      │   │  API Calls          │
│           │                       │   │                     │
│           │ supabaseClient.js     │ ──┘                     │
│           │ (Cấu hình & Khởi tạo) │                         │
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
│  │  (Email/Pass)    │  │   (Dữ liệu       │                  │
│  │  (Session)       │  │    User mở rộng) │                  │
│  │  (JWT Tokens)    │  │   (Roles)        │                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                  │
│  │ activity_logs    │  │   RLS Policies   │                  │
│  │ (Audit Trail)    │  │  (Bảo mật hàng)  │                  │
│  │ (Hành động)      │  │  (Quyền)         │                  │
│  │ (Timestamps)     │  │  (Truy cập dữ liệu)│                  │
│  └──────────────────┘  └──────────────────┘                  │
│                                                                │
│  ┌──────────────────┐                                         │
│  │  storage/avatars │                                         │
│  │  (Tải file)      │                                         │
│  │  (CDN)           │                                         │
│  └──────────────────┘                                         │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Sơ Đồ Luồng Dữ Liệu

### 1. Luồng Đăng Ký

```
User điền form (email, password, tên)
         │
         ▼
validateForm() ─ kiểm tra email, độ dài password, điều khoản
         │
         ├─ Không hợp lệ: Hiển thị lỗi
         │
         ├─ Hợp lệ: Tiếp tục
         │
         ▼
handleRegister() trong useAuthActions
         │
         ▼
authService.signUp({ email, password, displayName })
         │
         ▼
supabase.auth.signUp()
         │
         ├─ ✅ Thành công
         │   └─ Bản ghi auth.users được tạo
         │   └─ Session token được tạo
         │   └─ Trigger: handle_new_user() kích hoạt
         │       └─ Bản ghi profiles tự động tạo
         │       └─ Role được đặt thành 'user'
         │   └─ Email xác minh được gửi
         │   └─ Trả về thành công
         │
         └─ ❌ Lỗi
             └─ Trả về thông báo lỗi
             └─ Hiển thị cho user
```

### 2. Luồng Đăng Nhập

```
User gửi email & password
         │
         ▼
validateForm()
         │
         ├─ Không hợp lệ: Hiển thị lỗi
         │
         ├─ Hợp lệ: Tiếp tục
         │
         ▼
handleLogin() trong useAuthActions
         │
         ▼
authService.signIn({ email, password })
         │
         ▼
supabase.auth.signInWithPassword()
         │
         ├─ ✅ Thành công
         │   └─ Session token được cấp
         │   └─ Lưu trong localStorage
         │   └─ SIGNED_IN event kích hoạt
         │   └─ AuthContext phát hiện thay đổi
         │   └─ loadUserProfile() được gọi
         │       └─ Lấy từ bảng profiles
         │       └─ Cập nhật user state
         │   └─ Components re-render
         │   └─ Chuyển hướng đến dashboard
         │
         └─ ❌ Lỗi
             └─ Thông tin đăng nhập không hợp lệ
             └─ User không tìm thấy
             └─ Email chưa được xác minh
             └─ Hiển thị lỗi
```

### 3. Khôi Phục Session (Reload Trang)

```
Trang reload
         │
         ▼
AuthContext mount
         │
         ▼
Kiểm tra cấu hình Supabase
         │
         ├─ Chưa cấu hình: setIsLoading(false)
         │
         ├─ Đã cấu hình: Tiếp tục
         │
         ▼
onAuthStateChange() listener bắt đầu
         │
         ▼
INITIAL_SESSION event kích hoạt
         │
         ├─ ✅ Tìm thấy session
         │   └─ loadUserProfile(session.user)
         │   └─ Lấy từ bảng profiles
         │   └─ setUser() + setProfile()
         │   └─ setIsLoading(false)
         │
         └─ ❌ Không có session
             └─ setUser(null)
             └─ setProfile(null)
             └─ setIsLoading(false)
             └─ Hiển thị trang login
```

### 4. Luồng Cập Nhật User Admin

```
Admin click "Change Role"
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
         ├─ ✅ Thành công
         │   └─ Profile cập nhật trong DB
         │   └─ RLS cho phép (kiểm tra admin)
         │   └─ Trả về user đã cập nhật
         │   └─ Cập nhật local state
         │   └─ UI refresh
         │
         └─ ❌ Lỗi
             └─ RLS từ chối (không phải admin)
             └─ Lỗi database
             └─ Hiển thị thông báo lỗi
```

---

## Phân Cấp Component

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

## Luồng Quản Lý State

### State Toàn Cục (AuthContext)

```
AuthContext State:
├─ user
│  ├─ id (UUID từ Supabase)
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
└─ isAuthenticated (boolean - được suy ra từ user)

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

### State Cục Bộ (Components)

```
LoginPage:
├─ email
├─ password
├─ showPassword
├─ formErrors
└─ (Từ useAuthActions):
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
└─ (Từ useAuthActions):
   ├─ isSubmitting
   └─ actionError

UsersList:
└─ (Từ useUserManagement):
   ├─ users
   ├─ total
   ├─ page
   ├─ isLoading
   ├─ error
   ├─ search
   └─ role filter
```

---

## Kiến Trúc Bảo Mật

### RLS (Row Level Security) Policies

```
Bảng profiles:
├─ SELECT
│  ├─ User có thể xem profile của mình: auth.uid() = user_id
│  └─ Admin có thể xem tất cả: role = 'admin'
│
├─ UPDATE
│  ├─ User có thể cập nhật của mình: auth.uid() = user_id
│  └─ Admin có thể cập nhật bất kỳ: role = 'admin'
│
└─ DELETE
   └─ Admin có thể xóa: role = 'admin'

Bảng activity_logs:
├─ SELECT
│  ├─ User có thể xem của mình: auth.uid() = user_id
│  └─ Admin có thể xem tất cả: role = 'admin'
│
└─ INSERT
   └─ User có thể log của mình: auth.uid() = user_id

storage/avatars:
├─ SELECT: Public (ai cũng có thể xem)
├─ INSERT: Users đã xác thực
├─ UPDATE: Chủ sở hữu có thể cập nhật
└─ DELETE: Chủ sở hữu có thể xóa
```

### Luồng Xác Thực

```
1. Password
   ├─ Được hash bởi Supabase (bcrypt)
   ├─ Được salt
   ├─ Không bao giờ gửi đến frontend
   └─ Không bao giờ lưu trong localStorage

2. Session Token (JWT)
   ├─ Được cấp sau khi login
   ├─ Lưu trong localStorage
   ├─ Tự động refresh trước khi hết hạn
   ├─ Sử dụng cho API calls
   └─ Xóa khi logout

3. Xác Minh Email
   ├─ Gửi sau khi đăng ký
   ├─ Tùy chọn/Có thể cấu hình
   ├─ Ngăn chặn tài khoản spam
   └─ Có thể chặn users chưa xác minh

4. Ghi Log Hoạt Động
   ├─ Theo dõi tất cả hành động
   ├─ Lưu user_id, action, timestamp
   ├─ Hữu ích cho audit trail
   └─ Có thể phát hiện hoạt động đáng ngờ
```

---

## Quan Hệ Schema Database

```
auth.users (Supabase quản lý)
└─ 1:1 ─── profiles (bảng của chúng ta)
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

activity_logs (bảng của chúng ta)
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

storage/avatars (bucket của chúng ta)
└─ Được tham chiếu bởi profiles.avatar_url
   ├─ Truy cập đọc công khai
   ├─ User có thể upload
   └─ CDN phân phối
```

---

## Chu Kỳ Request/Response

### Request Đăng Nhập

```
Frontend:
1. User điền form
2. validateForm() ✓
3. POST /auth/signInWithPassword
   {
     email: "user@example.com",
     password: "password123"
   }

Backend (Supabase):
1. Kiểm tra thông tin đăng nhập
2. Tạo JWT token
3. Trả về session
   {
     user: { id, email, ... },
     session: { access_token, refresh_token },
     ...
   }

Frontend:
1. Lưu session trong localStorage
2. SIGNED_IN event kích hoạt
3. loadUserProfile(user.id)
4. Lấy từ bảng profiles
5. Cập nhật AuthContext
6. Chuyển hướng đến dashboard
```

### Request Lấy User Profile

```
Frontend:
1. Cần user profile
2. GET /rest/v1/profiles?user_id=eq.UUID
   Headers: Authorization: Bearer <JWT>

Backend (Supabase):
1. Xác minh JWT token
2. Kiểm tra RLS policy
   - User có thể truy cập profile này không?
3. Trả về dữ liệu hoặc 403

Frontend:
1. Nhận dữ liệu profile
2. Cập nhật state
3. Re-render component
4. Hiển thị thông tin user
```

---

## Luồng Xử Lý Lỗi

```
Lỗi Xảy Ra
│
├─ AuthService bắt lỗi
│  └─ Log vào console với prefix [AuthService]
│  └─ Trả về { success: false, error: message }
│
├─ useAuthActions bắt lỗi
│  └─ Đặt actionError state
│  └─ Trả về { success: false, error: message }
│
├─ Component xử lý
│  ├─ Hiển thị thông báo lỗi cho user
│  ├─ Cho phép user thử lại
│  ├─ Xóa lỗi khi thử mới
│  └─ Log vào analytics (tùy chọn)
│
└─ User thấy thông báo lỗi thân thiện
   ├─ "Email hoặc password không hợp lệ"
   ├─ "Email đã được đăng ký"
   ├─ "Lỗi mạng - vui lòng thử lại"
   └─ v.v.
```

---

## Kiến Trúc Deployment

```
Development (localhost)
├─ Frontend: http://localhost:5173
├─ Supabase: your-project.supabase.co
└─ localStorage: session tokens

Production (Vercel/Netlify)
├─ Frontend: https://yourapp.com
├─ Supabase: your-project.supabase.co
├─ CORS: Đã cấu hình trong Supabase
├─ localStorage: session tokens
├─ HTTPS: Bắt buộc (secure cookies)
└─ Environment: Production secrets

Supabase (Cloud)
├─ Auth: Email/password + JWT
├─ Database: PostgreSQL
├─ RLS: Đã bật & cấu hình
├─ Backups: Tự động hàng ngày
└─ Monitoring: Tích hợp sẵn
```

---

## Cân Nhắc Hiệu Suất

### Chiến Lược Tối Ưu

```
1. Lazy Loading
   ├─ Import auth services động
   ├─ Lazy load user management
   └─ Code split trên routes

2. Memoization
   ├─ useCallback cho functions
   ├─ useAuth() custom hook
   └─ Ngăn re-render không cần thiết

3. Database Queries
   ├─ Chỉ select các cột cần thiết
   ├─ Sử dụng indexes cho queries thường dùng
   ├─ Giới hạn kết quả với pagination
   └─ Cache user profile

4. Network
   ├─ Session lưu trong localStorage
   ├─ Giảm auth calls khi reload
   ├─ Tự động refresh tokens
   └─ CDN cho avatars

5. Rendering
   ├─ Conditional rendering
   ├─ Loading skeletons
   ├─ Debounce search
   └─ Virtual lists cho danh sách user lớn
```

---

## Monitoring & Debugging

### Pattern Console Logs

```
[AuthContext] - Thay đổi state toàn cục
[authService] - Supabase API calls
[UserManagement] - Thao tác Admin
[supabaseClient] - Khởi tạo client

Ví dụ:
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
   └─ Theo dõi lỗi 401/403

3. React DevTools
   ├─ Giá trị AuthContext
   ├─ State component
   └─ Giá trị useAuth() hook

4. Console
   ├─ Tìm logs [AuthContext]
   ├─ Theo dõi lỗi
   └─ Test functions trực tiếp
```

---

## Kiến Trúc Này Cung Cấp

✅ **Khả Năng Mở Rộng** - Dễ thêm tính năng
✅ **Bảo Mật** - RLS, JWT, password hashing
✅ **Khả Năng Bảo Trì** - Tách biệt rõ ràng các mối quan tâm
✅ **Hiệu Suất** - Queries tối ưu & caching
✅ **Độ Tin Cậy** - Xử lý lỗi & logging
✅ **Khả Năng Sử Dụng** - Giao diện đẹp & UX mượt mà
✅ **Tài Liệu** - Code được tài liệu tốt
✅ **Testing** - Dễ test từng tầng

**Bạn có một hệ thống authentication sẵn sàng production!** 🚀

