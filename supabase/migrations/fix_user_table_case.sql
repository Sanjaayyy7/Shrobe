-- Fix the User table and queries
-- The issue is that in lib/database.ts we're querying 'User' with capital U
-- but some queries might be using 'user' with lowercase u

-- Check if there's a lowercase 'user' table and if not, ensure the uppercase 'User' exists
DO $$
BEGIN 
  -- First make sure the "User" table exists (with capital U)
  IF NOT EXISTS (
    SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'User'
  ) THEN
    -- Create User table with proper casing
    CREATE TABLE IF NOT EXISTS public."User" (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      user_name TEXT UNIQUE NOT NULL,
      full_name TEXT,
      mail TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
    
    -- Enable row level security
    ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
    
    -- Create policies
    CREATE POLICY "Anyone can view user profiles"
    ON public."User"
    FOR SELECT
    TO public
    USING (true);
    
    CREATE POLICY "Users can update their own profile"
    ON public."User"
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
    
    CREATE POLICY "Users can insert their own profile"
    ON public."User"
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$; 