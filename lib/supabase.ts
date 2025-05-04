import { createClient } from "@supabase/supabase-js"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Env vars with fallback to hardcoded values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hviofamhcgqukpenyjjv.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh2aW9mYW1oY2dxdWtwZW55amp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MTEwNjksImV4cCI6MjA2MTE4NzA2OX0.NA8gvvyKVlhAsdcM2f6mWCCYzTE5aD7WsTZateBNGMk'

// Check if the environment variables are defined
const isDemoMode = false // We're no longer using demo mode since we hardcoded the values

// Create the Supabase client
export const supabase = typeof window !== 'undefined' 
  ? createClientComponentClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    })
  : createClient(supabaseUrl, supabaseAnonKey)

// Function to check if we're in demo mode
export const isSupabaseDemoMode = () => isDemoMode

// For debugging purposes
export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  usingEnvVars: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
})
