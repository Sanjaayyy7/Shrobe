"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { LogOut, Settings, ChevronLeft } from "lucide-react"
import Header from "@/components/feed/header"

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState({
    fullName: "",
    username: "",
    bio: "",
    profilePic: ""
  })

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("Error checking profile auth:", error)
        router.push("/login")
        return
      }
      
      if (!data?.session?.user) {
        router.push("/login")
        return
      }
      
      // Set user data
      setUser(data.session.user)
      
      console.log("Profile page - user metadata:", data.session.user.user_metadata)
      
      // Verificar si hay datos en localStorage primero
      const localProfile = localStorage.getItem('userProfile')
      if (localProfile) {
        try {
          const parsedProfile = JSON.parse(localProfile)
          setUserProfile({
            fullName: parsedProfile.fullName || data.session.user.user_metadata?.full_name || "User",
            username: parsedProfile.username || data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || "username",
            bio: parsedProfile.bio || data.session.user.user_metadata?.bio || "No bio yet. Edit your profile to add one!",
            profilePic: data.session.user.user_metadata?.avatar_url || ""
          })
          return
        } catch (e) {
          console.error("Error parsing profile from localStorage", e)
        }
      }
      
      // Set profile data from Supabase
      setUserProfile({
        fullName: data.session.user.user_metadata?.full_name || "User",
        username: data.session.user.user_metadata?.username || data.session.user.email?.split('@')[0] || "username",
        bio: data.session.user.user_metadata?.bio || "No bio yet. Edit your profile to add one!",
        profilePic: data.session.user.user_metadata?.avatar_url || ""
      })
    } catch (error) {
      console.error("Profile page error:", error)
      router.push("/login")
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        await loadUserProfile()
      } catch (error) {
        console.error("Profile page error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
    
    // Escuchar cambios en el perfil
    const handleProfileUpdate = (event: any) => {
      if (event.detail) {
        setUserProfile(prev => ({
          ...prev,
          fullName: event.detail.fullName || prev.fullName,
          username: event.detail.username || prev.username,
          bio: event.detail.bio || prev.bio
        }))
      }
    }
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    // También escuchar cambios en las sesiones de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'USER_UPDATED' && session) {
        // Actualizar el perfil cuando los metadatos del usuario cambien
        setUser(session.user)
        setUserProfile(prev => ({
          ...prev,
          fullName: session.user.user_metadata?.full_name || prev.fullName,
          username: session.user.user_metadata?.username || prev.username,
          bio: session.user.user_metadata?.bio || prev.bio
        }))
      }
    })
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
      subscription.unsubscribe()
    }
  }, [router, supabase])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadUserProfile()
      }
    }
  
    document.addEventListener("visibilitychange", handleVisibilityChange)
  
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        router.push("/")
      }
    } catch (err) {
      console.error("Exception during sign out:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header />
      
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/feed"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Feed
            </Link>
          </div>
          
          {/* Profile header */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl mb-8">
            {/* Cover image */}
            <div className="h-40 sm:h-60 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-indigo-500/40 relative">
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            
            {/* Profile info */}
            <div className="flex flex-col md:flex-row px-6 py-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-6 md:left-6 md:relative md:top-auto border-4 border-black rounded-full overflow-hidden">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 flex items-center justify-center rounded-full">
                  <div className="text-3xl font-bold text-white/60">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* User info */}
              <div className="mt-10 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {userProfile.fullName}
                    </h1>
                    <p className="text-gray-400">@{userProfile.username}</p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                      href="/settings"
                      className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/10 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-1.5 md:hidden" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">About</h2>
                    <p className="text-gray-300 mt-1">
                      {userProfile.bio}
                    </p>
                  </div>
                  
                  <div className="flex space-x-6">
                    <div>
                      <span className="text-white font-bold">42</span>
                      <span className="text-gray-400 ml-1">Items</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">138</span>
                      <span className="text-gray-400 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">96</span>
                      <span className="text-gray-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Closet section */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl p-6">
            <h2 className="text-xl font-bold mb-6">Your Closet</h2>
            
            {/* Placeholder for user's wardrobe */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {/* This would come from the database in a real app */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-gray-800/60 flex items-center justify-center animate-pulse">
                  <span className="text-white/30">Item {i+1}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <Link
                href="/closet"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-colors"
              >
                View Full Closet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 