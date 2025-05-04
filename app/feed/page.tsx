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

// Style images for the background rotation
const styleImages = [
  "/images/uploads/fashion-coastal-sunset.jpg",
  "/images/uploads/fashion-red-sequin.jpg",
  "/images/uploads/fashion-festival-outfit.jpg", 
  "/images/uploads/fashion-western-inspired.jpg"
]

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
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
  const rotateBackground = useTransform(scrollYProgress, [0, 1], [0, -5])
  
  // Cycle through images in background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % styleImages.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Animate in when in view
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])
  
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
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your style feed...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
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
    <main className="min-h-screen bg-black text-white relative">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Animated background dots */}
        <motion.div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            rotate: rotateBackground
          }}
        />
        
        {/* Rotating background images */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.3, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 1.2, ease: [0.4, 0.0, 0.2, 1] }}
            >
              <Image
                src={styleImages[currentImageIndex]}
                alt="Fashion style"
                fill
                className="object-cover blur-sm"
                priority
                loading="eager"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Pink to purple gradient overlay */}
        <div className="absolute inset-0 bg-gradient-radial from-[#ff65c5]/20 via-black/80 to-black/90 z-0"></div>
      </div>
      
      {/* Fixed Header */}
      <Header />
      
      {/* Main Content */}
      <div>
        {/* Hero Section with Title */}
        <motion.section 
          ref={containerRef}
          className="relative overflow-hidden min-h-[60vh] flex items-center mb-8"
          style={{ opacity, scale }}
        >
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              {/* Subtitle with slide-in animation */}
              <motion.span 
                className="text-[#ff65c5] text-sm md:text-base uppercase tracking-wider inline-block mb-4 font-medium"
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.6 }}
              >
                WELCOME TO YOUR PERSONAL STYLE FEED
              </motion.span>
              
              {/* Main title with character-by-character animation */}
              <div className="overflow-hidden">
                <motion.h2 
                  className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tighter"
                  style={{ y: textY }}
                >
                  {"Today's Looks".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      className="inline-block"
                      initial={{ opacity: 0, y: 60 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.05 * index,
                        ease: "easeOut" 
                      }}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h2>
              </div>
              
              {/* Description with fade-in animation */}
              <motion.p 
                className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={controls}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Discover trending styles and available rentals near you
              </motion.p>
            </div>
          </div>
        </motion.section>

        <div className="container mx-auto px-4 pb-12 relative z-10">
          {/* Discovery Carousel (Tinder-inspired) */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <DiscoveryCarousel />
          </motion.section>
          
          {/* Category Navigation (Spotify/Airbnb-inspired) */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <CategoryNavigation />
          </motion.section>
          
          {/* Pinterest-Style Masonry Grid */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <MasonryGrid />
          </motion.section>
        </div>
      </div>
    </main>
  )
} 