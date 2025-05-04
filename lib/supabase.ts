import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Env vars with fallback to empty values to prevent accidental authentication
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if the environment variables are defined
const isDemoMode = false 

// Create the Supabase client
export const supabase = typeof window !== 'undefined' 
  ? createClientComponentClient()  // Let Next.js handle the Supabase client configuration
  : createClient(supabaseUrl, supabaseAnonKey)

// Function to check if we're in demo mode
export const isSupabaseDemoMode = () => isDemoMode

// For debugging purposes
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  usingEnvVars: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
})
