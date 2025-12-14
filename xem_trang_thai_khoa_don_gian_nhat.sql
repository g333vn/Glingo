-- ========================================
-- XEM TRẠNG THÁI KHÓA ĐƠN GIẢN NHẤT + MAINTENANCE MODE
-- ========================================
-- Query này hiển thị rõ ràng nhất: Level nào đang khóa, level nào đang mở
-- Và trạng thái Maintenance Mode (Chế độ bảo trì)
-- Chạy query này trong Supabase SQL Editor

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
  COALESCE(maintenance_mode::text, 'NULL') AS gia_tri
FROM app_settings
WHERE id = 1;

-- ========================================
-- 1. QUERY ĐẦY ĐỦ: XEM TẤT CẢ (MAINTENANCE MODE + ACCESS CONTROL)
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
  0 AS sort_order
FROM app_settings
WHERE id = 1

UNION ALL

SELECT 
  'LEVEL Module' AS module,
  UPPER(level_id) AS level,
  CASE 
    WHEN config->>'accessType' = 'none' THEN '🔒 KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
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
    WHEN config->>'accessType' = 'none' THEN '🔒 KHÓA'
    WHEN config->>'accessType' = 'all' THEN '✅ MỞ'
    WHEN config->>'accessType' = 'role' THEN '⚠️ KHÓA ROLE'
    WHEN config->>'accessType' = 'user' THEN '⚠️ KHÓA USER'
    ELSE '❓ Chưa cấu hình'
  END AS trang_thai,
  2 AS sort_order
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL

ORDER BY sort_order, level;

-- ========================================
-- CÁCH ĐỌC KẾT QUẢ:
-- ========================================
-- module        | level | trang_thai
-- --------------|-------|------------
-- LEVEL Module  | N1    | 🔒 KHÓA    ← N1 đang bị khóa
-- LEVEL Module  | N2    | 🔒 KHÓA    ← N2 đang bị khóa
-- LEVEL Module  | N3    | ✅ MỞ      ← N3 đang mở
-- JLPT Module   | N1    | ✅ MỞ      ← JLPT N1 đang mở
-- ========================================

