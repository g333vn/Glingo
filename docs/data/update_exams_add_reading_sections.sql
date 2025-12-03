-- Update exams table to add reading_sections column
-- This script adds the missing reading_sections column to support the 3-part exam structure:
-- Knowledge (言語知識), Reading (読解), Listening (聴解)

-- Step 1: Add reading_sections column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exams' 
    AND column_name = 'reading_sections'
  ) THEN
    ALTER TABLE exams 
    ADD COLUMN reading_sections JSONB;
    
    RAISE NOTICE '✅ Added reading_sections column to exams table';
  ELSE
    RAISE NOTICE '⚠️ reading_sections column already exists';
  END IF;
END $$;

-- Step 2: Add other missing columns if needed (for consistency)
DO $$
BEGIN
  -- Add date column if missing
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exams' 
    AND column_name = 'date'
  ) THEN
    ALTER TABLE exams 
    ADD COLUMN date VARCHAR(50);
    
    RAISE NOTICE '✅ Added date column to exams table';
  END IF;

  -- Add status column if missing
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exams' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE exams 
    ADD COLUMN status VARCHAR(50);
    
    RAISE NOTICE '✅ Added status column to exams table';
  END IF;

  -- Add image_url column if missing
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'exams' 
    AND column_name = 'image_url'
  ) THEN
    ALTER TABLE exams 
    ADD COLUMN image_url VARCHAR(500);
    
    RAISE NOTICE '✅ Added image_url column to exams table';
  END IF;
END $$;

-- Step 3: Verify the structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'exams'
ORDER BY ordinal_position;

-- Expected columns after update:
-- id (UUID)
-- level (VARCHAR)
-- exam_id (VARCHAR)
-- title (VARCHAR)
-- knowledge_sections (JSONB)
-- reading_sections (JSONB)  ← NEW
-- listening_sections (JSONB)
-- config (JSONB)
-- date (VARCHAR)  ← NEW (if missing)
-- status (VARCHAR)  ← NEW (if missing)
-- image_url (VARCHAR)  ← NEW (if missing)
-- created_by (UUID)
-- created_at (TIMESTAMP)
-- updated_at (TIMESTAMP)
-- deleted_at (TIMESTAMP)

