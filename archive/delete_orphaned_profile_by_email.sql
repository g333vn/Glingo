-- ========================================
-- XÓA ORPHANED PROFILE THEO EMAIL
-- ========================================
-- Orphaned profile = Profile có trong profiles nhưng không có trong auth.users
-- Email: giangtest@gmail.com
--
-- ⚠️ LƯU Ý: 
-- - Script này chỉ xóa profile trong bảng profiles
-- - Không ảnh hưởng đến auth.users (vì user đã không có ở đó)

-- ========================================
-- BƯỚC 1: KIỂM TRA PROFILE TRƯỚC KHI XÓA
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
-- BƯỚC 2: KIỂM TRA USER CÓ TRONG AUTH.USERS KHÔNG
-- ========================================
SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email = 'giangtest@gmail.com';  -- Thay email của bạn

-- Nếu query này không trả về kết quả → Đây là orphaned profile

-- ========================================
-- BƯỚC 3: XÓA ORPHANED PROFILE
-- ========================================
-- ⚠️ CHỈ CHẠY NẾU BẠN CHẮC CHẮN MUỐN XÓA
-- 
DELETE FROM public.profiles
WHERE email = 'giangtest@gmail.com';  -- Thay email của bạn

-- ========================================
-- BƯỚC 4: XÁC NHẬN ĐÃ XÓA
-- ========================================
-- Chạy lại query BƯỚC 1 để xác nhận
-- Nếu không có kết quả → Đã xóa thành công

SELECT 
  user_id,
  email,
  display_name
FROM public.profiles
WHERE email = 'giangtest@gmail.com';

-- ========================================
-- BƯỚC 5: XÓA TẤT CẢ ORPHANED PROFILES (NẾU CẦN)
-- ========================================
-- Tìm tất cả orphaned profiles:
SELECT 
  p.user_id,
  p.email,
  p.display_name,
  p.role,
  p.created_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE u.id IS NULL;

-- Xóa tất cả orphaned profiles:
-- DELETE FROM public.profiles
-- WHERE user_id IN (
--   SELECT p.user_id
--   FROM public.profiles p
--   LEFT JOIN auth.users u ON p.user_id = u.id
--   WHERE u.id IS NULL
-- );

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Script để xóa orphaned profile!';
  RAISE NOTICE '⚠️ Đảm bảo user không có trong auth.users trước khi xóa';
END $$;

