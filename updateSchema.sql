-- Add github_connecting column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS github_connecting BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN public.profiles.github_connecting IS 'Flag indicating if GitHub connection is in progress';

-- Update existing users to have the new field set to false
UPDATE public.profiles
SET github_connecting = FALSE
WHERE github_connecting IS NULL; 