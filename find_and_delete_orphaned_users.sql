-- ========================================
-- TÌM VÀ XÓA ORPHANED USERS
-- ========================================
-- Orphaned users = Users có trong auth.users nhưng không có trong profiles
-- 
-- ⚠️ LƯU Ý: 
-- - Không thể xóa trực tiếp từ auth.users bằng SQL thông thường
-- - Cần dùng Supabase Admin API hoặc Dashboard
-- - Script này chỉ để TÌM orphaned users

-- ========================================
-- BƯỚC 1: TÌM ORPHANED USERS
-- ========================================
-- Xem danh sách users có trong auth.users nhưng không có trong profiles
SELECT 
  u.id as user_id,
  u.email,
  u.created_at as "Tạo lúc",
  u.email_confirmed_at as "Xác nhận email lúc",
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Orphaned (không có profile)'
    ELSE '✅ Có profile'
  END as "Trạng thái"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL
ORDER BY u.created_at DESC;

-- ========================================
-- BƯỚC 2: ĐẾM SỐ LƯỢNG ORPHANED USERS
-- ========================================
SELECT 
  COUNT(*) as "Số orphaned users"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- ========================================
-- BƯỚC 3: XÓA ORPHANED USERS
-- ========================================
-- ⚠️ KHÔNG THỂ XÓA TRỰC TIẾP TỪ auth.users BẰNG SQL
-- 
-- Cách xóa:
-- 1. Qua Supabase Dashboard:
--    - Vào Authentication → Users
--    - Tìm user theo email
--    - Click "Delete user"
--
-- 2. Qua Supabase Admin API (cần service role key):
--    - Sử dụng DELETE /auth/v1/admin/users/{user_id}
--    - Hoặc dùng supabase-admin SDK
--
-- 3. Qua SQL (chỉ với service role):
--    - DELETE FROM auth.users WHERE id = 'USER_ID';
--    - ⚠️ Cần quyền SUPERUSER hoặc service role

-- ========================================
-- BƯỚC 4: XÓA TẤT CẢ ORPHANED USERS (NẾU CẦN)
-- ========================================
-- ⚠️ CHỈ CHẠY NẾU BẠN CHẮC CHẮN MUỐN XÓA TẤT CẢ
-- 
-- Lấy danh sách IDs để xóa:
SELECT 
  u.id,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Sau đó xóa từng user qua Dashboard hoặc Admin API

-- ========================================
-- BƯỚC 5: KIỂM TRA EMAIL CỤ THỂ
-- ========================================
-- Kiểm tra xem email có tồn tại trong auth.users không
SELECT 
  u.id,
  u.email,
  u.created_at,
  CASE 
    WHEN p.user_id IS NULL THEN '❌ Orphaned'
    ELSE '✅ Có profile'
  END as status
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email = 'giangtest@gmail.com';  -- Thay email của bạn

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Script để tìm orphaned users!';
  RAISE NOTICE '⚠️ Để xóa, dùng Supabase Dashboard → Authentication → Users';
END $$;

