-- ========================================
-- KIỂM TRA LỆNH KHÓA CẤP TRUY CẬP TRONG DATABASE
-- ========================================
-- Script này kiểm tra xem các lệnh khóa cấp truy cập đã được lưu vào database chưa
-- Chạy script này trong Supabase SQL Editor

-- ========================================
-- QUICK CHECK: KIỂM TRA NHANH LEVEL N1 CỦA MODULE "level"
-- ========================================
-- Chạy query này nếu bạn chỉ muốn kiểm tra N1 có đang bị khóa không
SELECT 
  'LEVEL Module - N1' AS vi_tri,
  CASE 
    WHEN access_control->'level'->'n1' IS NULL THEN '❌ Chưa có cấu hình'
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA HOÀN TOÀN'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN access_control->'level'->'n1'->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN access_control->'level'->'n1'->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Không xác định'
  END AS ket_qua,
  access_control->'level'->'n1'->>'accessType' AS access_type,
  access_control->'level'->'n1'->'allowedRoles' AS roles_bi_chan,
  access_control->'level'->'n1'->'allowedUsers' AS users_bi_chan,
  jsonb_pretty(access_control->'level'->'n1') AS chi_tiet_json
FROM app_settings
WHERE id = 1;

-- ========================================
-- 0. TỔNG QUAN: XEM NHANH TRẠNG THÁI MỞ/KHÓA (ĐỌC PHẦN NÀY TRƯỚC!)
-- ========================================
-- Phần này hiển thị rõ ràng nhất: Đang mở hay đang khóa, và khóa cái gì
SELECT 
  '📊 TỔNG QUAN TRẠNG THÁI KHÓA/MỞ' AS title,
  '' AS empty_col
FROM app_settings WHERE id = 1;

-- Xem từng level trong LEVEL Module
SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 KHÓA HOÀN TOÀN'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ (Tất cả truy cập được)'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
  CASE 
    WHEN config->>'accessType' = 'none' THEN 'Không ai có thể truy cập level này'
    WHEN config->>'accessType' = 'all' THEN 'Tất cả người dùng đều truy cập được'
    WHEN config->>'accessType' = 'role' THEN 'Chặn các role: ' || COALESCE((config->'allowedRoles')::text, '[]')
    WHEN config->>'accessType' = 'user' THEN 'Chặn các user ID: ' || COALESCE((config->'allowedUsers')::text, '[]')
    ELSE ''
  END AS mo_ta,
  CASE 
    WHEN config->>'accessType' = 'role' THEN COALESCE((config->'allowedRoles')::text, '[]')
    WHEN config->>'accessType' = 'user' THEN COALESCE((config->'allowedUsers')::text, '[]')
    ELSE NULL
  END AS chi_tiet_khoa
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL

UNION ALL

-- Xem từng level trong JLPT Module
SELECT 
  'JLPT Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 KHÓA HOÀN TOÀN'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ (Tất cả truy cập được)'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
  CASE 
    WHEN config->>'accessType' = 'none' THEN 'Không ai có thể truy cập level này'
    WHEN config->>'accessType' = 'all' THEN 'Tất cả người dùng đều truy cập được'
    WHEN config->>'accessType' = 'role' THEN 'Chặn các role: ' || COALESCE((config->'allowedRoles')::text, '[]')
    WHEN config->>'accessType' = 'user' THEN 'Chặn các user ID: ' || COALESCE((config->'allowedUsers')::text, '[]')
    ELSE ''
  END AS mo_ta,
  CASE 
    WHEN config->>'accessType' = 'role' THEN COALESCE((config->'allowedRoles')::text, '[]')
    WHEN config->>'accessType' = 'user' THEN COALESCE((config->'allowedUsers')::text, '[]')
    ELSE NULL
  END AS chi_tiet_khoa
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL

ORDER BY module, level;

-- Tóm tắt: Chỉ hiển thị các level BỊ KHÓA
SELECT 
  '🔒 DANH SÁCH CÁC LEVEL ĐANG BỊ KHÓA' AS title,
  '' AS empty_col
FROM app_settings WHERE id = 1;

SELECT 
  module_type,
  UPPER(level_id) AS level_bi_khoa,
  CASE 
    WHEN access_type = 'none' THEN 'Khóa hoàn toàn - Không ai truy cập được'
    WHEN access_type = 'role' THEN 'Khóa theo role: ' || COALESCE((blocked_roles)::text, '[]')
    WHEN access_type = 'user' THEN 'Khóa theo user: ' || COALESCE((blocked_users)::text, '[]')
  END AS chi_tiet_khoa
