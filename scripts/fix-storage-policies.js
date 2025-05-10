require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStoragePolicies() {
  try {
    console.log('Creating or checking listings bucket...');
    
    // List buckets to check if listings bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError);
      throw bucketsError;
    }
    
    const listingsBucket = buckets.find(bucket => bucket.name === 'listings');
    
    if (!listingsBucket) {
      console.log('Creating listings bucket...');
      const { error: createError } = await supabase.storage.createBucket('listings', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Error creating listings bucket:', createError);
        throw createError;
      }
      
      console.log('Listings bucket created successfully');
    } else {
      console.log('Listings bucket already exists');
    }
    
    // Update the bucket to be public
    console.log('Updating listings bucket to be public...');
    const { error: updateError } = await supabase.storage.updateBucket('listings', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
    });
    
    if (updateError) {
      console.error('Error updating listings bucket:', updateError);
      throw updateError;
    }
    
    console.log('Listings bucket updated successfully');
    
    // Enable RLS on the storage.objects table
    console.log('Enabling RLS on storage.objects table...');
    const { error: rlsError } = await supabase.rpc('enable_rls_on_storage');
    
    if (rlsError && !rlsError.message.includes('function does not exist')) {
      console.error('Error enabling RLS on storage.objects:', rlsError);
      throw rlsError;
    }
    
    // Create the RPC function to enable RLS
    console.log('Creating RPC function to enable RLS...');
    const { error: createFnError } = await supabase.rpc('create_rls_enabler');
    
    if (createFnError && !createFnError.message.includes('function does not exist')) {
      console.error('Error creating RLS enabler function:', createFnError);
      throw createFnError;
    }
    
    console.log('Storage policies setup completed');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the fix
fixStoragePolicies(); 