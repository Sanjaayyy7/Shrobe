"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Heart, X, Users } from "lucide-react"

// Mock data for the discovery carousel
const discoveryItems = [
  {
    id: 1,
    title: "Eclat Ensemble: Spring Arrivals",
    image: "/images/carousel/spring-collection.jpg", // These would need to be added
    price: "$35/day",
    available: true,
    curator: "Sophia Lee",
    curatorImage: "/images/avatars/sophia.jpg",
  },
  {
    id: 2,
    title: "Y2K Revival Series",
    image: "/images/carousel/y2k-revival.jpg",
    price: "$28/day",
    available: true,
    curator: "Marcus Chen",
    curatorImage: "/images/avatars/marcus.jpg",
  },
  {
    id: 3,
    title: "Festival Ready: Coachella Edit",
    image: "/images/carousel/festival-edit.jpg",
    price: "$42/day",
    available: false,
    availableFrom: "May 15",
    curator: "Zoe Taylor",
    curatorImage: "/images/avatars/zoe.jpg",
  },
  {
    id: 4,
    title: "Minimalist Monochrome",
    image: "/images/carousel/monochrome.jpg",
    price: "$30/day",
    available: true,
    curator: "Aiden West",
    curatorImage: "/images/avatars/aiden.jpg",
  },
  {
    id: 5,
    title: "Vintage Denim Collection",
    image: "/images/carousel/vintage-denim.jpg",
    price: "$25/day",
    available: true,
    curator: "Ella Johnson",
    curatorImage: "/images/avatars/ella.jpg",
  },
]

// Story circles above the carousel
const storyUsers = [
  { id: 1, name: "Mia", image: "/images/avatars/mia.jpg", hasNew: true },
  { id: 2, name: "Noah", image: "/images/avatars/noah.jpg", hasNew: true },
  { id: 3, name: "Emma", image: "/images/avatars/emma.jpg", hasNew: false },
  { id: 4, name: "Liam", image: "/images/avatars/liam.jpg", hasNew: true },
  { id: 5, name: "Ava", image: "/images/avatars/ava.jpg", hasNew: false },
  { id: 6, name: "Jackson", image: "/images/avatars/jackson.jpg", hasNew: false },
  { id: 7, name: "Isabella", image: "/images/avatars/isabella.jpg", hasNew: true },
  { id: 8, name: "Lucas", image: "/images/avatars/lucas.jpg", hasNew: false },
]

export default function DiscoveryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<null | 'left' | 'right'>(null)
  const touchStartX = useRef(0)
  
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? discoveryItems.length - 1 : prev - 1))
  }
  
  const handleNext = () => {
    setCurrentIndex((prev) => (prev === discoveryItems.length - 1 ? 0 : prev + 1))
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    setIsSwiping(true)
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return
    
    const touchCurrentX = e.touches[0].clientX
    const diff = touchCurrentX - touchStartX.current
    
    if (diff > 50) {
      setSwipeDirection('right')
    } else if (diff < -50) {
      setSwipeDirection('left')
    } else {
      setSwipeDirection(null)
    }
  }
  
  const handleTouchEnd = () => {
    if (swipeDirection === 'left') {
      handleNext()
    } else if (swipeDirection === 'right') {
      handlePrev()
    }
    
    setIsSwiping(false)
    setSwipeDirection(null)
  }
  
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Handle like logic here
    handleNext()
  }
  
  const handleDislike = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Handle dislike logic here
    handleNext()
  }

  return (
    <div className="py-3">
      {/* Story circles */}
      <div className="mb-6 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 px-1 pb-2">
          {storyUsers.map((user) => (
            <div key={user.id} className="flex flex-col items-center space-y-1">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${user.hasNew ? 'bg-gradient-to-tr from-[#E91E63] to-[#F06292] p-[2px]' : 'p-[2px]'}`}>
                <div className="bg-[#121212] rounded-full p-[2px] w-full h-full">
                  <div className="bg-gray-400 rounded-full w-full h-full relative overflow-hidden">
                    {/* In production, replace with actual images */}
                    <div className="absolute inset-0 flex items-center justify-center text-[8px] text-white">
                      {user.name[0]}
                    </div>
                  </div>
                </div>
              </div>
              <span className="text-xs text-white/80">{user.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Discovery carousel */}
      <div className="relative overflow-hidden h-[400px] md:h-[480px] rounded-[30px] md:rounded-[40px]">
        {/* Cards Container */}
        <div 
          className="h-full w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Current Card */}
          <div className="absolute inset-0 rounded-[30px] md:rounded-[40px] overflow-hidden transform transition-transform duration-300">
            <div className="relative w-full h-full">
              {/* Placeholder for image */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black">
                {/* In production, replace with actual images */}
                <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <p className="text-white text-4xl font-bold opacity-30">{discoveryItems[currentIndex].title}</p>
                </div>
              </div>
              
              {/* Content Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-6">
                <div className="flex justify-between items-start">
                  {/* Curator Info */}
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center">
                      <span className="text-[10px] text-white">{discoveryItems[currentIndex].curator[0]}</span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{discoveryItems[currentIndex].curator}</p>
                      <p className="text-white/70 text-xs">Curator</p>
                    </div>
                  </div>
                  
                  {/* Available Status */}
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${discoveryItems[currentIndex].available ? 'bg-green-600/80 text-white' : 'bg-amber-600/80 text-white'}`}>
                    {discoveryItems[currentIndex].available 
                      ? 'Available Now' 
                      : `Available ${(discoveryItems[currentIndex] as any).availableFrom}`}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">
                    {discoveryItems[currentIndex].title}
                  </h3>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={handleDislike}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-lg"
                      >
                        <X className="w-6 h-6 text-gray-800" />
                      </button>
                      <button 
                        onClick={handleLike}
                        className="w-14 h-14 rounded-full bg-[#E91E63] flex items-center justify-center shadow-lg"
                      >
                        <Heart className="w-7 h-7 text-white" />
                      </button>
                    </div>
                    
                    <div className="text-white">
                      <p className="text-lg font-bold">{discoveryItems[currentIndex].price}</p>
                      <p className="text-xs text-white/70">Rental price</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white z-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white z-10"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        {/* Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
          {discoveryItems.map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${
                index === currentIndex ? 'bg-white' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
} 