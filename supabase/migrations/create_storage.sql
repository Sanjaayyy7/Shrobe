-- Create the listings bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('listings', 'listings', true, false, 5242880, '{"image/jpeg","image/png","image/webp"}')
ON CONFLICT (id) DO UPDATE SET public = true;

-- Public access for listing images
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'listings');

-- Allow all authenticated users to upload files
CREATE POLICY "Upload Access" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (bucket_id = 'listings');

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 