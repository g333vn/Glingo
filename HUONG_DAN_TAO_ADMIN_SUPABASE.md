# 🔐 Hướng Dẫn Tạo Tài Khoản Admin Trên Supabase

## 📋 Tổng Quan

Để tạo tài khoản admin trên Supabase và truy cập hệ thống, bạn có **3 cách**:

1. **Tạo user mới → Set role admin** (Khuyến nghị cho lần đầu)
2. **Đổi role user hiện có thành admin**
3. **Tạo trực tiếp qua Supabase Dashboard**

---

## 🎯 Cách 1: Tạo User Mới Rồi Set Role Admin (Khuyến nghị)

### **Bước 1: Tạo tài khoản mới**

#### **Qua Website (Đăng ký):**
1. Truy cập trang đăng ký của website
2. Điền thông tin:
   - **Email**: `admin@example.com` (thay bằng email của bạn)
   - **Password**: Mật khẩu mạnh (tối thiểu 6 ký tự)
   - **Tên hiển thị**: Tên của bạn
3. Click **"Đăng ký"**
4. ✅ Tài khoản sẽ được tạo trong Supabase Auth
5. ✅ Profile sẽ tự động được tạo với role mặc định là `user`

#### **Qua Supabase Dashboard (Nếu cần):**
1. Mở **Supabase Dashboard** → https://supabase.com/dashboard
2. Chọn project của bạn
3. Vào **Authentication** → **Users**
4. Click **"Add user"** → **"Create new user"**
5. Điền:
   - **Email**: `admin@example.com`
   - **Password**: Mật khẩu mạnh
   - **Auto Confirm User**: ✅ Bật (để không cần xác minh email)
6. Click **"Create user"**

### **Bước 2: Set Role Admin**

Sau khi tài khoản đã được tạo, bạn cần đổi role từ `user` thành `admin`:

#### **Cách A: Qua SQL Editor (Nhanh nhất)**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Copy và chạy query sau (thay email của bạn):

```sql
-- Đổi role thành admin cho user mới tạo
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'admin@example.com';  -- ⚠️ Thay email của bạn
```

3. Click **"Run"** để thực thi
4. ✅ Kiểm tra kết quả:

```sql
-- Xác nhận role đã được đổi
SELECT 
  email,
  display_name,
  role,
  updated_at
FROM public.profiles
WHERE email = 'admin@example.com';  -- ⚠️ Thay email của bạn
```

#### **Cách B: Qua Table Editor (Trực quan)**

1. Mở **Supabase Dashboard** → **Table Editor** → **profiles**
2. Tìm user theo email (dùng search box)
3. Click vào row của user đó
4. Sửa cột `role`: đổi từ `user` thành `admin`
5. Click **"Save"** hoặc nhấn Enter
6. ✅ Role đã được cập nhật

---

## 🎯 Cách 2: Đổi Role User Hiện Có Thành Admin

Nếu bạn đã có tài khoản user và muốn nâng cấp lên admin:

### **Qua SQL Editor:**

```sql
-- Đổi role user hiện có thành admin
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'your-email@example.com';  -- ⚠️ Thay email của bạn
```

### **Qua Table Editor:**

1. Vào **Table Editor** → **profiles**
2. Tìm user theo email
3. Đổi `role` từ `user` thành `admin`
4. Save

---

## 🎯 Cách 3: Tạo Trực Tiếp Qua Supabase Dashboard (Nâng cao)

### **Bước 1: Tạo User trong Auth**

1. **Supabase Dashboard** → **Authentication** → **Users** → **Add user**
2. Điền thông tin và tạo user

### **Bước 2: Tạo Profile với Role Admin**

1. Vào **SQL Editor**
2. Chạy query sau (thay `USER_ID` và `EMAIL`):

```sql
-- Tạo profile với role admin ngay từ đầu
INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
)
VALUES (
  'USER_ID_FROM_AUTH',  -- ⚠️ Lấy từ auth.users table
  'admin@example.com',  -- ⚠️ Email của admin
  'Admin User',         -- ⚠️ Tên hiển thị
  'admin',              -- ✅ Role admin
  NOW(),
  NOW()
)
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();
```

**Lấy USER_ID:**
```sql
-- Tìm user_id từ email
SELECT id, email 
FROM auth.users 
WHERE email = 'admin@example.com';
```

---

## ✅ Kiểm Tra Admin Account

### **1. Kiểm tra trong Supabase:**

