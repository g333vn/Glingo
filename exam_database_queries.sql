-- ============================================
-- SQL QUERIES TO CHECK EXAM DATA IN DATABASE
-- ============================================
-- Sử dụng các câu query này trong Supabase SQL Editor để kiểm tra dữ liệu exam

-- ============================================
-- 1. XEM TẤT CẢ EXAMS (KHÔNG BỊ XÓA)
-- ============================================
SELECT 
  id,
  level,
  exam_id,
  title,
  date,
  status,
  image_url,
  created_at,
  updated_at,
  created_by
FROM exams
WHERE deleted_at IS NULL
ORDER BY level, exam_id;

-- ============================================
-- 2. XEM EXAMS THEO LEVEL (ví dụ: N1)
-- ============================================
SELECT 
  exam_id,
  title,
  date,
  status,
  created_at
FROM exams
WHERE level = 'n1'
  AND deleted_at IS NULL
ORDER BY exam_id;

-- ============================================
-- 3. XEM CHI TIẾT MỘT EXAM CỤ THỂ
-- ============================================
SELECT 
  id,
  level,
  exam_id,
  title,
  date,
  status,
  image_url,
  config,
  created_at,
  updated_at
FROM exams
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL;

-- ============================================
-- 4. ĐẾM SỐ SECTIONS VÀ QUESTIONS TRONG MỖI EXAM
-- ============================================
SELECT 
  level,
  exam_id,
  title,
  -- Đếm sections
  jsonb_array_length(COALESCE(knowledge_sections, '[]'::jsonb)) as knowledge_sections_count,
  jsonb_array_length(COALESCE(reading_sections, '[]'::jsonb)) as reading_sections_count,
  jsonb_array_length(COALESCE(listening_sections, '[]'::jsonb)) as listening_sections_count,
  -- Đếm questions (tổng từ tất cả sections)
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section
    CROSS JOIN jsonb_array_elements(section->'questions') AS question
  ) +
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section
    CROSS JOIN jsonb_array_elements(section->'questions') AS question
  ) +
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section
    CROSS JOIN jsonb_array_elements(section->'questions') AS question
  ) as total_questions_count
FROM exams
WHERE deleted_at IS NULL
ORDER BY level, exam_id;

-- ============================================
-- 5. XEM TẤT CẢ SECTIONS CỦA MỘT EXAM
-- ============================================
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->>'instruction' as section_instruction,
  (section->>'timeLimit')::int as time_limit,
  jsonb_array_length(COALESCE(section->'questions', '[]'::jsonb)) as questions_count
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'reading' as part_type,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->>'instruction' as section_instruction,
  (section->>'timeLimit')::int as time_limit,
  jsonb_array_length(COALESCE(section->'questions', '[]'::jsonb)) as questions_count
FROM exams,
  jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'listening' as part_type,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->>'instruction' as section_instruction,
  (section->>'timeLimit')::int as time_limit,
  jsonb_array_length(COALESCE(section->'questions', '[]'::jsonb)) as questions_count
FROM exams,
  jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

ORDER BY part_type, section_id;

-- ============================================
-- 6. XEM TẤT CẢ QUESTIONS CỦA MỘT EXAM
-- ============================================
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  LEFT(question->>'question', 50) as question_preview,  -- 50 ký tự đầu
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count,
  (question->>'correctAnswer')::int as correct_answer,
  CASE (question->>'correctAnswer')::int
    WHEN 0 THEN 'A'
    WHEN 1 THEN 'B'
    WHEN 2 THEN 'C'
    WHEN 3 THEN 'D'
    ELSE 'N/A'
  END as correct_answer_letter
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'reading' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  LEFT(question->>'question', 50) as question_preview,
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count,
  (question->>'correctAnswer')::int as correct_answer,
  CASE (question->>'correctAnswer')::int
    WHEN 0 THEN 'A'
    WHEN 1 THEN 'B'
    WHEN 2 THEN 'C'
    WHEN 3 THEN 'D'
    ELSE 'N/A'
  END as correct_answer_letter
FROM exams,
  jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'listening' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  LEFT(question->>'question', 50) as question_preview,
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count,
  (question->>'correctAnswer')::int as correct_answer,
  CASE (question->>'correctAnswer')::int
    WHEN 0 THEN 'A'
    WHEN 1 THEN 'B'
    WHEN 2 THEN 'C'
    WHEN 3 THEN 'D'
    ELSE 'N/A'
  END as correct_answer_letter
FROM exams,
  jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL

ORDER BY part_type, section_id, question_id;

-- ============================================
-- 7. XEM CHI TIẾT MỘT QUESTION CỤ THỂ (JSON)
-- ============================================
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  question as question_full_data  -- Toàn bộ dữ liệu question dạng JSON
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND question->>'id' = '1'  -- Thay đổi question_id
  AND deleted_at IS NULL;

