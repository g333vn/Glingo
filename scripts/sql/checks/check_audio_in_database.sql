-- ============================================
-- SQL QUERIES ĐỂ KIỂM TRA AUDIO TRONG DATABASE
-- ============================================

-- 1️⃣ KIỂM TRA CẤU TRÚC LISTENING_SECTIONS (JSONB)
-- Xem toàn bộ listening_sections của một exam cụ thể
SELECT 
  id,
  level,
  exam_id,
  title,
  listening_sections,
  -- Extract audioUrl từ listening_sections (nếu có ở section level - format cũ)
  jsonb_path_query_array(listening_sections, '$[*].audioUrl') as section_audio_urls,
  jsonb_path_query_array(listening_sections, '$[*].audioName') as section_audio_names
FROM exams
WHERE level = 'n1'  -- Thay đổi level nếu cần
  AND exam_id = '2025-12'  -- Thay đổi exam_id nếu cần
  AND deleted_at IS NULL;

-- 2️⃣ KIỂM TRA AUDIO Ở LISTENING PART LEVEL (Format mới - SAU KHI FIX)
-- Format mới: listening_sections là object có { sections: [...], audioUrl: "...", audioPath: "...", audioName: "..." }
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Check structure type
  jsonb_typeof(listening_sections) as structure_type,
  -- Format mới: object có audioUrl (SAU KHI FIX examService.js)
  listening_sections->>'audioUrl' as listening_part_audio_url,
  listening_sections->>'audioPath' as listening_part_audio_path,
  listening_sections->>'audioName' as listening_part_audio_name,
  -- Sections count (format mới)
  jsonb_array_length(listening_sections->'sections') as sections_count,
  -- Format cũ: array (backward compatibility)
  CASE 
    WHEN jsonb_typeof(listening_sections) = 'array' THEN jsonb_array_length(listening_sections)
    ELSE NULL
  END as old_format_sections_count,
  -- Xem toàn bộ structure
  listening_sections
FROM exams
WHERE level = 'n1'  -- Thay đổi level nếu cần
  AND exam_id = '2025-12'  -- Thay đổi exam_id nếu cần
  AND deleted_at IS NULL;

-- 3️⃣ KIỂM TRA TẤT CẢ EXAMS CÓ AUDIO HAY KHÔNG
-- Tìm tất cả exams có audio ở bất kỳ level nào
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Check listening part level audio (format mới)
  CASE 
    WHEN listening_sections::text LIKE '%"audioUrl"%' THEN 'Có audio ở part level'
    WHEN listening_sections::text LIKE '%audioUrl%' THEN 'Có audio ở section level (format cũ)'
    ELSE 'Không có audio'
  END as audio_status,
  -- Extract audioUrl nếu có
  listening_sections->>'audioUrl' as part_level_audio_url,
  listening_sections->>'audioName' as part_level_audio_name
FROM exams
WHERE deleted_at IS NULL
ORDER BY level, exam_id;

-- 4️⃣ KIỂM TRA CHI TIẾT MỘT EXAM CỤ THỂ (SAU KHI FIX examService.js)
-- Thay 'n1' và '2025-12' bằng level và exam_id của bạn
SELECT 
  id,
  level,
  exam_id,
  title,
  -- Full JSON structure
  listening_sections,
  -- Check type: object hay array?
  jsonb_typeof(listening_sections) as listening_sections_type,
  -- Format mới: object có { sections: [...], audioUrl: "...", ... } (SAU KHI FIX)
  CASE 
    WHEN jsonb_typeof(listening_sections) = 'object' THEN
      jsonb_build_object(
        'hasAudioUrl', listening_sections ? 'audioUrl',
        'audioUrl', listening_sections->>'audioUrl',
        'audioPath', listening_sections->>'audioPath',
        'audioName', listening_sections->>'audioName',
        'sectionsCount', jsonb_array_length(listening_sections->'sections'),
        'sections', listening_sections->'sections'
      )
    ELSE NULL
  END as part_level_info,
  -- Format cũ: array (backward compatibility - sections trực tiếp)
  CASE 
    WHEN jsonb_typeof(listening_sections) = 'array' THEN
      jsonb_build_object(
        'sectionsCount', jsonb_array_length(listening_sections),
        'firstSectionHasAudio', listening_sections->0 ? 'audioUrl',
        'firstSectionAudioUrl', listening_sections->0->>'audioUrl',
        'note', 'Old format - needs migration to new format'
      )
    ELSE NULL
  END as array_format_info
FROM exams
WHERE level = 'n1'  -- ⚠️ THAY ĐỔI level
  AND exam_id = '2025-12'  -- ⚠️ THAY ĐỔI exam_id
  AND deleted_at IS NULL;

-- 5️⃣ TÌM TẤT CẢ EXAMS CÓ AUDIO Ở PART LEVEL (Format mới - SAU KHI FIX)
-- Format mới: listening_sections là object có key 'audioUrl'
SELECT 
  level,
  exam_id,
  title,
  jsonb_typeof(listening_sections) as structure_type,
  listening_sections->>'audioUrl' as audio_url,
  listening_sections->>'audioName' as audio_name,
  listening_sections->>'audioPath' as audio_path,
  jsonb_array_length(listening_sections->'sections') as sections_count,
  updated_at
FROM exams
WHERE deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'object'  -- Must be object (not array)
  AND listening_sections ? 'audioUrl'  -- Check nếu có key 'audioUrl'
ORDER BY level, exam_id;

-- 6️⃣ TÌM TẤT CẢ EXAMS KHÔNG CÓ AUDIO (Cần upload)
SELECT 
  level,
  exam_id,
  title,
  jsonb_typeof(listening_sections) as structure_type,
  jsonb_array_length(listening_sections) as sections_count,
  updated_at
FROM exams
WHERE deleted_at IS NULL
  AND (
    -- Không có audioUrl ở part level
    NOT (listening_sections ? 'audioUrl')
    -- Và không có audioUrl ở section level
    AND NOT EXISTS (
      SELECT 1 
      FROM jsonb_array_elements(listening_sections) section
      WHERE section ? 'audioUrl'
    )
  )
ORDER BY level, exam_id;

-- ============================================
-- QUERY NHANH ĐỂ CHECK MỘT EXAM CỤ THỂ
-- ============================================
-- Thay 'n1' và '2025-12' bằng level và exam_id của bạn
SELECT 
  'Level' as field, level::text as value FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Exam ID', exam_id FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Title', title FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Has listening_sections', CASE WHEN listening_sections IS NOT NULL THEN 'YES' ELSE 'NO' END 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Structure Type', jsonb_typeof(listening_sections) 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Has audioUrl (part level)', 
  CASE 
    WHEN jsonb_typeof(listening_sections) = 'object' AND listening_sections ? 'audioUrl' THEN 'YES (new format)'
    WHEN jsonb_typeof(listening_sections) = 'array' THEN 'NO (old format - array)'
    ELSE 'NO'
  END 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Audio URL (part level)', COALESCE(listening_sections->>'audioUrl', '(empty)') 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Audio Name (part level)', COALESCE(listening_sections->>'audioName', '(empty)') 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL
UNION ALL
SELECT 'Audio Path (part level)', COALESCE(listening_sections->>'audioPath', '(empty)') 
  FROM exams WHERE level = 'n1' AND exam_id = '2025-12' AND deleted_at IS NULL;
