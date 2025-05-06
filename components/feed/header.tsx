"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Bell, MessageSquare, User, Plus, Menu, Home, LogOut, Settings, UserCircle} from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Define un tipo para el evento personalizado de actualización de usuario
declare global {
  interface WindowEventMap {
    'userProfileUpdated': CustomEvent<{
      fullName?: string;
      username?: string;
      bio?: string;
    }>;
  }
}


export default function Header() {
  const [activeTab, setActiveTab] = useState("discover")
  const [scrolled, setScrolled] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [userName, setUserName] = useState("")
  const [userNameUpdated, setUserNameUpdated] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Get user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Intentar obtener datos desde localStorage primero para mostrarlos inmediatamente
        const cachedUserData = localStorage.getItem('userProfile')
        if (cachedUserData) {
          const userData = JSON.parse(cachedUserData)
          if (userData.fullName) {
            setUserName(userData.fullName)
            setUserNameUpdated(true)
          }
        }
        
        // Luego obtener datos actualizados de Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error || !data.session) {
          console.error("Error fetching user session:", error)
          return
        }
        
        setUser(data.session.user)
        
        // Si no hay datos en localStorage o no hemos actualizado el nombre
        if (!userNameUpdated) {
          // Get display name from user metadata or email
          const fullName = data.session.user.user_metadata?.full_name
          const email = data.session.user.email
          
          if (fullName) {
            setUserName(fullName)
          } else if (email) {
            // Use part before @ in email as fallback
            setUserName(email.split('@')[0])
          } else {
            setUserName("User")
          }
          
          // Actualizar localStorage con los datos del usuario
          saveUserProfileToLocalStorage(data.session.user)
        }
      } catch (err) {
        console.error("Error getting user data:", err)
      }
    }
    
    fetchUserData()
    
    // Escuchar evento personalizado para actualización de perfil
    const handleProfileUpdate = (event: CustomEvent<{fullName?: string, username?: string, bio?: string}>) => {
      console.log("Header received profile update event:", event.detail)
      if (event.detail.fullName) {
        setUserName(event.detail.fullName)
        setUserNameUpdated(true)
      }
    }
    
    window.addEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    
    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate as EventListener)
    }
  }, [supabase, userNameUpdated])

  // Guardar perfil de usuario en localStorage
  const saveUserProfileToLocalStorage = (userData: any) => {
    const profileData = {
      fullName: userData.user_metadata?.full_name || "",
      username: userData.user_metadata?.username || userData.email?.split('@')[0] || "",
      bio: userData.user_metadata?.bio || "",
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
      
      // Close mobile menu on outside click
      if (userMenuOpen && !(event.target as Element).closest('.mobile-menu-container')) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [userMenuOpen])

  // Sign out function
  const handleSignOut = async () => {
    try {
      localStorage.removeItem('userProfile') // Limpiar datos del usuario al cerrar sesión
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
            
            {/* Mobile Add Button - Hidden */}
            <motion.button 
              className="hidden md:hidden flex items-center justify-center w-8 h-8 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white rounded-full"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-4 h-4" />
            </motion.button>
            
            {/* Icons - Hidden on mobile */}
            <motion.button 
              className="hidden md:flex w-9 h-9 items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Search className="w-5 h-5" />
            </motion.button>
            
            <motion.button 
              className="hidden md:flex w-9 h-9 items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
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
              className="hidden md:flex w-9 h-9 items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors relative"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
            
            {/* Profile Button with Dropdown - Hidden on mobile */}
            <div className="hidden md:block relative" ref={profileMenuRef}>
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
                      <p className="text-sm font-medium text-white">{userName}</p>
                      <p className="text-xs text-gray-400">@{user?.email?.split('@')[0] || "username"}</p>
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
            
            {/* Mobile Menu - Keep visible */}
            <motion.button 
              className="md:hidden w-9 h-9 flex items-center justify-center text-white/70 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {userMenuOpen && (
          <motion.div 
            className="mobile-menu-container md:hidden absolute top-16 left-0 right-0 bg-black/90 backdrop-blur-lg border-b border-white/10 shadow-xl overflow-hidden z-40"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-4">
                <div className="border-b border-white/10 pb-3">
                  <p className="text-sm font-medium text-white">Hi, {userName}</p>
                  <p className="text-xs text-gray-400">@{user?.email?.split('@')[0] || "username"}</p>
                </div>
                
                <Link 
                  href="/profile" 
                  className="flex items-center space-x-2 py-2.5 text-sm text-white/80"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <UserCircle className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                
                <Link 
                  href="/settings" 
                  className="flex items-center space-x-2 py-2.5 text-sm text-white/80"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                
                <button 
                  onClick={() => {
                    setUserMenuOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center w-full space-x-2 py-2.5 text-sm text-white/80"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>

                <button 
                  className="mt-2 flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white text-sm font-medium"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span>Add to Closet</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
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