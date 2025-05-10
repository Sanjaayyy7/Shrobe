-- Enable Row Level Security on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert objects into the listings bucket
CREATE POLICY "Authenticated users can upload to listings bucket" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'listings');

-- Create policy to allow users to update their own objects
CREATE POLICY "Users can update their own objects in listings bucket" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (bucket_id = 'listings' AND auth.uid()::text = owner);

-- Create policy to allow users to delete their own objects
CREATE POLICY "Users can delete their own objects in listings bucket" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'listings' AND auth.uid()::text = owner);

-- Create policy to allow public access to read objects
CREATE POLICY "Anyone can view objects in listings bucket" 
ON storage.objects 
FOR SELECT 
TO public 
USING (bucket_id = 'listings');

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO public;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO anon;

-- Grant select on objects table
GRANT SELECT ON storage.objects TO public;
GRANT SELECT ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Grant insert on objects table to authenticated users
GRANT INSERT ON storage.objects TO authenticated;

-- Grant update on objects table to authenticated users
GRANT UPDATE ON storage.objects TO authenticated;

-- Grant delete on objects table to authenticated users
GRANT DELETE ON storage.objects TO authenticated; 