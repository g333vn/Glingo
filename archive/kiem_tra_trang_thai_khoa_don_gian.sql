-- ========================================
-- KIỂM TRA TRẠNG THÁI KHÓA ĐƠN GIẢN
-- ========================================
-- Query này hiển thị rõ ràng: Level nào đang bị khóa, level nào đang mở
-- Chạy query này trong Supabase SQL Editor

-- ========================================
-- KIỂM TRA MODULE "level" (Dropdown LEVEL trong giao diện)
-- ========================================
SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình (Mặc định: MỞ)'
  END AS trang_thai,
  config->>'accessType' AS access_type
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL
ORDER BY level_id;

-- ========================================
-- KIỂM TRA MODULE "jlpt" (Dropdown JLPT trong giao diện)
-- ========================================
SELECT 
  'JLPT Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình (Mặc định: MỞ)'
  END AS trang_thai,
  config->>'accessType' AS access_type
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL
ORDER BY level_id;

-- ========================================
-- TỔNG HỢP: CHỈ HIỂN THỊ CÁC LEVEL ĐANG BỊ KHÓA
-- ========================================
SELECT 
  module,
  UPPER(level_id) AS level_bi_khoa,
  '🔒 ĐANG KHÓA' AS trang_thai
FROM (
  SELECT 
    'LEVEL Module' AS module,
    level_id,
    config->>'accessType' AS access_type
  FROM app_settings,
  LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'level' IS NOT NULL
    AND config->>'accessType' = 'none'
  
  UNION ALL
  
  SELECT 
    'JLPT Module' AS module,
    level_id,
    config->>'accessType' AS access_type
  FROM app_settings,
  LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'jlpt' IS NOT NULL
    AND config->>'accessType' = 'none'
) AS locked_levels
ORDER BY module, level_id;

-- ========================================
-- KIỂM TRA CỤ THỂ N1 VÀ N2 (Nếu bạn muốn xem chi tiết)
-- ========================================
SELECT 
  'LEVEL Module' AS module,
  'N1' AS level,
  CASE 
    WHEN access_control->'level'->'n1' IS NULL THEN '❓ Chưa có cấu hình'
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai,
  access_control->'level'->'n1'->>'accessType' AS access_type,
  jsonb_pretty(access_control->'level'->'n1') AS chi_tiet
FROM app_settings
WHERE id = 1

UNION ALL

SELECT 
  'LEVEL Module' AS module,
  'N2' AS level,
  CASE 
    WHEN access_control->'level'->'n2' IS NULL THEN '❓ Chưa có cấu hình'
    WHEN access_control->'level'->'n2'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN access_control->'level'->'n2'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    ELSE '⚠️ KHÓA MỘT PHẦN'
  END AS trang_thai,
  access_control->'level'->'n2'->>'accessType' AS access_type,
  jsonb_pretty(access_control->'level'->'n2') AS chi_tiet
FROM app_settings
WHERE id = 1;

-- ========================================
-- HƯỚNG DẪN ĐỌC KẾT QUẢ:
-- ========================================
-- 1. Query đầu tiên: Hiển thị tất cả level của module "level"
--    - 🔒 ĐANG KHÓA = accessType = "none"
--    - ✅ ĐANG MỞ = accessType = "all"
--
-- 2. Query thứ hai: Hiển thị tất cả level của module "jlpt"
--
-- 3. Query thứ ba: Chỉ hiển thị các level ĐANG BỊ KHÓA
--    - Dễ nhìn nhất để biết level nào bị khóa
--
-- 4. Query thứ tư: Kiểm tra cụ thể N1 và N2
--    - Hiển thị chi tiết JSON nếu cần debug
-- ========================================

