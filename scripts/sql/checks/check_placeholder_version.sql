-- ============================================
-- VERIFICATION SCRIPT: Check placeholder_version column
-- ============================================
-- This script checks if the placeholder_version column exists
-- and shows current data in the books table

-- 1. Check if column exists
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'books' 
  AND column_name = 'placeholder_version';

-- 2. Show sample data with placeholder_version
SELECT 
    id,
    level,
    title,
    image_url,
    placeholder_version,
    created_at,
    updated_at
FROM books
ORDER BY updated_at DESC
LIMIT 20;

-- 3. Count books by placeholder_version
SELECT 
    COALESCE(placeholder_version, 0) as placeholder_version,
    COUNT(*) as count
FROM books
GROUP BY placeholder_version
ORDER BY placeholder_version;

-- 4. Check if any books have NULL placeholder_version (should not happen after migration)
SELECT 
    COUNT(*) as books_with_null_placeholder_version
FROM books
WHERE placeholder_version IS NULL;

-- 5. Show books without placeholder_version (if column doesn't exist yet)
-- This will error if column exists, which is fine
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'books' 
        AND column_name = 'placeholder_version'
    ) THEN
        RAISE NOTICE '✅ Column placeholder_version EXISTS in books table';
    ELSE
        RAISE NOTICE '❌ Column placeholder_version DOES NOT EXIST - Run migration: add_placeholder_version_to_books.sql';
    END IF;
END $$;
