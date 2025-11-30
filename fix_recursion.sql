-- ========================================
-- FIX FOR INFINITE RECURSION IN RLS POLICIES
-- ========================================
-- Run this script in your Supabase SQL Editor to fix the "infinite recursion detected" error.

-- 1. Create a secure function to check if a user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (db owner),
-- bypassing RLS on the profiles table for this specific check.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

-- 3. Re-create policies using the new secure function
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (is_admin());

-- 4. Verify the fix
-- You should now be able to query the profiles table without errors.
