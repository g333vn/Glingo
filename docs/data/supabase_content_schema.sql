-- ============================================
-- SUPABASE CONTENT SCHEMA
-- Tables for storing Books, Chapters, Lessons, Quizzes
-- ============================================

-- ============================================
-- 1. BOOKS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT,
  series_id VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (id, level)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level);
CREATE INDEX IF NOT EXISTS idx_books_series ON books(series_id);
CREATE INDEX IF NOT EXISTS idx_books_created_by ON books(created_by);

-- ============================================
-- 2. CHAPTERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS chapters (
  id VARCHAR(255) NOT NULL,
  book_id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (id, book_id, level),
  FOREIGN KEY (book_id, level) REFERENCES books(id, level) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id, level);
CREATE INDEX IF NOT EXISTS idx_chapters_created_by ON chapters(created_by);

-- ============================================
-- 3. LESSONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS lessons (
  id VARCHAR(255) NOT NULL,
  book_id VARCHAR(255) NOT NULL,
  chapter_id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content_type VARCHAR(50) DEFAULT 'pdf', -- 'pdf', 'html', 'mixed'
  pdf_url TEXT,
  html_content TEXT,
  theory JSONB DEFAULT '{}',
  srs JSONB DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (id, book_id, chapter_id, level),
  FOREIGN KEY (book_id, level) REFERENCES books(id, level) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id, book_id, level) REFERENCES chapters(id, book_id, level) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lessons_book_chapter ON lessons(book_id, chapter_id, level);
CREATE INDEX IF NOT EXISTS idx_lessons_created_by ON lessons(created_by);

-- ============================================
-- 4. QUIZZES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS quizzes (
  id VARCHAR(255) NOT NULL,
  book_id VARCHAR(255) NOT NULL,
  chapter_id VARCHAR(255) NOT NULL,
  lesson_id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  time_limit INTEGER, -- seconds
  passing_score INTEGER DEFAULT 60, -- percentage
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (id, book_id, chapter_id, lesson_id, level),
  FOREIGN KEY (book_id, level) REFERENCES books(id, level) ON DELETE CASCADE,
  FOREIGN KEY (chapter_id, book_id, level) REFERENCES chapters(id, book_id, level) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id, book_id, chapter_id, level) REFERENCES lessons(id, book_id, chapter_id, level) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(book_id, chapter_id, lesson_id, level);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_questions_gin ON quizzes USING GIN(questions);

-- ============================================
-- 5. SERIES TABLE (Optional)
-- ============================================

CREATE TABLE IF NOT EXISTS series (
  id VARCHAR(255) NOT NULL,
  level VARCHAR(10) NOT NULL,
  name VARCHAR(500) NOT NULL,
  description TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (id, level)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_series_level ON series(level);
CREATE INDEX IF NOT EXISTS idx_series_created_by ON series(created_by);

-- ============================================
-- 6. TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_books_updated_at ON books;
CREATE TRIGGER trigger_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

DROP TRIGGER IF EXISTS trigger_chapters_updated_at ON chapters;
CREATE TRIGGER trigger_chapters_updated_at
  BEFORE UPDATE ON chapters
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

DROP TRIGGER IF EXISTS trigger_lessons_updated_at ON lessons;
CREATE TRIGGER trigger_lessons_updated_at
  BEFORE UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

DROP TRIGGER IF EXISTS trigger_quizzes_updated_at ON quizzes;
CREATE TRIGGER trigger_quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

DROP TRIGGER IF EXISTS trigger_series_updated_at ON series;
CREATE TRIGGER trigger_series_updated_at
  BEFORE UPDATE ON series
  FOR EACH ROW
  EXECUTE FUNCTION update_content_updated_at();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;

-- Policies: Everyone can read, only admins can write
DROP POLICY IF EXISTS "Anyone can read books" ON books;
CREATE POLICY "Anyone can read books"
  ON books FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can insert books" ON books;
CREATE POLICY "Admins can insert books"
  ON books FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can update books" ON books;
CREATE POLICY "Admins can update books"
  ON books FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete books" ON books;
CREATE POLICY "Admins can delete books"
  ON books FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Same policies for chapters, lessons, quizzes, series
-- (Copy the same pattern for each table)

DROP POLICY IF EXISTS "Anyone can read chapters" ON chapters;
CREATE POLICY "Anyone can read chapters"
  ON chapters FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage chapters" ON chapters;
CREATE POLICY "Admins can manage chapters"
  ON chapters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can read lessons" ON lessons;
CREATE POLICY "Anyone can read lessons"
  ON lessons FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage lessons" ON lessons;
CREATE POLICY "Admins can manage lessons"
  ON lessons FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can read quizzes" ON quizzes;
CREATE POLICY "Anyone can read quizzes"
  ON quizzes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage quizzes" ON quizzes;
CREATE POLICY "Admins can manage quizzes"
  ON quizzes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can read series" ON series;
CREATE POLICY "Anyone can read series"
  ON series FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage series" ON series;
CREATE POLICY "Admins can manage series"
  ON series FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Content schema created successfully!';
  RAISE NOTICE '📊 Tables: books, chapters, lessons, quizzes, series';
  RAISE NOTICE '🔒 RLS enabled: Public read, Admin write';
END $$;

