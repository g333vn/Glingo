-- ========================================
-- FIX PROFILES TABLE RLS POLICIES (SIMPLE VERSION)
-- ========================================
-- This is a simpler approach that avoids recursion completely
-- Run this in Supabase SQL Editor

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
-- 2. DROP RECURSIVE FUNCTION
-- ========================================
DROP FUNCTION IF EXISTS public.is_admin();

-- ========================================
-- 3. CREATE SIMPLE POLICIES (NO RECURSION)
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

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 4. ADMIN ACCESS VIA SERVICE ROLE
-- ========================================
-- For admin operations, use service role key in backend
-- OR create a separate admin-only table/view
-- OR temporarily disable RLS for admin operations

-- ========================================
-- 5. FIX HANDLE_NEW_USER FUNCTION
-- ========================================
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
-- 6. VERIFY
-- ========================================
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ========================================
-- SUCCESS
-- ========================================
DO $$
BEGIN
  RAISE NOTICE '✅ Simple RLS policies created!';
  RAISE NOTICE '✅ No recursion - users can only access their own profiles';
  RAISE NOTICE '✅ Admin operations should use service role';
END $$;

