"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Search, Bell, MessageSquare, User, Plus, Menu } from "lucide-react"

export default function Header() {
  const [activeTab, setActiveTab] = useState("discover")
  const [scrolled, setScrolled] = useState(false)
  const userName = "Alex" // This would come from auth state in a real app

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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
            
            <motion.button 
              className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <User className="w-5 h-5" />
            </motion.button>
            
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