-- Fix RLS policies for quizzes table to allow anonymous users to read quizzes
-- This allows quizzes to be visible in incognito/private browsing mode
-- ✅ Bắt chước logic của books/chapters/lessons - cho phép anonymous users đọc

-- Step 1: Enable RLS on quizzes table (if not already enabled)
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh (giống như books/chapters/lessons)
DROP POLICY IF EXISTS "Allow anonymous read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Allow public read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can read quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Allow authenticated users to manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Authenticated users can insert quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;

-- Step 3: Create policy to allow ANYONE (including anonymous users) to read quizzes
-- ✅ GIỐNG HỆT như books/chapters/lessons - USING (true) cho phép tất cả users đọc
DROP POLICY IF EXISTS "Anyone can read quizzes" ON public.quizzes;
CREATE POLICY "Anyone can read quizzes"
  ON public.quizzes FOR SELECT
  USING (true);

-- Step 4: Create policy for admins to manage quizzes (INSERT, UPDATE, DELETE)
-- ✅ GIỐNG HỆT như books/chapters/lessons - chỉ admin mới có thể write
DROP POLICY IF EXISTS "Admins can manage quizzes" ON public.quizzes;
CREATE POLICY "Admins can manage quizzes"
  ON public.quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

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

