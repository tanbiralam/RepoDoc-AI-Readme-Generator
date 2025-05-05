-- Updated schema for the ReadMe Generator with enhanced authentication

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
  password_reset_token TEXT,
  password_reset_token_expires_at TIMESTAMP WITH TIME ZONE,
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

-- Create an auth_logs table to track authentication events
CREATE TABLE IF NOT EXISTS public.auth_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,  -- 'sign_in', 'sign_up', 'password_reset_requested', 'password_reset_completed', etc.
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.auth_logs ENABLE ROW LEVEL SECURITY;

-- Set up access policies for the auth_logs table
CREATE POLICY "Users can view their own auth logs"
  ON public.auth_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create a function to log auth events
CREATE OR REPLACE FUNCTION public.log_auth_event(
  user_id UUID,
  event_type TEXT,
  ip_address TEXT DEFAULT NULL,
  user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.auth_logs (
    user_id,
    event_type,
    ip_address,
    user_agent
  )
  VALUES (
    user_id,
    event_type,
    ip_address,
    user_agent
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up functions for password reset
CREATE OR REPLACE FUNCTION public.create_password_reset_token(
  user_email TEXT
)
RETURNS TEXT AS $$
DECLARE
  token TEXT;
  user_id UUID;
BEGIN
  -- Find the user ID from the email
  SELECT id INTO user_id FROM auth.users WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RETURN NULL; -- User not found
  END IF;
  
  -- Generate a random token
  token := encode(gen_random_bytes(32), 'hex');
  
  -- Store the token and expiry in the profiles table
  UPDATE public.profiles
  SET 
    password_reset_token = token,
    password_reset_token_expires_at = NOW() + INTERVAL '1 hour',
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Log the password reset request
  PERFORM public.log_auth_event(user_id, 'password_reset_requested');
  
  RETURN token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add missing columns if they don't exist (safe migration)
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
        ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_reset_token_expires_at TIMESTAMP WITH TIME ZONE;
    EXCEPTION
        WHEN duplicate_column THEN
        -- Do nothing, column already exists
    END;
END $$;

-- Create auth_settings table for configuration
CREATE TABLE IF NOT EXISTS public.auth_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Ensures single row
  allow_signups BOOLEAN DEFAULT TRUE,
  require_email_verification BOOLEAN DEFAULT TRUE,
  password_min_length INTEGER DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO public.auth_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.auth_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view/edit auth settings (add appropriate admin check)
CREATE POLICY "Anyone can view auth settings"
  ON public.auth_settings
  FOR SELECT
  USING (true); 