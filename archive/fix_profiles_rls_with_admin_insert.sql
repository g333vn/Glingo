-- ========================================
-- FIX PROFILES TABLE RLS POLICIES (WITH ADMIN INSERT)
-- ========================================
-- This version allows admins to insert profiles for other users
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: This uses a non-recursive approach by checking role
-- directly from auth.users metadata or from a subquery

-- ========================================
-- 1. DROP ALL EXISTING POLICIES
-- ========================================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- ========================================
-- 2. DROP RECURSIVE FUNCTION (if exists)
-- ========================================
DROP FUNCTION IF EXISTS public.is_admin();

-- ========================================
-- 3. CREATE HELPER FUNCTION (NON-RECURSIVE)
-- ========================================
-- This function checks if current user is admin by checking their own profile
-- It uses SECURITY DEFINER to bypass RLS when checking
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if current user's profile has admin role
  -- Use SECURITY DEFINER to bypass RLS for this check
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ========================================
-- 4. CREATE RLS POLICIES
-- ========================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can insert their own profile (for new signups)
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin());

-- ✅ CRITICAL: Admins can insert any profile (for admin operations)
-- This allows admin to create profile for newly created users
CREATE POLICY "Admins can insert any profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (public.is_admin());

-- ========================================
-- 5. FIX HANDLE_NEW_USER FUNCTION
-- ========================================
-- This function needs SECURITY DEFINER to bypass RLS when creating profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'user'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. VERIFY POLICIES
-- ========================================
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies created with admin insert support!';
  RAISE NOTICE '✅ Users can view/update/insert their own profiles';
  RAISE NOTICE '✅ Admins can view/update/insert all profiles';
  RAISE NOTICE '✅ No recursion - uses SECURITY DEFINER function';
END $$;

