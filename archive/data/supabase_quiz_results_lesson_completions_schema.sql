-- ============================================
-- SUPABASE QUIZ RESULTS & LESSON COMPLETIONS SCHEMA
-- Tables for storing detailed quiz results and lesson completion tracking
-- ============================================
-- 
-- ⚠️ LƯU Ý: 
-- - 2 bảng này được tạo để bổ sung cho learning_progress (không thay thế)
-- - Code hiện tại vẫn hoạt động bình thường với learning_progress
-- - Tính năng mới sẽ được phát triển sau khi có đủ user
-- ============================================

-- ============================================
-- 1. QUIZ RESULTS TABLE
-- ============================================
-- Lưu chi tiết từng lần làm quiz (để review, phân tích)

CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Content References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id VARCHAR(255) NOT NULL,
  chapter_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  quiz_id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  
  -- Kết quả tổng
  score INTEGER NOT NULL CHECK (score >= 0),
  total INTEGER NOT NULL CHECK (total > 0),
  percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  time_spent INTEGER,  -- seconds, nullable
  
  -- Chi tiết từng câu hỏi (JSONB)
  -- Format: [
  --   {
  --     "questionId": "q1",
  --     "selectedAnswer": 0,
  --     "correctAnswer": 0,
  --     "isCorrect": true,
  --     "timeSpent": 30
  --   },
  --   ...
  -- ]
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  
  -- Metadata
  started_at TIMESTAMP,
  completed_at TIMESTAMP NOT NULL,
  attempt_number INTEGER NOT NULL CHECK (attempt_number >= 1),  -- Lần thứ mấy (1, 2, 3...)
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys (optional, để đảm bảo data integrity)
  CONSTRAINT fk_quiz_results_book FOREIGN KEY (book_id, level) 
    REFERENCES books(id, level) ON DELETE CASCADE,
  
  -- ✅ UNIQUE CONSTRAINT: Tránh duplicate (user + lesson + attempt_number)
  -- Một user chỉ có thể có 1 record cho mỗi attempt_number của một lesson
  CONSTRAINT uq_quiz_results_user_lesson_attempt 
    UNIQUE (user_id, book_id, chapter_id, lesson_id, level, attempt_number)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user 
  ON quiz_results(user_id);
  
CREATE INDEX IF NOT EXISTS idx_quiz_results_lesson 
  ON quiz_results(book_id, chapter_id, lesson_id, level);
  
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz 
  ON quiz_results(quiz_id, level);
  
CREATE INDEX IF NOT EXISTS idx_quiz_results_created 
  ON quiz_results(created_at DESC);
  
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_lesson 
  ON quiz_results(user_id, book_id, chapter_id, lesson_id, level);
  
-- Index for JSONB answers (GIN index for faster queries)
CREATE INDEX IF NOT EXISTS idx_quiz_results_answers_gin 
  ON quiz_results USING GIN(answers);

-- ============================================
-- 2. LESSON COMPLETIONS TABLE
-- ============================================
-- Lưu chi tiết quá trình học lesson (để resume, thống kê)

CREATE TABLE IF NOT EXISTS lesson_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User & Content References
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id VARCHAR(255) NOT NULL,
  chapter_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  
  -- Trạng thái tổng
  status VARCHAR(20) NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'theory_viewed', 'quiz_completed', 'fully_completed')),
  
  -- Thời gian học Theory
  theory_started_at TIMESTAMP,
  theory_completed_at TIMESTAMP,
  theory_time_spent INTEGER DEFAULT 0 CHECK (theory_time_spent >= 0),
  
  -- Thời gian làm Quiz
  quiz_started_at TIMESTAMP,
  quiz_completed_at TIMESTAMP,
  quiz_time_spent INTEGER DEFAULT 0 CHECK (quiz_time_spent >= 0),
  
  -- Số lần
  theory_view_count INTEGER DEFAULT 0 CHECK (theory_view_count >= 0),
  quiz_attempt_count INTEGER DEFAULT 0 CHECK (quiz_attempt_count >= 0),
  
  -- Chi tiết Theory Progress (JSONB)
  -- Format: {
  --   "sections": [
  --     {
  --       "sectionId": "section1",
  --       "viewed": true,
  --       "timeSpent": 120,
  --       "lastViewedAt": "2024-01-01T00:00:00Z"
  --     }
  --   ],
  --   "lastPosition": "section2",
  --   "scrollPosition": 500
  -- }
  theory_progress JSONB DEFAULT '{}'::jsonb,
  
  -- Chi tiết Quiz Scores (JSONB)
  -- Format: [
  --   {
  --     "attemptNumber": 1,
  --     "score": 6,
  --     "total": 10,
  --     "percentage": 60,
  --     "completedAt": "2024-01-01T00:00:00Z"
  --   },
  --   ...
  -- ]
  quiz_scores JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata
  first_viewed_at TIMESTAMP,
  last_viewed_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys (optional, để đảm bảo data integrity)
  CONSTRAINT fk_lesson_completions_book FOREIGN KEY (book_id, level) 
    REFERENCES books(id, level) ON DELETE CASCADE,
  
  -- Unique constraint: 1 record per user per lesson
  CONSTRAINT uq_lesson_completions_user_lesson 
    UNIQUE (user_id, book_id, chapter_id, lesson_id, level)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user 
  ON lesson_completions(user_id);
  
