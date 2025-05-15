"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
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
    email: "",
    biography: ""
  })
  const [originalUsername, setOriginalUsername] = useState("")
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [usernameError, setUsernameError] = useState("")
  const [checkingUsername, setCheckingUsername] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        console.error("No authenticated user", userError)
        router.push("/login")
        return
      }

      setUser(user)

      const { data: profileData, error: profileError } = await supabase
        .from("profile")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        return
      }

      setOriginalUsername(profileData.user_name || "")
      setFormData({
        fullName: profileData.full_name || "",
        username: profileData.user_name || "",
        email: profileData.mail || user.email || "",
        biography: profileData.biography || "",
      })
      setLoading(false)
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setSaveSuccess(false)
    setSaveError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError("")
    setSaveSuccess(false)

    if (!user) {
      setSaveError("No user authenticated.")
      setSaving(false)
      return
    }

    const { error } = await supabase
      .from("profile")
      .update({
        full_name: formData.fullName,
        user_name: formData.username,
        biography: formData.biography,
      })
      .eq("id", user.id)

    if (error) {
      setSaveError("Failed to update profile.")
      console.error("Update error:", error)
    } else {
      setSaveSuccess(true)
    }

    setSaving(false)
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
      <Header />
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/profile" className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold">Edit Profile</h1>
            <p className="text-gray-400 mt-1">Make changes to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6">
            <div className="space-y-6">
              {saveSuccess && (
                <div className="bg-green-900/60 border border-green-500/50 rounded-md p-4 text-green-200">
                  Profile updated successfully!
                </div>
              )}
              {saveError && (
                <div className="bg-red-900/60 border border-red-500/50 rounded-md p-4 text-red-200">
                  {saveError}
                </div>
              )}

              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
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
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 bg-black/60 border border-white/10 rounded-lg text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="biography" className="block text-sm font-medium text-gray-300 mb-1">Biography</label>
                <textarea
                  id="biography"
                  name="biography"
                  value={formData.biography}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
                />
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
      </div>
    </main>
  )
}
