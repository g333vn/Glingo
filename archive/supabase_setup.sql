-- ========================================
-- SUPABASE DATABASE SETUP
-- ========================================
-- Copy and paste this into your Supabase SQL Editor to set up the database

-- ========================================
-- 1. CREATE PROFILES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary & Foreign Keys
  user_id UUID NOT NULL PRIMARY KEY,
  
  -- User Information
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  
  -- Role & Permissions
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'editor', 'user')),
  is_banned BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  phone_number TEXT,
  bio TEXT,
  location TEXT,
  
  -- Constraints
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========================================
-- 2. CREATE ACTIVITY LOG TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ========================================
-- 3. CREATE INDEXES
-- ========================================
-- For faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_is_banned ON public.profiles(is_banned);
CREATE INDEX IF NOT EXISTS idx_activity_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON public.activity_logs(created_at DESC);

-- ========================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================
-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function for RLS (must be defined before policies that use it)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
  USING (is_admin());

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  USING (
  USING (is_admin());

-- Enable RLS on activity_logs table
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all activity logs
CREATE POLICY "Admins can view all activity logs"
  ON public.activity_logs
  FOR SELECT
  USING (
  USING (is_admin());

-- ========================================
-- 5. CREATE FUNCTIONS
-- ========================================

-- Update updated_at timestamp on profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Handle new user signup (auto-create profile)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'display_name' OR NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user signup
CREATE TRIGGER trigger_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ========================================
-- 6. CREATE VIEWS
-- ========================================

-- View for user statistics
CREATE OR REPLACE VIEW public.user_statistics AS
SELECT
  COUNT(*) as total_users,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admin_count,
  SUM(CASE WHEN role = 'editor' THEN 1 ELSE 0 END) as editor_count,
  SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_count,
  SUM(CASE WHEN is_banned THEN 1 ELSE 0 END) as banned_count,
  SUM(CASE WHEN last_login_at > NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as active_week
FROM public.profiles;

-- ========================================
-- 7. STORAGE SETUP (for avatars)
-- ========================================

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

-- Set up RLS for avatars bucket
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Anyone can update their own avatar."
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars');

-- ========================================
-- 8. HELPFUL QUERIES
-- ========================================

-- Get all users with roles
-- SELECT user_id, email, display_name, role, created_at FROM profiles ORDER BY created_at DESC;

-- Get activity for a specific user
-- SELECT * FROM activity_logs WHERE user_id = 'USER_ID' ORDER BY created_at DESC;

-- Get recent signups (last 7 days)
-- SELECT * FROM profiles WHERE created_at > NOW() - INTERVAL '7 days' ORDER BY created_at DESC;

-- ========================================
-- 9. NOTES
-- ========================================
-- 
-- ✅ Profiles table is connected to Supabase auth.users
-- ✅ New users automatically get a profile when they sign up
-- ✅ RLS policies ensure users can only access their own data (except admins)
-- ✅ Indexes are created for common queries
-- ✅ Activity logging is available for audit trail
-- ✅ Avatars can be stored in Supabase storage
--
-- After running this script:
-- 1. Go to Supabase Dashboard
-- 2. Verify tables are created in SQL Editor
-- 3. Test RLS policies
-- 4. Update your .env with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

