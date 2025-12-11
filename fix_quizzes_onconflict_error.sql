-- Fix: Lỗi 42P10 khi save quiz lên Supabase
-- Error: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
-- 
-- Nguyên nhân: Code đang dùng onConflict: 'id' nhưng bảng quizzes có composite primary key
-- Giải pháp: Tạo unique constraint trên cột 'id' hoặc sửa code để không dùng onConflict

-- ============================================
-- Bước 1: Kiểm tra schema hiện tại
-- ============================================

-- Kiểm tra primary key của bảng quizzes
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'quizzes' 
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY kcu.ordinal_position;

-- Kiểm tra unique constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'quizzes' 
  AND tc.constraint_type = 'UNIQUE'
ORDER BY kcu.ordinal_position;

-- ============================================
-- Bước 2: Tạo unique constraint trên cột 'id'
-- ============================================

-- Option 1: Tạo unique constraint trên cột 'id' (nếu chưa có)
-- Lưu ý: Chỉ làm nếu bạn chắc chắn rằng 'id' là unique trong toàn bộ bảng
-- Nếu không, sẽ bị lỗi vì có thể có duplicate values

-- Kiểm tra xem có duplicate id không
SELECT id, COUNT(*) as count
FROM quizzes
GROUP BY id
HAVING COUNT(*) > 1;

-- Nếu không có duplicate, tạo unique constraint
-- (Bỏ comment để chạy)
/*
CREATE UNIQUE INDEX IF NOT EXISTS idx_quizzes_id_unique ON quizzes(id);
*/

-- ============================================
-- Bước 3: Alternative - Sửa code để không dùng onConflict
-- ============================================

-- Nếu không thể tạo unique constraint trên 'id' (vì có duplicate),
-- thì phải sửa code để không dùng onConflict
-- Code đã được sửa trong: src/services/contentService.js
-- Thay đổi: .upsert(upsertData, { onConflict: 'id' })
-- Thành: .upsert(upsertData)

-- ============================================
-- Bước 4: Kiểm tra sau khi fix
-- ============================================

-- Kiểm tra lại constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    tc.constraint_type
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'quizzes' 
  AND (tc.constraint_type = 'PRIMARY KEY' OR tc.constraint_type = 'UNIQUE')
ORDER BY tc.constraint_type, kcu.ordinal_position;

-- ============================================
-- Lưu ý
-- ============================================

-- 1. Nếu bảng quizzes có composite primary key (id, book_id, chapter_id, lesson_id, level),
--    thì không thể dùng onConflict: 'id' vì 'id' không phải unique constraint đơn lẻ.
--
-- 2. Giải pháp:
--    a) Tạo unique constraint trên 'id' (nếu 'id' thực sự unique)
--    b) Sửa code để không dùng onConflict (đã làm trong contentService.js)
--    c) Dùng composite key trong onConflict (nếu Supabase hỗ trợ)
--
-- 3. Code đã được sửa trong src/services/contentService.js:
--    - Bỏ onConflict: 'id'
--    - Dùng .upsert(upsertData) để Supabase tự detect primary key

