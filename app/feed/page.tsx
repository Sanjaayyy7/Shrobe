"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { motion, useAnimation, AnimatePresence, cubicBezier } from "framer-motion"
import { Search, CameraIcon, Bell, Home, User, Sparkles, ArrowRight } from "lucide-react"
import Image from "next/image"

// Import components
import Header from "@/components/feed/header"
import MasonryGrid from "@/components/feed/masonry-grid"
import UserAvatarStories from "@/components/feed/user-avatar-stories"
import UserClosetHighlights from "@/components/feed/user-closet-highlights"
import GradientBackground from "@/components/gradient-background"
import AnimatedBackground from "@/components/animated-background"

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

      <main className="bg-[#0B0B0B] text-white min-h-screen overflow-x-hidden">
        {/* Subtle Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <GradientBackground />
          <AnimatedBackground variant="dots" opacity={0.05} />
        </div>
        
        {/* Fixed Header */}
        <Header />
        
        {/* Main Content Container */}
        <div className="pt-20 relative z-10">
          {/* Lyniq-inspired Hero Section */}
          <motion.section 
            className="min-h-[90vh] relative flex items-center"
            initial="initial"
            animate="animate"
            variants={{
              initial: {},
              animate: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1
                }
              }
            }}
          >
            {/* Background gradient animation - Lyniq style */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div 
                className="absolute -inset-[100px] blur-3xl opacity-10"
                animate={{ 
                  scale: [1, 1.05, 1],
                  opacity: [0.1, 0.15, 0.1],
                  transition: { 
                    repeat: Infinity, 
                    duration: 20, 
                    ease: "easeInOut" 
                  }
                }}
              >
                <motion.div 
                  className="absolute top-1/3 left-1/4 w-[800px] h-[800px] rounded-full bg-[#ff65c5]"
                  animate={{ 
                    y: [0, -50, 0],
                    x: [0, 30, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 18, 
                      ease: "easeInOut" 
                    }
                  }}
                />
                <motion.div 
                  className="absolute bottom-1/4 right-1/3 w-[900px] h-[900px] rounded-full bg-[#c7aeef]"
                  animate={{ 
                    y: [0, 50, 0],
                    x: [0, -30, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 15, 
                      ease: "easeInOut",
                      delay: 1
                    }
                  }}
                />
              </motion.div>
            </div>
            
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-5 gap-12 z-10">
              {/* Text Column - Lyniq-inspired (3/5 width) */}
              <div className="lg:col-span-3 flex flex-col justify-center">
                {/* Title with reveal animation - exactly like Lyniq */}
                <div className="overflow-hidden relative mb-4">
                  <motion.h1 
                    className="text-5xl sm:text-6xl md:text-[5.5rem] font-bold leading-[1.1] tracking-[-0.02em]"
                    variants={{
                      initial: { y: 150, opacity: 0.5 },
                      animate: { 
                        y: 0, 
                        opacity: 1,
                        transition: {
                          duration: 1,
                          ease: lyniqEase
                        }
                      }
                    }}
                  >
                    <span className="block">Discover Fashion</span>
                    <span className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">Worth Sharing</span>
                  </motion.h1>
                </div>
                
                <motion.p 
                  className="text-xl md:text-2xl text-white/70 mt-2 mb-10 max-w-2xl"
                  variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.8,
                        ease: lyniqEase
                      }
                    }
                  }}
                >
                  Find unique styles from creators around you or share your own collection.
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-5 mt-4"
                  variants={{
                    initial: { opacity: 0, y: 30 },
                    animate: { 
                      opacity: 1, 
                      y: 0,
                      transition: {
                        duration: 0.6,
                        ease: lyniqEase
                      }
                    }
                  }}
                >
                  <motion.button
                    className="px-8 py-3.5 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white font-medium text-lg rounded-lg flex items-center shadow-lg"
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: "0 0 30px rgba(255,101,197,0.4)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Start Exploring
                  </motion.button>
                  
                  <motion.button
                    className="px-8 py-3.5 bg-[#ffffff08] backdrop-blur-sm border border-white/15 text-white font-medium text-lg rounded-lg flex items-center"
                    whileHover={{ 
                      scale: 1.03, 
                      backgroundColor: "rgba(255,255,255,0.1)",
                      borderColor: "rgba(255,255,255,0.25)" 
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Upload Your Style
                  </motion.button>
                </motion.div>
              </div>
              
              {/* Visual Column - Lyniq-inspired floating cards (2/5 width) */}
              <div className="lg:col-span-2 relative h-[620px] hidden lg:block">
                {/* Floating fashion closet card 1 */}
                <motion.div
                  className="absolute top-12 right-10 z-30 w-[260px] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                  variants={{
                    initial: { opacity: 0, y: 80, x: 50, rotate: 6 },
                    animate: { 
                      opacity: 1, 
                      y: 0,
                      x: 0, 
                      rotate: 0,
                      transition: {
                        duration: 1.2,
                        ease: lyniqEase
                      }
                    }
                  }}
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 1, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 8, 
                      ease: "easeInOut" 
                    }
                  }}
                >
                  <div className="relative w-full aspect-[4/5] bg-[#111]">
                    <Image 
                      src="/images/uploads/fashion-red-sequin.jpg"
                      fill
                      alt="Fashion item"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 p-6">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 rounded-full border-2 border-white/30 overflow-hidden relative mr-3">
                          <Image 
                            src="/images/avatars/sophia.jpg"
                            fill
                            alt="Creator avatar"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">Sophia Davis</p>
                          <p className="text-white/70 text-xs">@sophiastyle</p>
                        </div>
                      </div>
                      <h3 className="text-white text-xl font-semibold mb-2">Evening Collection</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-[#ff65c5]/30 rounded-full text-white/90 text-xs">Luxury</span>
                        <span className="px-3 py-1 bg-white/10 rounded-full text-white/90 text-xs">34 items</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating fashion item card 2 */}
                <motion.div
                  className="absolute bottom-20 left-0 z-20 w-[220px] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                  variants={{
                    initial: { opacity: 0, y: 100, x: -40, rotate: -5 },
                    animate: { 
                      opacity: 1, 
                      y: 0, 
                      x: 0,
                      rotate: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.1,
                        ease: lyniqEase
                      }
                    }
                  }}
                  animate={{ 
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    rotate: [0, -1, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 10, 
                      ease: "easeInOut",
                      delay: 1
                    }
                  }}
                >
                  <div className="relative w-full aspect-[3/4] bg-[#111]">
                    <Image 
                      src="/images/uploads/fashion-coastal-sunset.jpg"
                      fill
                      alt="Fashion item"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60"></div>
                    <div className="absolute bottom-0 left-0 p-5">
                      <div className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full inline-flex items-center mb-2">
                        <span className="w-2 h-2 rounded-full bg-[#c7aeef] mr-2"></span>
                        <span className="text-white text-xs font-medium">Trending now</span>
                      </div>
                      <h3 className="text-white text-lg font-semibold mb-1">Knit Cardigan</h3>
                      <p className="text-white/70 text-xs mb-3">By Alex Chen</p>
                      <div className="flex justify-between items-center">
                        <span className="text-white/90 font-semibold">$32/day</span>
                        <span className="px-2 py-1 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] rounded-full text-white text-xs">Available</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Floating fashion outfit card 3 */}
                <motion.div
                  className="absolute top-[40%] left-16 z-10 w-[180px] rounded-2xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]"
                  variants={{
                    initial: { opacity: 0, y: 70, x: 30, rotate: 8 },
                    animate: { 
                      opacity: 1, 
                      y: 0, 
                      x: 0,
                      rotate: 0,
                      transition: {
                        duration: 1.2,
                        delay: 0.2,
                        ease: lyniqEase
                      }
                    }
                  }}
                  animate={{ 
                    y: [0, -15, 0],
                    x: [0, -5, 0],
                    rotate: [0, 2, 0],
                    transition: { 
                      repeat: Infinity, 
                      duration: 9, 
                      ease: "easeInOut",
                      delay: 0.5
                    }
                  }}
                >
                  <div className="relative w-full aspect-[3/4] bg-[#111]">
                    <Image 
                      src="/images/uploads/fashion-festival-outfit.jpg"
                      fill
                      alt="Fashion item"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-70"></div>
                    <div className="absolute bottom-0 left-0 p-4">
                      <span className="px-2 py-1 bg-[#ff65c5]/30 rounded-full text-white/90 text-xs mb-2 inline-block">Festival</span>
                      <h3 className="text-white text-base font-semibold mb-1">Summer Ready</h3>
                      <div className="flex items-center">
                        <div className="w-5 h-5 rounded-full overflow-hidden relative mr-1.5">
                          <Image 
                            src="/images/avatars/isabella.jpg"
                            fill
                            alt="Creator avatar"
                            className="object-cover"
                          />
                        </div>
                        <p className="text-white/70 text-xs">@bellafestival</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Decorative elements - sparkles, gradient accents */}
                <motion.div 
                  className="absolute top-[15%] left-[20%] w-6 h-6 text-[#ff65c5]"
                  variants={{
                    initial: { opacity: 0, scale: 0 },
                    animate: { 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      transition: {
                        duration: 3,
                        times: [0, 0.2, 1],
                        repeat: Infinity,
                        delay: 2,
                        repeatDelay: 7
                      }
                    }
                  }}
                >
                  <Sparkles className="w-full h-full" />
                </motion.div>
                
                <motion.div 
                  className="absolute bottom-[30%] right-[10%] w-4 h-4 text-[#c7aeef]"
                  variants={{
                    initial: { opacity: 0, scale: 0 },
                    animate: { 
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      transition: {
                        duration: 3,
                        times: [0, 0.2, 1],
                        repeat: Infinity,
                        delay: 4,
                        repeatDelay: 6
                      }
                    }
                  }}
                >
                  <Sparkles className="w-full h-full" />
                </motion.div>
                
                {/* Floating gradient circle */}
                <motion.div 
                  className="absolute top-[60%] right-[30%] w-28 h-28 rounded-full bg-gradient-to-r from-[#ff65c5]/10 to-[#c7aeef]/10 backdrop-blur-sm"
                  variants={{
                    initial: { opacity: 0, scale: 0 },
                    animate: { 
                      opacity: 0.7, 
                      scale: 1,
                      transition: {
                        duration: 0.8,
                        delay: 0.5,
                        ease: lyniqEase
                      }
                    }
                  }}
                  animate={{ 
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 0.5, 0.7],
                    transition: { 
                      repeat: Infinity, 
                      duration: 8, 
                      ease: "easeInOut" 
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Scroll indicator - Lyniq-style */}
            <motion.div 
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2 hidden md:flex flex-col items-center"
              variants={{
                initial: { opacity: 0, y: -20 },
                animate: { 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.8,
                    delay: 1.2,
                    ease: "easeOut"
                  }
                }
              }}
              animate={{ 
                y: [0, 8, 0],
                transition: { 
                  repeat: Infinity, 
                  duration: 2, 
                  ease: "easeInOut" 
                }
              }}
            >
              <p className="text-white/50 text-sm mb-2">Scroll to explore</p>
              <ArrowRight className="w-5 h-5 text-white/50 rotate-90" />
            </motion.div>
          </motion.section>
          
          {/* User Avatars Stories Section */}
          <motion.section 
            className="container mx-auto px-4 mb-12"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <UserAvatarStories />
          </motion.section>
          
          {/* User Closet Highlights Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="container mx-auto px-4 mb-12"
          >
            <UserClosetHighlights />
          </motion.section>
          
          {/* Separator with Gradient */}
          <motion.div 
            className="container mx-auto px-4 my-8"
            initial={{ opacity: 0, width: "0%" }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ff65c5]/40 to-transparent"></div>
          </motion.div>
          
          {/* Main Masonry Grid */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.4 }}
            className="pb-20"
          >
            <MasonryGrid />
          </motion.section>
          
          {/* App Navigation Bar - Mobile */}
          <motion.div 
            className="fixed bottom-0 left-0 right-0 bg-[#0B0B0B]/95 backdrop-blur-md border-t border-white/10 py-3 md:hidden z-50"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, delay: 1.6 }}
          >
            <div className="flex justify-around items-center">
              <button className="flex flex-col items-center justify-center">
                <Home className="w-6 h-6 text-white" />
                <span className="text-xs text-white/70 mt-1">Home</span>
              </button>
              <button className="flex flex-col items-center justify-center">
                <Search className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/70 mt-1">Search</span>
              </button>
              <button className="flex flex-col items-center justify-center">
                <div className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] p-1 rounded-full">
                  <CameraIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs text-white/70 mt-1">Share</span>
              </button>
              <button className="flex flex-col items-center justify-center">
                <Bell className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/70 mt-1">Alerts</span>
              </button>
              <button className="flex flex-col items-center justify-center">
                <User className="w-6 h-6 text-white/70" />
                <span className="text-xs text-white/70 mt-1">Profile</span>
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </>
  )
} 