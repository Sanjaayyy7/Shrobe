require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('Applying storage policies migration...');
    
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'storage_policies.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Apply the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error applying migration:', error);
      throw error;
    }
    
    console.log('Storage policies migration applied successfully');
    
    // Create the listings bucket if it doesn't exist
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
    
    // Set up the policies for the listings bucket
    console.log('Setting up policies for listings bucket...');
    const { error: policiesError } = await supabase.rpc('setup_storage_policies', { bucket_name: 'listings' });
    
    if (policiesError) {
      console.error('Error setting up storage policies:', policiesError);
      throw policiesError;
    }
    
    console.log('Storage policies set up successfully');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration(); 