-- Script Chuyển Timezone Sang Tokyo (Nhật Bản)
-- Chạy script này trong Supabase SQL Editor để chuyển timezone sang Asia/Tokyo
-- 
-- ⚠️ LƯU Ý:
-- - Script này chỉ thay đổi timezone cho các queries mới
-- - Dữ liệu đã lưu (timestamps) sẽ KHÔNG bị thay đổi
-- - Chỉ ảnh hưởng đến các giá trị mới được tạo bằng NOW()
-- 
-- ✅ AN TOÀN: Không ảnh hưởng đến cấu trúc hệ thống

-- ============================================
-- Option 1: Set Timezone Cho Session (Tạm Thời)
-- ============================================
-- Chạy mỗi lần mở SQL Editor (chỉ ảnh hưởng session hiện tại)

SET timezone = 'Asia/Tokyo';

-- Kiểm tra timezone hiện tại
SHOW timezone;

-- ============================================
-- Option 2: Set Timezone Cho Database (Vĩnh Viễn)
-- ============================================
-- ⚠️ CẨN THẬN: Thay đổi này sẽ ảnh hưởng đến tất cả connections
-- Chỉ chạy nếu bạn chắc chắn muốn thay đổi vĩnh viễn

-- ALTER DATABASE postgres SET timezone = 'Asia/Tokyo';
-- 
-- Sau khi chạy, cần reconnect database để áp dụng

-- ============================================
-- Option 3: Set Timezone Cho User/Role (Khuyến Khích)
-- ============================================
-- Set timezone cho role hiện tại (an toàn hơn)

-- ALTER ROLE CURRENT_USER SET timezone = 'Asia/Tokyo';
-- 
-- Sau khi chạy, cần reconnect để áp dụng

-- ============================================
-- Kiểm Tra Timezone Hiện Tại
-- ============================================

-- Xem timezone của database
SELECT current_setting('timezone') as current_timezone;

-- Xem timezone của session
SHOW timezone;

-- Test: So sánh NOW() với timezone khác nhau
SELECT 
  NOW() as current_time,
  NOW() AT TIME ZONE 'Asia/Tokyo' as tokyo_time,
  NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' as vietnam_time,
  NOW() AT TIME ZONE 'UTC' as utc_time;

-- ============================================
-- Lưu Ý
-- ============================================

-- 1. Code JavaScript đang dùng `new Date().toISOString()`
--    → Luôn trả về UTC, không phụ thuộc timezone
--    → Không cần thay đổi code
--
-- 2. Database dùng `NOW()` trong DEFAULT và triggers
--    → Sẽ dùng timezone của database/server
--    → Cần set timezone nếu muốn thay đổi
--
-- 3. Dữ liệu đã lưu:
--    → Nếu dùng TIMESTAMP WITH TIME ZONE: Giữ nguyên, chỉ hiển thị khác
--    → Nếu dùng TIMESTAMP (không có timezone): Có thể bị ảnh hưởng
--
-- 4. Khuyến nghị:
--    → Dùng Option 1 (session level) để test trước
--    → Nếu OK, dùng Option 3 (role level) để áp dụng vĩnh viễn
--    → Tránh Option 2 (database level) vì ảnh hưởng toàn bộ database

-- ============================================
-- Revert (Nếu Cần Quay Lại)
-- ============================================

-- Set lại về Việt Nam
-- SET timezone = 'Asia/Ho_Chi_Minh';
-- ALTER ROLE CURRENT_USER SET timezone = 'Asia/Ho_Chi_Minh';

