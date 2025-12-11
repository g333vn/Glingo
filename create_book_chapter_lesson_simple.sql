-- Script Đơn Giản: Tạo Book/Chapter/Lesson Cho Quiz
-- Chạy từng bước một, thay các giá trị YOUR_* bằng giá trị từ Console log

-- ============================================
-- Bước 1: Lấy Giá Trị Từ Console Log
-- ============================================

-- Khi save quiz, xem Console log:
-- [ContentService.saveQuiz] 📤 Upsert data: {
--   "book_id": "mina-1",
--   "chapter_id": "chapter-1",
--   "lesson_id": "chapter-1",
--   "level": "n5",
--   ...
-- }

-- Thay các giá trị dưới đây:
-- book_id = 'mina-1'
-- chapter_id = 'chapter-1'
-- lesson_id = 'chapter-1'
-- level = 'n5'

-- ============================================
-- Bước 2: Tạo Book (Nếu Chưa Có)
-- ============================================

-- Thay 'mina-1' và 'n5' bằng giá trị từ Console log
INSERT INTO books (id, level, title, created_at, updated_at)
VALUES (
  'mina-1',        -- Thay bằng book_id từ Console log
  'n5',            -- Thay bằng level từ Console log
  'Book mina-1',   -- Title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, level) DO NOTHING;

-- Kiểm tra book đã được tạo chưa
SELECT id, level, title, created_at
FROM books
WHERE id = 'mina-1' AND level = 'n5';

-- ============================================
-- Bước 3: Tạo Chapter (Nếu Chưa Có)
-- ============================================

-- Thay các giá trị bằng giá trị từ Console log
INSERT INTO chapters (id, book_id, level, title, created_at, updated_at)
VALUES (
  'chapter-1',     -- Thay bằng chapter_id từ Console log
  'mina-1',        -- Thay bằng book_id từ Console log
  'n5',            -- Thay bằng level từ Console log
  'Chapter chapter-1',  -- Title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, level) DO NOTHING;

-- Kiểm tra chapter đã được tạo chưa
SELECT id, book_id, level, title, created_at
FROM chapters
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND level = 'n5';

-- ============================================
-- Bước 4: Tạo Lesson (Nếu Chưa Có)
-- ============================================

-- Thay các giá trị bằng giá trị từ Console log
INSERT INTO lessons (id, book_id, chapter_id, level, title, created_at, updated_at)
VALUES (
  'chapter-1',     -- Thay bằng lesson_id từ Console log
  'mina-1',        -- Thay bằng book_id từ Console log
  'chapter-1',     -- Thay bằng chapter_id từ Console log
  'n5',            -- Thay bằng level từ Console log
  'Lesson chapter-1',  -- Title (có thể thay đổi)
  NOW(),
  NOW()
)
ON CONFLICT (id, book_id, chapter_id, level) DO NOTHING;

-- Kiểm tra lesson đã được tạo chưa
SELECT id, book_id, chapter_id, level, title, created_at
FROM lessons
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND chapter_id = 'chapter-1' 
  AND level = 'n5';

-- ============================================
-- Bước 5: Kiểm Tra Tất Cả Cùng Lúc
-- ============================================

-- Kiểm tra tất cả đã tồn tại chưa
SELECT 
    'books' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM books
WHERE id = 'mina-1' AND level = 'n5'
UNION ALL
SELECT 
    'chapters' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM chapters
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND level = 'n5'
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as exists_count,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM lessons
WHERE id = 'chapter-1' 
  AND book_id = 'mina-1' 
  AND chapter_id = 'chapter-1' 
  AND level = 'n5';

-- ============================================
-- Lưu Ý
-- ============================================

-- 1. Phải chạy theo thứ tự: Book → Chapter → Lesson
--    Vì foreign key constraints yêu cầu parent records tồn tại trước

-- 2. Thay tất cả các giá trị 'mina-1', 'chapter-1', 'n5' 
--    bằng giá trị từ Console log khi save quiz

-- 3. ON CONFLICT DO NOTHING đảm bảo không bị lỗi nếu đã tồn tại

-- 4. Sau khi chạy script này, thử save quiz lại trong app