FROM (
  SELECT 
    'LEVEL Module' AS module_type,
    level_id,
    config->>'accessType' AS access_type,
    config->'allowedRoles' AS blocked_roles,
    config->'allowedUsers' AS blocked_users
  FROM app_settings,
  LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'level' IS NOT NULL
    AND config->>'accessType' IN ('none', 'role', 'user')
  
  UNION ALL
  
  SELECT 
    'JLPT Module' AS module_type,
    level_id,
    config->>'accessType' AS access_type,
    config->'allowedRoles' AS blocked_roles,
    config->'allowedUsers' AS blocked_users
  FROM app_settings,
  LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'jlpt' IS NOT NULL
    AND config->>'accessType' IN ('none', 'role', 'user')
) AS locked_levels
ORDER BY module_type, level_id;

-- ========================================
-- 1. KIỂM TRA BẢNG app_settings CÓ TỒN TẠI KHÔNG
-- ========================================
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'app_settings'
    ) THEN '✅ Bảng app_settings đã tồn tại'
    ELSE '❌ Bảng app_settings CHƯA tồn tại - Cần tạo bảng trước!'
  END AS table_status;

-- ========================================
-- 2. KIỂM TRA CỘT access_control CÓ TỒN TẠI KHÔNG
-- ========================================
SELECT 
  column_name,
  data_type,
  column_default,
  CASE 
    WHEN column_name = 'access_control' THEN '✅ Cột access_control đã tồn tại'
    ELSE '❌ Cột access_control CHƯA tồn tại'
  END AS column_status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'app_settings'
  AND column_name = 'access_control';

-- Nếu cột chưa tồn tại, bạn cần chạy migration:
-- migrations/add_access_control_to_app_settings.sql

-- ========================================
-- 3. KIỂM TRA DỮ LIỆU access_control ĐÃ ĐƯỢC LƯU CHƯA
-- ========================================
SELECT 
  id,
  CASE 
    WHEN access_control IS NULL THEN '❌ access_control là NULL - Chưa có dữ liệu'
    WHEN access_control = '{}'::jsonb THEN '⚠️ access_control là rỗng {} - Chưa có cấu hình'
    ELSE '✅ access_control đã có dữ liệu'
  END AS data_status,
  updated_at AS last_updated
FROM app_settings
WHERE id = 1;

-- ========================================
-- 4. XEM CHI TIẾT CẤU HÌNH ACCESS CONTROL
-- ========================================
SELECT 
  id,
  access_control,
  updated_at,
  -- Kiểm tra từng module
  CASE 
    WHEN access_control ? 'level' THEN '✅ Có cấu hình LEVEL module'
    ELSE '❌ Chưa có cấu hình LEVEL module'
  END AS level_module_status,
  CASE 
    WHEN access_control ? 'jlpt' THEN '✅ Có cấu hình JLPT module'
    ELSE '❌ Chưa có cấu hình JLPT module'
  END AS jlpt_module_status,
  CASE 
    WHEN access_control ? 'levelModule' THEN '✅ Có cấu hình levelModule'
    ELSE '❌ Chưa có cấu hình levelModule'
  END AS level_module_config_status,
  CASE 
    WHEN access_control ? 'jlptModule' THEN '✅ Có cấu hình jlptModule'
    ELSE '❌ Chưa có cấu hình jlptModule'
  END AS jlpt_module_config_status
FROM app_settings
WHERE id = 1;

-- ========================================
-- 5. XEM CHI TIẾT TỪNG LEVEL ĐÃ BỊ KHÓA
-- ========================================
WITH level_configs AS (
  SELECT 
    id,
    access_control->'level' AS level_configs,
    access_control->'jlpt' AS jlpt_configs
  FROM app_settings
  WHERE id = 1
)
SELECT 
  'LEVEL Module' AS module_type,
  level_id,
  config->>'accessType' AS access_type,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 BỊ KHÓA (Không ai truy cập được)'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ (Tất cả đều truy cập được)'
    WHEN config->>'accessType' = 'role' THEN '⚠️ HẠN CHẾ THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ HẠN CHẾ THEO USER'
    ELSE '❓ Không xác định'
  END AS status,
  config->'allowedRoles' AS blocked_roles,
  config->'allowedUsers' AS blocked_users
FROM level_configs,
LATERAL jsonb_each(level_configs) AS t(level_id, config)
WHERE level_configs IS NOT NULL

UNION ALL

SELECT 
  'JLPT Module' AS module_type,
  level_id,
  config->>'accessType' AS access_type,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 BỊ KHÓA (Không ai truy cập được)'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ (Tất cả đều truy cập được)'
    WHEN config->>'accessType' = 'role' THEN '⚠️ HẠN CHẾ THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ HẠN CHẾ THEO USER'
    ELSE '❓ Không xác định'
  END AS status,
  config->'allowedRoles' AS blocked_roles,
  config->'allowedUsers' AS blocked_users
