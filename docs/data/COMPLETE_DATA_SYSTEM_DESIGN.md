# 🗄️ THIẾT KẾ HỆ THỐNG DỮ LIỆU HOÀN CHỈNH

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#tổng-quan-kiến-trúc)
2. [Schema Design](#schema-design)
3. [Data Flow](#data-flow)
4. [Constraints & Validation](#constraints--validation)
5. [Indexes & Performance](#indexes--performance)
6. [Backup & Recovery](#backup--recovery)
7. [Data Migration](#data-migration)
8. [Security & Access Control](#security--access-control)

---

## 🏗️ TỔNG QUAN KIẾN TRÚC

### **3-Layer Architecture:**

```
┌─────────────────────────────────────────────────┐
│  PRESENTATION LAYER (React Frontend)            │
│  - User Interface                                │
│  - State Management                              │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│  APPLICATION LAYER (Services)                   │
│  - Business Logic                                │
│  - Data Validation                               │
│  - Sync Logic (localStorage ↔ Supabase)         │
└─────────────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────────────┐
│  DATA LAYER                                      │
│  ┌──────────────┐  ┌──────────────┐            │
│  │  IndexedDB   │  │   Supabase   │            │
│  │  (Local)     │  │   (Cloud)    │            │
│  │              │  │              │            │
│  │ - Content    │  │ - User Data  │            │
│  │ - Cache      │  │ - Progress   │            │
│  │              │  │ - Results    │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### **Data Storage Strategy:**

| Data Type | Primary Storage | Backup/Sync | Purpose |
|-----------|----------------|-------------|---------|
| **Content** (Books, Lessons, Quizzes) | IndexedDB | Supabase (optional) | Fast local access, offline support |
| **User Progress** | Supabase | IndexedDB (cache) | Multi-device sync, analytics |
| **Exam Results** | Supabase | IndexedDB (cache) | Historical data, statistics |
| **User Settings** | localStorage | Supabase (profiles) | Personalization |
| **App Settings** | Supabase | - | Global configuration |

---

## 📊 SCHEMA DESIGN

### **1. AUTHENTICATION & USER MANAGEMENT**

```sql
-- ✅ Đã có: auth.users (Supabase built-in)
-- ✅ Đã có: profiles table

-- Cải thiện profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Ho_Chi_Minh',
  ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'vi',
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);

-- Triggers
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();
```

### **2. EXAM RESULTS (Hoàn thiện)**

```sql
-- ✅ Đã có: exam_results table
-- Cải thiện với constraints và indexes

-- Add missing constraints
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

-- Add computed column for pass rate (if needed)
-- Note: PostgreSQL doesn't support computed columns directly,
-- but we can use views or calculate in application layer
```

### **3. LEARNING PROGRESS (Hoàn thiện)**

```sql
-- ✅ Đã có: learning_progress table
-- Cải thiện với constraints và indexes

-- Add constraints
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
  -- Ensure lesson progress has book/chapter/lesson
  ADD CONSTRAINT chk_lesson_progress_required CHECK (
    (type = 'lesson_complete' AND book_id IS NOT NULL AND chapter_id IS NOT NULL AND lesson_id IS NOT NULL) OR
    (type != 'lesson_complete')
  ),
  -- Ensure exam progress has level/exam
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

-- Add unique constraint to prevent duplicates
-- (One progress record per user per lesson/exam)
CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_progress_lesson_unique
  ON learning_progress(user_id, book_id, chapter_id, lesson_id, type)
  WHERE type = 'lesson_complete';

CREATE UNIQUE INDEX IF NOT EXISTS idx_learning_progress_exam_unique
  ON learning_progress(user_id, level_id, exam_id, type)
  WHERE type = 'exam_attempt';
```

### **4. APP SETTINGS (Hoàn thiện)**

```sql
-- ✅ Đã có: app_settings table
-- Cải thiện với versioning và audit

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
```

### **5. CONTENT TABLES (Cho tương lai - Sync content lên Supabase)**

```sql
-- Books table (for content sync)
CREATE TABLE IF NOT EXISTS books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(2) NOT NULL CHECK (level IN ('n1', 'n2', 'n3', 'n4', 'n5')),
  book_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP, -- Soft delete
  UNIQUE(level, book_id)
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  order_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(book_id, chapter_id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  lesson_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  theory JSONB, -- { type, content, duration }
  has_quiz BOOLEAN DEFAULT false,
  order_index INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(book_id, chapter_id, lesson_id)
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  lesson_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  questions JSONB NOT NULL,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(book_id, chapter_id, lesson_id)
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level VARCHAR(2) NOT NULL CHECK (level IN ('n1', 'n2', 'n3', 'n4', 'n5')),
  exam_id VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  knowledge_sections JSONB,
  listening_sections JSONB,
  config JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  UNIQUE(level, exam_id)
);

-- Indexes for content tables
CREATE INDEX IF NOT EXISTS idx_books_level ON books(level) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_chapters_book ON chapters(book_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lessons_chapter ON lessons(chapter_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON quizzes(lesson_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_exams_level ON exams(level) WHERE deleted_at IS NULL;
```

---

## 🔄 DATA FLOW

### **1. User Progress Flow**

```
User Action (Quiz/Lesson/Exam)
    ↓
[Frontend] Save to localStorage (immediate)
    ↓
[Service] Validate data
    ↓
[Service] Save to Supabase (async, background)
    ↓
[Service] Update cache in IndexedDB (optional)
    ↓
[Frontend] Show success notification
```

### **2. Sync Flow (Multi-device)**

```
Device A: User completes quiz
    ↓
Save to Supabase
    ↓
Device B: User logs in
    ↓
Fetch progress from Supabase
    ↓
Merge with local cache (conflict resolution)
    ↓
Update UI
```

### **3. Conflict Resolution Strategy**

```javascript
// Priority: Supabase > LocalStorage
// If both exist:
// - Use most recent timestamp
// - If same timestamp, use Supabase (source of truth)
// - Merge attempts count (sum both)
```

---

## ✅ CONSTRAINTS & VALIDATION

### **Application-Level Validation**

```javascript
// Validation rules
const VALIDATION_RULES = {
  examResults: {
    knowledgeScore: { min: 0, max: 60 },
    readingScore: { min: 0, max: 60 },
    listeningScore: { min: 0, max: 60 },
    totalScore: { min: 0, max: 180 },
    correctAnswers: { min: 0, max: total },
    timeSpent: { min: 0 }
  },
  learningProgress: {
    score: { min: 0, max: total },
    attempts: { min: 1, max: 100 },
    timeSpent: { min: 0, max: 86400 } // Max 24 hours
  }
};
```

### **Database-Level Constraints**

- ✅ Check constraints (scores, totals)
- ✅ Foreign key constraints (user_id, references)
- ✅ Unique constraints (prevent duplicates)
- ✅ NOT NULL constraints (required fields)
- ✅ ENUM constraints (type, status)

---

## 🚀 INDEXES & PERFORMANCE

### **Critical Indexes**

```sql
-- User progress queries (most common)
CREATE INDEX idx_learning_progress_user_created 
  ON learning_progress(user_id, created_at DESC);

-- Exam results queries
CREATE INDEX idx_exam_results_user_completed 
  ON exam_results(user_id, completed_at DESC);

-- Dashboard queries (aggregations)
CREATE INDEX idx_learning_progress_user_type_status 
  ON learning_progress(user_id, type, status);

-- Search queries
CREATE INDEX idx_learning_progress_metadata_gin 
  ON learning_progress USING GIN(metadata);
```

### **Query Optimization**

- Use `SELECT` specific columns (not `*`)
- Use `LIMIT` for pagination
- Use `WHERE` clauses with indexed columns
- Use `EXPLAIN ANALYZE` to check query plans

---

## 💾 BACKUP & RECOVERY

### **1. Automated Backups**

```sql
-- Supabase automatically backs up daily
-- Manual backup script (for critical data)
```

### **2. Export/Import Strategy**

```javascript
// Export user data
async function exportUserData(userId) {
  const [progress, examResults] = await Promise.all([
    getUserProgress(userId),
    getUserExamResults(userId)
  ]);
  
  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    progress,
    examResults
  };
}

// Import user data (with validation)
async function importUserData(userId, data) {
  // Validate structure
  // Check version compatibility
  // Import with conflict resolution
}
```

### **3. Recovery Procedures**

1. **Point-in-time recovery**: Use Supabase backups
2. **Data corruption**: Validate and fix constraints
3. **Accidental deletion**: Use soft delete + recovery

---

## 🔄 DATA MIGRATION

### **Version Management**

```sql
-- Migration tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(50) PRIMARY KEY,
  description TEXT,
  applied_at TIMESTAMP DEFAULT NOW()
);

-- Example migration
INSERT INTO schema_migrations (version, description)
VALUES ('2024_01_01_add_timezone', 'Add timezone column to profiles');
```

### **Migration Strategy**

1. **Backward compatible**: Add new columns as nullable
2. **Gradual migration**: Migrate data in batches
3. **Rollback plan**: Keep old columns until migration complete

---

## 🔒 SECURITY & ACCESS CONTROL

### **Row Level Security (RLS)**

```sql
-- Enable RLS on all user tables
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only see their own exam results"
  ON exam_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own exam results"
  ON exam_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own exam results"
  ON exam_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Similar policies for learning_progress
```

### **Data Validation**

- ✅ Input sanitization (prevent SQL injection)
- ✅ Type checking (validate data types)
- ✅ Range validation (scores, totals)
- ✅ Business logic validation (pass criteria)

---

## 📈 MONITORING & ANALYTICS

### **Metrics to Track**

1. **Performance**
   - Query execution time
   - Database size
   - Index usage

2. **Data Quality**
   - Constraint violations
   - Missing data
   - Duplicate records

3. **User Activity**
   - Daily active users
   - Progress completion rate
   - Exam pass rate

---

## 🎯 NEXT STEPS

1. ✅ **Apply schema improvements** to Supabase
2. ✅ **Add indexes** for performance
3. ✅ **Implement RLS policies** for security
4. ✅ **Create migration scripts** for existing data
5. ✅ **Add monitoring** and alerting
6. ✅ **Document API** endpoints
7. ✅ **Create backup procedures**

---

## 📝 NOTES

- **Soft Delete**: Use `deleted_at` instead of hard delete
- **Audit Trail**: Track all changes with history tables
- **Versioning**: Support multiple schema versions
- **Performance**: Monitor and optimize slow queries
- **Security**: Always use RLS for user data

