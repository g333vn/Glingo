# 🔧 Hướng Dẫn Fix Lỗi "Database error saving new user"

## 🎯 Vấn Đề

Khi tạo user mới trong admin panel, bạn gặp lỗi:
```
❌ Lỗi khi tạo user trong Supabase: Database error saving new user
```

Hoặc:
```
⚠️ User đã được tạo trong Supabase Auth nhưng không thể tạo/update profile.
Lỗi: new row violates row-level security policy for table "profiles"
```

## 🔍 Nguyên Nhân

Lỗi này thường do **RLS (Row Level Security) policies** không cho phép admin insert profile cho user khác.

## ✅ Cách Fix

### **Bước 1: Kiểm Tra RLS Policies**

1. Mở **Supabase Dashboard** → **SQL Editor**
2. Chạy query này để xem các policies hiện tại:

```sql
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

### **Bước 2: Chạy Script Fix RLS**

Nếu không thấy policy **"Admins can insert any profile"**, chạy script này:

**File**: `fix_profiles_rls_with_admin_insert.sql`

```sql
-- ========================================
-- FIX PROFILES TABLE RLS POLICIES (WITH ADMIN INSERT)
-- ========================================

-- 1. DROP ALL EXISTING POLICIES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- 2. DROP RECURSIVE FUNCTION (if exists)
DROP FUNCTION IF EXISTS public.is_admin();

-- 3. CREATE HELPER FUNCTION FOR ADMIN CHECK (NON-RECURSIVE)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE CORRECTED RLS POLICIES

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- ✅ CRITICAL: Admins can insert any profile (for admin operations)
CREATE POLICY "Admins can insert any profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- 5. FIX HANDLE_NEW_USER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. VERIFY
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

### **Bước 3: Kiểm Tra Function `is_admin()`**

Chạy query này để kiểm tra function có hoạt động đúng không:

```sql
-- Kiểm tra function is_admin()
SELECT public.is_admin();

-- Nếu bạn là admin, kết quả phải là: true
-- Nếu không, kết quả là: false
```

### **Bước 4: Kiểm Tra Role Của User Hiện Tại**

Chạy query này để xem role của user đang đăng nhập:

```sql
SELECT 
  user_id,
  email,
  role,
  display_name
FROM public.profiles
WHERE user_id = auth.uid();
```

**Đảm bảo**:
- ✅ User đang đăng nhập có `role = 'admin'`
- ✅ Nếu không, cập nhật role:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE user_id = auth.uid();
```

### **Bước 5: Test Lại**

1. Đăng xuất và đăng nhập lại (để refresh session)
2. Thử tạo user mới trong admin panel
3. Nếu vẫn lỗi, kiểm tra console logs để xem lỗi chi tiết

## 🔍 Debug

### **Kiểm Tra Console Logs**

Mở **Browser Console** (F12) và xem logs:
- `[AuthService] Error creating user profile:` - Lỗi chi tiết
- `[ADD_USER]` - Logs từ quá trình tạo user

### **Kiểm Tra Network Requests**

1. Mở **Browser DevTools** → **Network** tab
2. Tìm request đến `/rest/v1/profiles`
3. Xem **Response** để biết lỗi chi tiết

### **Kiểm Tra RLS Policies Trong Supabase**

1. Mở **Supabase Dashboard** → **Table Editor** → **profiles**
2. Click **"Policies"** tab
3. Đảm bảo có policy: **"Admins can insert any profile"**

## ⚠️ Lưu Ý

1. **Function `is_admin()` phải có `SECURITY DEFINER`**:
   - Cho phép function bypass RLS khi check role
   - Nếu không có, function sẽ bị recursive loop

2. **Admin phải có role = 'admin' trong profiles**:
   - Không phải trong `auth.users`
   - Phải trong bảng `profiles`

3. **Session phải được refresh**:
   - Sau khi update RLS policies, đăng xuất và đăng nhập lại
   - Hoặc refresh page

## 🎯 Checklist

- [ ] Đã chạy `fix_profiles_rls_with_admin_insert.sql`
- [ ] Function `is_admin()` có `SECURITY DEFINER`
- [ ] Có policy "Admins can insert any profile"
- [ ] User đang đăng nhập có `role = 'admin'` trong profiles
- [ ] Đã đăng xuất và đăng nhập lại
- [ ] Đã thử tạo user mới lại

## 🚀 Sau Khi Fix

Nếu đã fix thành công:
- ✅ Có thể tạo user mới trong admin panel
- ✅ Profile được tạo tự động
- ✅ Không còn lỗi RLS

---

**Nếu vẫn gặp lỗi**, vui lòng:
1. Copy toàn bộ error message từ console
2. Copy response từ Network tab
3. Kiểm tra lại RLS policies trong Supabase Dashboard

