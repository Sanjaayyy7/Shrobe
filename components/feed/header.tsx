"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, MessageSquare, User, Plus, Menu, Home, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Header() {
  const [activeTab, setActiveTab] = useState("discover")
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userName = "Alex" // This would come from auth state in a real app
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuRef])

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
            
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              <motion.button 
                onClick={() => setActiveTab("discover")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative ${
                  activeTab === "discover" 
                    ? "text-white" 
                    : "text-white/70 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Discover
                {activeTab === "discover" && (
                  <motion.span 
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    layoutId="activeTab"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
              
              <motion.button 
                onClick={() => setActiveTab("nearby")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative ${
                  activeTab === "nearby" 
                    ? "text-white" 
                    : "text-white/70 hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                Nearby
                {activeTab === "nearby" && (
                  <motion.span 
                    className="absolute inset-0 bg-white/10 rounded-full -z-10"
                    layoutId="activeTab"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
              
              {/* Home/Landing Page Button */}
              <Link href="/">
                <motion.button 
                  className="flex items-center space-x-1 px-4 py-1.5 border border-white/20 text-white/80 hover:text-white rounded-full text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <Home className="w-4 h-4 mr-1" />
                  <span>Home</span>
                </motion.button>
              </Link>
            </nav>
          </div>

          {/* Welcome message - Mobile hidden, visible on md+ */}
          <div className="hidden md:block">
            <motion.p 
              className="text-sm font-medium text-white/70"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              Hi, <span className="text-white">{userName}</span>
            </motion.p>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-3">
            {/* Add to Closet Button */}
            <motion.button 
              className="hidden md:flex items-center space-x-1 px-4 py-1.5 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white rounded-full text-sm font-medium relative group overflow-hidden"
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
            </motion.button>
            
            {/* Mobile Add Button */}
            <motion.button 
              className="md:hidden flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            
            {/* Icons */}
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
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
            </motion.button>
            
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <motion.button 
                className={`w-9 h-9 flex items-center justify-center ${userMenuOpen ? 'text-white bg-white/20' : 'text-white/70 hover:text-white hover:bg-white/10'} rounded-full transition-colors`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="w-5 h-5" />
              </motion.button>
              
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div 
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-black/90 border border-white/10 shadow-xl overflow-hidden backdrop-blur-lg"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="text-white font-medium text-sm">{userName}</p>
                      <p className="text-white/50 text-xs truncate">user@example.com</p>
                    </div>
                    <div className="py-1">
                      <Link href="/profile" className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                        <User className="w-4 h-4 mr-2 opacity-70" />
                        Profile
                      </Link>
                      <Link href="/settings" className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors">
                        <Settings className="w-4 h-4 mr-2 opacity-70" />
                        Settings
                      </Link>
                      <Link 
                        href="/signout"
                        className="flex items-center px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 transition-colors border-t border-white/10 mt-1"
                      >
                        <LogOut className="w-4 h-4 mr-2 opacity-70" />
                        Sign Out
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile Menu */}
            <motion.button 
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Animated gradient line at bottom */}
      <div className="absolute left-0 right-0 bottom-0 h-[1px] overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-[#ff65c5] via-[#c7aeef] to-[#ff65c5]"
          animate={{ 
            x: ["0%", "100%", "0%"],
          }}
          transition={{ 
            duration: 8, 
            ease: "linear", 
            repeat: Infinity 
          }}
          style={{ width: "200%" }}
        />
      </div>
    </motion.header>
  )
} 