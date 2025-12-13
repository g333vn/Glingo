-- Migration: Add user_settings column to app_settings table
-- Run this in Supabase SQL Editor
-- This stores user management settings: defaultRole, passwordMinLength, passwordMaxLength

-- Check if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'user_settings'
  ) THEN
    -- Add user_settings column as JSONB
    ALTER TABLE app_settings
    ADD COLUMN user_settings JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment
    COMMENT ON COLUMN app_settings.user_settings IS 'User management settings: defaultRole, passwordMinLength, passwordMaxLength';
    
    -- Initialize with default values if row exists
    UPDATE app_settings
    SET user_settings = jsonb_build_object(
      'defaultRole', 'user',
      'passwordMinLength', 6,
      'passwordMaxLength', 50
    )
    WHERE id = 1 AND (user_settings IS NULL OR user_settings = '{}'::jsonb);
    
    RAISE NOTICE '✅ Added user_settings column to app_settings table';
  ELSE
    RAISE NOTICE 'ℹ️ Column user_settings already exists';
  END IF;
END $$;

-- Verify the column exists
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_settings'
  AND column_name = 'user_settings';

-- Show current user_settings (if any)
SELECT 
  id,
  user_settings,
  updated_at
FROM app_settings
WHERE id = 1;