FROM level_configs,
LATERAL jsonb_each(jlpt_configs) AS t(level_id, config)
WHERE jlpt_configs IS NOT NULL

ORDER BY module_type, level_id;

-- ========================================
-- 6. TỔNG KẾT: ĐẾM SỐ LEVEL BỊ KHÓA
-- ========================================
WITH level_configs AS (
  SELECT 
    access_control->'level' AS level_configs,
    access_control->'jlpt' AS jlpt_configs
  FROM app_settings
  WHERE id = 1
)
SELECT 
  'LEVEL Module' AS module_type,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'none') AS so_level_bi_khoa,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'all') AS so_level_mo,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'role') AS so_level_han_che_role,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'user') AS so_level_han_che_user,
  COUNT(*) AS tong_so_level
FROM level_configs,
LATERAL jsonb_each(level_configs) AS t(level_id, config)
WHERE level_configs IS NOT NULL

UNION ALL

SELECT 
  'JLPT Module' AS module_type,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'none') AS so_level_bi_khoa,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'all') AS so_level_mo,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'role') AS so_level_han_che_role,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'user') AS so_level_han_che_user,
  COUNT(*) AS tong_so_level
FROM level_configs,
LATERAL jsonb_each(jlpt_configs) AS t(level_id, config)
WHERE jlpt_configs IS NOT NULL;

-- ========================================
-- 7. XEM CẤU HÌNH MODULE-LEVEL (levelModule, jlptModule)
-- ========================================
SELECT 
  'levelModule' AS module_config_name,
  access_control->'levelModule'->>'accessType' AS access_type,
  CASE 
    WHEN access_control->'levelModule'->>'accessType' = 'none' THEN '🔒 BỊ KHÓA'
    WHEN access_control->'levelModule'->>'accessType' = 'all' THEN '✅ MỞ'
    WHEN access_control->'levelModule'->>'accessType' = 'role' THEN '⚠️ HẠN CHẾ THEO ROLE'
    WHEN access_control->'levelModule'->>'accessType' = 'user' THEN '⚠️ HẠN CHẾ THEO USER'
    ELSE '❓ Chưa có cấu hình'
  END AS status,
  access_control->'levelModule'->'allowedRoles' AS blocked_roles,
  access_control->'levelModule'->'allowedUsers' AS blocked_users
FROM app_settings
WHERE id = 1

UNION ALL

SELECT 
  'jlptModule' AS module_config_name,
  access_control->'jlptModule'->>'accessType' AS access_type,
  CASE 
    WHEN access_control->'jlptModule'->>'accessType' = 'none' THEN '🔒 BỊ KHÓA'
    WHEN access_control->'jlptModule'->>'accessType' = 'all' THEN '✅ MỞ'
    WHEN access_control->'jlptModule'->>'accessType' = 'role' THEN '⚠️ HẠN CHẾ THEO ROLE'
    WHEN access_control->'jlptModule'->>'accessType' = 'user' THEN '⚠️ HẠN CHẾ THEO USER'
    ELSE '❓ Chưa có cấu hình'
  END AS status,
  access_control->'jlptModule'->'allowedRoles' AS blocked_roles,
  access_control->'jlptModule'->'allowedUsers' AS blocked_users
FROM app_settings
WHERE id = 1;

-- ========================================
-- 8. XEM TOÀN BỘ JSON access_control (Để debug)
-- ========================================
SELECT 
  id,
  jsonb_pretty(access_control) AS access_control_pretty,
  updated_at
FROM app_settings
WHERE id = 1;

-- ========================================
-- HƯỚNG DẪN SỬ DỤNG:
-- ========================================
-- 1. Chạy script này trong Supabase SQL Editor
-- 2. Xem kết quả từng phần để kiểm tra:
--    - Phần 1: Bảng có tồn tại không
--    - Phần 2: Cột access_control có tồn tại không
--    - Phần 3: Dữ liệu đã được lưu chưa
--    - Phần 4: Cấu hình chi tiết từng module
--    - Phần 5: Danh sách các level bị khóa
--    - Phần 6: Tổng kết số lượng level bị khóa
--    - Phần 7: Cấu hình module-level
--    - Phần 8: Xem toàn bộ JSON (để debug)
--
-- NẾU CHƯA CÓ DỮ LIỆU:
-- - Kiểm tra xem bạn đã lưu cấu hình từ Admin Control Page chưa
-- - Kiểm tra xem migration đã chạy chưa: migrations/add_access_control_to_app_settings.sql
-- - Kiểm tra xem có lỗi khi lưu vào Supabase không (xem console trong browser)
-- ========================================

