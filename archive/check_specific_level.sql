-- ========================================
-- KIỂM TRA CỤ THỂ MỘT LEVEL CÓ ĐANG BỊ KHÓA KHÔNG
-- ========================================
-- Script này kiểm tra cụ thể một level (ví dụ: N1 của module "level")
-- Thay đổi 'n1' và 'level' theo nhu cầu của bạn

-- ========================================
-- KIỂM TRA LEVEL N1 CỦA MODULE "level"
-- ========================================
SELECT 
  'LEVEL Module - N1' AS thong_tin,
  CASE 
    WHEN access_control->'level'->'n1' IS NULL THEN '❌ Chưa có cấu hình cho N1'
    WHEN access_control->'level'->'n1'->>'accessType' = 'none' THEN '🔒 ĐANG KHÓA HOÀN TOÀN'
    WHEN access_control->'level'->'n1'->>'accessType' = 'all' THEN '✅ ĐANG MỞ (Tất cả truy cập được)'
    WHEN access_control->'level'->'n1'->>'accessType' = 'role' THEN '⚠️ ĐANG KHÓA THEO ROLE'
    WHEN access_control->'level'->'n1'->>'accessType' = 'user' THEN '⚠️ ĐANG KHÓA THEO USER'
    ELSE '❓ Không xác định'
  END AS trang_thai,
  access_control->'level'->'n1'->>'accessType' AS access_type,
  access_control->'level'->'n1'->'allowedRoles' AS roles_bi_chan,
  access_control->'level'->'n1'->'allowedUsers' AS users_bi_chan,
  jsonb_pretty(access_control->'level'->'n1') AS chi_tiet_json
FROM app_settings
WHERE id = 1;

-- ========================================
-- KIỂM TRA TẤT CẢ CÁC LEVEL CỦA MODULE "level"
-- ========================================
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
  config->'allowedRoles' AS roles_bi_chan,
  config->'allowedUsers' AS users_bi_chan
FROM app_settings,
LATERAL jsonb_each(access_control->'level') AS t(level_id, config)
WHERE id = 1
  AND access_control->'level' IS NOT NULL
ORDER BY level_id;

-- ========================================
-- KIỂM TRA TẤT CẢ CÁC LEVEL CỦA MODULE "jlpt"
-- ========================================
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
  config->'allowedRoles' AS roles_bi_chan,
  config->'allowedUsers' AS users_bi_chan
FROM app_settings,
LATERAL jsonb_each(access_control->'jlpt') AS t(level_id, config)
WHERE id = 1
  AND access_control->'jlpt' IS NOT NULL
ORDER BY level_id;

-- ========================================
-- HƯỚNG DẪN ĐỌC JSON TRỰC TIẾP
-- ========================================
-- Nếu bạn đang xem JSON trong access_control_pretty, tìm như sau:
-- 
-- 1. Tìm key "level": {
-- 2. Bên trong "level", tìm "n1": {
-- 3. Xem "accessType" bên trong "n1":
--    - "accessType": "none" → 🔒 ĐANG KHÓA
--    - "accessType": "all" → ✅ ĐANG MỞ
--    - "accessType": "role" → ⚠️ KHÓA THEO ROLE
--    - "accessType": "user" → ⚠️ KHÓA THEO USER
--
-- Ví dụ JSON khi N1 bị khóa:
-- {
--   "level": {
--     "n1": {
--       "accessType": "none",    ← Đây là dấu hiệu bị khóa
--       "allowedRoles": [],
--       "allowedUsers": []
--     }
--   }
-- }

