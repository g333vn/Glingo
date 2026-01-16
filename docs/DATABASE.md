# Database Documentation

## Overview

The application uses **Supabase PostgreSQL** as the primary database with Row Level Security (RLS) enabled on all tables.

## Database Schema

### Core Tables

#### `profiles`

User profile information linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  avatar_url TEXT,
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- `user_id` → `auth.users(id)` (CASCADE DELETE)

**Indexes:**
- Primary key on `user_id`
- Index on `email` (for lookups)
- Index on `role` (for admin queries)

#### `books`

Learning books organized by JLPT level.

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  series_id TEXT,
  cover_image TEXT,
  placeholder_version INTEGER DEFAULT 1 CHECK (placeholder_version >= 1 AND placeholder_version <= 10),
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- `created_by` → `auth.users(id)`
- `series_id` → (references series, if exists)

**Indexes:**
- Primary key on `id`
- Index on `level` (for filtering)
- Index on `series_id` (for series grouping)

#### `chapters`

Chapters within books.

```sql
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- `book_id` → `books(id)` (CASCADE DELETE)

**Indexes:**
- Primary key on `id`
- Index on `book_id` (for book queries)
- Index on `(book_id, order_index)` (for ordered listing)

#### `lessons`

Individual lessons within chapters.

```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
  book_id TEXT,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'theory',  -- 'theory' | 'flashcard' | 'quiz' | 'mixed'
  content JSONB,               -- Rich text content
  flashcards JSONB,            -- Flashcard data
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- `chapter_id` → `chapters(id)` (CASCADE DELETE)
- `book_id` → `books(id)` (denormalized for performance)

**Indexes:**
- Primary key on `id`
- Index on `chapter_id` (for chapter queries)
- Index on `(chapter_id, order_index)` (for ordered listing)
- GIN index on `content` (for JSONB queries)

#### `quizzes`

Quizzes associated with lessons.

```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT,
  chapter_id TEXT,
  book_id TEXT,
  level TEXT NOT NULL,
  title TEXT,
  questions JSONB,             -- Array of question objects
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Relationships:**
- `lesson_id` → `lessons(id)`
- `chapter_id` → `chapters(id)`
- `book_id` → `books(id)`
- `created_by` → `auth.users(id)`

**Indexes:**
- Primary key on `id`
- Index on `(level, book_id, chapter_id, lesson_id)` (for lookups)
- GIN index on `questions` (for JSONB queries)

#### `exams`

JLPT practice exams.

```sql
CREATE TABLE exams (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,       -- Unique exam identifier (e.g., '2024-07')
  level TEXT NOT NULL,         -- 'n1' | 'n2' | 'n3' | 'n4' | 'n5'
  year INTEGER,
  month INTEGER,
  title TEXT,
  knowledge_sections JSONB,    -- Knowledge section questions
  listening_sections JSONB,    -- Listening section (object format)
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(level, exam_id)
);
```

**Relationships:**
- None (standalone)

**Indexes:**
- Primary key on `id`
- Unique constraint on `(level, exam_id)`
- Index on `level` (for filtering)
- Index on `deleted_at` (for soft delete queries)
- GIN indexes on `knowledge_sections` and `listening_sections`

**Note:** `listening_sections` uses object format:
```json
{
  "sections": [...],
  "audioUrl": "...",
  "audioPath": "...",
  "audioName": "..."
}
```

#### `app_settings`

Application-wide settings.

```sql
CREATE TABLE app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  system_settings JSONB,       -- System-wide settings
  user_settings JSONB,         -- User preference defaults
  exam_config JSONB,           -- Exam configuration
  access_control JSONB,        -- Access control config
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Common Keys:**
- `maintenance_mode`: Boolean
- `access_control`: Level/module access config

**Indexes:**
- Primary key on `id`
- Unique index on `key`
- GIN indexes on JSONB columns

## Row Level Security (RLS)

All tables have RLS enabled with role-based policies.

### Profiles Policies

```sql
-- Users can view own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

### Content Tables Policies

```sql
-- Public read access
CREATE POLICY "Anyone can read published content" ON books
  FOR SELECT USING (is_published = true);

-- Admin/Editor write access
CREATE POLICY "Admins can manage content" ON books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('admin', 'editor'))
  );
```

### App Settings Policies

```sql
-- Public can read system_settings only
CREATE POLICY "Public can read system_settings" ON app_settings
  FOR SELECT USING (true);

