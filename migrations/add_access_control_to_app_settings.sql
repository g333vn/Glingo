-- Migration: Add access_control column to app_settings table
-- Run this in Supabase SQL Editor

-- Check if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'access_control'
  ) THEN
    -- Add access_control column
    ALTER TABLE app_settings
    ADD COLUMN access_control JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment
    COMMENT ON COLUMN app_settings.access_control IS 'Access control configurations for level and jlpt modules';
    
    RAISE NOTICE '✅ Added access_control column to app_settings table';
  ELSE
    RAISE NOTICE 'ℹ️ Column access_control already exists';
  END IF;
END $$;

-- Verify the column exists
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_settings'
  AND column_name IN ('maintenance_mode', 'access_control')
ORDER BY column_name;

