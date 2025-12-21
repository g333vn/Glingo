-- ============================================
-- SQL QUERIES ĐỂ KIỂM TRA PASSAGE IMAGE TRONG DATABASE
-- ============================================

-- 1️⃣ KIỂM TRA PASSAGE IMAGE TRONG KNOWLEDGE SECTIONS
-- Xem tất cả sections có passageImage trong knowledge_sections
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Extract sections có passageImage
  jsonb_path_query_array(
    knowledge_sections, 
    '$[*] ? (@.passageImage != null)'
  ) as sections_with_passage_image,
  -- Count sections có passageImage
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as knowledge_sections_with_image_count
FROM exams
WHERE knowledge_sections IS NOT NULL
  AND deleted_at IS NULL
ORDER BY level, exam_id;

-- 2️⃣ KIỂM TRA PASSAGE IMAGE TRONG READING SECTIONS
-- Xem tất cả sections có passageImage trong reading_sections
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Extract sections có passageImage
  jsonb_path_query_array(
    reading_sections, 
    '$[*] ? (@.passageImage != null)'
  ) as sections_with_passage_image,
  -- Count sections có passageImage
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as reading_sections_with_image_count
FROM exams
WHERE reading_sections IS NOT NULL
  AND deleted_at IS NULL
ORDER BY level, exam_id;

