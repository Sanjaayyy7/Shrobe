"use client"

import { useState } from "react"
import { Heart, MessageCircle, MapPin, Clock } from "lucide-react"

// Mock fashion items data for grid
const fashionItems = [
  {
    id: 1,
    image: "/images/grid/outfit1.jpg", // These would need to be added
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
]

export default function MasonryGrid() {
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  
  const toggleLike = (itemId: number) => {
    setLikedItems((prev) => 
      prev.includes(itemId) 
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    )
  }
  
  const handleDoubleTap = (itemId: number) => {
    if (!likedItems.includes(itemId)) {
      toggleLike(itemId)
      
      // Add heart animation logic here
    }
  }
  
  return (
    <div className="py-4">
      {/* View mode toggle */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-white">Trending Now</h2>
        
        <div className="flex border-2 border-white/10 rounded-full p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-white text-[#121212]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Grid View
          </button>
          <button
            onClick={() => setViewMode("map")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              viewMode === "map"
                ? "bg-white text-[#121212]"
                : "text-white/70 hover:text-white"
            }`}
          >
            Map View
          </button>
        </div>
      </div>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fashionItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white/5 rounded-2xl overflow-hidden backdrop-blur-sm hover:transform hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
              onDoubleClick={() => handleDoubleTap(item.id)}
            >
              {/* Image Container */}
              <div 
                className="relative bg-gray-700" 
                style={{ 
                  paddingBottom: getPaddingBottomForAspectRatio(item.aspectRatio),
                }}
              >
                {/* In production, replace with actual images */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <div className="text-white opacity-30 font-bold">{item.user.name}'s Outfit</div>
                </div>
                
                {/* Overlay for user interaction */}
                <div className="absolute inset-0">
                  {/* User info overlay */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                      <span className="text-[8px] text-white">{item.user.name[0]}</span>
                    </div>
                    <div className="text-white text-sm font-medium">{item.user.name}</div>
                  </div>
                  
                  {/* Like button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleLike(item.id)
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Heart 
                      className={`w-4 h-4 ${
                        likedItems.includes(item.id) 
                          ? "text-[#E91E63] fill-[#E91E63]" 
                          : "text-white"
                      }`} 
                    />
                  </button>
                  
                  {/* Price tag */}
                  <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-sm font-bold">
                    {item.price}
                  </div>
                </div>
              </div>
              
              {/* Content below image */}
              <div className="p-4">
                {/* Distance and availability */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center text-white/70 text-xs">
                    <MapPin className="w-3 h-3 mr-1" />
                    {item.distance}
                  </div>
                  <div className={`flex items-center text-xs ${item.available ? 'text-green-500' : 'text-amber-500'}`}>
                    <Clock className="w-3 h-3 mr-1" />
                    {item.available ? 'Available Now' : `Available ${(item as any).availableFrom}`}
                  </div>
                </div>
                
                {/* Categories */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {item.categories.map((category) => (
                    <span 
                      key={`${item.id}-${category}`}
                      className="px-2 py-0.5 bg-white/10 rounded-full text-white/80 text-[10px]"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center justify-center space-x-1 text-[#E91E63] bg-[#E91E63]/10 hover:bg-[#E91E63]/20 transition-colors rounded-full px-3 py-1.5">
                      <span className="text-xs font-medium">Borrow</span>
                    </button>
                    <button className="flex items-center justify-center w-8 h-8 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 transition-colors rounded-full">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center text-white/70">
                    <Heart className="w-3 h-3 mr-1" />
                    <span className="text-xs">{item.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[500px] bg-gray-800 rounded-2xl flex items-center justify-center">
          <p className="text-white/50">Map view would load here, showing available items by location</p>
        </div>
      )}
    </div>
  )
}

// Helper function to handle aspect ratio
function getPaddingBottomForAspectRatio(aspectRatio: string): string {
  const [width, height] = aspectRatio.split('/')
  const percentage = (parseInt(height) / parseInt(width)) * 100
  return `${percentage}%`
} 