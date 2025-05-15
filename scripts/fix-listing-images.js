// Script to check and fix listing image URLs
const { createClient } = require('@supabase/supabase-js');

// Supabase credentials - hardcoded for this script
const supabaseUrl = 'https://hviofamhcgqukpenyjjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW9mYW1oY2dxdWtwZW55amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTEwNjksImV4cCI6MjA2MTE4NzA2OX0.NA8gvvyKVlhAsdcM2f6mWCCYzTE5aD7WsTZateBNGMk';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixListingImages() {
  console.log('Checking for listing images with issues...');
  
  try {
    // Get all listing images
    const { data: images, error } = await supabase
      .from('listing_images')
      .select('*');
    
    if (error) {
      console.error('Error fetching listing images:', error.message);
      return;
    }
    
    console.log(`Found ${images.length} total images`);
    
    // Check for any images that might have URL issues (missing protocol, etc)
    const problematicImages = images.filter(img => {
      if (!img.image_url) return true;
      
      // Check if URL has proper https:// prefix
      try {
        const url = new URL(img.image_url);
        return url.protocol !== 'https:';
      } catch (e) {
        // If URL is invalid
        return true;
      }
    });
    
    console.log(`Found ${problematicImages.length} images with potential issues`);
    
    // Fix each problematic image
    for (const img of problematicImages) {
      console.log(`Fixing image ID: ${img.id}, current URL: ${img.image_url}`);
      
      // Ensure the URL starts with the Supabase storage URL
      let fixedUrl = img.image_url;
      
      if (!fixedUrl || !fixedUrl.includes('storage.googleapis.com')) {
        console.log(`\tSkipping image ${img.id} - can't auto-fix this URL`);
        continue;
      }
      
      // Make sure URL starts with https://
      if (!fixedUrl.startsWith('https://')) {
        fixedUrl = 'https://' + fixedUrl.replace(/^http:\/\//, '');
      }
      
      // Update the image URL in the database
      const { error: updateError } = await supabase
        .from('listing_images')
        .update({ image_url: fixedUrl })
        .eq('id', img.id);
      
      if (updateError) {
        console.error(`\tError updating image ${img.id}:`, updateError.message);
      } else {
        console.log(`\tUpdated image ${img.id} URL to: ${fixedUrl}`);
      }
    }
    
    console.log('\nImage check and fix completed!');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
fixListingImages(); 