-- Admins can manage all settings
CREATE POLICY "Admins can manage app_settings" ON app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

## Database Functions

### Auto-create Profile

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Get Public Settings

```sql
CREATE OR REPLACE FUNCTION get_public_system_settings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT system_settings 
    FROM app_settings 
    WHERE id = 1
  );
END;
$$;
```

## Migrations

### Migration Files

Located in `migrations/` folder:

| File | Purpose |
|------|---------|
| `add_access_control_to_app_settings.sql` | Add access_control column |
| `add_exam_config_to_app_settings.sql` | Add exam_config column |
| `add_placeholder_version_to_books.sql` | Add placeholder_version to books |
| `add_system_settings_to_app_settings.sql` | Add system_settings column |
| `add_user_settings_to_app_settings.sql` | Add user_settings column |
| `enable_rls_for_app_settings.sql` | Enable RLS on app_settings |
| `check_placeholder_version.sql` | Verification query |

### Running Migrations

1. **Backup database** before running migrations
2. Open Supabase SQL Editor
3. Run migration file content
4. Verify with check queries

### Migration Best Practices

```sql
-- Always check if column exists first
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'table_name' AND column_name = 'column_name'
  ) THEN
    ALTER TABLE table_name ADD COLUMN column_name TYPE;
  END IF;
END $$;

-- Use transactions for data migrations
BEGIN;
UPDATE table_name SET ...;
-- Verify before committing
COMMIT;
```

## Data Types

### JSONB Usage

Several tables use JSONB for flexible schema:

- **`lessons.content`**: Rich text content (blocks, formatting)
- **`lessons.flashcards`**: Flashcard data array
- **`quizzes.questions`**: Question objects array
- **`exams.knowledge_sections`**: Knowledge section structure
- **`exams.listening_sections`**: Listening section structure
- **`app_settings.value`**: Flexible settings storage

### JSONB Query Examples

```sql
-- Query lessons with specific content type
SELECT * FROM lessons 
WHERE content->>'type' = 'heading';

-- Query quizzes with multiple choice questions
SELECT * FROM quizzes 
WHERE questions @> '[{"type": "multiple_choice"}]';

-- Update JSONB field
UPDATE lessons 
SET content = jsonb_set(content, '{title}', '"New Title"')
WHERE id = 'lesson-1';
```

## Indexes

### Performance Indexes

```sql
-- Composite indexes for common queries
CREATE INDEX idx_chapters_book_order ON chapters(book_id, order_index);
CREATE INDEX idx_lessons_chapter_order ON lessons(chapter_id, order_index);
CREATE INDEX idx_quizzes_lookup ON quizzes(level, book_id, chapter_id, lesson_id);

-- GIN indexes for JSONB queries
CREATE INDEX idx_lessons_content_gin ON lessons USING GIN(content);
CREATE INDEX idx_quizzes_questions_gin ON quizzes USING GIN(questions);
```

## Backup & Recovery

### Supabase Backups

- **Automatic**: Daily backups (Supabase Pro plan)
- **Manual**: Create via Supabase Dashboard
- **Point-in-time recovery**: Available on Pro plan

### Export Data

```sql
-- Export specific table
COPY (SELECT * FROM books WHERE level = 'n5') 
TO '/tmp/books_n5.csv' WITH CSV HEADER;

-- Export as JSON
SELECT json_agg(row_to_json(books)) FROM books WHERE level = 'n5';
```

## Monitoring

### Query Performance

```sql
-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Connection Pooling

Supabase uses PgBouncer for connection pooling:
- **Transaction mode**: Recommended for most queries
- **Session mode**: For transactions with temp tables

## Security Considerations

1. **RLS enabled** on all tables
2. **SECURITY DEFINER** functions are carefully reviewed
3. **No service role key** in client code
4. **Input validation** before database operations
5. **SQL injection prevention** via parameterized queries

## Troubleshooting

### Common Issues

**Issue**: RLS blocking legitimate queries
- **Solution**: Check user role in `profiles` table
- **Verify**: `SELECT role FROM profiles WHERE user_id = auth.uid();`

**Issue**: JSONB queries slow
- **Solution**: Add GIN indexes on JSONB columns
- **Check**: `EXPLAIN ANALYZE` query plan

**Issue**: Foreign key constraint errors
- **Solution**: Ensure parent records exist before creating children
- **Check**: Verify `book_id`, `chapter_id` exist
