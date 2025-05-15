-- Update RLS policies to allow our script to work

-- Allow public to insert listings (for testing purposes only)
CREATE POLICY "Allow public to insert listings for testing" ON public.listings
FOR INSERT TO public
WITH CHECK (true);

-- Allow public to insert listing_images
CREATE POLICY "Allow public to insert listing_images" ON public.listing_images
FOR INSERT TO public
WITH CHECK (true);

-- Allow public to insert listing_tags
CREATE POLICY "Allow public to insert listing_tags" ON public.listing_tags
FOR INSERT TO public
WITH CHECK (true); 