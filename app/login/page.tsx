'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, getSupabaseConfig } from '@/lib/supabase'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supabaseConnected, setSupabaseConnected] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // If user is logged in, redirect to feed page
        router.push("/feed")
      }
    }

    checkAuth()
  }, [router, supabase])
  
  // Check if Supabase is properly configured
  useEffect(() => {
    const config = getSupabaseConfig()
    if (!config.url || !config.hasKey) {
      console.error('Supabase configuration missing. URL or Key not set.')
      setSupabaseConnected(false)
      setError('Supabase configuration is incomplete. Please check your environment variables.')
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!supabaseConnected) {
      setError('Cannot connect to authentication service. Please try again later.')
      setLoading(false)
      return
    }

    try {
      console.log('Attempting to sign in with:', email)
      
      // Use Supabase's auth.signInWithPassword method
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Authentication error:', error)
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.')
        } else {
          throw error
        }
      }

      if (data?.user) {
        console.log('Login successful, redirecting to feed')
        router.push('/feed')
      } else {
        throw new Error('Successfully authenticated but no user data found')
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'An error occurred during sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#111]">
      <div className="max-w-md w-full space-y-8 bg-black/60 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="font-medium text-primary-pink hover:text-primary-purple transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>
        
        <form className="mt-6 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white rounded-lg bg-black/40 focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-white/20 placeholder-gray-400 text-white rounded-lg bg-black/40 focus:outline-none focus:ring-2 focus:ring-primary-pink focus:border-transparent sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-900/60 p-4 border border-red-500/50">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Error icon */}
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-300">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !supabaseConnected}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary-pink to-primary-purple hover:from-primary-purple hover:to-primary-pink focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-pink disabled:opacity-50 transition-all duration-300 shadow-md"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <Link 
              href="#" 
              className="font-medium text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
          
          <div className="text-xs text-center text-gray-400">
            <p>Need a demo account? Use:</p>
            <p className="mt-1 text-white/70 font-mono">test@example.com / testpassword123</p>
          </div>
        </form>
      </div>
    </div>
  )
} 