-- Migration: Add exam_config column to app_settings table
-- Run this in Supabase SQL Editor
-- This stores exam level configurations (passing score, max score, time limits) for each JLPT level

-- Check if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'exam_config'
  ) THEN
    -- Add exam_config column as JSONB
    ALTER TABLE app_settings
    ADD COLUMN exam_config JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment
    COMMENT ON COLUMN app_settings.exam_config IS 'Exam level configurations: passing score, max score, time limits for each JLPT level (n1, n2, n3, n4, n5)';
    
    RAISE NOTICE '✅ Added exam_config column to app_settings table';
  ELSE
    RAISE NOTICE 'ℹ️ Column exam_config already exists';
  END IF;
END $$;

-- Verify the column exists
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_settings'
  AND column_name = 'exam_config';

-- Show current exam_config (if any)
SELECT 
  id,
  exam_config,
  updated_at
FROM app_settings
WHERE id = 1;

