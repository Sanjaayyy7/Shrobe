// Script to create a test listing with images in Supabase
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Supabase credentials
const supabaseUrl = 'https://hviofamhcgqukpenyjjv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW9mYW1oY2dxdWtwZW55amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTEwNjksImV4cCI6MjA2MTE4NzA2OX0.NA8gvvyKVlhAsdcM2f6mWCCYzTE5aD7WsTZateBNGMk';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Placeholder image URLs (replace with actual public URLs if needed)
const placeholderImages = [
  'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=3005&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2787&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2835&auto=format&fit=crop'
];

async function createTestListing() {
  console.log('Creating test listing...');
  
  try {
    // Get an existing user ID from the database
    const { data: users, error: usersError } = await supabase
      .from('User')
      .select('id')
      .limit(1);
    
    let userId;
    if (usersError || !users || users.length === 0) {
      console.error('Error fetching users:', usersError?.message || 'No users found');
      console.log('Using a hardcoded UUID instead (note: this may cause foreign key issues)');
      // Hardcoded UUID that should match a user in your database
      userId = '3c5ec010-8e86-4a11-816a-0c12bfa12a19';
    } else {
      userId = users[0].id;
      console.log(`Using user ID: ${userId}`);
    }
    
    // Create the listing
    const listingData = {
      user_id: userId,
      title: 'Test Listing - Nike Jacket',
      description: 'This is a test listing created by the script. A brand new Nike jacket for testing purposes.',
      brand: 'Nike',
      size: 'M',
      condition: 'New with tags',
      daily_price: 25.00,
      weekly_price: 150.00,
      location: 'San Francisco',
      latitude: 37.7749,
      longitude: -122.4194,
      is_available: true
    };
    
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .insert(listingData)
      .select()
      .single();
    
    if (listingError) {
      console.error('Error creating listing:', listingError.message);
      return;
    }
    
    console.log(`Created listing with ID: ${listing.id}`);
    
    // Add images to the listing
    const imageData = placeholderImages.map((url, index) => ({
      listing_id: listing.id,
      image_url: url,
      display_order: index
    }));
    
    const { data: images, error: imagesError } = await supabase
      .from('listing_images')
      .insert(imageData)
      .select();
    
    if (imagesError) {
      console.error('Error adding images to listing:', imagesError.message);
    } else {
      console.log(`Added ${images.length} images to the listing`);
    }
    
    // Add tags to the listing
    const tagsData = [
      { listing_id: listing.id, tag: 'Outerwear' },
      { listing_id: listing.id, tag: 'Streetwear' }
    ];
    
    const { data: tags, error: tagsError } = await supabase
      .from('listing_tags')
      .insert(tagsData)
      .select();
    
    if (tagsError) {
      console.error('Error adding tags to listing:', tagsError.message);
    } else {
      console.log(`Added ${tags.length} tags to the listing`);
    }
    
    console.log('\nTest listing created successfully!');
    console.log('You can view it in your app now.');
    
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

// Run the function
createTestListing(); 