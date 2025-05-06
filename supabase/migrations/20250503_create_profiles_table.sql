-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  mail TEXT NOT NULL,
  full_name TEXT, -- Nullable
  user_name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security for User table
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'User' AND policyname = 'Anyone can view users'
  ) THEN
    CREATE POLICY "Anyone can view users" 
    ON "User" 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

-- Create policy to allow users to update only their own user record
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'User' AND policyname = 'Users can update own user record'
  ) THEN
    CREATE POLICY "Users can update own user record" 
    ON "User" 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to insert their own user record
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'User' AND policyname = 'Users can insert own user record'
  ) THEN
    CREATE POLICY "Users can insert own user record" 
    ON "User" 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Create trigger to automatically create a user record when a user signs up
CREATE OR REPLACE FUNCTION create_user_record_for_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, mail, user_name, full_name, created_at)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists already
DROP TRIGGER IF EXISTS create_user_record_on_signup ON auth.users;

-- Create the trigger
CREATE TRIGGER create_user_record_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_user_record_for_auth_user();

-- Create index on user_name for faster lookups
CREATE INDEX IF NOT EXISTS user_name_idx ON "User" (user_name); 