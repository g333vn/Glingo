-- ============================================
-- MIGRATION SCRIPT: Chuyển listening_sections từ array → object format
-- ============================================
-- Mục đích: Chuyển đổi data cũ (array) sang format mới (object có sections + audio)
-- 
-- Format cũ: listening_sections = [{section1}, {section2}, ...]
-- Format mới: listening_sections = { sections: [...], audioUrl: "...", ... }
--
-- ⚠️ LƯU Ý: Script này chỉ migrate structure, không migrate audio từ section level lên part level
-- Nếu bạn đã upload audio mới, nó sẽ được lưu với format mới tự động
-- ============================================

-- 1️⃣ XEM TRƯỚC KHI MIGRATE (Dry run - không thay đổi data)
-- Chạy query này để xem có bao nhiêu exams cần migrate
SELECT 
  level,
  exam_id,
  title,
  jsonb_typeof(listening_sections) as current_type,
  CASE 
    WHEN jsonb_typeof(listening_sections) = 'array' THEN jsonb_array_length(listening_sections)
    ELSE NULL
  END as sections_count,
  'Will be migrated to object format' as migration_status
FROM exams
WHERE deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'array'  -- Chỉ migrate array format
ORDER BY level, exam_id;

-- 2️⃣ MIGRATE TẤT CẢ EXAMS (Array → Object format)
-- ⚠️ BACKUP TRƯỚC KHI CHẠY! Hoặc chạy trong transaction để có thể rollback
BEGIN;

UPDATE exams
SET 
  listening_sections = jsonb_build_object(
    'sections', listening_sections,  -- Giữ nguyên sections array
    -- Audio fields sẽ là null (cần upload lại audio)
    'audioUrl', NULL,
    'audioPath', NULL,
    'audioName', NULL
  ),
  updated_at = NOW()
WHERE deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'array';  -- Chỉ migrate array format

-- Kiểm tra kết quả
SELECT 
  level,
  exam_id,
  title,
  jsonb_typeof(listening_sections) as new_type,
  listening_sections ? 'sections' as has_sections_key,
  listening_sections ? 'audioUrl' as has_audioUrl_key,
  jsonb_array_length(listening_sections->'sections') as sections_count
FROM exams
WHERE deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'object'
ORDER BY level, exam_id
LIMIT 10;

-- Nếu kết quả OK, commit:
-- COMMIT;
-- Nếu có vấn đề, rollback:
-- ROLLBACK;

-- 3️⃣ MIGRATE MỘT EXAM CỤ THỂ (An toàn hơn)
-- Thay 'n1' và '2025-12' bằng level và exam_id của bạn
BEGIN;

UPDATE exams
SET 
  listening_sections = jsonb_build_object(
    'sections', listening_sections,  -- Giữ nguyên sections array
    'audioUrl', NULL,
    'audioPath', NULL,
    'audioName', NULL
  ),
  updated_at = NOW()
WHERE level = 'n1'  -- ⚠️ THAY ĐỔI level
  AND exam_id = '2025-12'  -- ⚠️ THAY ĐỔI exam_id
  AND deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'array';

-- Kiểm tra kết quả
SELECT 
  level,
  exam_id,
  title,
  jsonb_typeof(listening_sections) as new_type,
  listening_sections->>'audioUrl' as audio_url,
  jsonb_array_length(listening_sections->'sections') as sections_count
FROM exams
WHERE level = 'n1'  -- ⚠️ THAY ĐỔI level
  AND exam_id = '2025-12'  -- ⚠️ THAY ĐỔI exam_id
  AND deleted_at IS NULL;

-- Nếu OK, commit:
-- COMMIT;
-- Nếu có vấn đề, rollback:
-- ROLLBACK;

-- ============================================
-- 4️⃣ MIGRATE AUDIO TỪ SECTION LEVEL LÊN PART LEVEL (Nếu cần)
-- ============================================
-- Nếu bạn có audio ở section level (format cũ) và muốn migrate lên part level
-- ⚠️ CHỈ CHẠY NẾU BẠN CHẮC CHẮN CẦN THIẾT
-- Thông thường, bạn nên upload audio mới ở part level thay vì migrate

BEGIN;

UPDATE exams
SET 
  listening_sections = jsonb_build_object(
    'sections', 
    -- Remove audio từ sections
    jsonb_agg(
      jsonb_build_object(
        'id', section->>'id',
        'title', section->>'title',
        'instruction', section->>'instruction',
        'timeLimit', section->>'timeLimit',
        'questions', section->'questions'
        -- ❌ Không copy audioUrl, audioPath, audioName từ section
      )
    ),
    -- Copy audio từ section đầu tiên có audio (nếu có)
    'audioUrl', (
      SELECT section->>'audioUrl' 
      FROM jsonb_array_elements(listening_sections) section
      WHERE section ? 'audioUrl' 
        AND section->>'audioUrl' IS NOT NULL
        AND section->>'audioUrl' != ''
      LIMIT 1
    ),
    'audioPath', (
      SELECT section->>'audioPath' 
      FROM jsonb_array_elements(listening_sections) section
      WHERE section ? 'audioPath' 
        AND section->>'audioPath' IS NOT NULL
        AND section->>'audioPath' != ''
      LIMIT 1
    ),
    'audioName', (
      SELECT section->>'audioName' 
      FROM jsonb_array_elements(listening_sections) section
      WHERE section ? 'audioName' 
        AND section->>'audioName' IS NOT NULL
        AND section->>'audioName' != ''
      LIMIT 1
    )
  ),
  updated_at = NOW()
WHERE level = 'n1'  -- ⚠️ THAY ĐỔI level
  AND exam_id = '2025-12'  -- ⚠️ THAY ĐỔI exam_id
  AND deleted_at IS NULL
  AND jsonb_typeof(listening_sections) = 'array'
  AND EXISTS (
    -- Chỉ migrate nếu có ít nhất 1 section có audio
    SELECT 1 
    FROM jsonb_array_elements(listening_sections) section
    WHERE section ? 'audioUrl' 
      AND section->>'audioUrl' IS NOT NULL
      AND section->>'audioUrl' != ''
  );

-- Kiểm tra kết quả
SELECT 
  level,
  exam_id,
  title,
  listening_sections->>'audioUrl' as migrated_audio_url,
  listening_sections->>'audioName' as migrated_audio_name,
  jsonb_array_length(listening_sections->'sections') as sections_count
FROM exams
WHERE level = 'n1'  -- ⚠️ THAY ĐỔI level
  AND exam_id = '2025-12'  -- ⚠️ THAY ĐỔI exam_id
  AND deleted_at IS NULL;

-- Nếu OK, commit:
-- COMMIT;
-- Nếu có vấn đề, rollback:
-- ROLLBACK;

