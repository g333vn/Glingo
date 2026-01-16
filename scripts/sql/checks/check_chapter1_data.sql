-- ============================================
-- KIỂM TRA DỮ LIỆU CHAPTER 1 (第1部)
-- ============================================

-- BƯỚC 1: Tìm Chapter ID và Book ID
SELECT 
  id as chapter_id,
  book_id,
  level,
  title as chapter_title,
  created_at
FROM chapters
WHERE title LIKE '%第1部%'
  OR title LIKE '%第１部%'
ORDER BY created_at DESC;

-- BƯỚC 2: Tìm tất cả Lessons của Chapter 1
SELECT 
  id as lesson_id,
  book_id,
  chapter_id,
  level,
  title as lesson_title,
  description,
  order_index,
  created_at,
  updated_at
FROM lessons
WHERE chapter_id IN (
  SELECT id 
  FROM chapters 
  WHERE title LIKE '%第1部%' OR title LIKE '%第１部%'
)
ORDER BY order_index ASC, created_at ASC;

-- BƯỚC 3: Tìm tất cả Quizzes của Chapter 1
SELECT 
  id as quiz_id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title as quiz_title,
  jsonb_array_length(questions) as questions_count,
  created_at,
  updated_at
FROM quizzes
WHERE chapter_id IN (
  SELECT id 
  FROM chapters 
  WHERE title LIKE '%第1部%' OR title LIKE '%第１部%'
)
ORDER BY lesson_id, created_at ASC;

-- BƯỚC 4: Tổng hợp (ĐÃ SỬA LỖI TYPE MISMATCH)
WITH chapter_info AS (
  SELECT 
    id as chapter_id,
    book_id,
    level,
    title as chapter_title
  FROM chapters
  WHERE title LIKE '%第1部%' OR title LIKE '%第１部%'
)
SELECT 
  'Chapter' as type,
  ci.chapter_id as id,
  ci.book_id,
  ci.level,
  ci.chapter_title as title,
  NULL::text as lesson_id,
  NULL::integer as questions_count,
  NULL::timestamp as created_at
FROM chapter_info ci

UNION ALL

SELECT 
  'Lesson' as type,
  l.id,
  l.book_id,
  l.level,
  l.title,
  NULL::text as lesson_id,
  NULL::integer as questions_count,
  l.created_at
FROM lessons l
INNER JOIN chapter_info ci ON l.chapter_id = ci.chapter_id 
  AND l.book_id = ci.book_id 
  AND l.level = ci.level

UNION ALL

SELECT 
  'Quiz' as type,
  q.id,
  q.book_id,
  q.level,
  q.title,
  q.lesson_id,
  jsonb_array_length(q.questions)::integer as questions_count,
  q.created_at
FROM quizzes q
INNER JOIN chapter_info ci ON q.chapter_id = ci.chapter_id 
  AND q.book_id = ci.book_id 
  AND q.level = ci.level

ORDER BY type, created_at;

-- BƯỚC 5: Đếm số lượng (nhanh)
SELECT 
  (SELECT COUNT(*) 
   FROM lessons l
   INNER JOIN chapters c ON l.chapter_id = c.id 
     AND l.book_id = c.book_id 
     AND l.level = c.level
   WHERE c.title LIKE '%第1部%' OR c.title LIKE '%第１部%'
  ) as total_lessons,
  
  (SELECT COUNT(*) 
   FROM quizzes q
   INNER JOIN chapters c ON q.chapter_id = c.id 
     AND q.book_id = c.book_id 
     AND q.level = c.level
   WHERE c.title LIKE '%第1部%' OR c.title LIKE '%第１部%'
  ) as total_quizzes,
  
  (SELECT COALESCE(SUM(jsonb_array_length(questions)), 0)
   FROM quizzes q
   INNER JOIN chapters c ON q.chapter_id = c.id 
     AND q.book_id = c.book_id 
     AND q.level = c.level
   WHERE c.title LIKE '%第1部%' OR c.title LIKE '%第１部%'
  ) as total_questions;
