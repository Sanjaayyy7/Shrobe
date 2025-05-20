"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, MessageSquare, User, Plus, Menu, Home, LogOut, Settings, UserCircle} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Define a type for the custom user update event
declare global {
  interface WindowEventMap {
    'userProfileUpdated': CustomEvent<{
      fullName?: string;
      username?: string;
    }>;
  }
}


export default function Header() {
  const [activeTab, setActiveTab] = useState("discover")
  const [scrolled, setScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState({ fullName: "", username: "" })
  const [userNameUpdated, setUserNameUpdated] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Get user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Try to get data from localStorage first to display immediately
        const cachedUserData = localStorage.getItem('userProfile')
        if (cachedUserData) {
          const userData = JSON.parse(cachedUserData)
          if (userData.fullName) {
            setUserProfile({ fullName: userData.fullName, username: userData.username })
            setUserNameUpdated(true)
          }
        }
        
        // Then get updated data from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data.session) {
          console.error("Error fetching user session:", error)
          return
        }
        
        setUser(data.session.user)
        
        // If there's no data in localStorage or we haven't updated the name
        if (!userNameUpdated) {
          // Get display name from user metadata or email
          const fullName = data.session.user.user_metadata?.full_name
          const email = data.session.user.email
          const userName = data.session.user.user_metadata?.user_name || email?.split('@')[0] || "";
          
          if (fullName) {
            setUserProfile({ fullName: fullName, username: userName })
          } else {
            setUserProfile({ fullName: "Unknown User", username: "" })
          }
          
          // Update localStorage with user data
          saveUserProfileToLocalStorage(data.session.user)
        }
      } catch (err) {
        console.error("Error getting user data:", err)
      }
    }
    
    fetchUserData()
    
    // Listen for custom event for profile updates
    const handleProfileUpdate = (event: CustomEvent<{fullName?: string, username?: string}>) => {
      console.log("Header received profile update event:", event.detail)
      if (event.detail.fullName) {
        setUserProfile({ 
          fullName: event.detail.fullName || "", 
          username: event.detail.username || "" 
        })
        setUserNameUpdated(true)
      }
    }
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    }
  }, [supabase, userNameUpdated])

  // Save user profile to localStorage
  const saveUserProfileToLocalStorage = (userData: any) => {
    const profileData = {
      fullName: userData.user_metadata?.full_name || "",
      username: userData.user_metadata?.user_name || "",
      email: userData.email || ""
    }
    
    localStorage.setItem('userProfile', JSON.stringify(profileData))
  }


  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])


  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Sign out function
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('userProfile') // Clear user data when signing out
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error signing out:", error)
      } else {
        console.log("Successfully signed out")
        router.push("/")
      }
    } catch (err) {
      console.error("Exception during sign out:", err)
    }
  }


  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 backdrop-blur-lg ${
        scrolled 
          ? "bg-black/80 border-white/10 shadow-lg" 
          : "bg-transparent border-transparent"
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/feed" className="text-2xl font-bold">
              <motion.span 
                className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Shrobe
              </motion.span>
            </Link>
          </div>

          {/* Welcome message - Mobile hidden, visible on md+ */}
          <div className="hidden md:block">
            <motion.p 
              className="text-sm font-medium text-white/70"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Hi, <span className="text-white">{userProfile.username}</span>
            </motion.p>
          </div>
          
          {/* Actions - Hidden on mobile, visible on md+ */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Add to Closet Button */}
            {/*<motion.button 
              className="flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white rounded-full text-sm font-medium relative group overflow-hidden"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(255,101,197,0.5)" }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Plus className="w-4 h-4" />
              <span>Add to Closet</span>
              <motion.div 
                className="absolute inset-0 bg-white/20 -z-10"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.4 }}
              />
            </motion.button>*/}
            
            {/* Icons */}
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/search')}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            {/*<motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell className="w-5 h-5" />
              <motion.span 
                className="absolute top-1 right-1.5 w-2 h-2 bg-[#ff65c5] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  duration: 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }}
              />
            </motion.button>*/}
            
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => router.push('/messages')}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
            
            {/* Profile Button with Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <motion.button 
                className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors ${
                  showProfileMenu 
                    ? "text-white bg-white/20" 
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                aria-label="Toggle profile menu"
              >
                <User className="w-5 h-5" />
              </motion.button>
              
              {/* Profile Dropdown Menu */}
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden z-50"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-3 border-b border-white/10">
                      <p className="text-sm text-gray-400">@{userProfile.username}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <UserCircle className="w-4 h-4" />
                        <span>My Profile</span>
                      </Link>
                      <Link 
                        href="/settings" 
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="flex items-center w-full space-x-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {/* Animated gradient line at bottom */}
      <div className="absolute left-0 right-0 bottom-0 h-[1px]">
        <div className="w-full h-full bg-gradient-to-r from-[#ff65c5] via-[#c7aeef] to-[#ff65c5]" />
      </div>
    </motion.header>
  )
} 