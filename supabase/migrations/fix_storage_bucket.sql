-- Create and configure the 'listings' storage bucket

-- Check if listings bucket exists, create if not
DO $$
DECLARE
  bucket_exists BOOLEAN;
BEGIN
  -- Check if bucket exists
  SELECT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'listings'
  ) INTO bucket_exists;
  
  -- Create bucket if it doesn't exist
  IF NOT bucket_exists THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('listings', 'listings', true);
  END IF;

  -- Update bucket to be public if it exists but isn't public
  UPDATE storage.buckets
  SET public = true
  WHERE name = 'listings' AND public = false;
END
$$;

-- Enable appropriate RLS policies for the bucket
-- Allow public to read files
DO $$
BEGIN
  -- Drop existing policies if they exist to recreate them
  DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
  
  -- Create policy for public read access
  CREATE POLICY "Allow public read access" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id = 'listings');
END
$$;

-- Allow authenticated users to upload and manage their files
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
  DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;
  
  -- Create upload policy
  CREATE POLICY "Allow authenticated users to upload files" 
  ON storage.objects 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'listings');
  
  -- Create update policy
  CREATE POLICY "Allow users to update their own files" 
  ON storage.objects 
  FOR UPDATE 
  TO authenticated 
  USING (bucket_id = 'listings' AND auth.uid()::text = owner);
  
  -- Create delete policy
  CREATE POLICY "Allow users to delete their own files" 
  ON storage.objects 
  FOR DELETE 
  TO authenticated 
  USING (bucket_id = 'listings' AND auth.uid()::text = owner);
END
$$; 