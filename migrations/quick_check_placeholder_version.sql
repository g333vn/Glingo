-- ============================================
-- QUICK CHECK: placeholder_version in books table
-- ============================================
-- Chạy script này trong Supabase SQL Editor để kiểm tra nhanh
-- Copy và paste vào Supabase Dashboard → SQL Editor → Run

-- ✅ BƯỚC 1: Kiểm tra cột có tồn tại không
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'books' 
            AND column_name = 'placeholder_version'
        ) THEN '✅ Cột placeholder_version ĐÃ TỒN TẠI'
        ELSE '❌ Cột placeholder_version CHƯA TỒN TẠI - Cần chạy migration: add_placeholder_version_to_books.sql'
    END as column_status;

-- ✅ BƯỚC 2: Xem thông tin cột (nếu đã tồn tại)
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'books' 
  AND column_name = 'placeholder_version';

-- ✅ BƯỚC 3: Xem dữ liệu mẫu (20 sách gần nhất)
SELECT 
    id,
    level,
    title,
    image_url,
    placeholder_version,
    updated_at
FROM books
ORDER BY updated_at DESC
LIMIT 20;

-- ✅ BƯỚC 4: Thống kê theo placeholder_version
SELECT 
    COALESCE(placeholder_version::text, 'NULL') as placeholder_version,
    COUNT(*) as so_luong_sach
FROM books
GROUP BY placeholder_version
ORDER BY placeholder_version;

-- ✅ BƯỚC 5: Kiểm tra sách có NULL placeholder_version (không nên có sau migration)
SELECT 
    COUNT(*) as sach_co_null_placeholder_version
FROM books
WHERE placeholder_version IS NULL;

-- ✅ BƯỚC 6: Xem tất cả sách và placeholder_version của chúng
SELECT 
    level,
    id,
    title,
    CASE 
        WHEN image_url IS NULL OR image_url = '' THEN 'Không có ảnh → Dùng placeholder'
        ELSE 'Có ảnh'
    END as trang_thai_anh,
    placeholder_version as placeholder_design,
    updated_at
FROM books
ORDER BY level, id;

