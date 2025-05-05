"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Flame, TrendingUp, Sparkles, Heart, ArrowRight, ExternalLink, Eye } from "lucide-react"

// Sample data for user closets
const userClosets = [
  {
    id: 1,
    username: "sophiastyle",
    name: "Sophia Davis",
    avatar: "/images/avatars/sophia.jpg",
    followerCount: 3408,
    closetTitle: "Luxe Minimalist",
    itemCount: 78,
    rating: 4.9,
    featured: true,
    visits: 15643,
    shares: 3528,
    featuredImage: "/images/uploads/fashion-red-sequin.jpg",
    tags: ["Luxury", "Minimal", "Evening"],
    trendingItem: {
      name: "Red Sequin Gown",
      description: "Statement floor-length sequin dress with slim straps for special occasions",
      likes: 2941,
      image: "/images/uploads/fashion-red-sequin.jpg",
      tags: ["Evening", "Formal", "Statement"],
    }
  },
  {
    id: 2,
    username: "alexurban",
    name: "Alex Chen",
    avatar: "/images/avatars/alex.jpg",
    followerCount: 2150,
    closetTitle: "Streetwear Archive",
    itemCount: 112,
    rating: 4.7,
    featured: true,
    visits: 12408,
    shares: 2814,
    featuredImage: "/images/uploads/fashion-coastal-sunset.jpg",
    tags: ["Streetwear", "Urban", "Casual"],
    trendingItem: {
      name: "Coastal Knit Ensemble",
      description: "Relaxed cream knit cardigan with white wide-leg pants for beach-side evenings",
      likes: 3428,
      image: "/images/uploads/fashion-coastal-sunset.jpg",
      tags: ["Casual", "Bohemian", "Evening"],
    }
  },
  {
    id: 3,
    username: "zaradesigns",
    name: "Zara Thompson",
    avatar: "/images/avatars/zara.jpg",
    followerCount: 5674,
    closetTitle: "Vintage Couture",
    itemCount: 94,
    rating: 4.8,
    featured: true,
    visits: 10982,
    shares: 2165,
    featuredImage: "/images/uploads/fashion-festival-outfit.jpg",
    tags: ["Vintage", "Couture", "Elegant"],
    trendingItem: {
      name: "Festival Ready Outfit",
      description: "Stylish festival look with cargo pants, white bikini top and boho accessories",
      likes: 2752,
      image: "/images/uploads/fashion-festival-outfit.jpg",
      tags: ["Festival", "Summer", "Casual"],
    }
  },
  {
    id: 4,
    username: "marcofashion",
    name: "Marco Rodriguez",
    avatar: "/images/avatars/marco.jpg",
    followerCount: 1872,
    closetTitle: "Monochrome Essentials",
    itemCount: 65,
    rating: 4.6,
    featured: true,
    visits: 8754,
    shares: 1893,
    featuredImage: "/images/uploads/fashion-western-inspired.jpg",
    tags: ["Monochrome", "Essentials", "Minimal"],
    trendingItem: {
      name: "Western-Inspired Look",
      description: "Stylish western-inspired outfit with corset top, white skirt and cowboy boots",
      likes: 3124,
      image: "/images/uploads/fashion-western-inspired.jpg",
      tags: ["Western", "Statement", "Theme"],
    }
  }
]

// Add more closets to make the horizontal scrolling more obvious
const extendedClosets = [
  ...userClosets,
  ...userClosets.map(closet => ({...closet, id: closet.id + 4}))
]

