-- Create a function to set up storage policies for a bucket
CREATE OR REPLACE FUNCTION public.setup_storage_policies(bucket_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  policy_exists boolean;
BEGIN
  -- Check if the policy already exists
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = bucket_name || '_insert_policy'
  ) INTO policy_exists;
  
  -- If policy doesn't exist, create it
  IF NOT policy_exists THEN
    -- Allow authenticated users to insert objects into the bucket
    EXECUTE format('
      CREATE POLICY %I_insert_policy ON storage.objects
      FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = %L);
    ', bucket_name, bucket_name);
    
    -- Allow authenticated users to update their own objects
    EXECUTE format('
      CREATE POLICY %I_update_policy ON storage.objects
      FOR UPDATE
      TO authenticated
      USING (bucket_id = %L AND auth.uid()::text = owner);
    ', bucket_name, bucket_name);
    
    -- Allow authenticated users to delete their own objects
    EXECUTE format('
      CREATE POLICY %I_delete_policy ON storage.objects
      FOR DELETE
      TO authenticated
      USING (bucket_id = %L AND auth.uid()::text = owner);
    ', bucket_name, bucket_name);
    
    -- Allow public access to read objects
    EXECUTE format('
      CREATE POLICY %I_select_policy ON storage.objects
      FOR SELECT
      TO public
      USING (bucket_id = %L);
    ', bucket_name, bucket_name);
  END IF;
  
  RETURN true;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.setup_storage_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.setup_storage_policies(text) TO anon; 