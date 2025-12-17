-- Script SQL để kiểm tra số lượng quizzes trong Supabase
-- Chạy trong Supabase SQL Editor

-- 1. Tổng số quizzes
SELECT 
  COUNT(*) as total_quizzes
FROM quizzes;

-- 2. Số quizzes theo level
SELECT 
  level,
  COUNT(*) as quiz_count
FROM quizzes
GROUP BY level
ORDER BY level;

-- 3. Số quizzes theo book, chapter, lesson (chi tiết)
SELECT 
  level,
  book_id,
  chapter_id,
  lesson_id,
  title,
  created_at,
  updated_at
FROM quizzes
ORDER BY level, book_id, chapter_id, lesson_id;

-- 4. Tìm các lesson có quiz (để so sánh với số lượng quiz hiển thị)
SELECT 
  level,
  book_id,
  chapter_id,
  COUNT(DISTINCT lesson_id) as lessons_with_quiz,
  COUNT(*) as total_quizzes
FROM quizzes
WHERE level = 'n5'  -- Thay đổi level nếu cần
  AND book_id LIKE '%mina%'  -- Thay đổi book_id nếu cần
  AND chapter_id LIKE '%từ vựng%'  -- Thay đổi chapter_id nếu cần
GROUP BY level, book_id, chapter_id
ORDER BY level, book_id, chapter_id;

-- 5. Xem tất cả quizzes của một chapter cụ thể
SELECT 
  id,
  title,
  lesson_id,
  jsonb_array_length(questions) as questions_count,
  created_at,
  updated_at
FROM quizzes
WHERE level = 'n5'
  AND book_id = 'mina-1'  -- Thay đổi theo book_id thực tế
  AND chapter_id = 'từ-vựng'  -- Thay đổi theo chapter_id thực tế
ORDER BY lesson_id;

-- 6. Đếm số câu hỏi trong mỗi quiz
SELECT 
  level,
  book_id,
  chapter_id,
  lesson_id,
  title,
  jsonb_array_length(questions) as questions_count
FROM quizzes
WHERE level = 'n5'
  AND book_id LIKE '%mina%'
ORDER BY book_id, chapter_id, lesson_id;

-- 7. ✅ KIỂM TRA QUIZZES CỦA N5 (QUAN TRỌNG)
-- Xem tất cả quizzes của level n5
SELECT 
  level,
  book_id,
  chapter_id,
  lesson_id,
  title,
  jsonb_array_length(questions) as questions_count,
  created_at,
  updated_at
FROM quizzes
WHERE level = 'n5'
ORDER BY book_id, chapter_id, lesson_id;

-- 8. ✅ ĐẾM TỔNG SỐ QUIZZES CỦA N5
SELECT 
  level,
  COUNT(*) as total_quizzes,
  COUNT(DISTINCT book_id) as total_books,
  COUNT(DISTINCT chapter_id) as total_chapters,
  COUNT(DISTINCT lesson_id) as total_lessons
FROM quizzes
WHERE level = 'n5'
GROUP BY level;

-- 9. ✅ XEM CHI TIẾT QUIZZES CỦA N5 THEO BOOK/CHAPTER
SELECT 
  level,
  book_id,
  chapter_id,
  COUNT(DISTINCT lesson_id) as lessons_with_quiz,
  COUNT(*) as total_quizzes,
  SUM(jsonb_array_length(questions)) as total_questions
FROM quizzes
WHERE level = 'n5'
GROUP BY level, book_id, chapter_id
ORDER BY book_id, chapter_id;

