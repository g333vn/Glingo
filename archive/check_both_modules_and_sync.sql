-- ========================================
-- KIỂM TRA CẢ 2 MODULE: "level" VÀ "jlpt" + MAINTENANCE MODE
-- ========================================
-- Script này kiểm tra cả 2 module để xem level nào đang bị khóa
-- Và hiển thị trạng thái Maintenance Mode (Chế độ bảo trì)

-- ========================================
-- 0. KIỂM TRA MAINTENANCE MODE (CHẾ ĐỘ BẢO TRÌ)
-- ========================================
SELECT 
  'Maintenance Mode' AS loai_cau_hinh,
  CASE 
    WHEN maintenance_mode = true THEN '🔴 ĐANG BẬT (Bảo trì)'
    WHEN maintenance_mode = false THEN '🟢 ĐANG TẮT (Hoạt động bình thường)'
    WHEN maintenance_mode IS NULL THEN '❓ Chưa cấu hình'
    ELSE '❓ Không xác định'
  END AS trang_thai,
  COALESCE(maintenance_mode::text, 'NULL') AS gia_tri,
  updated_at AS cap_nhat_luc
FROM app_settings
WHERE id = 1;

-- ========================================
-- 1. TỔNG HỢP: XEM TẤT CẢ (MAINTENANCE MODE + ACCESS CONTROL)
-- ========================================
-- Query này hiển thị Maintenance Mode và tất cả Access Control trong cùng một bảng

SELECT 
  'Maintenance Mode' AS module,
  'System' AS level,
  CASE 
    WHEN maintenance_mode = true THEN '🔴 ĐANG BẬT (Bảo trì)'
    WHEN maintenance_mode = false THEN '🟢 ĐANG TẮT (Hoạt động)'
    WHEN maintenance_mode IS NULL THEN '❓ Chưa cấu hình'
    ELSE '❓ Không xác định'
  END AS trang_thai,
  COALESCE(maintenance_mode::text, 'NULL') AS access_type,
  0 AS sort_order
FROM app_settings
WHERE id = 1

UNION ALL

SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
  config->>'accessType' AS access_type,
  1 AS sort_order
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL

UNION ALL

SELECT 
  'JLPT Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
  config->>'accessType' AS access_type,
  2 AS sort_order
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL

ORDER BY sort_order, level;

-- ========================================
-- 2. CHỈ HIỂN THỊ CÁC LEVEL ĐANG BỊ KHÓA (CẢ 2 MODULE)
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
ORDER BY module, level_bi_khoa;

-- ========================================
-- 3. KIỂM TRA MODULE "level" - N1
-- ========================================
SELECT 
  'MODULE: level' AS module,
  'N1' AS level,
  CASE 
    WHEN access_control->'level'->'n1' IS NULL THEN '❌ Chưa có cấu hình'
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA HOÀN TOÀN'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN access_control->'level'->'n1'->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN access_control->'level'->'n1'->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Không xác định'
  END AS trang_thai,
  access_control->'level'->'n1'->>'accessType' AS access_type,
  jsonb_pretty(access_control->'level'->'n1') AS chi_tiet_json
FROM app_settings
WHERE id = 1;

-- ========================================
-- 2. KIỂM TRA MODULE "jlpt" - N1
-- ========================================
SELECT 
  'MODULE: jlpt' AS module,
  'N1' AS level,
  CASE 
    WHEN access_control->'jlpt'->'n1' IS NULL THEN '❌ Chưa có cấu hình'
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA HOÀN TOÀN'
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ'
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'role' THEN '⚠️ KHÓA THEO ROLE'
    WHEN access_control->'jlpt'->'n1'->>'accessType' = 'user' THEN '⚠️ KHÓA THEO USER'
    ELSE '❓ Không xác định'
  END AS trang_thai,
  access_control->'jlpt'->'n1'->>'accessType' AS access_type,
  jsonb_pretty(access_control->'jlpt'->'n1') AS chi_tiet_json
FROM app_settings
WHERE id = 1;

-- ========================================
-- 4. SO SÁNH TỪNG LEVEL GIỮA 2 MODULE
-- ========================================
-- Query này so sánh cùng một level (ví dụ: N1) giữa 2 module
SELECT 
  UPPER(level_id) AS level,
  COALESCE(level_config->>'accessType', 'Chưa cấu hình') AS level_module_status,
  COALESCE(jlpt_config->>'accessType', 'Chưa cấu hình') AS jlpt_module_status,
  CASE 
    WHEN level_config->>'accessType' = 'none' THEN '🔒'
    WHEN level_config->>'accessType' = 'all' THEN '✅'
    ELSE '⚠️'
  END AS level_icon,
  CASE 
    WHEN jlpt_config->>'accessType' = 'none' THEN '🔒'
    WHEN jlpt_config->>'accessType' = 'all' THEN '✅'
    ELSE '⚠️'
  END AS jlpt_icon
FROM (
  SELECT 
    level_id,
    config AS level_config
  FROM app_settings,
  LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'level' IS NOT NULL
) AS level_data
FULL OUTER JOIN (
  SELECT 
    level_id,
    config AS jlpt_config
  FROM app_settings,
  LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
  WHERE id = 1
    AND access_control->'jlpt' IS NOT NULL
) AS jlpt_data USING (level_id)
ORDER BY level;

-- ========================================
-- 5. TỔNG KẾT: ĐẾM SỐ LEVEL BỊ KHÓA/MỞ (CẢ 2 MODULE)
-- ========================================
SELECT 
  'LEVEL Module' AS module,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'none') AS so_level_bi_khoa,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'all') AS so_level_mo,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'role') AS so_level_khoa_role,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'user') AS so_level_khoa_user,
  COUNT(*) AS tong_so_level
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL

UNION ALL

SELECT 
  'JLPT Module' AS module,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'none') AS so_level_bi_khoa,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'all') AS so_level_mo,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'role') AS so_level_khoa_role,
  COUNT(*) FILTER (WHERE config->>'accessType' = 'user') AS so_level_khoa_user,
  COUNT(*) AS tong_so_level
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL;

-- ========================================
-- 6. XEM TOÀN BỘ JSON ĐỂ DEBUG
-- ========================================
SELECT 
  id,
  jsonb_pretty(access_control) AS access_control_full,
  updated_at
FROM app_settings
WHERE id = 1;

