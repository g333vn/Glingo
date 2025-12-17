-- ============================================
-- SUPABASE EXAMS SCHEMA
-- Table for storing JLPT Exam data
-- Structure: Level -> Exam -> 3 Parts (Knowledge, Reading, Listening) -> Sections -> Questions
-- ============================================

-- ============================================
-- 1. EXAMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(2) NOT NULL CHECK (level IN ('n1', 'n2', 'n3', 'n4', 'n5')),
  exam_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  
  -- 3 phần chính (JSONB)
  knowledge_sections JSONB,      -- Sections của phần Knowledge (言語知識)
  reading_sections JSONB,        -- Sections của phần Reading (読解)
  listening_sections JSONB,      -- Sections của phần Listening (聴解)
  
  -- Metadata
  config JSONB DEFAULT '{}',     -- Cấu hình, metadata
  image_url VARCHAR(500),        -- URL ảnh đề thi
  date VARCHAR(50),              -- Ngày thi (ví dụ: '2024/12')
  status VARCHAR(50),            -- Trạng thái (ví dụ: 'Có sẵn')
  
  -- Audit
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,         -- Soft delete
  
  UNIQUE(level, exam_id)
);

-- ============================================
-- 2. INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_exams_level ON exams(level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_exam_id ON exams(exam_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_date ON exams(date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_created_by ON exams(created_by) WHERE deleted_at IS NULL;

-- GIN indexes for JSONB columns (for faster queries)
CREATE INDEX IF NOT EXISTS idx_exams_knowledge_sections_gin ON exams USING GIN(knowledge_sections) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_reading_sections_gin ON exams USING GIN(reading_sections) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_listening_sections_gin ON exams USING GIN(listening_sections) WHERE deleted_at IS NULL;

-- ============================================
-- 3. TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_exams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_exams_updated_at ON exams;
CREATE TRIGGER trigger_exams_updated_at
  BEFORE UPDATE ON exams
  FOR EACH ROW
  EXECUTE FUNCTION update_exams_updated_at();

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exams (not deleted)
DROP POLICY IF EXISTS "Anyone can read exams" ON exams;
CREATE POLICY "Anyone can read exams"
  ON exams FOR SELECT
  USING (deleted_at IS NULL);

-- Policy: Admins and editors can insert exams
DROP POLICY IF EXISTS "Admins and editors can insert exams" ON exams;
CREATE POLICY "Admins and editors can insert exams"
  ON exams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Policy: Admins and editors can update exams
DROP POLICY IF EXISTS "Admins and editors can update exams" ON exams;
CREATE POLICY "Admins and editors can update exams"
  ON exams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role IN ('admin', 'editor')
    )
  );

-- Policy: Only admins can delete exams (soft delete)
DROP POLICY IF EXISTS "Admins can delete exams" ON exams;
CREATE POLICY "Admins can delete exams"
  ON exams FOR UPDATE  -- Use UPDATE for soft delete
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- 5. HELPER FUNCTIONS
-- ============================================

-- Function to get exam count by level
CREATE OR REPLACE FUNCTION get_exam_count_by_level(p_level VARCHAR(2))
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM exams
    WHERE level = p_level
    AND deleted_at IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Exams schema created successfully!';
  RAISE NOTICE '📊 Table: exams';
  RAISE NOTICE '📋 Columns: level, exam_id, title, knowledge_sections, reading_sections, listening_sections';
  RAISE NOTICE '🔒 RLS enabled: Public read, Admin/Editor write';
END $$;

