-- ============================================
-- SUPABASE SCHEMA IMPROVEMENTS
-- Apply these improvements to enhance data integrity
-- ============================================

-- ============================================
-- 1. IMPROVE PROFILES TABLE
-- ============================================

-- Add missing columns
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'vi',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- ============================================
-- 2. IMPROVE EXAM_RESULTS TABLE
-- ============================================

-- Add constraints for data integrity
ALTER TABLE exam_results
  DROP CONSTRAINT IF EXISTS chk_exam_results_scores,
  DROP CONSTRAINT IF EXISTS chk_exam_results_correct,
  DROP CONSTRAINT IF EXISTS chk_exam_results_totals;

ALTER TABLE exam_results
  ADD CONSTRAINT chk_exam_results_scores CHECK (
    knowledge_score >= 0 AND knowledge_score <= 60 AND
    reading_score >= 0 AND reading_score <= 60 AND
    listening_score >= 0 AND listening_score <= 60 AND
    total_score >= 0 AND total_score <= 180
  ),
  ADD CONSTRAINT chk_exam_results_correct CHECK (
    knowledge_correct >= 0 AND knowledge_correct <= knowledge_total AND
    reading_correct >= 0 AND reading_correct <= reading_total AND
    listening_correct >= 0 AND listening_correct <= listening_total
  ),
  ADD CONSTRAINT chk_exam_results_totals CHECK (
    knowledge_total > 0 AND
    reading_total > 0 AND
    listening_total > 0
  );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exam_results_user_level 
  ON exam_results(user_id, level_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_completed_at 
  ON exam_results(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_is_passed 
  ON exam_results(is_passed) WHERE is_passed = true;

-- ============================================
-- 3. IMPROVE LEARNING_PROGRESS TABLE
-- ============================================

-- Add constraints
ALTER TABLE learning_progress
  DROP CONSTRAINT IF EXISTS chk_learning_progress_type,
  DROP CONSTRAINT IF EXISTS chk_learning_progress_status,
  DROP CONSTRAINT IF EXISTS chk_learning_progress_score,
  DROP CONSTRAINT IF EXISTS chk_learning_progress_total,
  DROP CONSTRAINT IF EXISTS chk_learning_progress_attempts,
  DROP CONSTRAINT IF EXISTS chk_lesson_progress_required,
  DROP CONSTRAINT IF EXISTS chk_exam_progress_required;

ALTER TABLE learning_progress
  ADD CONSTRAINT chk_learning_progress_type CHECK (
    type IN ('lesson_complete', 'quiz_attempt', 'exam_attempt', 'flashcard_review')
  ),
  ADD CONSTRAINT chk_learning_progress_status CHECK (
    status IN ('not_started', 'in_progress', 'completed', 'abandoned')
  ),
  ADD CONSTRAINT chk_learning_progress_score CHECK (
    (score IS NULL) OR (score >= 0 AND score <= total)
  ),
  ADD CONSTRAINT chk_learning_progress_total CHECK (
    (total IS NULL) OR (total > 0)
  ),
  ADD CONSTRAINT chk_learning_progress_attempts CHECK (
    attempts >= 1
  ),
  ADD CONSTRAINT chk_lesson_progress_required CHECK (
    (type = 'lesson_complete' AND book_id IS NOT NULL AND chapter_id IS NOT NULL AND lesson_id IS NOT NULL) OR
    (type != 'lesson_complete')
  ),
  ADD CONSTRAINT chk_exam_progress_required CHECK (
    (type = 'exam_attempt' AND level_id IS NOT NULL AND exam_id IS NOT NULL) OR
    (type != 'exam_attempt')
  );

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_type 
  ON learning_progress(user_id, type);
CREATE INDEX IF NOT EXISTS idx_learning_progress_lesson 
  ON learning_progress(user_id, book_id, chapter_id, lesson_id) 
  WHERE type = 'lesson_complete';
CREATE INDEX IF NOT EXISTS idx_learning_progress_exam 
  ON learning_progress(user_id, level_id, exam_id) 
  WHERE type = 'exam_attempt';
CREATE INDEX IF NOT EXISTS idx_learning_progress_status 
  ON learning_progress(status) 
  WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_learning_progress_created_at 
  ON learning_progress(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_created 
  ON learning_progress(user_id, created_at DESC);

-- Add unique constraints to prevent duplicates
DROP INDEX IF EXISTS idx_learning_progress_lesson_unique;
CREATE UNIQUE INDEX idx_learning_progress_lesson_unique
  ON learning_progress(user_id, book_id, chapter_id, lesson_id, type)
  WHERE type = 'lesson_complete';

DROP INDEX IF EXISTS idx_learning_progress_exam_unique;
CREATE UNIQUE INDEX idx_learning_progress_exam_unique
  ON learning_progress(user_id, level_id, exam_id, type)
  WHERE type = 'exam_attempt';

-- ============================================
-- 4. IMPROVE APP_SETTINGS TABLE
-- ============================================

-- Add versioning and audit columns
ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS change_log JSONB DEFAULT '[]';

-- Create settings history table for audit
CREATE TABLE IF NOT EXISTS app_settings_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_id INTEGER REFERENCES app_settings(id),
  setting_key VARCHAR(100) NOT NULL,
  old_value JSONB,
  new_value JSONB,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_settings_history_setting_id 
  ON app_settings_history(setting_id);
CREATE INDEX IF NOT EXISTS idx_settings_history_updated_at 
  ON app_settings_history(updated_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can only see their own exam results" ON exam_results;
DROP POLICY IF EXISTS "Users can only insert their own exam results" ON exam_results;
DROP POLICY IF EXISTS "Users can only update their own exam results" ON exam_results;

DROP POLICY IF EXISTS "Users can only see their own progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can only insert their own progress" ON learning_progress;
DROP POLICY IF EXISTS "Users can only update their own progress" ON learning_progress;

-- Exam Results Policies
CREATE POLICY "Users can only see their own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own exam results"
  ON exam_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Learning Progress Policies
CREATE POLICY "Users can only see their own progress"
  ON learning_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own progress"
  ON learning_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own progress"
  ON learning_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- App Settings History (Admin only)
CREATE POLICY "Admins can see all settings history"
  ON app_settings_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update last_active_at in profiles
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET last_active_at = NOW()
  WHERE user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. VIEWS FOR ANALYTICS
-- ============================================

-- View for user progress summary
CREATE OR REPLACE VIEW user_progress_summary AS
SELECT
  user_id,
  type,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) as total_count,
  AVG(score::numeric / NULLIF(total, 0) * 100) FILTER (WHERE status = 'completed' AND score IS NOT NULL AND total IS NOT NULL) as avg_score_percentage,
  SUM(attempts) as total_attempts,
  SUM(time_spent) as total_time_spent
FROM learning_progress
GROUP BY user_id, type;

-- View for exam statistics
CREATE OR REPLACE VIEW exam_statistics AS
SELECT
  level_id,
  exam_id,
  COUNT(*) as total_attempts,
  COUNT(*) FILTER (WHERE is_passed = true) as passed_count,
  AVG(total_score) as avg_score,
  AVG(knowledge_score) as avg_knowledge_score,
  AVG(reading_score) as avg_reading_score,
  AVG(listening_score) as avg_listening_score
FROM exam_results
GROUP BY level_id, exam_id;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Schema improvements applied successfully!';
  RAISE NOTICE '📊 Check indexes: SELECT * FROM pg_indexes WHERE tablename IN (''exam_results'', ''learning_progress'', ''profiles'');';
  RAISE NOTICE '🔒 Check RLS: SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = ''public'';';
END $$;