-- 3️⃣ CHI TIẾT PASSAGE IMAGE CỦA MỘT EXAM CỤ THỂ
-- Thay đổi level và exam_id theo nhu cầu
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Knowledge sections với passageImage
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'section_id', section->>'id',
        'section_title', section->>'title',
        'passage_image_url', section->'passageImage'->>'url',
        'passage_image_path', section->'passageImage'->>'path',
        'passage_image_name', section->'passageImage'->>'name'
      )
    )
    FROM jsonb_array_elements(knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as knowledge_passage_images,
  -- Reading sections với passageImage
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'section_id', section->>'id',
        'section_title', section->>'title',
        'passage_image_url', section->'passageImage'->>'url',
        'passage_image_path', section->'passageImage'->>'path',
        'passage_image_name', section->'passageImage'->>'name'
      )
    )
    FROM jsonb_array_elements(reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as reading_passage_images
FROM exams
WHERE level = 'n1'  -- Thay đổi level nếu cần
  AND exam_id = '2025-12'  -- Thay đổi exam_id nếu cần
  AND deleted_at IS NULL;

-- 4️⃣ KIỂM TRA TẤT CẢ EXAMS CÓ PASSAGE IMAGE HAY KHÔNG
-- Tổng hợp tất cả exams có ít nhất 1 section có passageImage
SELECT 
  level,
  exam_id,
  title,
  -- Knowledge sections count
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as knowledge_sections_with_image,
  -- Reading sections count
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as reading_sections_with_image,
  -- Total sections with image
  (
    SELECT COUNT(*)
    FROM jsonb_array_elements(knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) + (
    SELECT COUNT(*)
    FROM jsonb_array_elements(reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
  ) as total_sections_with_image
FROM exams
WHERE deleted_at IS NULL
  AND (
    -- Có ít nhất 1 section có passageImage trong knowledge
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(knowledge_sections) AS section
      WHERE section->'passageImage' IS NOT NULL
    )
    OR
    -- Hoặc có ít nhất 1 section có passageImage trong reading
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(reading_sections) AS section
      WHERE section->'passageImage' IS NOT NULL
    )
  )
ORDER BY level, exam_id;

-- 5️⃣ CHI TIẾT TỪNG SECTION CÓ PASSAGE IMAGE (FLATTENED)
-- Hiển thị từng section có passageImage một cách chi tiết
SELECT 
  e.id as exam_uuid,
  e.level,
  e.exam_id,
  e.title as exam_title,
  'knowledge' as test_type,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->'passageImage'->>'url' as passage_image_url,
  section->'passageImage'->>'path' as passage_image_path,
  section->'passageImage'->>'name' as passage_image_name,
  jsonb_array_length(section->'questions') as questions_count
FROM exams e,
  jsonb_array_elements(e.knowledge_sections) AS section
WHERE section->'passageImage' IS NOT NULL
  AND e.deleted_at IS NULL

UNION ALL

SELECT 
  e.id as exam_uuid,
  e.level,
  e.exam_id,
  e.title as exam_title,
  'reading' as test_type,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->'passageImage'->>'url' as passage_image_url,
  section->'passageImage'->>'path' as passage_image_path,
  section->'passageImage'->>'name' as passage_image_name,
  jsonb_array_length(section->'questions') as questions_count
FROM exams e,
  jsonb_array_elements(e.reading_sections) AS section
WHERE section->'passageImage' IS NOT NULL
  AND e.deleted_at IS NULL

ORDER BY level, exam_id, test_type, section_id;

-- 6️⃣ KIỂM TRA MỘT SECTION CỤ THỂ
-- Thay đổi level, exam_id, và section_id theo nhu cầu
SELECT 
  level,
  exam_id,
  title,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->'passageImage'->>'url' as passage_image_url,
  section->'passageImage'->>'path' as passage_image_path,
  section->'passageImage'->>'name' as passage_image_name,
  section->'passageImage' as passage_image_full,  -- Toàn bộ object passageImage
  section  -- Toàn bộ section object
FROM exams,
  jsonb_array_elements(knowledge_sections) AS section
WHERE level = 'n1'  -- Thay đổi level nếu cần
  AND exam_id = '2025-12'  -- Thay đổi exam_id nếu cần
  AND section->>'id' = 'section1'  -- Thay đổi section_id nếu cần
  AND deleted_at IS NULL

UNION ALL

SELECT 
  level,
  exam_id,
  title,
  section->>'id' as section_id,
  section->>'title' as section_title,
  section->'passageImage'->>'url' as passage_image_url,
  section->'passageImage'->>'path' as passage_image_path,
  section->'passageImage'->>'name' as passage_image_name,
  section->'passageImage' as passage_image_full,
  section
FROM exams,
  jsonb_array_elements(reading_sections) AS section
WHERE level = 'n1'  -- Thay đổi level nếu cần
  AND exam_id = '2025-12'  -- Thay đổi exam_id nếu cần
  AND section->>'id' = 'section1'  -- Thay đổi section_id nếu cần
  AND deleted_at IS NULL;

-- 7️⃣ KIỂM TRA STRUCTURE CỦA PASSAGE IMAGE
-- Xem cấu trúc JSON của passageImage để đảm bảo đúng format
SELECT 
  level,
  exam_id,
  section->>'id' as section_id,
  jsonb_typeof(section->'passageImage') as passage_image_type,
  section->'passageImage' as passage_image_object,
  -- Check các fields có tồn tại không
  CASE WHEN section->'passageImage'->>'url' IS NOT NULL THEN '✅' ELSE '❌' END as has_url,
  CASE WHEN section->'passageImage'->>'path' IS NOT NULL THEN '✅' ELSE '❌' END as has_path,
  CASE WHEN section->'passageImage'->>'name' IS NOT NULL THEN '✅' ELSE '❌' END as has_name
FROM exams,
  jsonb_array_elements(knowledge_sections) AS section
WHERE section->'passageImage' IS NOT NULL
  AND deleted_at IS NULL
LIMIT 5;  -- Giới hạn 5 records để xem mẫu

-- 8️⃣ TỔNG HỢP THỐNG KÊ
-- Thống kê tổng quan về passage images
SELECT 
  COUNT(DISTINCT e.id) as total_exams_with_passage_image,
  COUNT(DISTINCT e.level) as levels_with_passage_image,
  -- Knowledge sections
  (
    SELECT COUNT(*)
    FROM exams e2,
      jsonb_array_elements(e2.knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
      AND e2.deleted_at IS NULL
  ) as total_knowledge_sections_with_image,
  -- Reading sections
  (
    SELECT COUNT(*)
    FROM exams e2,
      jsonb_array_elements(e2.reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
      AND e2.deleted_at IS NULL
  ) as total_reading_sections_with_image,
  -- Total
  (
    SELECT COUNT(*)
    FROM exams e2,
      jsonb_array_elements(e2.knowledge_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
      AND e2.deleted_at IS NULL
  ) + (
    SELECT COUNT(*)
    FROM exams e2,
      jsonb_array_elements(e2.reading_sections) AS section
    WHERE section->'passageImage' IS NOT NULL
      AND e2.deleted_at IS NULL
  ) as total_sections_with_image
FROM exams e
WHERE e.deleted_at IS NULL
  AND (
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(e.knowledge_sections) AS section
      WHERE section->'passageImage' IS NOT NULL
    )
    OR
    EXISTS (
      SELECT 1
      FROM jsonb_array_elements(e.reading_sections) AS section
      WHERE section->'passageImage' IS NOT NULL
    )
  );

