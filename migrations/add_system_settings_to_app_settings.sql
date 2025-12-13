-- Migration: Add system_settings column to app_settings table
-- Run this in Supabase SQL Editor
-- This stores platformName, platformTagline, platformDescription, contactEmail

-- Check if column already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'app_settings' 
    AND column_name = 'system_settings'
  ) THEN
    -- Add system_settings column as JSONB
    ALTER TABLE app_settings
    ADD COLUMN system_settings JSONB DEFAULT '{}'::jsonb;
    
    -- Add comment
    COMMENT ON COLUMN app_settings.system_settings IS 'System settings: platformName, platformTagline, platformDescription, contactEmail';
    
    -- Initialize with default values if row exists
    UPDATE app_settings
    SET system_settings = jsonb_build_object(
      'platformName', 'Learn Your Approach',
      'platformTagline', 'Japanese Learning Platform',
      'platformDescription', jsonb_build_object(
        'vi', 'Nền tảng học tiếng Nhật chuyên nghiệp với JLPT mock tests và tài liệu học tập đa dạng',
        'en', 'Professional Japanese learning platform with JLPT mock tests and diverse learning materials',
        'ja', 'JLPT模擬試験と多様な学習資料を備えたプロフェッショナルな日本語学習プラットフォーム'
      ),
      'contactEmail', 'admin@example.com'
    )
    WHERE id = 1 AND (system_settings IS NULL OR system_settings = '{}'::jsonb);
    
    RAISE NOTICE '✅ Added system_settings column to app_settings table';
  ELSE
    RAISE NOTICE 'ℹ️ Column system_settings already exists';
  END IF;
END $$;

-- Verify the column exists
SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_settings'
  AND column_name = 'system_settings';

-- Show current system_settings (if any)
SELECT 
  id,
  system_settings,
  updated_at
FROM app_settings
WHERE id = 1;

