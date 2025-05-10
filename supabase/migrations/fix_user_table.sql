-- Check if User table exists, if not create it
CREATE TABLE IF NOT EXISTS public."User" (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT UNIQUE NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security on User table
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read any user profile
CREATE POLICY "Anyone can view user profiles"
ON public."User"
FOR SELECT
TO public
USING (true);

-- Create policy to allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public."User"
FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Create policy to allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public."User"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO public;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

GRANT SELECT ON public."User" TO public;
GRANT SELECT ON public."User" TO authenticated;
GRANT SELECT ON public."User" TO anon;

GRANT INSERT, UPDATE ON public."User" TO authenticated;

-- Create a trigger function to create a user profile when a new user signs up
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, user_name, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile(); 