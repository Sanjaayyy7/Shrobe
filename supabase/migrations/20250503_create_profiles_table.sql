-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  full_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view all profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Anyone can view profiles'
  ) THEN
    CREATE POLICY "Anyone can view profiles" 
    ON profiles 
    FOR SELECT 
    USING (true);
  END IF;
END
$$;

-- Create policy to allow users to update only their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" 
    ON profiles 
    FOR UPDATE 
    USING (auth.uid() = id);
  END IF;
END
$$;

-- Create policy to allow users to insert their own profile
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile" 
    ON profiles 
    FOR INSERT 
    WITH CHECK (auth.uid() = id);
  END IF;
END
$$;

-- Create trigger to automatically create an empty profile when a user is created
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists already
DROP TRIGGER IF EXISTS create_user_profile_on_signup ON auth.users;

-- Create the trigger
CREATE TRIGGER create_user_profile_on_signup
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION create_profile_for_user();

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles (username); 