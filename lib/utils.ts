import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Checks if Supabase environment variables are properly configured
 */
export function checkSupabaseConfig(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables")
    return false
  }

  return true
}

/**
 * Formats an error message for display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle duplicate email error
    if (error.message.includes("duplicate key") || error.message.includes("unique constraint")) {
      return "This email is already registered with us."
    }
    return error.message
  }
  return "An unexpected error occurred. Please try again."
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
