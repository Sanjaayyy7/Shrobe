"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronLeft, Save } from "lucide-react"
import Header from "@/components/feed/header"

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    bio: "",
    email: ""
  })

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Get session
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Error checking settings auth:", error)
          router.push("/login")
          return
        }
        
        if (!data?.session?.user) {
          router.push("/login")
          return
        }
        
        // Set user data
        setUser(data.session.user)
        
        // Initialize form with user data
        setFormData({
          fullName: data.session.user.user_metadata?.full_name || "",
          username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || "",
          bio: data.session.user.user_metadata?.bio || "",
          email: data.session.user.email || ""
        })
        
      } catch (error) {
        console.error("Settings page error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName,
          username: formData.username,
          bio: formData.bio
        }
      })
      
      if (error) {
        console.error("Error updating profile:", error)
        alert("Failed to update profile. Please try again.")
      } else {
        alert("Profile updated successfully!")
      }
    } catch (err) {
      console.error("Exception during profile update:", err)
      alert("An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/profile"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </Link>
          </div>
          
          {/* Settings header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-gray-400 mt-1">Update your profile and preferences</p>
          </div>
          
          {/* Profile settings form */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 bg-black/60 border border-r-0 border-white/20 rounded-l-lg text-gray-400">
                      @
                    </span>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2.5 bg-black/40 border border-white/20 rounded-r-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
          
          {/* Account settings */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-6">Account Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-400">Manage your email notifications</p>
                </div>
                <Link
                  href="/settings/notifications"
                  className="text-sm font-medium text-pink-500 hover:text-pink-400 transition-colors"
                >
                  Manage
                </Link>
              </div>
              
              <div className="flex items-center justify-between py-3 border-b border-white/10">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-400">Update your password</p>
                </div>
                <Link
                  href="/settings/password"
                  className="text-sm font-medium text-pink-500 hover:text-pink-400 transition-colors"
                >
                  Update
                </Link>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="font-medium text-red-500">Delete Account</h3>
                  <p className="text-sm text-gray-400">Permanently delete your account</p>
                </div>
                <button
                  className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 