-- Drop existing RLS policies if they exist
DROP POLICY IF EXISTS "Users can read their own GitHub identities" ON github_identities;
DROP POLICY IF EXISTS "Users can insert their own GitHub identities" ON github_identities;
DROP POLICY IF EXISTS "Users can update their own GitHub identities" ON github_identities;

-- Enable RLS on the table
ALTER TABLE github_identities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own GitHub identities"
ON github_identities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub identities"
ON github_identities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub identities"
ON github_identities
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 