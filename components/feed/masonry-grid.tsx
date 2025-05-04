"use client"

import { useState } from "react"
import { Heart, MessageCircle, MapPin, Clock, Share, Bookmark, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Mock fashion items data for grid
const fashionItems = [
  {
    id: 1,
    image: "/images/grid/outfit1.jpg",
    title: "Y2K Butterfly Top Set",
    user: {
      name: "Mia Harper",
      avatar: "/images/avatars/mia.jpg",
    },
    likes: 124,
    price: "$32/day",
    available: true,
    distance: "0.8 mi",
    categories: ["Y2K", "Party"],
    aspectRatio: "2/3", // Tall
  },
  {
    id: 2,
    image: "/images/grid/outfit2.jpg",
    title: "Urban Streetwear Collection",
    user: {
      name: "Noah Williams",
      avatar: "/images/avatars/noah.jpg",
    },
    likes: 87,
    price: "$45/day",
    available: true,
    distance: "1.2 mi",
    categories: ["Streetwear", "Everyday"],
    aspectRatio: "4/5", // Medium tall
  },
  {
    id: 3,
    image: "/images/grid/outfit3.jpg",
    title: "Festival Season Ready",
    user: {
      name: "Emma Davis",
      avatar: "/images/avatars/emma.jpg",
    },
    likes: 213,
    price: "$28/day",
    available: false,
    availableFrom: "June 10",
    distance: "2.5 mi",
    categories: ["Festival", "Summer Vibes"],
    aspectRatio: "1/1", // Square
  },
  {
    id: 4,
    image: "/images/grid/outfit4.jpg",
    title: "Minimalist Work Ensemble",
    user: {
      name: "Liam Johnson",
      avatar: "/images/avatars/liam.jpg",
    },
    likes: 56,
    price: "$38/day",
    available: true,
    distance: "0.5 mi",
    categories: ["Minimalist", "Work"],
    aspectRatio: "5/6", // Nearly square
  },
  {
    id: 5,
    image: "/images/grid/outfit5.jpg",
    title: "Evening Gala Elegance",
    user: {
      name: "Ava Martinez",
      avatar: "/images/avatars/ava.jpg",
    },
    likes: 164,
    price: "$52/day",
    available: true,
    distance: "3.1 mi",
    categories: ["Luxury", "Formal"],
    aspectRatio: "2/3", // Tall
  },
  {
    id: 6,
    image: "/images/grid/outfit6.jpg",
    title: "Vintage Monochrome Look",
    user: {
      name: "Jackson Brown",
      avatar: "/images/avatars/jackson.jpg",
    },
    likes: 98,
    price: "$42/day",
    available: false,
    availableFrom: "May 22",
    distance: "1.7 mi",
    categories: ["Vintage", "Monochrome"],
    aspectRatio: "1/1", // Square
  },
  {
    id: 7,
    image: "/images/grid/outfit7.jpg",
    title: "Athleisure Comfort Set",
    user: {
      name: "Isabella Wilson",
      avatar: "/images/avatars/isabella.jpg",
    },
    likes: 142,
    price: "$35/day",
    available: true,
    distance: "0.9 mi",
    categories: ["Athleisure", "Everyday"],
    aspectRatio: "3/4", // Medium tall
  },
  {
    id: 8,
    image: "/images/grid/outfit8.jpg",
    title: "Fall Layering Essentials",
    user: {
      name: "Lucas Garcia",
      avatar: "/images/avatars/lucas.jpg",
    },
    likes: 76,
    price: "$29/day",
    available: true,
    distance: "2.3 mi",
    categories: ["Streetwear", "Fall Layers"],
    aspectRatio: "2/3", // Tall
  },
  {
    id: 9,
    image: "/images/grid/outfit9.jpg",
    title: "Luxury Party Dress",
    user: {
      name: "Sophia Taylor",
      avatar: "/images/avatars/sophia.jpg",
    },
    likes: 189,
    price: "$48/day",
    available: true,
    distance: "1.5 mi",
    categories: ["Luxury", "Party"],
    aspectRatio: "4/5", // Medium tall
  },
  {
    id: 10,
    image: "/images/grid/outfit5.jpg",
    title: "Bohemian Summer Collection",
    user: {
      name: "Oliver Wilson",
      avatar: "/images/avatars/aiden.jpg",
    },
    likes: 132,
    price: "$38/day",
    available: true,
    distance: "0.7 mi",
    categories: ["Bohemian", "Summer Vibes"],
    aspectRatio: "1/1", // Square
  },
  {
    id: 11,
    image: "/images/grid/outfit3.jpg",
    title: "Designer Casual Mix",
    user: {
      name: "Amelia Johnson",
      avatar: "/images/avatars/zoe.jpg",
    },
    likes: 154,
    price: "$55/day",
    available: false, 
    availableFrom: "June 15",
    distance: "1.9 mi",
    categories: ["Luxury", "Casual"],
    aspectRatio: "3/4", // Medium tall
  },
  {
    id: 12,
    image: "/images/grid/outfit2.jpg",
    title: "Metropolitan Style Guide",
    user: {
      name: "Ethan Davis",
      avatar: "/images/avatars/marcus.jpg",
    },
    likes: 92,
    price: "$40/day",
    available: true,
    distance: "2.2 mi",
    categories: ["Urban", "Everyday"],
    aspectRatio: "2/3", // Tall
  },
]

export default function MasonryGrid() {
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [savedItems, setSavedItems] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  
  const toggleLike = (itemId: number) => {
    setLikedItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const toggleSave = (itemId: number) => {
    setSavedItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const handleDoubleTap = (itemId: number) => {
    if (!likedItems.includes(itemId)) {
      toggleLike(itemId)
    }
  }
  
  // Helper function to handle aspect ratio
  const getPaddingBottomForAspectRatio = (aspectRatio: string): string => {
    const [width, height] = aspectRatio.split('/')
    const percentage = (parseInt(height) / parseInt(width)) * 100
    return `${percentage}%`
  }
  
  return (
    <div className="py-2">
      {/* View options header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white">
          Explore Available Styles
        </h2>
        
        <div className="flex items-center border border-white/10 rounded-full p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-white text-[#0f0f0f]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              viewMode === "map"
                ? "bg-white text-[#0f0f0f]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Map
          </button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {fashionItems.map((item) => (
            <motion.div 
              key={item.id}
              className="rounded-xl overflow-hidden bg-[#1a1a1a] shadow-md hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ 
                y: -4, 
                transition: { duration: 0.2 }
              }}
              onDoubleClick={() => handleDoubleTap(item.id)}
            >
              {/* Image Container */}
              <div className="relative group cursor-pointer">
                <div 
                  className="relative overflow-hidden"
                  style={{ 
                    paddingBottom: getPaddingBottomForAspectRatio(item.aspectRatio),
                  }}
                >
                  {/* Image placeholder - in production, use real images */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <div className="text-white/50 font-semibold">{item.title}</div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                    <button className="bg-[#ff65c5] text-white font-medium py-2 px-4 rounded-full flex items-center text-sm transform scale-90 group-hover:scale-100 transition-transform duration-200">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
                
                {/* Save button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleSave(item.id)
                  }}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:opacity-100 opacity-80"
                >
                  <Bookmark 
                    className={`w-4 h-4 ${
                      savedItems.includes(item.id) 
                        ? "text-[#c7aeef] fill-[#c7aeef]" 
                        : "text-white"
                    }`} 
                  />
                </button>

                {/* Price tag */}
                <div className="absolute bottom-3 right-3 z-10 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-bold group-hover:opacity-100 opacity-90">
                  {item.price}
                </div>
              </div>
              
              {/* Content */}
              <div className="p-3">
                {/* Title */}
                <h3 className="text-white font-medium text-base mb-2 line-clamp-1">{item.title}</h3>
                
                {/* User info */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={item.user.avatar} alt={item.user.name} />
                      <AvatarFallback className="bg-[#333] text-white text-xs">
                        {item.user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-white/80 text-xs line-clamp-1">{item.user.name}</span>
                  </div>
                </div>
                
                {/* Distance and availability */}
                <div className="flex justify-between items-center mb-2 text-xs">
                  <div className="flex items-center text-white/60">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.distance}
                  </div>
                  <div className={`flex items-center ${item.available ? 'text-green-400' : 'text-amber-400'}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {item.available ? 'Available Now' : `Available ${(item as any).availableFrom}`}
                  </div>
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.categories.map((category) => (
                    <span 
                      key={`${item.id}-${category}`}
                      className="px-2 py-0.5 bg-[#2a2a2a] rounded-full text-white/70 text-[10px]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleLike(item.id)
                      }}
                      className="flex items-center text-white/70 hover:text-white"
                    >
                      <Heart 
                        className={`w-4 h-4 mr-1 ${
                          likedItems.includes(item.id) 
                            ? "text-[#ff65c5] fill-[#ff65c5]" 
                            : ""
                        }`} 
                      />
                      <span className="text-xs">{item.likes}</span>
                    </button>
                    
                    <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                    
                    <button className="w-6 h-6 flex items-center justify-center text-white/70 hover:text-white">
                      <Share className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <button className="bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white text-xs font-medium py-1.5 px-3 rounded-full hover:shadow-[0_0_10px_rgba(255,101,197,0.3)] transition-shadow">
                    Borrow
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="relative h-[600px] bg-[#1a1a1a] rounded-xl flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-image-pattern"></div>
          <div className="text-center p-6 z-10">
            <div className="w-16 h-16 bg-[#222] rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-[#ff65c5]" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Map View Coming Soon</h3>
            <p className="text-white/60 mb-4 max-w-md mx-auto">
              Soon you'll be able to discover fashion rentals near you with our interactive map feature.
            </p>
            <button 
              onClick={() => setViewMode("grid")}
              className="bg-white text-[#0f0f0f] font-medium py-2 px-6 rounded-full"
            >
              Back to Grid View
            </button>
          </div>
        </div>
      )}
      
      {/* Load more button */}
      <div className="mt-8 text-center">
        <button className="bg-white/10 hover:bg-white/15 text-white font-medium py-2.5 px-6 rounded-full transition-colors">
          Load More Styles
        </button>
      </div>
    </div>
  )
} 