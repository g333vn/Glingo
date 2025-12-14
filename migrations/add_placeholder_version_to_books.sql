-- ============================================
-- MIGRATION: Add placeholder_version to books table
-- ============================================
-- This migration adds a placeholder_version column to the books table
-- to support different placeholder designs (ver1-ver10) when no cover image is available

-- Add placeholder_version column
ALTER TABLE books 
ADD COLUMN IF NOT EXISTS placeholder_version INTEGER DEFAULT 1;

-- Update existing books to use default version 1
UPDATE books 
SET placeholder_version = 1 
WHERE placeholder_version IS NULL;

-- Add constraint to ensure placeholder_version is between 1 and 10
ALTER TABLE books 
ADD CONSTRAINT check_placeholder_version_range 
CHECK (placeholder_version >= 1 AND placeholder_version <= 10);

-- Add comment
COMMENT ON COLUMN books.placeholder_version IS 'Placeholder design version (1-10) to display when image_url is empty. Default is 1.';

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the migration:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'books' AND column_name = 'placeholder_version';

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed: placeholder_version column added to books table';
  RAISE NOTICE '📊 Default value: 1 (Ver1)';
  RAISE NOTICE '🔒 Constraint: placeholder_version must be between 1 and 10';
END $$;

