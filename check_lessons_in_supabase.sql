-- Script SQL để kiểm tra số lượng lessons trong Supabase
-- Chạy trong Supabase SQL Editor

-- 1. Tổng số lessons
SELECT 
  COUNT(*) as total_lessons
FROM lessons;

-- 2. Số lessons theo level
SELECT 
  level,
  COUNT(*) as lesson_count
FROM lessons
GROUP BY level
ORDER BY level;

-- 3. Số lessons theo book và chapter (chi tiết)
SELECT 
  level,
  book_id,
  chapter_id,
  COUNT(*) as lesson_count,
  STRING_AGG(id, ', ' ORDER BY order_index) as lesson_ids
FROM lessons
GROUP BY level, book_id, chapter_id
ORDER BY level, book_id, chapter_id;

-- 4. Tìm các chapter có ít lessons (có thể bị mất dữ liệu)
-- Nếu bạn biết chapter nào nên có 25 lessons nhưng chỉ có 5
SELECT 
  level,
  book_id,
  chapter_id,
  COUNT(*) as lesson_count,
  MIN(order_index) as min_order,
  MAX(order_index) as max_order
FROM lessons
WHERE level = 'n5'  -- Thay đổi level nếu cần
  AND book_id LIKE '%mina%'  -- Thay đổi book_id nếu cần
  AND chapter_id LIKE '%từ vựng%'  -- Thay đổi chapter_id nếu cần
GROUP BY level, book_id, chapter_id
HAVING COUNT(*) < 25  -- Tìm các chapter có ít hơn 25 lessons
ORDER BY lesson_count;

-- 5. Xem tất cả lessons của một chapter cụ thể
SELECT 
  id,
  title,
  order_index,
  created_at,
  updated_at
FROM lessons
WHERE level = 'n5'
  AND book_id = 'mina-1'  -- Thay đổi theo book_id thực tế
  AND chapter_id = 'từ-vựng'  -- Thay đổi theo chapter_id thực tế
ORDER BY order_index;

