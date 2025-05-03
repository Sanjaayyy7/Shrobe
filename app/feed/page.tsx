"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"

import Header from "@/components/feed/header"
import DiscoveryCarousel from "@/components/feed/discovery-carousel"
import CategoryNavigation from "@/components/feed/category-navigation"
import MasonryGrid from "@/components/feed/masonry-grid"

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...")
        setIsLoading(true)
        
        // Check for demo mode login
        const demoUser = typeof window !== 'undefined' ? localStorage.getItem('shrobe_demo_user') : null
        
        if (demoUser) {
          console.log("Demo user found in local storage")
          setIsAuthenticated(true)
          setIsLoading(false)
          return
        }
        
        // Proceed with real authentication
        const { data, error } = await supabase.auth.getSession()
        
        console.log("Auth session response:", { data, error })
        
        if (error) {
          console.error("Session error:", error)
          return
        }
        
        if (!data.session) {
          console.log("No active session, redirecting to login")
          router.push("/login")
        } else {
          console.log("User authenticated:", data.session.user.email)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#E91E63] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
          <p className="text-lg mb-8">Please sign in to access this page</p>
          <Link href="/login" className="inline-flex items-center px-6 py-3 rounded-full bg-[#E91E63] text-white font-medium hover:bg-[#D81B60] transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        {/* Background gradient/animation can go here */}
      </div>
      
      {/* Fixed Header */}
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Discovery Carousel (Tinder-inspired) */}
        <section className="mb-8">
          <DiscoveryCarousel />
        </section>
        
        {/* Category Navigation (Spotify/Airbnb-inspired) */}
        <section className="mb-8">
          <CategoryNavigation />
        </section>
        
        {/* Pinterest-Style Masonry Grid */}
        <section>
          <MasonryGrid />
        </section>
      </div>
    </main>
  )
} 