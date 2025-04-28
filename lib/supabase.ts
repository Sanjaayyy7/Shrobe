import { createClient } from "@supabase/supabase-js"

// Make sure we have the environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Check if the environment variables are defined
const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (isDemoMode && typeof window !== 'undefined') {
  console.warn("⚠️ Using Supabase in demo mode - database features will be mocked")
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to check if we're in demo mode
export const isSupabaseDemoMode = () => isDemoMode
