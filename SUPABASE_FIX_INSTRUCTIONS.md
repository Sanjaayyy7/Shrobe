# Supabase Fix Instructions

This document contains instructions to fix the following issues:
1. Image upload failures due to row-level security policy
2. Error fetching user profiles
3. Other related Supabase permission issues

## Option 1: Fix via Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor
4. Run the following SQL files in order:
   - `supabase/migrations/fix_storage_rls.sql`
   - `supabase/migrations/fix_user_table.sql`

## Option 2: Run the Fix Scripts Locally

1. Make sure you have Node.js installed
2. Install dependencies:
   ```
   npm install dotenv @supabase/supabase-js
   ```
3. Run the fix script:
   ```
   node scripts/fix-storage-policies.js
   ```

## Verifying the Fixes

After applying the fixes, you should be able to:
1. Upload images to your listings
2. See user profiles correctly
3. Create and view listings without errors

## Manual Bucket Creation (if needed)

If you're still having issues with the storage bucket, you can manually create it:

1. Go to the Supabase dashboard
2. Navigate to Storage
3. Click "New Bucket"
4. Name it "listings"
5. Check "Public bucket" to make it publicly accessible
6. Click "Create bucket"

## Manual RLS Policy Creation (if needed)

If you're still having issues with RLS policies, you can manually create them:

1. Go to the Supabase dashboard
2. Navigate to Storage
3. Click on the "listings" bucket
4. Go to the "Policies" tab
5. Add the following policies:
   - INSERT policy for authenticated users
   - SELECT policy for public
   - UPDATE policy for authenticated users (only their own files)
   - DELETE policy for authenticated users (only their own files)

## User Table Issues

If you're still having issues with the User table:

1. Go to the Supabase dashboard
2. Navigate to Database
3. Check if the "User" table exists in the public schema
4. If not, run the `fix_user_table.sql` script
5. Verify that RLS policies are enabled and properly configured 