```sql
-- Xem tất cả admin accounts
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
FROM public.profiles
WHERE role = 'admin'
ORDER BY created_at DESC;
```

### **2. Kiểm tra trong Website:**

1. **Đăng xuất** (nếu đang đăng nhập)
2. **Đăng nhập lại** với email và password của admin account
3. Kiểm tra:
   - ✅ Có thể truy cập **Admin Panel** (`/admin`)
   - ✅ Có thể truy cập **User Management** (`/admin/users`)
   - ✅ Có thể truy cập **Settings** (`/admin/settings`)
   - ✅ Header hiển thị menu admin

---

## 🔍 Troubleshooting

### **Lỗi: "new row violates row-level security policy"**

**Nguyên nhân:** RLS policies không cho phép insert/update profile

**Giải pháp:** Chạy script fix RLS:

1. Mở **SQL Editor**
2. Chạy file `fix_profiles_rls_with_admin_insert.sql` hoặc:

```sql
-- Kiểm tra và fix RLS policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'profiles';
```

Nếu thiếu policy, chạy:

```sql
-- Tạo policy cho admin insert/update
CREATE POLICY "Admins can insert any profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
```

### **Role không thay đổi sau khi update**

**Nguyên nhân:** User chưa đăng xuất/đăng nhập lại

**Giải pháp:**
1. **Đăng xuất** hoàn toàn
2. **Đăng nhập lại** với admin account
3. Hoặc **refresh trang** (F5) để cập nhật session

### **Không thấy user trong profiles table**

**Nguyên nhân:** Profile chưa được tạo tự động

**Giải pháp:** Tạo profile thủ công:

```sql
-- Tạo profile cho user đã có trong auth.users
INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  role
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', email),
  'admin'  -- ✅ Set role admin ngay
FROM auth.users
WHERE email = 'admin@example.com'  -- ⚠️ Thay email
AND id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();
```

### **Không thể đăng nhập sau khi tạo account**

**Nguyên nhân:** Email chưa được xác minh

**Giải pháp:**
1. Kiểm tra email để xác minh
2. Hoặc trong Supabase Dashboard → **Authentication** → **Users** → Click vào user → **Auto Confirm User**: ✅ Bật

---

## 📋 Quick Reference

### **SQL Queries Thường Dùng:**

```sql
-- 1. Tạo admin từ user hiện có
UPDATE public.profiles 
SET role = 'admin', updated_at = NOW() 
WHERE email = 'your-email@example.com';

-- 2. Xem tất cả admin
SELECT email, display_name, role, created_at 
FROM public.profiles 
WHERE role = 'admin';

-- 3. Xem tất cả users
SELECT email, display_name, role 
FROM public.profiles 
ORDER BY role, email;

-- 4. Đếm users theo role
SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role;

-- 5. Tìm user theo email
SELECT user_id, email, display_name, role 
FROM public.profiles 
WHERE email = 'your-email@example.com';
```

---

## 🎯 Best Practices

1. ✅ **Tạo ít nhất 2 admin accounts** để backup
2. ✅ **Sử dụng email thật** để có thể reset password
3. ✅ **Đặt password mạnh** (tối thiểu 12 ký tự, có số, chữ hoa, ký tự đặc biệt)
4. ✅ **Bật 2FA** nếu Supabase hỗ trợ
5. ✅ **Lưu lại user_id** của admin accounts để dễ quản lý
6. ⚠️ **Không share admin account** với nhiều người
7. ⚠️ **Kiểm tra RLS policies** trước khi deploy production

---

## 📝 Checklist Tạo Admin

- [ ] Tạo user mới qua website hoặc Supabase Dashboard
- [ ] Xác nhận user đã được tạo trong `auth.users`
- [ ] Xác nhận profile đã được tạo trong `public.profiles`
- [ ] Set role = 'admin' trong `public.profiles`
- [ ] Kiểm tra role đã được cập nhật
- [ ] Đăng xuất và đăng nhập lại
- [ ] Kiểm tra có thể truy cập Admin Panel
- [ ] Kiểm tra có thể quản lý users
- [ ] Lưu lại thông tin admin account (email, user_id)

---

**Chúc bạn tạo admin account thành công! 🎉**

Nếu gặp vấn đề, tham khảo thêm:
- `HUONG_DAN_DOI_ROLE_USER.md` - Hướng dẫn đổi role
- `FIX_RLS_ERROR_CREATE_USER.md` - Fix lỗi RLS
- `AUTH_SYSTEM_SETUP.md` - Setup hệ thống auth

