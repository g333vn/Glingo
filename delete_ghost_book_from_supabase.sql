-- Script SQL để xóa book "BOOK MINNA-NO-NIHONGO-1" khỏi Supabase
-- Chạy trong Supabase SQL Editor

-- 1. Kiểm tra book có tồn tại không
SELECT 
  id,
  level,
  title,
  created_at,
  updated_at
FROM books
WHERE level = 'n5'
  AND (
    LOWER(id) LIKE '%minna-no-nihongo%' OR
    LOWER(title) LIKE '%minna-no-nihongo%' OR
    LOWER(title) LIKE '%book minna-no-nihongo%'
  )
ORDER BY created_at DESC;

-- 2. Xem tất cả books của n5 để xác định book cần xóa
SELECT 
  id,
  level,
  title,
  created_at
FROM books
WHERE level = 'n5'
ORDER BY created_at DESC;

-- 3. ✅ XÓA BOOK (Thay 'minna-no-nihongo-1' bằng ID thực tế từ query trên)
-- ⚠️ CẢNH BÁO: Xóa book sẽ xóa tất cả chapters, lessons, quizzes liên quan!
-- Chỉ chạy query này sau khi đã xác nhận đúng book ID

-- DELETE FROM books
-- WHERE id = 'minna-no-nihongo-1'  -- Thay bằng ID thực tế
--   AND level = 'n5';

-- 4. Kiểm tra chapters liên quan (sẽ bị xóa cascade)
SELECT 
  id,
  book_id,
  level,
  title
FROM chapters
WHERE level = 'n5'
  AND book_id LIKE '%minna-no-nihongo%'
ORDER BY book_id, id;

-- 5. Kiểm tra lessons liên quan (sẽ bị xóa cascade)
SELECT 
  id,
  book_id,
  chapter_id,
  level,
  title
FROM lessons
WHERE level = 'n5'
  AND book_id LIKE '%minna-no-nihongo%'
ORDER BY book_id, chapter_id, id;

-- 6. Kiểm tra quizzes liên quan (sẽ bị xóa cascade)
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title
FROM quizzes
WHERE level = 'n5'
  AND book_id LIKE '%minna-no-nihongo%'
ORDER BY book_id, chapter_id, lesson_id;

