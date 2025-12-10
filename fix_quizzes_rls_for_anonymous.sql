-- Fix RLS policies for quizzes table to allow anonymous users to read quizzes
-- This allows quizzes to be visible in incognito/private browsing mode

-- Step 1: Enable RLS on quizzes table (if not already enabled)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing SELECT policy if exists
DROP POLICY IF EXISTS "Allow anonymous read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Allow public read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;

-- Step 3: Create new policy to allow anonymous/public users to read quizzes
-- This allows anyone (including anonymous users) to read quizzes
CREATE POLICY "Quizzes are viewable by everyone"
ON public.quizzes
FOR SELECT
USING (true);

-- Step 4: Keep existing policies for authenticated users (if any)
-- These policies allow authenticated users to INSERT, UPDATE, DELETE

-- Optional: If you want to allow anonymous users to read but restrict write operations
-- The following policies ensure only authenticated users can modify quizzes

-- Allow authenticated users to insert quizzes
DROP POLICY IF EXISTS "Authenticated users can insert quizzes" ON public.quizzes;
CREATE POLICY "Authenticated users can insert quizzes"
ON public.quizzes
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update their own quizzes
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
CREATE POLICY "Users can update their own quizzes"
ON public.quizzes
FOR UPDATE
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete their own quizzes
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;
CREATE POLICY "Users can delete their own quizzes"
ON public.quizzes
FOR DELETE
USING (auth.role() = 'authenticated');

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'quizzes'
ORDER BY policyname;

