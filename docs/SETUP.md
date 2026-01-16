# Setup Guide

## Prerequisites

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **Git**: For version control
- **Supabase Account**: For backend services

## Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd elearning
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Database Tables

Run these SQL commands in Supabase SQL Editor:

#### Profiles Table

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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### Books Table

```sql
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  series_id TEXT,
  cover_image TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published books" ON books
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage books" ON books
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### Chapters Table

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

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chapters" ON chapters FOR SELECT USING (true);
CREATE POLICY "Admins can manage chapters" ON chapters
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### Lessons Table

```sql
CREATE TABLE lessons (
  id TEXT PRIMARY KEY,
  chapter_id TEXT REFERENCES chapters(id) ON DELETE CASCADE,
  book_id TEXT,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'theory',
  content JSONB,
  flashcards JSONB,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Admins can manage lessons" ON lessons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### Quizzes Table

```sql
CREATE TABLE quizzes (
  id TEXT PRIMARY KEY,
  lesson_id TEXT,
  chapter_id TEXT,
  book_id TEXT,
  level TEXT NOT NULL,
  title TEXT,
  questions JSONB,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read quizzes" ON quizzes FOR SELECT USING (true);
CREATE POLICY "Admins can manage quizzes" ON quizzes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

#### App Settings Table

```sql
CREATE TABLE app_settings (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings" ON app_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage settings" ON app_settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Insert default settings
INSERT INTO app_settings (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('access_control', '{}');
```

### 3. Auto-create Profile Trigger

```sql
-- Function to create profile on signup
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

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. Create First Admin

After signing up your first user:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

## Development

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Manual Deployment

```bash
# Build
npm run build

# The dist/ folder contains the production build
# Upload to any static hosting service
```

## Troubleshooting

### Common Issues

#### 1. Supabase Connection Failed

```
Error: Missing configuration: VITE_SUPABASE_URL
```

**Solution**: Ensure `.env.local` file exists with correct values.

#### 2. RLS Policy Error

```
Error: Row-level security policy violation
```

**Solution**: Check RLS policies and ensure user has correct role.

#### 3. Profile Not Created

```
Error: Profile not found
```

**Solution**: Check if the trigger `on_auth_user_created` exists.

#### 4. IndexedDB Not Available

```
Warning: IndexedDB not available, using localStorage
```

**Solution**: This is a fallback behavior in incognito mode. Normal in private browsing.

### Debug Mode

Enable debug logging in browser console:

```javascript
localStorage.setItem('debug', 'true');
```

### Reset Local Storage

Clear all cached data:

```javascript
localStorage.clear();
indexedDB.deleteDatabase('glingo-db');
```

## NPM Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | Run ESLint |
| `npm run backup:auto` | Auto backup |
| `npm run backup:cleanup` | Clean old backups |
| `npm run i18n:scan` | Scan translations |
| `npm run verify:deploy` | Verify deployment |
| `npm run verify:all` | Full security check |

## Project Scripts

Located in `scripts/` folder:

| Script | Purpose |
|--------|---------|
| `auto-backup.cjs` | Automated backup system |
| `backup-cleanup.cjs` | Clean old backup files |
| `i18n-migration.js` | Translation management |
| `verify-deployment.js` | Check deployment status |
| `verify-headers.js` | Security headers check |