export default function UserClosetHighlights() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [hoveredCard, setHoveredCard] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])
  
  // Scroll left and right handlers
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      })
    }
  }
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      })
    }
  }

  // Custom card variants for animations
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { y: -8, scale: 1.02 }
  }
  
  return (
    <div className="py-10 relative">
      <div className="max-w-7xl mx-auto px-4">
        {/* Section header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center">
              <Flame className="w-6 h-6 mr-2 text-[#ff65c5]" />
              Trending Closets
            </h2>
            <p className="text-sm text-gray-400 mt-1">Discover popular collections from fashion enthusiasts</p>
          </div>
          
          <Link href="/closets">
            <motion.div
              className="flex items-center text-sm font-medium text-white/80 hover:text-white border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-2 rounded-full"
              whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.1)" }}
              transition={{ duration: 0.2 }}
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </motion.div>
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-32 w-64 h-64 bg-[#ff65c5]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#c7aeef]/5 rounded-full blur-3xl" />
        
        {/* Scroll navigation arrows - Only on desktop */}
        {!isMobile && (
          <>
            <motion.button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2 rounded-full shadow-lg border border-white/10"
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-6 h-6 rotate-180" />
            </motion.button>
            
            <motion.button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-black/40 backdrop-blur-sm hover:bg-black/60 text-white p-2 rounded-full shadow-lg border border-white/10"
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}
        
        {/* Scrollable content rail */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <div className="flex space-x-4 md:space-x-6">
            {extendedClosets.map((closet, index) => (
              <motion.div
                key={`${closet.id}-${index}`}
                className="flex-shrink-0 w-[280px] md:w-[340px]"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ duration: 0.3 }}
                onHoverStart={() => setHoveredCard(closet.id)}
                onHoverEnd={() => setHoveredCard(null)}
              >
                <Link href={`/closets/${closet.username}`}>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg bg-black/40 backdrop-blur-sm h-full transition-all duration-300 hover:shadow-[0_0_25px_rgba(255,101,197,0.2)]">
                    {/* Main image */}
                    <div className="relative h-[320px] w-full overflow-hidden">
                      <Image
                        src={closet?.featuredImage}
                        alt={closet?.trendingItem.name}
                        fill
                        className="object-cover transition-transform duration-700"
                        sizes="(max-width: 768px) 280px, 340px"
                        style={{
                          transform: hoveredCard === closet.id ? 'scale(1.05)' : 'scale(1)',
                        }}
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      
                      {/* Trending badge */}
                      <div className="absolute top-4 left-4">
                        <div className="flex items-center gap-1 bg-[#ff65c5]/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                          <TrendingUp className="w-3 h-3" />
                          <span>TRENDING NOW</span>
                        </div>
                      </div>
                      
                      {/* Stats */}
                      <div className="absolute top-4 right-4 flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          <span>{(closet.visits / 1000).toFixed(1)}k</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          <Heart className="w-3 h-3" fill="white" />
                          <span>{(closet.trendingItem.likes / 1000).toFixed(1)}k</span>
                        </div>
                      </div>
                      
                      {/* User info - bottom */}
                      <div className="absolute bottom-4 left-4 right-4 flex items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden relative border-2 border-white/20">
                            {closet?.avatar ? (
                              <Image
                                src={closet.avatar}
                                alt={closet.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              closet?.name.charAt(0)
                            )}
                            
                            {closet?.featured && (
                              <div className="absolute -right-1 -bottom-1 bg-[#c7aeef] text-white p-1 rounded-full">
                                <Sparkles className="w-2 h-2" />
                              </div>
                            )}
                          </div>
                          
                          <div className="text-left">
                            <h3 className="text-white font-bold text-base leading-tight">
                              {closet?.name}
                            </h3>
                            <p className="text-gray-300 text-xs">@{closet?.username}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content section */}
                    <div className="p-4">
                      {/* Item name and tags */}
                      <h3 className="text-lg font-bold text-white mb-1">
                        {closet?.trendingItem.name}
                      </h3>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2 mb-3">
                        {closet?.trendingItem.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="bg-white/10 backdrop-blur-sm text-gray-200 text-[10px] px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      {/* Collection info */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="text-xs text-gray-400">
                          <p className="text-white/90 font-medium">{closet?.closetTitle}</p>
                          <p>{closet?.itemCount} items • {closet?.followerCount.toLocaleString()} followers</p>
                        </div>

                        {/* Action button - Only shows on hover */}
                        <AnimatePresence>
                          {hoveredCard === closet.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              transition={{ duration: 0.2 }}
                              className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white text-xs font-medium rounded-full px-3 py-1.5 flex items-center gap-1"
                            >
                              Browse <ArrowRight className="w-3 h-3" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile indicator dots for scrolling */}
        {isMobile && (
          <div className="flex justify-center mt-6 space-x-1">
            {Array(Math.min(5, extendedClosets.length)).fill(0).map((_, index) => (
              <div 
                key={index} 
                className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-[#ff65c5]' : 'bg-gray-600'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 