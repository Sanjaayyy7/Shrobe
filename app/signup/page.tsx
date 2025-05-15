'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import toast from 'react-hot-toast'

function calculateAge(dateString: string): number {
  const today = new Date()
  const birthDate = new Date(dateString)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

function verifyUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]+$/.test(username)
}

async function usernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profile')
    .select('user_name')
    .eq('user_name', username)
    .maybeSingle()

  return !!data
}

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [age, setAge] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const age = calculateAge(dateOfBirth)

    if (age < 10 || age > 100) {
      setError('Age must be between 10 and 100 years')
      setLoading(false)
      return
    }

    // Check if username already exists
    if (!verifyUsername(username)) {
      setError("Username must contain only letters and numbers")
      setLoading(false)
      return
    }

    const exists = await usernameExists(username)
    if (exists) {
      setError("This username is already taken")
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_name: username,
            age: age,
            date_of_birth: dateOfBirth,
          },
        },
      })

      if (error) {
        toast.error(`Registration failed: ${error.message}`)
        throw error
      }

      const { error: insertError } = await supabase.from('profile').insert({
        id: data?.user?.id,
        mail: email,
        user_name: username,
        full_name: fullName,
        age: age,
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('Error inserting into profile:', insertError.message)
        toast.error('User created, but failed to save profile info')
      }

      if (data?.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('This email is already registered')
        } else {
          toast.success('Account created! Redirecting...')
          router.push('/feed')
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-[#111]">
      <div className="max-w-md w-full space-y-8 bg-black/60 backdrop-blur-lg p-8 rounded-2xl border border-white/10 shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white">Create your account</h2>
        <p className="text-center text-sm text-gray-300">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-pink hover:text-primary-purple font-medium transition-colors"
          >
            Sign in instead
          </Link>
        </p>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />
          <input
            type="text"
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />
          <input
            type="text"
            required
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />
          <input
            type="date"
            placeholder="Date of Birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />
          <input
            type="password"
            required
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/20 text-white placeholder-gray-400"
          />

          {error && (
            <div className="text-red-400 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-primary-pink to-primary-purple text-white font-medium transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
