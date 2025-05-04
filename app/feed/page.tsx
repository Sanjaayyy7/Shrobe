"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import Image from "next/image"
import { motion, useAnimation, useScroll, useTransform, AnimatePresence } from "framer-motion"

import Header from "@/components/feed/header"
import DiscoveryCarousel from "@/components/feed/discovery-carousel"
import CategoryNavigation from "@/components/feed/category-navigation"
import MasonryGrid from "@/components/feed/masonry-grid"
import UserAvatarStories from "@/components/feed/user-avatar-stories"

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  // Create parallax effect when scrolling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Transform values for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.3, 1, 1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05])
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100])
  
  // Animate in when in view
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking authentication status...")
        setIsLoading(true)
        
        // Get the session from Supabase
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
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your style feed...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">Authentication Required</h1>
          <p className="text-lg mb-8 text-gray-300">Please sign in to access your fashion feed</p>
          <Link href="/login" className="relative inline-block group">
            <span className="inline-block bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white font-medium text-lg py-3 px-8 rounded-full z-10 relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,101,197,0.4)]">
              Sign In
            </span>
            <span className="absolute inset-0 bg-white rounded-full blur-md z-0 opacity-50 group-hover:opacity-70"></span>
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Background Elements - subtle gradient instead of rotating images */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#131313] to-[#0f0f0f]"></div>
        
        {/* Subtle dots pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        
        {/* Very subtle color gradient at the top */}
        <div className="absolute top-0 left-0 right-0 h-[30vh] bg-gradient-to-b from-[#ff65c5]/5 to-transparent"></div>
      </div>
      
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content */}
      <div className="pt-20">
        {/* Today's Looks Heading Section */}
        <motion.section 
          ref={containerRef}
          className="relative py-6 mb-4"
          style={{ opacity, scale }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-7xl mx-auto md:text-left text-center">
              {/* Main title */}
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                Today's Looks
              </h2>
              
              {/* Description */}
              <p className="text-base text-gray-300 max-w-2xl md:mx-0 mx-auto">
                Discover trending styles and available rentals near you
              </p>
            </div>
          </div>
        </motion.section>

        <div className="container mx-auto px-4 pb-12 relative z-10">
          {/* User Avatars Stories (Instagram-inspired) */}
          <motion.section 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <UserAvatarStories />
          </motion.section>
          
          {/* Filter Bar (Pinterest/Airbnb-inspired) */}
          <motion.section 
            className="mb-8 sticky top-16 z-30 bg-[#0f0f0f]/80 backdrop-blur-md py-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <CategoryNavigation />
          </motion.section>
          
          {/* Pinterest-Style Masonry Grid */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <MasonryGrid />
          </motion.section>
        </div>
      </div>
    </main>
  )
} 