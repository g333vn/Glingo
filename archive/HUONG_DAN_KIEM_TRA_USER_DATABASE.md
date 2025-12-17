# 📊 Hướng Dẫn Kiểm Tra User Data Trong Supabase Database

## 🎯 Dữ Liệu Được Lưu Ở Đâu?

Sau khi tạo user thành công, dữ liệu được lưu ở **2 bảng chính** trong Supabase:

### 1. **`auth.users`** (Bảng Authentication - Supabase quản lý)
- **Vị trí**: Supabase Dashboard → Authentication → Users
- **Chứa**: Thông tin đăng nhập cơ bản
  - `id` (UUID) - User ID duy nhất
  - `email` - Email đăng nhập
  - `encrypted_password` - Password đã được hash (không thể xem)
  - `email_confirmed_at` - Thời gian xác nhận email
  - `created_at` - Thời gian tạo tài khoản
  - `updated_at` - Thời gian cập nhật
  - `raw_user_meta_data` - Metadata (display_name, etc.)

### 2. **`public.profiles`** (Bảng Profile - Do bạn quản lý)
- **Vị trí**: Supabase Dashboard → Table Editor → `profiles`
- **Chứa**: Thông tin profile chi tiết
  - `user_id` (UUID) - Foreign key → `auth.users.id`
  - `email` - Email (duplicate từ auth.users)
  - `display_name` - Tên hiển thị
  - `role` - Quyền: 'admin', 'editor', 'user'
  - `avatar_url` - URL avatar (nếu có)
  - `is_banned` - Trạng thái bị cấm
  - `created_at` - Thời gian tạo profile
  - `updated_at` - Thời gian cập nhật

---

## 🔍 Cách Kiểm Tra Trong Supabase Dashboard

### **Cách 1: Kiểm Tra Qua UI (Dễ nhất)**

#### **Bước 1: Kiểm tra trong Authentication**
1. Mở **Supabase Dashboard** → https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Users**
4. Tìm user theo email hoặc scroll xuống để xem danh sách
5. Click vào user để xem chi tiết:
   - User ID (UUID)
   - Email
   - Created at
   - Email confirmed
   - Metadata

#### **Bước 2: Kiểm tra trong Table Editor**
1. Vào **Table Editor** → **profiles**
2. Tìm user theo:
   - Email
   - User ID
   - Display name
3. Xem các cột:
   - `user_id` - ID của user
   - `email` - Email
   - `display_name` - Tên hiển thị
   - `role` - Quyền (admin/editor/user)
   - `created_at` - Thời gian tạo

---

### **Cách 2: Kiểm Tra Qua SQL Editor (Chi tiết hơn)**

#### **Query 1: Xem tất cả users mới tạo (24h gần đây)**
```sql
-- Xem users trong auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  raw_user_meta_data->>'display_name' as display_name
FROM auth.users
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

#### **Query 2: Xem profiles của users mới tạo**
```sql
-- Xem profiles mới tạo
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
FROM public.profiles
WHERE created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

#### **Query 3: Xem user và profile cùng lúc (JOIN)**
```sql
-- Xem user + profile cùng lúc
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as auth_created_at,
  u.email_confirmed_at,
  p.display_name,
  p.role,
  p.created_at as profile_created_at,
  p.updated_at as profile_updated_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.created_at >= NOW() - INTERVAL '24 hours'
ORDER BY u.created_at DESC;
```

#### **Query 4: Tìm user cụ thể theo email**
```sql
-- Tìm user theo email
SELECT 
  u.id as user_id,
  u.email,
  u.created_at,
  p.display_name,
  p.role,
  p.is_banned
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'giangtest@gmail.com';  -- Thay email của bạn
```

#### **Query 5: Kiểm tra user có profile chưa**
```sql
-- Tìm users chưa có profile (nên không có)
SELECT 
  u.id,
  u.email,
  u.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;
```

---

## 📋 Checklist Kiểm Tra User Mới Tạo

Sau khi tạo user, kiểm tra các điểm sau:

### ✅ **1. User có trong `auth.users`?**
- [ ] Có email đúng
- [ ] Có `created_at` timestamp
- [ ] Có `id` (UUID)

### ✅ **2. Profile có trong `public.profiles`?**
- [ ] Có `user_id` khớp với `auth.users.id`
- [ ] Có `email` đúng
- [ ] Có `display_name` đúng
- [ ] Có `role` đúng (admin/editor/user)

### ✅ **3. Dữ Liệu Đồng Bộ?**
- [ ] Email trong `auth.users` = Email trong `profiles`
- [ ] `user_id` trong `profiles` = `id` trong `auth.users`
- [ ] `display_name` trong `profiles` = `raw_user_meta_data.display_name` trong `auth.users`

---

## 🛠️ SQL Queries Hữu Ích

### **Đếm số users theo role**
```sql
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY count DESC;
```

### **Xem users mới nhất**
```sql
SELECT 
  p.display_name,
  p.email,
  p.role,
  p.created_at,
  u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
```

### **Xem users chưa xác nhận email**
```sql
SELECT 
  u.email,
  u.created_at,
  p.display_name,
  p.role
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email_confirmed_at IS NULL
ORDER BY u.created_at DESC;
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **Password không thể xem**: Password được hash và lưu trong `auth.users.encrypted_password`, không thể xem được.

2. **RLS Policies**: Nếu bạn không thấy data, có thể do RLS policies. Admin có thể xem tất cả, user chỉ xem được profile của chính họ.

3. **Trigger tự động**: Nếu có trigger `handle_new_user()`, profile sẽ được tạo tự động khi user đăng ký.

4. **Foreign Key**: `profiles.user_id` phải khớp với `auth.users.id`, nếu không sẽ bị lỗi.

---

## 🎯 Quick Check (Kiểm tra nhanh)

**Copy query này vào SQL Editor để xem user mới nhất:**

```sql
SELECT 
  u.id,
  u.email,
  u.created_at as "Tạo lúc",
  p.display_name as "Tên",
  p.role as "Quyền",
  CASE 
    WHEN u.email_confirmed_at IS NOT NULL THEN 'Đã xác nhận'
    ELSE 'Chưa xác nhận'
  END as "Trạng thái email"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

---

## 📞 Nếu Gặp Vấn Đề

1. **User không có trong `auth.users`**: 
   - Kiểm tra lỗi khi tạo user
   - Xem console log trong browser

2. **User có trong `auth.users` nhưng không có profile**:
   - Chạy lại `createUserProfile()` 
   - Kiểm tra RLS policies có cho phép INSERT không
   - Kiểm tra trigger `handle_new_user()` có hoạt động không

3. **Profile có nhưng role sai**:
   - Chạy `updateUserRole()` để sửa
   - Hoặc update trực tiếp trong Table Editor

---

**Chúc bạn kiểm tra thành công! 🎉**

