-- Fix: Lỗi 23503 khi save quiz lên Supabase
-- Error: "insert or update on table "quizzes" violates foreign key constraint"
-- 
-- Nguyên nhân: Quiz đang cố gắng reference đến lesson/chapter/book không tồn tại
-- Giải pháp: Đảm bảo book/chapter/lesson tồn tại trước khi insert quiz

-- ============================================
-- Bước 1: Kiểm tra Foreign Key Constraints
-- ============================================

-- Xem tất cả foreign key constraints của bảng quizzes
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'quizzes'
ORDER BY tc.constraint_name, kcu.ordinal_position;

-- ============================================
-- Bước 2: Kiểm tra Data Có Tồn Tại Không
-- ============================================

-- Thay các giá trị này bằng giá trị thực tế từ quiz bạn đang cố save
-- Lấy từ Console log: [ContentService.saveQuiz] 📤 Upsert data

-- Ví dụ: book_id = 'mina-1', chapter_id = 'chapter-1', lesson_id = 'chapter-1', level = 'n5'

-- 2.1. Kiểm tra book có tồn tại không
-- Lưu ý: Bảng books có cột 'id' (không phải 'book_id')
SELECT 
    id,
    level,
    title
FROM books
WHERE id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ quiz (đây là id trong bảng books)
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ quiz

-- 2.2. Kiểm tra chapter có tồn tại không
SELECT 
    id,
    book_id,
    chapter_id,
    level,
    title
FROM chapters
WHERE id = 'YOUR_CHAPTER_ID_HERE'  -- Thay bằng chapter_id từ quiz
  AND book_id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ quiz
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ quiz

-- 2.3. Kiểm tra lesson có tồn tại không
SELECT 
    id,
    book_id,
    chapter_id,
    lesson_id,
    level,
    title
FROM lessons
WHERE id = 'YOUR_LESSON_ID_HERE'  -- Thay bằng lesson_id từ quiz
  AND book_id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ quiz
  AND chapter_id = 'YOUR_CHAPTER_ID_HERE'  -- Thay bằng chapter_id từ quiz
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ quiz

-- ============================================
-- Bước 3: Tạo Book/Chapter/Lesson Nếu Chưa Có
-- ============================================

-- 3.1. Tạo book nếu chưa có
-- (Bỏ comment và thay các giá trị)
-- Lưu ý: Bảng books có cột 'id' (không phải 'book_id')
/*
INSERT INTO books (id, level, title, created_at, updated_at)
VALUES (
  'YOUR_BOOK_ID_HERE',  -- id (đây là book_id từ quiz)
  'YOUR_LEVEL_HERE',    -- level (n1, n2, n3, n4, n5)
  'Book Title',         -- title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, level) DO NOTHING;
*/

-- 3.2. Tạo chapter nếu chưa có
-- (Bỏ comment và thay các giá trị)
/*
INSERT INTO chapters (id, book_id, chapter_id, level, title, created_at, updated_at)
VALUES (
  'YOUR_CHAPTER_ID_HERE',  -- chapter_id
  'YOUR_BOOK_ID_HERE',     -- book_id
  'YOUR_CHAPTER_ID_HERE',  -- chapter_id (giống trên)
  'YOUR_LEVEL_HERE',       -- level
  'Chapter Title',         -- title
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, level) DO NOTHING;
*/

-- 3.3. Tạo lesson nếu chưa có
-- (Bỏ comment và thay các giá trị)
/*
INSERT INTO lessons (id, book_id, chapter_id, lesson_id, level, title, created_at, updated_at)
VALUES (
  'YOUR_LESSON_ID_HERE',   -- lesson_id
  'YOUR_BOOK_ID_HERE',     -- book_id
  'YOUR_CHAPTER_ID_HERE',  -- chapter_id
  'YOUR_LESSON_ID_HERE',   -- lesson_id (giống trên)
  'YOUR_LEVEL_HERE',       -- level
  'Lesson Title',          -- title
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, chapter_id, level) DO NOTHING;
*/

-- ============================================
-- Bước 4: Option - Xóa Foreign Key Constraint (KHÔNG KHUYẾN KHÍCH)
-- ============================================

-- ⚠️ CHỈ LÀM NẾU BẠN CHẮC CHẮN!
-- Xóa foreign key constraint sẽ cho phép insert quiz mà không cần book/chapter/lesson tồn tại
-- Nhưng sẽ mất tính toàn vẹn dữ liệu

-- Xem tên constraint trước:
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'quizzes'
  AND constraint_type = 'FOREIGN KEY'
  AND constraint_name LIKE '%lesson%';

-- Xóa constraint (BỎ COMMENT ĐỂ CHẠY - CẨN THẬN!)
/*
ALTER TABLE quizzes
DROP CONSTRAINT IF EXISTS quizzes_lesson_id_book_id_chapter_id_level_fkey;
*/

-- ============================================
-- Bước 5: Kiểm Tra Sau Khi Fix
-- ============================================

-- Kiểm tra lại xem book/chapter/lesson đã tồn tại chưa
SELECT 
    'books' as table_name,
    COUNT(*) as count
FROM books
WHERE id = 'YOUR_BOOK_ID_HERE' AND level = 'YOUR_LEVEL_HERE'
UNION ALL
SELECT 
    'chapters' as table_name,
    COUNT(*) as count
FROM chapters
WHERE id = 'YOUR_CHAPTER_ID_HERE' AND book_id = 'YOUR_BOOK_ID_HERE' AND level = 'YOUR_LEVEL_HERE'
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as count
FROM lessons
WHERE id = 'YOUR_LESSON_ID_HERE' 
  AND book_id = 'YOUR_BOOK_ID_HERE' 
  AND chapter_id = 'YOUR_CHAPTER_ID_HERE' 
  AND level = 'YOUR_LEVEL_HERE';

-- ============================================
-- Lưu Ý
-- ============================================

-- 1. Foreign key constraint đảm bảo tính toàn vẹn dữ liệu
--    - Quiz phải reference đến lesson tồn tại
--    - Lesson phải reference đến chapter tồn tại
--    - Chapter phải reference đến book tồn tại
--
-- 2. Giải pháp tốt nhất:
--    - Đảm bảo book/chapter/lesson tồn tại trước khi insert quiz
--    - Hoặc tự động tạo book/chapter/lesson nếu chưa có (xem Bước 3)
--
-- 3. Giải pháp tạm thời (không khuyến khích):
--    - Xóa foreign key constraint (xem Bước 4)
--    - Chỉ làm nếu bạn chắc chắn và hiểu rõ hậu quả

