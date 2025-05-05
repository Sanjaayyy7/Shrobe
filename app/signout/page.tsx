'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignoutPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    async function signOut() {
      try {
        setIsLoading(true)
        
        // Sign out from Supabase
        const { error } = await supabase.auth.signOut({ scope: 'global' })
        
        if (error) {
          throw error
        }

        // Clear any localStorage items
        if (typeof window !== 'undefined') {
          // Clear any auth-related localStorage items
          localStorage.removeItem('supabase.auth.token')
          
          // Force a hard redirect to the root to ensure all state is clean
          // We'll do this after a short delay to show the success message
          setTimeout(() => {
            router.push('/')
            router.refresh() // Force Next.js to revalidate
            
            // If still having issues, uncommenting this will force a complete page reload
            // but should generally be avoided in Next.js apps
            // window.location.href = '/'
          }, 2000)
        }
      } catch (err: any) {
        console.error('Error signing out:', err)
        setError(err.message || 'An error occurred while signing out')
      } finally {
        setIsLoading(false)
      }
    }

    signOut()
  }, [supabase, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] px-4">
      <div className="max-w-md w-full space-y-8 bg-black/60 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center">
          {isLoading ? (
            <>
              <div className="w-12 h-12 border-4 border-t-primary-pink border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-white">Signing out...</h2>
            </>
          ) : error ? (
            <>
              <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold text-white mb-2">Sign Out Failed</h2>
              <p className="text-red-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-white text-black rounded-lg font-medium hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <svg className="w-16 h-16 mx-auto mb-4 text-primary-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h2 className="text-3xl font-bold text-white mb-2">You've successfully signed out</h2>
              <p className="text-gray-300 mb-8">Thank you for using Shrobe. Come back soon!</p>
              <p className="text-gray-400 text-sm mb-4">Redirecting you to the home page...</p>
              
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-white/20 text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors"
                >
                  Return to Home
                </Link>
                <Link 
                  href="/login"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-primary-pink to-primary-purple hover:from-primary-purple hover:to-primary-pink transition-all duration-300 shadow-md"
                >
                  Sign In Again
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 