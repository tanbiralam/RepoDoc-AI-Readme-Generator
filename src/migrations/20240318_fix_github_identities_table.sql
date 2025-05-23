-- First, drop all existing policies
DROP POLICY IF EXISTS "GitHub identities are viewable by the owner." ON github_identities;
DROP POLICY IF EXISTS "Users can insert their own GitHub identity." ON github_identities;
DROP POLICY IF EXISTS "Users can update their own GitHub identity." ON github_identities;
DROP POLICY IF EXISTS "Users can delete their own GitHub identity." ON github_identities;
DROP POLICY IF EXISTS "Users can read their own GitHub identities" ON github_identities;
DROP POLICY IF EXISTS "Users can insert their own GitHub identities" ON github_identities;
DROP POLICY IF EXISTS "Users can update their own GitHub identities" ON github_identities;

-- Make sure RLS is enabled
ALTER TABLE github_identities ENABLE ROW LEVEL SECURITY;

-- Create fresh policies
CREATE POLICY "Users can read their own GitHub identities"
ON github_identities FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own GitHub identities"
ON github_identities FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own GitHub identities"
ON github_identities FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add a trigger to automatically set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_github_identities_updated_at ON github_identities;

CREATE TRIGGER update_github_identities_updated_at
    BEFORE UPDATE ON github_identities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON github_identities TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE github_identities_id_seq TO authenticated; 