CREATE INDEX IF NOT EXISTS idx_lesson_completions_lesson 
  ON lesson_completions(book_id, chapter_id, lesson_id, level);
  
CREATE INDEX IF NOT EXISTS idx_lesson_completions_status 
  ON lesson_completions(status);
  
CREATE INDEX IF NOT EXISTS idx_lesson_completions_user_lesson 
  ON lesson_completions(user_id, book_id, chapter_id, lesson_id, level);
  
CREATE INDEX IF NOT EXISTS idx_lesson_completions_last_viewed 
  ON lesson_completions(last_viewed_at DESC);
  
-- Indexes for JSONB columns (GIN indexes for faster queries)
CREATE INDEX IF NOT EXISTS idx_lesson_completions_theory_progress_gin 
  ON lesson_completions USING GIN(theory_progress);
  
CREATE INDEX IF NOT EXISTS idx_lesson_completions_quiz_scores_gin 
  ON lesson_completions USING GIN(quiz_scores);

-- ============================================
-- 3. TRIGGERS FOR updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_lesson_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_quiz_results_updated_at ON quiz_results;
CREATE TRIGGER trigger_quiz_results_updated_at
  BEFORE UPDATE ON quiz_results
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_results_updated_at();

DROP TRIGGER IF EXISTS trigger_lesson_completions_updated_at ON lesson_completions;
CREATE TRIGGER trigger_lesson_completions_updated_at
  BEFORE UPDATE ON lesson_completions
  FOR EACH ROW
  EXECUTE FUNCTION update_lesson_completions_updated_at();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_completions ENABLE ROW LEVEL SECURITY;

-- Policies: Users can only see their own data, admins can see all
-- Quiz Results Policies
DROP POLICY IF EXISTS "Users can view own quiz results" ON quiz_results;
CREATE POLICY "Users can view own quiz results"
  ON quiz_results FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz results" ON quiz_results;
CREATE POLICY "Users can insert own quiz results"
  ON quiz_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own quiz results" ON quiz_results;
CREATE POLICY "Users can update own quiz results"
  ON quiz_results FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all quiz results" ON quiz_results;
CREATE POLICY "Admins can manage all quiz results"
  ON quiz_results FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Lesson Completions Policies
DROP POLICY IF EXISTS "Users can view own lesson completions" ON lesson_completions;
CREATE POLICY "Users can view own lesson completions"
  ON lesson_completions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own lesson completions" ON lesson_completions;
CREATE POLICY "Users can insert own lesson completions"
  ON lesson_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own lesson completions" ON lesson_completions;
CREATE POLICY "Users can update own lesson completions"
  ON lesson_completions FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all lesson completions" ON lesson_completions;
CREATE POLICY "Admins can manage all lesson completions"
  ON lesson_completions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Quiz Results & Lesson Completions schema created successfully!';
  RAISE NOTICE '📊 Tables: quiz_results, lesson_completions';
  RAISE NOTICE '🔒 RLS enabled: Users can only access their own data, Admins can access all';
  RAISE NOTICE '📝 Note: These tables are supplements to learning_progress, not replacements';
  RAISE NOTICE '🚀 Features will be developed later when user base is stable';
END $$;

