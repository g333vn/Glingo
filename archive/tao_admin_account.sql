-- ========================================
-- SCRIPT TẠO TÀI KHOẢN ADMIN TRÊN SUPABASE
-- ========================================
-- Hướng dẫn: Thay EMAIL và DISPLAY_NAME của bạn vào các query dưới đây

-- ========================================
-- BƯỚC 1: KIỂM TRA USER ĐÃ TỒN TẠI CHƯA
-- ========================================

-- Kiểm tra user có trong auth.users không
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  confirmed_at
FROM auth.users
WHERE email = 'admin@example.com';  -- ⚠️ Thay email của bạn

-- Kiểm tra profile đã tồn tại chưa
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at
FROM public.profiles
WHERE email = 'admin@example.com';  -- ⚠️ Thay email của bạn

-- ========================================
-- BƯỚC 2: TẠO ADMIN TỪ USER HIỆN CÓ
-- ========================================

-- Nếu user đã tồn tại, chỉ cần đổi role thành admin
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'admin@example.com';  -- ⚠️ Thay email của bạn

-- ========================================
-- BƯỚC 3: TẠO PROFILE CHO USER MỚI (Nếu chưa có profile)
-- ========================================

-- Nếu user đã có trong auth.users nhưng chưa có profile
-- Lấy user_id từ query trên, rồi chạy:

INSERT INTO public.profiles (
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)),
  'admin',  -- ✅ Set role admin ngay
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'admin@example.com'  -- ⚠️ Thay email của bạn
AND id NOT IN (SELECT user_id FROM public.profiles WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin',
  updated_at = NOW();

-- ========================================
-- BƯỚC 4: XÁC NHẬN KẾT QUẢ
-- ========================================

-- Kiểm tra admin account đã được tạo thành công
SELECT 
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  CASE 
    WHEN p.role = 'admin' THEN '✅ Đã là Admin'
    ELSE '❌ Chưa phải Admin'
  END as status,
  p.created_at,
  p.updated_at,
  u.email_confirmed_at as email_verified
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.email = 'admin@example.com';  -- ⚠️ Thay email của bạn

-- ========================================
-- BƯỚC 5: XEM TẤT CẢ ADMIN ACCOUNTS
-- ========================================

-- Liệt kê tất cả admin accounts
SELECT 
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  p.created_at,
  p.updated_at,
  u.email_confirmed_at as email_verified,
  u.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.role = 'admin'
ORDER BY p.created_at DESC;

-- ========================================
-- BƯỚC 6: THỐNG KÊ USERS THEO ROLE
-- ========================================

-- Xem số lượng users theo từng role
SELECT 
  role,
  COUNT(*) as count,
  STRING_AGG(email, ', ' ORDER BY email) as emails
FROM public.profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'admin' THEN 1
    WHEN 'editor' THEN 2
    WHEN 'user' THEN 3
    ELSE 4
  END;

-- ========================================
-- TROUBLESHOOTING
-- ========================================

-- Nếu gặp lỗi RLS, kiểm tra policies:
SELECT 
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Nếu thiếu policy, chạy script fix_profiles_rls_with_admin_insert.sql

-- ========================================
-- LƯU Ý
-- ========================================
-- 1. Thay 'admin@example.com' bằng email thật của bạn
-- 2. Sau khi set role admin, user cần đăng xuất và đăng nhập lại
-- 3. Đảm bảo RLS policies đã được setup đúng
-- 4. Kiểm tra email đã được xác minh trong auth.users

