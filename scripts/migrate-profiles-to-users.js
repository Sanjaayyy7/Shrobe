/**
 * Script to migrate data from 'profiles' table to 'User' table
 * 
 * To run: 
 * node scripts/migrate-profiles-to-users.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: The environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

// Client with service key for full permissions
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateProfilesToUsers() {
  console.log('🚀 Starting migration from profiles to User...');

  try {
    // 1. Get all existing profiles
    const { data: profiles, error: fetchError } = await supabase
      .from('profiles')
      .select('*');

    if (fetchError) {
      throw new Error(`Error retrieving profiles: ${fetchError.message}`);
    }

    console.log(`📊 Found ${profiles.length} profiles to migrate`);

    // 2. Get all users to have their emails
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      throw new Error(`Error retrieving users: ${usersError.message}`);
    }

    // Create a map of user ID to email
    const userEmailMap = {};
    users.forEach(user => {
      userEmailMap[user.id] = user.email;
    });

    // 3. Process and migrate each profile
    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        // Get the user email
        const userEmail = userEmailMap[profile.id];
        
        if (!userEmail) {
          console.warn(`⚠️ Email not found for user with ID: ${profile.id}`);
          errorCount++;
          continue;
        }

        // Insert into User table
        const { error: insertError } = await supabase
          .from('User')
          .upsert({
            id: profile.id,
            mail: userEmail,
            user_name: profile.username || userEmail.split('@')[0],
            full_name: profile.full_name,
            created_at: profile.created_at
          }, { 
            onConflict: 'id'
          });

        if (insertError) {
          console.error(`❌ Error inserting user ${profile.id}: ${insertError.message}`);
          errorCount++;
        } else {
          console.log(`✅ Migrated: ${profile.username || 'user without name'} (${userEmail})`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error in migration of ${profile.id}: ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Migration summary:');
    console.log(`✅ Successfully migrated: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total processed: ${profiles.length}`);

  } catch (error) {
    console.error(`🔥 Error in migration process: ${error.message}`);
    process.exit(1);
  }
}

// Run the migration
migrateProfilesToUsers().then(() => {
  console.log('🎉 Migration process completed');
  process.exit(0);
}); 