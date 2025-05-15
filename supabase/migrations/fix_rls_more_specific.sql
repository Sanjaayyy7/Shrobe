-- Specific fixes for RLS policies

-- First, drop any conflicting policies
DROP POLICY IF EXISTS "Allow public to insert listing_images" ON public.listing_images;
DROP POLICY IF EXISTS "Allow public to insert listing_tags" ON public.listing_tags;

-- Policy for listing_images
DO $$
BEGIN
    -- Create policy with explicit ON CONFLICT DO NOTHING in case it already exists
    BEGIN
        CREATE POLICY "Allow all operations on listing_images" ON public.listing_images
        FOR ALL TO public
        USING (true)
        WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$;

-- Policy for listing_tags 
DO $$
BEGIN
    -- Create policy with explicit ON CONFLICT DO NOTHING in case it already exists
    BEGIN
        CREATE POLICY "Allow all operations on listing_tags" ON public.listing_tags
        FOR ALL TO public
        USING (true)
        WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN
        NULL;
    END;
END
$$; 