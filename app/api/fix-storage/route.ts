import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user to verify they're authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession()
    
    if (authError || !session) {
      return NextResponse.json(
        { 
          error: 'Unauthorized', 
          message: 'You must be logged in to perform this action' 
        }, 
        { status: 401 }
      )
    }
    
    // Execute the raw SQL to fix RLS policies
    // This is similar to what would be in an RPC function
    
    // First enable RLS if not already enabled
    await supabase.rpc('exec_sql', { 
      sql: 'ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;' 
    })

    // Clean up existing policies to avoid conflicts
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Public Access" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Upload Access" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "listings_public_select" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "listings_authenticated_insert" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "listings_public_insert" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "listings_authenticated_update" ON storage.objects;' 
    })
    
    await supabase.rpc('exec_sql', { 
      sql: 'DROP POLICY IF EXISTS "listings_authenticated_delete" ON storage.objects;' 
    })
    
    // Create read policy
    await supabase.rpc('exec_sql', { 
      sql: `
      CREATE POLICY "listings_public_select"
      ON storage.objects
      FOR SELECT
      USING (bucket_id = 'listings');
      ` 
    })
    
    // Create insert policy for authenticated users
    await supabase.rpc('exec_sql', { 
      sql: `
      CREATE POLICY "listings_authenticated_insert"
      ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'listings');
      ` 
    })
    
    // Create public insert policy - this is critical for allowing anyone to upload
    await supabase.rpc('exec_sql', { 
      sql: `
      CREATE POLICY "listings_public_insert"
      ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'listings');
      ` 
    })
    
    // Create update policy for authenticated users
    await supabase.rpc('exec_sql', { 
      sql: `
      CREATE POLICY "listings_authenticated_update"
      ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'listings');
      ` 
    })
    
    // Create delete policy for authenticated users
    await supabase.rpc('exec_sql', { 
      sql: `
      CREATE POLICY "listings_authenticated_delete"
      ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'listings');
      ` 
    })
    
    // Make sure the bucket exists and is public
    await supabase.rpc('exec_sql', { 
      sql: `
      INSERT INTO storage.buckets (id, name, public)
      VALUES ('listings', 'listings', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
      ` 
    })
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage policies fixed successfully' 
    })
    
  } catch (error: any) {
    console.error('Error fixing storage policies:', error)
    
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: error.message || 'Failed to fix storage policies' 
      }, 
      { status: 500 }
    )
  }
} 