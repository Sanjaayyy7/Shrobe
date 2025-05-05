"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Star, ShoppingBag, Tag } from "lucide-react"
import Link from "next/link"

// Sample data for new drops
const newDropsData = [
  {
    id: 1,
    title: "Limited Edition Cargo Collection",
    description: "Exclusive vintage military-inspired cargo pieces",
    imageUrl: "/images/carousel/cargo-collection.jpg",
    designerName: "Urban Essence",
    designerAvatar: "/images/avatars/urban-essence.jpg",
    price: "$45/day",
    rating: 4.8,
    reviewCount: 126,
    tags: ["Vintage", "Streetwear"]
  },
  {
    id: 2,
    title: "Summer Pastel Sets",
    description: "Light, breathable fabrics in season's hottest pastel tones",
    imageUrl: "/images/carousel/pastel-sets.jpg",
    designerName: "Pastel Dreams",
    designerAvatar: "/images/avatars/pastel-dreams.jpg",
    price: "$38/day",
    rating: 4.6,
    reviewCount: 94,
    tags: ["Summer", "Casual"]
  },
  {
    id: 3,
    title: "Avant-Garde Evening Collection",
    description: "Bold statement pieces for unforgettable nights",
    imageUrl: "/images/carousel/avant-garde.jpg",
    designerName: "Future Noir",
    designerAvatar: "/images/avatars/future-noir.jpg",
    price: "$65/day",
    rating: 4.9,
    reviewCount: 78,
    tags: ["Luxury", "Evening"]
  },
  {
    id: 4,
    title: "Sustainable Denim Edit",
    description: "Eco-friendly denim from recycled materials",
    imageUrl: "/images/carousel/sustainable-denim.jpg",
    designerName: "Green Thread",
    designerAvatar: "/images/avatars/green-thread.jpg",
    price: "$42/day",
    rating: 4.7,
    reviewCount: 105,
    tags: ["Sustainable", "Casual"]
  },
  {
    id: 5,
    title: "Y2K Revival Capsule",
    description: "Nostalgic 2000s pieces reimagined for today",
    imageUrl: "/images/carousel/y2k-capsule.jpg",
    designerName: "Retro Rewind",
    designerAvatar: "/images/avatars/retro-rewind.jpg",
    price: "$50/day",
    rating: 4.8,
    reviewCount: 87,
    tags: ["Y2K", "Retro"]
  }
]

export default function NewDropsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  const slideWidth = 350 // Width of each slide in pixels
  const gap = 20 // Gap between slides
  
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => 
      prev < newDropsData.length - getVisibleSlides() ? prev + 1 : prev
    )
  }
  
  const getVisibleSlides = () => {
    if (typeof window === 'undefined') return 1
    const width = window.innerWidth
    if (width < 640) return 1 // mobile
    if (width < 1024) return 2 // tablet
    return 3 // desktop
  }

  // Mouse and touch handlers
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    setDragOffset(0)
    
    // Get clientX from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setDragStartX(clientX)
    
    document.addEventListener('mousemove', handleDragMove as any)
    document.addEventListener('touchmove', handleDragMove as any)
    document.addEventListener('mouseup', handleDragEnd)
    document.addEventListener('touchend', handleDragEnd)
  }
  
  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return
    
    // Get clientX from either mouse or touch event
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
    const offset = clientX - dragStartX
    
    setDragOffset(offset)
  }
  
  const handleDragEnd = () => {
    setIsDragging(false)
    
    document.removeEventListener('mousemove', handleDragMove as any)
    document.removeEventListener('touchmove', handleDragMove as any)
    document.removeEventListener('mouseup', handleDragEnd)
    document.removeEventListener('touchend', handleDragEnd)
    
    // Determine if we should navigate based on drag distance
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        handlePrevious()
      } else {
        handleNext()
      }
    }
    
    setDragOffset(0)
  }
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const maxIndex = newDropsData.length - getVisibleSlides()
      if (currentIndex > maxIndex) {
        setCurrentIndex(Math.max(0, maxIndex))
      }
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentIndex])
  
  return (
    <div className="my-8">
      {/* Section header */}
      <div className="flex justify-between items-center mb-5 px-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <ShoppingBag className="w-5 h-5 mr-2 text-[#ff65c5]" />
            New Drops
          </h2>
          <p className="text-sm text-gray-400">Fresh arrivals this week</p>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex space-x-2">
          <button 
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentIndex === 0 
                ? 'text-gray-600 bg-gray-800/50 cursor-not-allowed' 
                : 'text-white bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleNext}
            disabled={currentIndex >= newDropsData.length - getVisibleSlides()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              currentIndex >= newDropsData.length - getVisibleSlides() 
                ? 'text-gray-600 bg-gray-800/50 cursor-not-allowed' 
                : 'text-white bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Carousel container */}
      <div className="relative overflow-hidden">
        <div 
          ref={carouselRef}
          className="flex px-4 transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
          style={{ 
            transform: `translateX(-${currentIndex * (slideWidth + gap)}px) translateX(${dragOffset}px)`,
          }}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
        >
          {newDropsData.map((item) => (
            <motion.div 
              key={item.id} 
              className="flex-shrink-0 w-[350px] mr-5 rounded-xl overflow-hidden bg-[#161616] border border-white/5 shadow-xl"
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              {/* Image section */}
              <div className="relative h-48 w-full overflow-hidden">
                {/* In real app, replace the div below with an Image component */}
                <div className="w-full h-full bg-gradient-to-br from-[#333] to-[#111] flex items-center justify-center">
                  {/* This is a placeholder. In production, use actual images */}
                  <span className="text-gray-500">{item.title}</span>
                </div>
                
                {/* Price tag */}
                <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md rounded-full px-3 py-1 text-white font-medium text-sm">
                  {item.price}
                </div>
              </div>
              
              {/* Content section */}
              <div className="p-4">
                {/* Designer info */}
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-700 mr-2 overflow-hidden">
                    {/* Designer avatar placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-white">
                      {item.designerName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{item.designerName}</p>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 text-yellow-400 mr-1" />
                      <span className="text-xs text-gray-400">{item.rating} ({item.reviewCount})</span>
                    </div>
                  </div>
                </div>
                
                {/* Item details */}
                <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.tags.map((tag, index) => (
                    <div key={index} className="bg-[#282828] rounded-full px-2 py-1 text-xs text-gray-300 flex items-center">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </div>
                  ))}
                </div>
                
                {/* Action button */}
                <Link href={`/item/${item.id}`}>
                  <motion.button
                    className="w-full py-2 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] rounded-lg text-white font-medium text-sm hover:shadow-lg flex items-center justify-center"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Details
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 