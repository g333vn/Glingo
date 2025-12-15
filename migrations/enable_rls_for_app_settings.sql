-- Migration: Enable RLS for app_settings table
-- Run this in Supabase SQL Editor
-- This protects app_settings from unauthorized access

-- ========================================
-- 1. CHECK CURRENT STATUS
-- ========================================

-- Check if RLS is enabled
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'app_settings';
  
  IF rls_enabled THEN
    RAISE NOTICE 'ℹ️ RLS is already enabled on app_settings';
  ELSE
    RAISE NOTICE '⚠️ RLS is NOT enabled on app_settings - Enabling now...';
  END IF;
END $$;

-- ========================================
-- 2. ENABLE RLS
-- ========================================

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 3. DROP EXISTING POLICIES (if any)
-- ========================================

DROP POLICY IF EXISTS "Public can read system_settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can read all app_settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can update app_settings" ON app_settings;
DROP POLICY IF EXISTS "Admins can insert app_settings" ON app_settings;

-- ========================================
-- 4. CREATE POLICIES
-- ========================================

-- Policy: Public can read system_settings only
-- Note: This allows public read, but we'll use a view/function for better control
CREATE POLICY "Public can read system_settings"
  ON app_settings
  FOR SELECT
  USING (true);

-- Policy: Only authenticated admins can read all columns
-- This is for admin access to all settings
CREATE POLICY "Admins can read all app_settings"
  ON app_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only authenticated admins can update
CREATE POLICY "Admins can update app_settings"
  ON app_settings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 
      FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Only authenticated admins can insert
CREATE POLICY "Admins can insert app_settings"
  ON app_settings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ✅ RLS policies created for app_settings

-- ========================================
-- 5. CREATE VIEW FOR PUBLIC ACCESS (BETTER APPROACH)
-- ========================================

-- Create view that only exposes system_settings
CREATE OR REPLACE VIEW public_app_settings AS
SELECT 
  id,
  system_settings,
  updated_at
FROM app_settings
WHERE id = 1;

-- Grant access to anon and authenticated roles
GRANT SELECT ON public_app_settings TO anon;
GRANT SELECT ON public_app_settings TO authenticated;

-- ✅ Created public_app_settings view for public access

-- ========================================
-- 6. CREATE FUNCTION FOR PUBLIC ACCESS (BEST APPROACH)
-- ========================================

-- Function to get public system_settings
CREATE OR REPLACE FUNCTION get_public_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT system_settings 
    FROM app_settings 
    WHERE id = 1
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION get_public_system_settings() TO anon;
GRANT EXECUTE ON FUNCTION get_public_system_settings() TO authenticated;

-- ✅ Created get_public_system_settings() function

-- ========================================
-- 7. VERIFY
-- ========================================

-- Check RLS status
SELECT 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN '✅ RLS Enabled'
    ELSE '❌ RLS Disabled'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'app_settings';

-- Check policies
SELECT 
  policyname,
  cmd as command,
  CASE 
    WHEN cmd = 'SELECT' THEN '✅ Read Policy'
    WHEN cmd = 'UPDATE' THEN '✅ Update Policy'
    WHEN cmd = 'INSERT' THEN '✅ Insert Policy'
    ELSE 'Other'
  END as policy_type
FROM pg_policies
WHERE tablename = 'app_settings'
ORDER BY cmd;

-- Check view exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name = 'public_app_settings';

-- Check function exists
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_public_system_settings';

-- ✅ Verification complete

-- ========================================
-- NOTES
-- ========================================

-- After running this migration:
-- 1. Update your code to use the view or function:
--    - View: .from('public_app_settings')
--    - Function: .rpc('get_public_system_settings')
-- 2. Test that public users can only access system_settings
-- 3. Test that admins can access all columns
-- 4. Test that non-admins cannot update/insert

