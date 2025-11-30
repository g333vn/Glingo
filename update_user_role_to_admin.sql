-- ========================================
-- ĐỔI ROLE USER THÀNH ADMIN
-- ========================================
-- User: giangtest03@gmail.com
-- Role mới: admin

-- Cách 1: Update theo email (Dễ nhất)
UPDATE public.profiles
SET 
  role = 'admin',
  updated_at = NOW()
WHERE email = 'giangtest03@gmail.com';

-- Kiểm tra kết quả
SELECT 
  user_id,
  email,
  display_name,
  role,
  updated_at
FROM public.profiles
WHERE email = 'giangtest03@gmail.com';

-- ========================================
-- NẾU CẦN UPDATE THEO USER_ID:
-- ========================================
-- Tìm user_id trước:
-- SELECT user_id, email, role FROM public.profiles WHERE email = 'giangtest03@gmail.com';
--
-- Sau đó update:
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE user_id = 'UUID_CUA_USER';

-- ========================================
-- XÁC NHẬN:
-- ========================================
-- Chạy query này để xác nhận role đã được đổi:
SELECT 
  email,
  display_name,
  role,
  CASE 
    WHEN role = 'admin' THEN '✅ Đã là Admin'
    ELSE '❌ Chưa đổi thành Admin'
  END as status
FROM public.profiles
WHERE email = 'giangtest03@gmail.com';

