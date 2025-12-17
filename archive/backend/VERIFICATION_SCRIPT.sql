-- ============================================
-- VERIFICATION SCRIPT
-- Chạy script này sau khi setup để verify mọi thứ đã đúng
-- ============================================

-- ============================================
-- 1. VERIFY TABLES
-- ============================================

SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL - Expected 5 tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series');

-- List all tables
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
ORDER BY table_name;

-- ============================================
-- 2. VERIFY INDEXES
-- ============================================

SELECT 
  'Indexes Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 15 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Some indexes may be missing'
  END as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series');

-- ============================================
-- 3. VERIFY RLS ENABLED
-- ============================================

SELECT 
  'RLS Check' as check_type,
  COUNT(*) as tables_with_rls,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
AND rowsecurity = true;

-- ============================================
-- 4. VERIFY POLICIES
-- ============================================

SELECT 
  'Policies Check' as check_type,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Some policies may be missing'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series');

-- List policies by table
SELECT 
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
ORDER BY tablename, policyname;

-- ============================================
-- 5. VERIFY TRIGGERS
-- ============================================

SELECT 
  'Triggers Check' as check_type,
  COUNT(*) as trigger_count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Some triggers may be missing'
  END as status
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE c.relname IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
AND t.tgname LIKE 'trigger_%_updated_at';

-- ============================================
-- 6. VERIFY STORAGE BUCKETS (Manual Check)
-- ============================================

-- Note: Storage buckets must be checked manually in Supabase Dashboard
-- Go to Storage → Buckets and verify:
-- - book-images (public: true)
-- - audio-files (public: true)
-- - pdf-files (public: true)

-- ============================================
-- 7. VERIFY STORAGE POLICIES
-- ============================================

SELECT 
  'Storage Policies Check' as check_type,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 12 THEN '✅ PASS'
    ELSE '⚠️ WARNING - Some storage policies may be missing'
  END as status
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
AND policyname LIKE '%book images%' OR policyname LIKE '%audio files%' OR policyname LIKE '%PDF files%';

-- List storage policies
SELECT 
  policyname,
  bucket_id,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage'
AND tablename = 'objects'
ORDER BY bucket_id, policyname;

-- ============================================
-- 8. SUMMARY
-- ============================================

DO $$
DECLARE
  table_count INTEGER;
  rls_count INTEGER;
  policy_count INTEGER;
  trigger_count INTEGER;
  storage_policy_count INTEGER;
BEGIN
  -- Count tables
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name IN ('books', 'chapters', 'lessons', 'quizzes', 'series');
  
  -- Count RLS enabled
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
  AND rowsecurity = true;
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('books', 'chapters', 'lessons', 'quizzes', 'series');
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM pg_trigger t
  JOIN pg_class c ON t.tgrelid = c.oid
  WHERE c.relname IN ('books', 'chapters', 'lessons', 'quizzes', 'series')
  AND t.tgname LIKE 'trigger_%_updated_at';
  
  -- Count storage policies
  SELECT COUNT(*) INTO storage_policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
  AND tablename = 'objects';
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'VERIFICATION SUMMARY';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Tables: % / 5', table_count;
  RAISE NOTICE 'RLS Enabled: % / 5', rls_count;
  RAISE NOTICE 'Content Policies: %', policy_count;
  RAISE NOTICE 'Triggers: % / 5', trigger_count;
  RAISE NOTICE 'Storage Policies: %', storage_policy_count;
  RAISE NOTICE '';
  
  IF table_count = 5 AND rls_count = 5 AND trigger_count = 5 THEN
    RAISE NOTICE '✅ CONTENT SCHEMA: PASS';
  ELSE
    RAISE NOTICE '❌ CONTENT SCHEMA: FAIL';
  END IF;
  
  IF storage_policy_count >= 12 THEN
    RAISE NOTICE '✅ STORAGE POLICIES: PASS';
  ELSE
    RAISE NOTICE '⚠️ STORAGE POLICIES: Check manually';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Manual Checks Required:';
  RAISE NOTICE '1. Verify storage buckets exist (book-images, audio-files, pdf-files)';
  RAISE NOTICE '2. Verify buckets are PUBLIC';
  RAISE NOTICE '3. Test upload in app';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
END $$;

