-- Script to verify if quizzes are saved in Supabase
-- Run this in Supabase SQL Editor to check if quizzes exist

-- 1. Check all quizzes in the database
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title,
  array_length(questions, 1) as questions_count,
  created_at,
  updated_at,
  created_by
FROM public.quizzes
ORDER BY updated_at DESC
LIMIT 20;

-- 2. Check quizzes for a specific level (e.g., n5)
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title,
  array_length(questions, 1) as questions_count,
  created_at,
  updated_at
FROM public.quizzes
WHERE level = 'n5'  -- Change this to your level
ORDER BY updated_at DESC;

-- 3. Check quizzes for a specific book/chapter/lesson
SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title,
  array_length(questions, 1) as questions_count,
  created_at,
  updated_at
FROM public.quizzes
WHERE level = 'n5'  -- Change these values
  AND book_id = 'mina-1'  -- Change to your book ID
  AND chapter_id = 'chapter-1'  -- Change to your chapter ID
  AND lesson_id = 'chapter-1';  -- Change to your lesson ID

-- 4. Check RLS policies on quizzes table
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

-- 5. Test if anonymous users can read quizzes
-- This simulates what happens when an anonymous user tries to read quizzes
-- Note: This will only work if RLS policies allow anonymous read access

SELECT 
  id,
  book_id,
  chapter_id,
  lesson_id,
  level,
  title
FROM public.quizzes
WHERE level = 'n5'  -- Change to your level
LIMIT 5;

