-- Populate the User table with data from auth.users

-- First, make sure we have the proper trigger in place
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."User" (id, user_name, full_name, mail)
  VALUES (NEW.id, 
    COALESCE(NEW.email, 'user_' || substring(NEW.id::text, 1, 8)), 
    NEW.raw_user_meta_data->>'full_name',
    NEW.email)
  ON CONFLICT (id) DO UPDATE SET
    user_name = EXCLUDED.user_name,
    full_name = EXCLUDED.full_name,
    mail = EXCLUDED.mail;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table if it doesn't exist
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_user_profile();

-- Now populate the User table with existing auth.users data
INSERT INTO public."User" (id, user_name, full_name, mail, created_at)
SELECT 
  id,
  COALESCE(email, 'user_' || substring(id::text, 1, 8)) as user_name,
  raw_user_meta_data->>'full_name' as full_name,
  email as mail,
  created_at
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  full_name = EXCLUDED.full_name,
  mail = EXCLUDED.mail; 