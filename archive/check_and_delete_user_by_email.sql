-- ========================================
-- KIỂM TRA VÀ XÓA USER THEO EMAIL
-- ========================================
-- Email: giangtest@gmail.com
-- 
-- ⚠️ LƯU Ý: 
-- - Script này để KIỂM TRA user có tồn tại không
-- - Để XÓA, cần dùng Supabase Dashboard hoặc Admin API

-- ========================================
-- BƯỚC 1: KIỂM TRA USER TRONG PROFILES
-- ========================================
SELECT 
  user_id,
  email,
  display_name,
  role,
  created_at,
  updated_at
FROM public.profiles
WHERE email = 'giangtest@gmail.com';  -- Thay email của bạn

-- ========================================
-- BƯỚC 2: KIỂM TRA USER TRONG AUTH.USERS
-- ========================================
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'giangtest@gmail.com';  -- Thay email của bạn

-- ========================================
-- BƯỚC 3: KIỂM TRA CẢ HAI BẢNG CÙNG LÚC
-- ========================================
SELECT 
  u.id as auth_user_id,
  u.email as auth_email,
  u.created_at as auth_created_at,
  p.user_id as profile_user_id,
  p.email as profile_email,
  p.display_name,
  p.role,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Có trong auth.users nhưng KHÔNG có trong profiles (orphaned)'
    WHEN u.id IS NULL THEN '❌ Có trong profiles nhưng KHÔNG có trong auth.users (lỗi)'
    ELSE '✅ Có trong cả hai bảng'
  END as status
FROM auth.users u
FULL OUTER JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'giangtest@gmail.com' OR p.email = 'giangtest@gmail.com';

-- ========================================
-- BƯỚC 4: XÓA USER TRONG PROFILES (NẾU CÓ)
-- ========================================
-- ⚠️ CHỈ CHẠY NẾU BẠN CHẮC CHẮN MUỐN XÓA
-- 
-- DELETE FROM public.profiles
-- WHERE email = 'giangtest@gmail.com';

-- ========================================
-- BƯỚC 5: XÓA USER TRONG AUTH.USERS
-- ========================================
-- ⚠️ KHÔNG THỂ XÓA TRỰC TIẾP TỪ auth.users BẰNG SQL
-- 
-- Cách xóa:
-- 1. Qua Supabase Dashboard:
--    - Vào Authentication → Users
--    - Tìm user theo email "giangtest@gmail.com"
--    - Click "Delete user"
--
-- 2. Hoặc dùng Admin API với service role key

-- ========================================
-- BƯỚC 6: XÓA TẤT CẢ DỮ LIỆU CỦA USER (NẾU CẦN)
-- ========================================
-- Lấy user_id trước:
-- SELECT id FROM auth.users WHERE email = 'giangtest@gmail.com';
--
-- Sau đó xóa profile (nếu có):
-- DELETE FROM public.profiles WHERE user_id = 'USER_ID_FROM_ABOVE';
--
-- Xóa trong auth.users (qua Dashboard hoặc Admin API)

-- ========================================
-- XÁC NHẬN SAU KHI XÓA
-- ========================================
-- Chạy lại query BƯỚC 1 và BƯỚC 2 để xác nhận đã xóa
-- Nếu không có kết quả → Đã xóa thành công

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Script để kiểm tra và xóa user theo email!';
  RAISE NOTICE '⚠️ Để xóa user trong auth.users, dùng Supabase Dashboard';
END $$;

