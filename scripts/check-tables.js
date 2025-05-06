/**
 * Script to check Supabase tables
 * 
 * To run: 
 * node scripts/check-tables.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('🔍 Checking tables in Supabase...');

  try {
    // Check profiles table
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (profilesError) {
        console.error('❌ Error accessing profiles table:', profilesError.message);
        console.log('   The table may not exist or you may not have permission to access it');
      } else {
        console.log('✅ The profiles table exists and is accessible');
        
        // Count records
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log('   Could not count records:', countError.message);
        } else {
          console.log(`   The table contains approximately ${count} records`);
        }
      }
    } catch (e) {
      console.error('❌ Error checking profiles table:', e.message);
    }

    console.log('---');

    // Check User table
    try {
      const { data: users, error: usersError } = await supabase
        .from('User')
        .select('count')
        .limit(1);
      
      if (usersError) {
        console.error('❌ Error accessing User table:', usersError.message);
        console.log('   The table may not exist or you may not have permission to access it');
      } else {
        console.log('✅ The User table exists and is accessible');
        
        // Count records
        const { count, error: countError } = await supabase
          .from('User')
          .select('*', { count: 'exact', head: true });
        
        if (countError) {
          console.log('   Could not count records:', countError.message);
        } else {
          console.log(`   The table contains approximately ${count} records`);
        }
      }
    } catch (e) {
      console.error('❌ Error checking User table:', e.message);
    }

  } catch (error) {
    console.error('🔥 General error:', error.message);
  }
}

// Run the verification
checkTables().then(() => {
  console.log('🏁 Verification completed');
  process.exit(0);
}); 