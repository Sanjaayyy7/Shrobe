"use client"

import { useState, useRef } from "react"
import { Heart, MessageCircle, MapPin, Clock, Share, Bookmark, ArrowRight, Filter, Grid, Layers, Search, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

// Mock fashion items data with improved data for a Pexels-like experience
const fashionItems = [
  {
    id: 1,
    image: "/images/uploads/fashion-red-sequin.jpg",
    title: "Red Sequin Gown",
    description: "Statement floor-length sequin dress with slim straps for special occasions",
    user: {
      name: "Sophia Davis",
      username: "sophiastyle",
      avatar: "/images/avatars/sophia.jpg",
    },
    likes: 2941,
    price: "$45/day",
    available: true,
    distance: "0.8 mi",
    categories: ["Evening", "Formal", "Statement"],
    aspectRatio: "2/3", // Tall
    color: "#E84D60" // Primary color
  },
  {
    id: 2,
    image: "/images/uploads/fashion-coastal-sunset.jpg",
    title: "Coastal Knit Ensemble",
    description: "Relaxed cream knit cardigan with wide-leg pants for beach-side evenings",
    user: {
      name: "Alex Chen",
      username: "alexurban",
      avatar: "/images/avatars/alex.jpg",
    },
    likes: 3428,
    price: "$32/day",
    available: true,
    distance: "1.2 mi",
    categories: ["Casual", "Bohemian", "Evening"],
    aspectRatio: "3/4", // Medium tall
    color: "#F5A623" // Primary color
  },
  {
    id: 3,
    image: "/images/uploads/fashion-festival-outfit.jpg",
    title: "Festival Ready Outfit",
    description: "Stylish festival look with cargo pants, white bikini top and boho accessories",
    user: {
      name: "Zara Thompson",
      username: "zaradesigns",
      avatar: "/images/avatars/zara.jpg",
    },
    likes: 2752,
    price: "$38/day",
    available: true,
    distance: "2.5 mi",
    categories: ["Festival", "Summer", "Casual"],
    aspectRatio: "2/3", // Tall
    color: "#89CFF0" // Primary color
  },
  {
    id: 4,
    image: "/images/uploads/fashion-western-inspired.jpg",
    title: "Western-Inspired Look",
    description: "Stylish western-inspired outfit with corset top, white skirt and cowboy boots",
    user: {
      name: "Marco Rodriguez",
      username: "marcofashion",
      avatar: "/images/avatars/marco.jpg",
    },
    likes: 3124,
    price: "$42/day",
    available: true,
    distance: "0.5 mi",
    categories: ["Western", "Statement", "Theme"],
    aspectRatio: "2/3", // Tall
    color: "#A98274" // Primary color
  },
  {
    id: 5,
    image: "/images/uploads/fashion-red-sequin.jpg",
    title: "Evening Gala Elegance",
    description: "Designer evening gown with intricate beading and dramatic train",
    user: {
      name: "Olivia Martinez",
      username: "oliviastyle",
      avatar: "/images/avatars/ava.jpg",
    },
    likes: 1864,
    price: "$75/day",
    available: false,
    availableFrom: "Jun 15",
    distance: "3.1 mi",
    categories: ["Luxury", "Formal", "Gala"],
    aspectRatio: "3/4", // Medium tall
    color: "#9D65C9" // Primary color
  },
  {
    id: 6,
    image: "/images/uploads/fashion-western-inspired.jpg",
    title: "Vintage Denim Collection",
    description: "Curated vintage denim pieces with authentic wear patterns",
    user: {
      name: "Jackson Reed",
      username: "jacksonvintage",
      avatar: "/images/avatars/jackson.jpg",
    },
    likes: 1598,
    price: "$29/day",
    available: true,
    distance: "1.7 mi",
    categories: ["Vintage", "Denim", "Casual"],
    aspectRatio: "4/5", // Medium tall
    color: "#4169E1" // Primary color
  },
  {
    id: 7,
    image: "/images/uploads/fashion-festival-outfit.jpg",
    title: "Summer Festival Set",
    description: "Vibrant festival-ready outfit with bold prints and comfortable fabrics",
    user: {
      name: "Isabella Wong",
      username: "bellafestival",
      avatar: "/images/avatars/isabella.jpg",
    },
    likes: 2142,
    price: "$35/day",
    available: true,
    distance: "0.9 mi",
    categories: ["Festival", "Summer", "Vibrant"],
    aspectRatio: "1/1", // Square
    color: "#FF9966" // Primary color
  },
  {
    id: 8,
    image: "/images/uploads/fashion-coastal-sunset.jpg",
    title: "Minimal Beach Collection",
    description: "Effortless beach-to-bar collection in neutral, relaxed fabrics",
    user: {
      name: "Lucas White",
      username: "lucasminimal",
      avatar: "/images/avatars/lucas.jpg",
    },
    likes: 1876,
    price: "$32/day",
    available: true,
    distance: "2.3 mi",
    categories: ["Beach", "Minimal", "Neutral"],
    aspectRatio: "2/3", // Tall
    color: "#D8BFD8" // Primary color
  },
  {
    id: 9,
    image: "/images/uploads/fashion-red-sequin.jpg",
    title: "Modern Party Collection",
    description: "Contemporary party pieces with unexpected silhouettes and textures",
    user: {
      name: "Sophia Taylor",
      username: "sophiaparty",
      avatar: "/images/avatars/sophia.jpg",
    },
    likes: 1989,
    price: "$45/day",
    available: true,
    distance: "1.5 mi",
    categories: ["Party", "Modern", "Evening"],
    aspectRatio: "4/5", // Medium tall
    color: "#FF69B4" // Primary color
  },
  {
    id: 10,
    image: "/images/uploads/fashion-western-inspired.jpg",
    title: "Sustainable Summer Edit",
    description: "Eco-conscious summer collection made from recycled materials",
    user: {
      name: "Aiden Wilson",
      username: "aidensustainable",
      avatar: "/images/avatars/aiden.jpg",
    },
    likes: 1732,
    price: "$38/day",
    available: true,
    distance: "0.7 mi",
    categories: ["Sustainable", "Summer", "Eco"],
    aspectRatio: "1/1", // Square
    color: "#98FB98" // Primary color
  },
  {
    id: 11,
    image: "/images/uploads/fashion-festival-outfit.jpg",
    title: "Designer Weekend Capsule",
    description: "Curated designer weekend pieces that mix and match perfectly",
    user: {
      name: "Zoe Johnson",
      username: "zoecapsule",
      avatar: "/images/avatars/zoe.jpg",
    },
    likes: 2254,
    price: "$55/day",
    available: false, 
    availableFrom: "May 30",
    distance: "1.9 mi",
    categories: ["Designer", "Capsule", "Weekend"],
    aspectRatio: "3/4", // Medium tall
    color: "#C39BD3" // Primary color
  },
  {
    id: 12,
    image: "/images/uploads/fashion-coastal-sunset.jpg",
    title: "Urban Explorer Collection",
    description: "City-ready pieces designed for versatility and movement",
    user: {
      name: "Marcus Davis",
      username: "marcusurban",
      avatar: "/images/avatars/marcus.jpg",
    },
    likes: 1892,
    price: "$40/day",
    available: true,
    distance: "2.2 mi",
    categories: ["Urban", "Streetwear", "City"],
    aspectRatio: "2/3", // Tall
    color: "#778899" // Primary color
  },
]

// Define filter categories for Pexels-inspired filter bar
const filterCategories = [
  "All Styles",
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Footwear",
  "Accessories",
  "Formal",
  "Casual",
  "Streetwear",
  "Vintage",
  "Designer",
  "Sustainable"
];

export default function MasonryGrid() {
  const [likedItems, setLikedItems] = useState<number[]>([])
  const [savedItems, setSavedItems] = useState<number[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid")
  const [activeFilter, setActiveFilter] = useState("All Styles")
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const filterScrollRef = useRef<HTMLDivElement>(null)
  
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
  
  // Horizontal scroll for filters
  const scrollLeft = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (filterScrollRef.current) {
      filterScrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Main Title Inspired by Pexels */}
      <div className="mb-8 flex flex-col">
        <h2 className="text-3xl font-bold text-white mb-2">
          Free Fashion Photos
        </h2>
        <div className="flex justify-between items-center">
          <div className="flex space-x-3 text-white/70 text-sm">
            <button className="font-medium text-white border-b-2 border-white pb-1">
              Photos <span className="opacity-70 ml-1">697K</span>
            </button>
            <button className="hover:text-white transition-colors">
              Videos <span className="opacity-70 ml-1">55K</span>
            </button>
            <button className="hover:text-white transition-colors">
              Users <span className="opacity-70 ml-1">3.3K</span>
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 border border-white/20 rounded-lg px-3 py-2 text-white hover:bg-white/5 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm">Filters</span>
            </button>
            
            <div className="flex items-center space-x-1 border border-white/20 rounded-lg overflow-hidden">
              <button 
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode("map")}
                className={`px-3 py-2 text-sm ${viewMode === "map" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"}`}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter pills - Pexels inspired */}
      <div className="relative mb-8 overflow-hidden">
        {/* Left scroll button */}
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-r from-black to-transparent pr-5 pl-1 h-full flex items-center"
        >
          <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors">
            <X className="w-4 h-4 text-white rotate-45" />
          </div>
        </button>
        
        <div 
          ref={filterScrollRef}
          className="flex space-x-2 py-2 overflow-x-auto whitespace-nowrap px-1"
          style={{ 
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {filterCategories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeFilter === category
                  ? "bg-white text-black"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Right scroll button */}
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-gradient-to-l from-black to-transparent pl-5 pr-1 h-full flex items-center"
        >
          <div className="bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      </div>
      
      {/* Advanced filter panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 mb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Advanced Filters</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="text-white text-sm font-medium block mb-2">
                  Price Range
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Min"
                      className="w-full bg-[#222] text-white border border-white/20 rounded-lg py-2 pl-6 pr-2 text-sm focus:outline-none focus:border-[#ff65c5]"
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
                  </div>
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="Max"
                      className="w-full bg-[#222] text-white border border-white/20 rounded-lg py-2 pl-6 pr-2 text-sm focus:outline-none focus:border-[#ff65c5]"
                    />
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/50">$</span>
                  </div>
                </div>
              </div>
              
              {/* Availability */}
              <div>
                <label className="text-white text-sm font-medium block mb-2">
                  Availability
                </label>
                <div className="space-y-2">
                  <label className="flex items-center text-white">
                    <input type="checkbox" className="mr-2 accent-[#ff65c5]" />
                    <span className="text-sm">Available Now</span>
                  </label>
                  <label className="flex items-center text-white">
                    <input type="checkbox" className="mr-2 accent-[#ff65c5]" />
                    <span className="text-sm">Available This Weekend</span>
                  </label>
                </div>
              </div>
              
              {/* Distance */}
              <div>
                <label className="text-white text-sm font-medium block mb-2">
                  Distance
                </label>
                <select className="w-full bg-[#222] text-white border border-white/20 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-[#ff65c5] appearance-none">
                  <option>Within 5 miles</option>
                  <option>Within 10 miles</option>
                  <option>Within 25 miles</option>
                  <option>Any distance</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-3">
              <button className="px-4 py-2 border border-white/20 rounded-lg text-white text-sm hover:bg-white/5 transition-colors">
                Reset
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white text-sm rounded-lg">
                Apply Filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {fashionItems.map((item) => (
            <motion.div 
              key={item.id}
              className="relative rounded-xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              whileHover={{ y: -5 }}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              onDoubleClick={() => handleDoubleTap(item.id)}
            >
              {/* Main Image */}
              <Link href="#">
                <div className="relative aspect-[5/6] overflow-hidden bg-gray-900 rounded-xl">
                  <div className="absolute inset-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-700"
                      style={{
                        transform: hoveredItem === item.id ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  </div>
                  
                  {/* Color overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"
                    initial={{ opacity: 0.6 }}
                    animate={{ 
                      opacity: hoveredItem === item.id ? 0.8 : 0.6,
                      background: hoveredItem === item.id 
                        ? `linear-gradient(to top, #000, rgba(0,0,0,0.4), transparent)`
                        : 'linear-gradient(to top, #000, rgba(0,0,0,0.2), transparent)'
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Quick action buttons - appear on hover */}
                  <AnimatePresence>
                    {hoveredItem === item.id && (
                      <motion.div 
                        className="absolute top-4 right-4 flex space-x-2"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleSave(item.id)
                          }}
                          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Bookmark 
                            className={`w-4 h-4 ${
                              savedItems.includes(item.id) 
                                ? "text-[#c7aeef] fill-[#c7aeef]" 
                                : "text-white"
                            }`} 
                          />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleLike(item.id)
                          }}
                          className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              likedItems.includes(item.id) 
                                ? "text-[#ff65c5] fill-[#ff65c5]" 
                                : "text-white"
                            }`} 
                          />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {/* Price tag */}
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
                    {item.price}
                  </div>
                  
                  {/* Item info footer */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8 border-2 border-white/20">
                          <AvatarImage src={item.user.avatar} alt={item.user.name} />
                          <AvatarFallback className="bg-[#333] text-white">
                            {item.user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-white font-medium text-sm line-clamp-1">
                            {item.title}
                          </p>
                          <p className="text-white/70 text-xs">
                            @{item.user.username}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Heart className={`w-4 h-4 mr-1 ${
                          likedItems.includes(item.id) 
                            ? "text-[#ff65c5] fill-[#ff65c5]" 
                            : "text-white/90"
                        }`} />
                        <span className="text-white text-xs">
                          {(item.likes / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                    
                    {/* View details button - appears on hover */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="mt-3"
                        >
                          <button className="w-full py-2 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white text-sm font-medium rounded-lg flex items-center justify-center">
                            <span className="mr-1">Borrow Now</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </Link>
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
      
      {/* Load more button - Pexels style */}
      <div className="mt-10 text-center">
        <motion.button 
          className="inline-flex items-center justify-center px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
        >
          Load More
        </motion.button>
      </div>
    </div>
  )
} 