"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { motion, useAnimation, AnimatePresence, cubicBezier } from "framer-motion"
import { Search, CameraIcon, Bell, Home, User, Sparkles, ArrowRight, Plus } from "lucide-react"
import Image from "next/image"

// Import components
import Header from "@/components/feed/header"
import MasonryGrid from "@/components/feed/masonry-grid"
import UserAvatarStories from "@/components/feed/user-avatar-stories"
import UserClosetHighlights from "@/components/feed/user-closet-highlights"
import GradientBackground from "@/components/gradient-background"
import AnimatedBackground from "@/components/animated-background"
import ListingGrid from "@/components/listings/listing-grid"

// Custom ease curves matching Lyniq
const lyniqEase = cubicBezier(0.16, 1, 0.3, 1);

// Custom Shrobe logo for preloader
const ShrobeLogo = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.5, ease: lyniqEase }
    }}
    className="relative"
  >
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M12 3C10.4 3 9 4.3 9 6C9 7.7 10.4 9 12 9C13.6 9 15 7.7 15 6C15 4.3 13.6 3 12 3ZM21 18L21 18L21 18L12 10L3 18V20C3 20.6 3.4 21 4 21H20C20.6 21 21 20.6 21 20V18ZM3 16L12 8L21 16V15L12 7L3 15V16Z" 
        fill="url(#shrobe-gradient)"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#ffffff20"
      />
      <defs>
        <linearGradient id="shrobe-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ff65c5" />
          <stop offset="100%" stopColor="#c7aeef" />
        </linearGradient>
      </defs>
    </svg>
    
    <motion.div 
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0, 0.5, 0],
        scale: [1, 1.2, 1], 
        transition: { 
          repeat: Infinity, 
          duration: 2,
          ease: "easeInOut"
        } 
      }}
    >
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M12 3C10.4 3 9 4.3 9 6C9 7.7 10.4 9 12 9C13.6 9 15 7.7 15 6C15 4.3 13.6 3 12 3ZM21 18L21 18L21 18L12 10L3 18V20C3 20.6 3.4 21 4 21H20C20.6 21 21 20.6 21 20V18ZM3 16L12 8L21 16V15L12 7L3 15V16Z" 
          fill="none"
          stroke="url(#shrobe-pulse-gradient)"
          strokeWidth="0.5"
        />
        <defs>
          <linearGradient id="shrobe-pulse-gradient" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff65c5" />
            <stop offset="100%" stopColor="#c7aeef" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  </motion.div>
);

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  
  // Animate in when in view
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])
  
  // Simulate preloader timing (Lyniq style with 2.4s duration)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 2400);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Feed page - Checking authentication status...")

        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()
        
        console.log("Feed page - Auth session response:", { data, error })
        
        if (error) {
          console.error("Feed page - Session error:", error)
          router.push("/login")
          return
        }
        
        if (!data?.session?.user) {
          console.log("Feed page - No active session, redirecting to login")
          router.push("/login")
        } else {
          console.log("Feed page - User authenticated:", data.session.user.email)
          setIsAuthenticated(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Feed page - Authentication error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your style feed...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
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
    <>
      {/* Lyniq-style Preloader */}
      <AnimatePresence>
        {isPageLoading && (
          <motion.div 
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0,
              transition: { 
                duration: 0.8, 
                ease: lyniqEase,
                delay: 0.1
              }
            }}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  duration: 0.6, 
                  ease: lyniqEase
                }
              }}
            >
              <ShrobeLogo />
              
              <div className="mt-8 overflow-hidden h-8">
                <motion.p 
                  className="text-white/90 font-medium text-center"
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ 
                    y: 0, 
                    opacity: 1,
                    transition: { 
                      delay: 0.3,
                      duration: 0.6, 
                      ease: lyniqEase
                    }
                  }}
                >
                  Styling your closet
                </motion.p>
              </div>
            </motion.div>
            
            {/* Loading indicator - Lyniq style */}
            <motion.div 
              className="absolute bottom-12 left-0 right-0 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { 
                  delay: 0.5, 
                  duration: 0.5 
                }
              }}
            >
              <motion.div 
                className="h-0.5 bg-white/10 w-20 relative overflow-hidden rounded-full"
              >
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#ff65c5] to-[#c7aeef]"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: "100%",
                    transition: { 
                      duration: 2, 
                      ease: "easeInOut" 
                    }
                  }}
                />
              </motion.div>
            </motion.div>
            
            {/* Gradient background - Lyniq style but with Shrobe colors */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute -inset-[100px] blur-3xl opacity-20"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.2, 0.25, 0.2],
                  transition: { 
                    repeat: Infinity, 
                    duration: 15, 
                    ease: "easeInOut" 
                  }
                }}
              >
                <motion.div 
                  className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[#ff65c5]"
                  animate={{ 
                    y: [0, -30, 0],
                    x: [0, 20, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 10, 
                      ease: "easeInOut" 
                    }
                  }}
                />
                <motion.div 
                  className="absolute bottom-1/4 right-1/3 w-[700px] h-[700px] rounded-full bg-[#c7aeef]"
                  animate={{ 
                    y: [0, 30, 0],
                    x: [0, -20, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 12, 
                      ease: "easeInOut",
                      delay: 0.5
                    }
                  }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <Header />
        
        <div className="container mx-auto px-4 pt-24 pb-20">
          {/* User Avatar Stories */}
          <div className="mb-12">
            <UserAvatarStories />
          </div>
          
          {/* Featured Closets */}
          <div className="mb-12">
            <UserClosetHighlights />
          </div>
          
          {/* Main content */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Browse Listings</h2>
              <Link 
                href="/listings/create" 
                className="bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create Listing
              </Link>
            </div>
            
            {/* Listing Grid */}
            <ListingGrid />
          </div>
        </div>
        
        {/* Footer Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10 py-3 px-4 z-40">
          <div className="container mx-auto">
            <div className="flex justify-around items-center">
              <Link href="/feed" className="flex flex-col items-center text-[#FF5CB1]">
                <Home className="w-6 h-6" />
                <span className="text-xs mt-1">Home</span>
              </Link>
              <Link href="/search" className="flex flex-col items-center text-white/60">
                <Search className="w-6 h-6" />
                <span className="text-xs mt-1">Search</span>
              </Link>
              <Link href="/listings/create" className="flex flex-col items-center text-white/60">
                <CameraIcon className="w-6 h-6" />
                <span className="text-xs mt-1">Create</span>
              </Link>
              <Link href="/notifications" className="flex flex-col items-center text-white/60">
                <Bell className="w-6 h-6" />
                <span className="text-xs mt-1">Alerts</span>
              </Link>
              <Link href="/profile" className="flex flex-col items-center text-white/60">
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 