-- Script Tự Động Tạo Book/Chapter/Lesson Cho Quiz
-- Chạy script này để tạo book/chapter/lesson nếu chưa có
-- Thay các giá trị YOUR_* bằng giá trị từ Console log khi save quiz

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
\set book_id 'mina-1'        -- Thay bằng book_id từ Console log
\set chapter_id 'chapter-1'   -- Thay bằng chapter_id từ Console log
\set lesson_id 'chapter-1'   -- Thay bằng lesson_id từ Console log
\set level 'n5'              -- Thay bằng level từ Console log (n1, n2, n3, n4, n5)

-- ============================================
-- Bước 2: Tạo Book (Nếu Chưa Có)
-- ============================================

-- Kiểm tra book có tồn tại không
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM books 
        WHERE id = :'book_id' AND level = :'level'
    ) THEN
        -- Tạo book mới
        INSERT INTO books (id, level, title, created_at, updated_at)
        VALUES (
            :'book_id',
            :'level',
            'Book ' || :'book_id',  -- Title mặc định, có thể thay đổi
            NOW(),
            NOW()
        )
        ON CONFLICT (id, level) DO NOTHING;
        
        RAISE NOTICE '✅ Đã tạo book: % (level: %)', :'book_id', :'level';
    ELSE
        RAISE NOTICE 'ℹ️ Book đã tồn tại: % (level: %)', :'book_id', :'level';
    END IF;
END $$;

-- ============================================
-- Bước 3: Tạo Chapter (Nếu Chưa Có)
-- ============================================

-- Kiểm tra chapter có tồn tại không
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM chapters 
        WHERE id = :'chapter_id' 
          AND book_id = :'book_id' 
          AND level = :'level'
    ) THEN
        -- Tạo chapter mới
        INSERT INTO chapters (id, book_id, level, title, created_at, updated_at)
        VALUES (
            :'chapter_id',
            :'book_id',
            :'level',
            'Chapter ' || :'chapter_id',  -- Title mặc định, có thể thay đổi
            NOW(),
            NOW()
        )
        ON CONFLICT (id, book_id, level) DO NOTHING;
        
        RAISE NOTICE '✅ Đã tạo chapter: % (book: %, level: %)', :'chapter_id', :'book_id', :'level';
    ELSE
        RAISE NOTICE 'ℹ️ Chapter đã tồn tại: % (book: %, level: %)', :'chapter_id', :'book_id', :'level';
    END IF;
END $$;

-- ============================================
-- Bước 4: Tạo Lesson (Nếu Chưa Có)
-- ============================================

-- Kiểm tra lesson có tồn tại không
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM lessons 
        WHERE id = :'lesson_id' 
          AND book_id = :'book_id' 
          AND chapter_id = :'chapter_id'
          AND level = :'level'
    ) THEN
        -- Tạo lesson mới
        INSERT INTO lessons (id, book_id, chapter_id, level, title, created_at, updated_at)
        VALUES (
            :'lesson_id',
            :'book_id',
            :'chapter_id',
            :'level',
            'Lesson ' || :'lesson_id',  -- Title mặc định, có thể thay đổi
            NOW(),
            NOW()
        )
        ON CONFLICT (id, book_id, chapter_id, level) DO NOTHING;
        
        RAISE NOTICE '✅ Đã tạo lesson: % (book: %, chapter: %, level: %)', :'lesson_id', :'book_id', :'chapter_id', :'level';
    ELSE
        RAISE NOTICE 'ℹ️ Lesson đã tồn tại: % (book: %, chapter: %, level: %)', :'lesson_id', :'book_id', :'chapter_id', :'level';
    END IF;
END $$;

-- ============================================
-- Bước 5: Kiểm Tra Kết Quả
-- ============================================

-- Kiểm tra tất cả đã tồn tại chưa
SELECT 
    'books' as table_name,
    id,
    level,
    title,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM books
WHERE id = :'book_id' AND level = :'level'
GROUP BY id, level, title
UNION ALL
SELECT 
    'chapters' as table_name,
    id::text,
    level,
    title,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM chapters
WHERE id = :'chapter_id' 
  AND book_id = :'book_id' 
  AND level = :'level'
GROUP BY id, level, title
UNION ALL
SELECT 
    'lessons' as table_name,
    id::text,
    level,
    title,
    CASE WHEN COUNT(*) > 0 THEN '✅ EXISTS' ELSE '❌ NOT EXISTS' END as status
FROM lessons
WHERE id = :'lesson_id' 
  AND book_id = :'book_id' 
  AND chapter_id = :'chapter_id' 
  AND level = :'level'
GROUP BY id, level, title;

-- ============================================
-- Lưu Ý
-- ============================================

-- 1. Script này sử dụng PostgreSQL variables (\set)
--    Nếu Supabase không hỗ trợ, dùng script đơn giản hơn bên dưới

-- 2. Thứ tự tạo: Book → Chapter → Lesson
--    Phải tạo theo thứ tự này vì foreign key constraints

-- 3. Nếu muốn thay đổi title, sửa giá trị trong INSERT statements