-- ============================================
-- 8. KIỂM TRA QUESTIONS THIẾU ĐÁP ÁN ĐÚNG
-- ============================================
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  question->>'question' as question_text
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE (question->>'correctAnswer') IS NULL
  OR (question->>'correctAnswer')::int NOT BETWEEN 0 AND 3
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'reading' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  question->>'question' as question_text
FROM exams,
  jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE (question->>'correctAnswer') IS NULL
  OR (question->>'correctAnswer')::int NOT BETWEEN 0 AND 3
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'listening' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  question->>'question' as question_text
FROM exams,
  jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE (question->>'correctAnswer') IS NULL
  OR (question->>'correctAnswer')::int NOT BETWEEN 0 AND 3
  AND deleted_at IS NULL;

-- ============================================
-- 9. KIỂM TRA QUESTIONS THIẾU OPTIONS
-- ============================================
SELECT 
  level,
  exam_id,
  'knowledge' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) < 4
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'reading' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count
FROM exams,
  jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) < 4
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  'listening' as part_type,
  section->>'id' as section_id,
  question->>'id' as question_id,
  jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) as options_count
FROM exams,
  jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section,
  jsonb_array_elements(COALESCE(section->'questions', '[]'::jsonb)) AS question
WHERE jsonb_array_length(COALESCE(question->'options', '[]'::jsonb)) < 4
  AND deleted_at IS NULL;

-- ============================================
-- 10. XEM TOÀN BỘ DỮ LIỆU EXAM (JSON)
-- ============================================
SELECT 
  level,
  exam_id,
  title,
  date,
  status,
  knowledge_sections,
  reading_sections,
  listening_sections,
  config
FROM exams
WHERE level = 'n1'  -- Thay đổi level
  AND exam_id = '2025/7'  -- Thay đổi exam_id
  AND deleted_at IS NULL;

-- ============================================
-- 11. THỐNG KÊ TỔNG QUAN THEO LEVEL
-- ============================================
SELECT 
  level,
  COUNT(*) as total_exams,
  SUM(
    jsonb_array_length(COALESCE(knowledge_sections, '[]'::jsonb)) +
    jsonb_array_length(COALESCE(reading_sections, '[]'::jsonb)) +
    jsonb_array_length(COALESCE(listening_sections, '[]'::jsonb))
  ) as total_sections,
  SUM(
    (SELECT COUNT(*) FROM jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS s
     CROSS JOIN jsonb_array_elements(COALESCE(s->'questions', '[]'::jsonb))) +
    (SELECT COUNT(*) FROM jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS s
     CROSS JOIN jsonb_array_elements(COALESCE(s->'questions', '[]'::jsonb))) +
    (SELECT COUNT(*) FROM jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS s
     CROSS JOIN jsonb_array_elements(COALESCE(s->'questions', '[]'::jsonb)))
  ) as total_questions
FROM exams
WHERE deleted_at IS NULL
GROUP BY level
ORDER BY level;

-- ============================================
-- 12. TÌM EXAMS CÓ SECTION INSTRUCTION CHỨA HTML TAGS
-- ============================================
SELECT 
  level,
  exam_id,
  title,
  'knowledge' as part_type,
  section->>'id' as section_id,
  section->>'instruction' as instruction
FROM exams,
  jsonb_array_elements(COALESCE(knowledge_sections, '[]'::jsonb)) AS section
WHERE section->>'instruction' LIKE '%<!--%'
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  title,
  'reading' as part_type,
  section->>'id' as section_id,
  section->>'instruction' as instruction
FROM exams,
  jsonb_array_elements(COALESCE(reading_sections, '[]'::jsonb)) AS section
WHERE section->>'instruction' LIKE '%<!--%'
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  title,
  'listening' as part_type,
  section->>'id' as section_id,
  section->>'instruction' as instruction
FROM exams,
  jsonb_array_elements(COALESCE(listening_sections, '[]'::jsonb)) AS section
WHERE section->>'instruction' LIKE '%<!--%'
  AND deleted_at IS NULL;

-- ============================================
-- 13. XEM EXAMS ĐƯỢC TẠO BỞI USER NÀO
-- ============================================
SELECT 
  e.level,
  e.exam_id,
  e.title,
  e.created_at,
  p.email,
  p.role
FROM exams e
LEFT JOIN profiles p ON e.created_by = p.user_id
WHERE e.deleted_at IS NULL
ORDER BY e.created_at DESC;

-- ============================================
-- LƯU Ý:
-- - Thay đổi 'n1' và '2025/7' trong các query theo exam bạn muốn kiểm tra
-- - Các query này sử dụng JSONB functions của PostgreSQL
-- - Có thể chạy trực tiếp trong Supabase SQL Editor
-- ============================================

