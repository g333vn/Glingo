-- Script Kiểm Tra Foreign Key Cho Quiz
-- Chạy script này để kiểm tra xem book/chapter/lesson có tồn tại không
-- Thay các giá trị YOUR_* bằng giá trị từ Console log khi save quiz

-- ============================================
-- Bước 1: Kiểm Tra Schema Thực Tế
-- ============================================

-- Xem cấu trúc bảng books
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'books'
ORDER BY ordinal_position;

-- Xem cấu trúc bảng chapters
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'chapters'
ORDER BY ordinal_position;

-- Xem cấu trúc bảng lessons
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;

-- Xem cấu trúc bảng quizzes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'quizzes'
ORDER BY ordinal_position;

-- ============================================
-- Bước 2: Kiểm Tra Data Có Tồn Tại Không
-- ============================================

-- Lấy giá trị từ Console log: [ContentService.saveQuiz] 📤 Upsert data
-- Ví dụ: book_id = 'mina-1', chapter_id = 'chapter-1', lesson_id = 'chapter-1', level = 'n5'

-- 2.1. Kiểm tra book có tồn tại không
-- Lưu ý: Bảng books có cột 'id' (không phải 'book_id')
SELECT 
    id,
    level,
    title,
    created_at
FROM books
WHERE id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ Console log
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ Console log (n1, n2, n3, n4, n5)

-- 2.2. Kiểm tra chapter có tồn tại không
SELECT 
    id,
    book_id,
    level,
    title,
    created_at
FROM chapters
WHERE id = 'YOUR_CHAPTER_ID_HERE'  -- Thay bằng chapter_id từ Console log
  AND book_id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ Console log
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ Console log

-- 2.3. Kiểm tra lesson có tồn tại không
SELECT 
    id,
    book_id,
    chapter_id,
    level,
    title,
    created_at
FROM lessons
WHERE id = 'YOUR_LESSON_ID_HERE'  -- Thay bằng lesson_id từ Console log
  AND book_id = 'YOUR_BOOK_ID_HERE'  -- Thay bằng book_id từ Console log
  AND chapter_id = 'YOUR_CHAPTER_ID_HERE'  -- Thay bằng chapter_id từ Console log
  AND level = 'YOUR_LEVEL_HERE';  -- Thay bằng level từ Console log

-- ============================================
-- Bước 3: Tạo Book/Chapter/Lesson Nếu Chưa Có
-- ============================================

-- 3.1. Tạo book nếu chưa có
-- Bỏ comment và thay các giá trị
/*
INSERT INTO books (id, level, title, created_at, updated_at)
VALUES (
  'YOUR_BOOK_ID_HERE',  -- id (book_id từ Console log)
  'YOUR_LEVEL_HERE',    -- level (n1, n2, n3, n4, n5)
  'Book Title',         -- title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, level) DO NOTHING;
*/

-- 3.2. Tạo chapter nếu chưa có
-- Bỏ comment và thay các giá trị
/*
INSERT INTO chapters (id, book_id, level, title, created_at, updated_at)
VALUES (
  'YOUR_CHAPTER_ID_HERE',  -- id (chapter_id từ Console log)
  'YOUR_BOOK_ID_HERE',     -- book_id từ Console log
  'YOUR_LEVEL_HERE',       -- level từ Console log
  'Chapter Title',         -- title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, level) DO NOTHING;
*/

-- 3.3. Tạo lesson nếu chưa có
-- Bỏ comment và thay các giá trị
/*
INSERT INTO lessons (id, book_id, chapter_id, level, title, created_at, updated_at)
VALUES (
  'YOUR_LESSON_ID_HERE',   -- id (lesson_id từ Console log)
  'YOUR_BOOK_ID_HERE',     -- book_id từ Console log
  'YOUR_CHAPTER_ID_HERE',   -- chapter_id từ Console log
  'YOUR_LEVEL_HERE',       -- level từ Console log
  'Lesson Title',          -- title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, chapter_id, level) DO NOTHING;
*/

-- ============================================
-- Bước 4: Kiểm Tra Tất Cả Cùng Lúc
-- ============================================

-- Chạy query này với giá trị từ Console log để xem tất cả
SELECT 
    'books' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM books
WHERE id = 'YOUR_BOOK_ID_HERE' AND level = 'YOUR_LEVEL_HERE'
UNION ALL
SELECT 
    'chapters' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM chapters
WHERE id = 'YOUR_CHAPTER_ID_HERE' 
  AND book_id = 'YOUR_BOOK_ID_HERE' 
  AND level = 'YOUR_LEVEL_HERE'
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM lessons
WHERE id = 'YOUR_LESSON_ID_HERE' 
  AND book_id = 'YOUR_BOOK_ID_HERE' 
  AND chapter_id = 'YOUR_CHAPTER_ID_HERE' 
  AND level = 'YOUR_LEVEL_HERE';

-- ============================================
-- Lưu Ý
-- ============================================

-- 1. Bảng books có cột 'id' (KHÔNG phải 'book_id')
--    - id = book_id từ quiz
--
-- 2. Bảng chapters có cột 'id' và 'book_id'
--    - id = chapter_id từ quiz
--    - book_id = book_id từ quiz
--
-- 3. Bảng lessons có cột 'id', 'book_id', 'chapter_id'
--    - id = lesson_id từ quiz
--    - book_id = book_id từ quiz
--    - chapter_id = chapter_id từ quiz
--
-- 4. Tất cả đều có cột 'level' (n1, n2, n3, n4, n5)

