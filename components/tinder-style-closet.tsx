"use client"

import { useState, useRef, useEffect } from "react"
import { motion, useAnimation, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// Define trending closet items
const trendingClosetItems = [
  {
    id: 1,
    image: "/images/uploads/fashion-coastal-sunset.jpg", // Red sequin dress
    name: "Red Sequin Gown",
    description: "Statement floor-length sequin dress with slim straps for special occasions",
    likes: 2941,
    owner: "sophia.style",
    tags: ["Evening", "Formal", "Statement"],
  },
  {
    id: 2,
    image: "/images/uploads/fashion-red-sequin.jpg", // Person sitting on rocks at sunset
    name: "Coastal Knit Ensemble",
    description: "Relaxed cream knit cardigan with white wide-leg pants for beach-side evenings",
    likes: 3428,
    owner: "sophia.style",
    tags: ["Casual", "Bohemian", "Evening"],
  },
  {
    id: 3,
    image: "/images/uploads/fashion-festival-outfit.jpg", // Third image (festival outfit with bikini top)
    name: "Festival Ready Outfit",
    description: "Stylish festival look with cargo pants, white bikini top and boho accessories",
    likes: 2752,
    owner: "sophia.style",
    tags: ["Festival", "Summer", "Casual"],
  },
  {
    id: 4,
    image: "/images/uploads/fashion-western-inspired.jpg", // Fourth image (cowboy outfit with hat)
    name: "Western-Inspired Look",
    description: "Stylish western-inspired outfit with corset top, white skirt and cowboy boots",
    likes: 3124,
    owner: "sophia.style",
    tags: ["Western", "Statement", "Theme"],
  }
]

export default function TinderStyleCloset() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  
  // Get current item
  const currentItem = trendingClosetItems[currentIndex]
  const nextItem = trendingClosetItems[(currentIndex + 1) % trendingClosetItems.length]
  
  // Motion values for handling drag
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 0, 300], [-15, 0, 15])
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0])

  // Animation controls
  const controls = useAnimation()

  // Container ref
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Scale card on drag
  const scale = useTransform(
    x,
    [-300, -150, 0, 150, 300],
    [0.85, 0.95, 1, 0.95, 0.85]
  )
  
  // Indicators for swipe direction
  const leftIndicatorOpacity = useTransform(
    x,
    [-300, -100, 0],
    [1, 0.5, 0]
  )
  
  const rightIndicatorOpacity = useTransform(
    x,
    [0, 100, 300],
    [0, 0.5, 1]
  )

  // Handle swipe action
  const handleSwipe = (direction: 'left' | 'right') => {
    if (isSwiping) return
    
    setIsSwiping(true)
    setDirection(direction)
    
    const offset = direction === 'left' ? -500 : 500
    
    controls.start({
      x: offset,
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
    }).then(() => {
      // Reset position and advance to next card
      x.set(0)
      controls.set({ x: 0, opacity: 1, scale: 1 })
      
      // Move to next item
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingClosetItems.length)
      setIsSwiping(false)
      setDirection(null)
    })
  }
  
  // Handle drag end
  const handleDragEnd = (_: any, info: { offset: { x: number } }) => {
    const dragThreshold = 100
    
    if (info.offset.x > dragThreshold) {
      handleSwipe('right')
    } else if (info.offset.x < -dragThreshold) {
      handleSwipe('left')
    } else {
      // Reset if not enough drag
      controls.start({ 
        x: 0, 
        scale: 1,
        transition: { type: 'spring', stiffness: 300, damping: 25 }
      })
    }
  }

  return (
    <section className="py-20 md:py-28 relative overflow-hidden bg-black">
        
      <div className="container mx-auto px-4 relative z-10 mb-24">
          <div className="text-center mb-12">
            <span className="text-primary-pink text-sm uppercase tracking-wider inline-block mb-2">
              Trending Now
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              <span className="text-primary-pink">@sophia.style</span>'s Closet
            </h2>
            <p className="text-gray-300 max-w-lg mx-auto mt-3">
              This week's hottest closet with over 15k visits and 3.5k shares
            </p>
          </div>
          
          <div className="max-w-md mx-auto h-[650px] relative">
            {/* Background decorative elements */}
            <div className="absolute -top-12 -left-32 w-64 h-64 bg-primary-pink/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary-purple/10 rounded-full blur-3xl"></div>
            
            {/* Card stack container */}
            <div 
              ref={containerRef}
              className="relative w-full h-full flex items-center justify-center"
            >
              {/* Next card (showing underneath) */}
              <div className="absolute w-full max-w-md">
                <div 
                  className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-gray-800/30"
                  style={{ transform: 'scale(0.9)', opacity: 0.6, filter: 'blur(2px)' }}
                >
                  <Image
                    src={nextItem?.image}
                    alt={nextItem?.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px" 
                  />
                </div>
              </div>
              
              {/* Current card */}
              <motion.div 
                className="absolute w-full max-w-md z-10"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                style={{ x, rotate, scale }}
                animate={controls}
                whileTap={{ cursor: "grabbing" }}
              >
                <div className="relative w-full aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-700/50">
                  <Image
                    src={currentItem?.image}
                    alt={currentItem?.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />

                  {/* Swipe indicators */}
                  <motion.div 
                    className="absolute top-6 left-6 bg-red-500/80 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-[-15deg] backdrop-blur-sm"
                    style={{ opacity: leftIndicatorOpacity }}
                  >
                    PASS
                  </motion.div>
                  
                  <motion.div 
                    className="absolute top-6 right-6 bg-green-500/80 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-[15deg] backdrop-blur-sm"
                    style={{ opacity: rightIndicatorOpacity }}
                  >
                    LIKE
                  </motion.div>
                  
                  {/* Content overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-2xl font-bold text-white">
                        {currentItem?.name}
                      </h3>
                      <p className="text-gray-300 text-sm my-2">
                        {currentItem?.description}
                      </p>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center text-gray-300 text-sm">
                          <svg className="w-4 h-4 text-primary-pink mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 17.12a.5.5 0 0 1-.28-.08C9.44 16.8 4 13.39 4 9a6 6 0 1 1 12 0c0 4.39-5.44 7.8-5.72 8.04a.5.5 0 0 1-.28.08Z" />
                          </svg>
                          {currentItem?.likes.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        {currentItem?.tags.map((tag, i) => (
                          <span 
                            key={i}
                            className="bg-gray-800/60 backdrop-blur-sm text-gray-200 text-xs px-3 py-1 rounded-full border border-gray-700/30"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Control buttons */}
            <div className="flex justify-center mt-8 gap-6">
              <button 
                onClick={() => handleSwipe('left')}
                className="bg-gray-800 hover:bg-gray-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105"
                disabled={isSwiping}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <Link 
                href="#explore-full-closet"
                className="bg-primary-purple hover:bg-primary-purple/90 text-white px-6 py-4 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 font-medium"
              >
                Explore Full Closet
              </Link>
              
              <button 
                onClick={() => handleSwipe('right')}
                className="bg-primary-pink hover:bg-primary-pink/90 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105"
                disabled={isSwiping}
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
        </div>
      </div>
    </section>
  )
} 
