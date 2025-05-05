-- Create a profiles table that extends the auth.users table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  auth_provider TEXT DEFAULT 'email',
  github_username TEXT,
  github_connected BOOLEAN DEFAULT FALSE,
  subscription_tier TEXT DEFAULT 'free',
  readme_generations_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Set up access policies for the profiles table
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url, 
    auth_provider,
    github_connected
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    (COALESCE(NEW.raw_app_meta_data->>'provider', '') = 'github')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists (to avoid conflicts when rerunning this script)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create a table to store user's GitHub repositories
CREATE TABLE IF NOT EXISTS public.repositories (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  github_repo_id BIGINT,
  name TEXT NOT NULL,
  description TEXT,
  language TEXT,
  stars INTEGER DEFAULT 0,
  forks INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.repositories ENABLE ROW LEVEL SECURITY;

-- Set up access policies for the repositories table
CREATE POLICY "Users can view their own repositories"
  ON public.repositories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own repositories"
  ON public.repositories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own repositories"
  ON public.repositories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own repositories"
  ON public.repositories
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create a table to store generated READMEs
CREATE TABLE IF NOT EXISTS public.readmes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  repository_id INTEGER REFERENCES public.repositories(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.readmes ENABLE ROW LEVEL SECURITY;

-- Set up access policies for the readmes table
CREATE POLICY "Users can view their own READMEs"
  ON public.readmes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own READMEs"
  ON public.readmes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own READMEs"
  ON public.readmes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own READMEs"
  ON public.readmes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add missing columns if they don't exist (safe migration)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_username TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS github_connected BOOLEAN DEFAULT FALSE;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
END $$;
