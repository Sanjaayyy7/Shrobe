-- Fix the storage RLS issues for file uploads

-- First enable RLS if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies that might conflict
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects; 
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "listings_public_select" ON storage.objects;
DROP POLICY IF EXISTS "listings_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "listings_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "listings_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "listings_authenticated_delete" ON storage.objects;

-- Create a policy that allows anyone to read files from the listings bucket
CREATE POLICY "listings_public_select"
ON storage.objects
FOR SELECT
USING (bucket_id = 'listings');

-- Create a policy that allows authenticated users to insert files into the listings bucket
-- This policy is more permissive - no owner check
CREATE POLICY "listings_authenticated_insert"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Create a policy that allows anyone to insert files into the listings bucket (for testing)
-- This is especially important for unauthenticated or newly authenticated users
CREATE POLICY "listings_public_insert"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'listings');

-- Create a policy that allows authenticated users to update any files in the listings bucket
CREATE POLICY "listings_authenticated_update"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'listings');

-- Create a policy that allows authenticated users to delete any files in the listings bucket
CREATE POLICY "listings_authenticated_delete"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'listings');

-- Make sure the storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('listings', 'listings', true)
ON CONFLICT (id) DO UPDATE SET public = true; 