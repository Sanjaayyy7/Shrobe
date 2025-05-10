"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Grid, Layers } from "lucide-react"
import ListingCard from "./listing-card"
import { Listing } from "@/lib/types"
import { getListings } from "@/lib/database"

// Define filter categories
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

interface ListingGridProps {
  initialListings?: Listing[]
  showFilters?: boolean
}

export default function ListingGrid({ 
  initialListings,
  showFilters = true 
}: ListingGridProps) {
  const [listings, setListings] = useState<Listing[]>(initialListings || [])
  const [isLoading, setIsLoading] = useState(!initialListings)
  const [activeFilter, setActiveFilter] = useState("All Styles")
  const [viewMode, setViewMode] = useState<"grid" | "masonry">("masonry")
  const [likedItems, setLikedItems] = useState<string[]>([])
  const [savedItems, setSavedItems] = useState<string[]>([])
  
  // Fetch listings if not provided
  useEffect(() => {
    if (!initialListings) {
      fetchListings()
    }
  }, [initialListings])
  
  const fetchListings = async (category?: string) => {
    try {
      setIsLoading(true)
      
      const filters = category && category !== "All Styles" 
        ? { category } 
        : undefined
        
      const data = await getListings(filters)
      setListings(data)
    } catch (error) {
      console.error("Error fetching listings:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFilterChange = (category: string) => {
    setActiveFilter(category)
    fetchListings(category === "All Styles" ? undefined : category)
  }
  
  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "masonry" : "grid")
  }
  
  const handleDoubleTap = (id: string) => {
    if (!likedItems.includes(id)) {
      setLikedItems([...likedItems, id])
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading listings...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="w-full">
      {/* Filter bar */}
      {showFilters && (
        <div className="mb-8">
          {/* Category filters */}
          <div className="relative mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-4 h-4 text-[#FF5CB1]" />
              <h3 className="text-white font-medium">Filter By Category</h3>
            </div>
            
            <div className="overflow-x-auto pb-2 -mx-4 px-4">
              <div className="flex gap-2 min-w-max">
                {filterCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleFilterChange(category)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all ${
                      activeFilter === category
                        ? "bg-[#FF5CB1] text-white"
                        : "bg-gray-800/50 text-white/70 hover:bg-gray-800"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* View toggle and results count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-white/70 text-sm">
              {listings.length} {listings.length === 1 ? 'item' : 'items'} found
            </p>
            
            <button
              onClick={toggleViewMode}
              className="flex items-center gap-1 text-white/70 hover:text-white text-sm"
            >
              {viewMode === "grid" ? (
                <>
                  <Layers className="w-4 h-4" />
                  <span>Masonry View</span>
                </>
              ) : (
                <>
                  <Grid className="w-4 h-4" />
                  <span>Grid View</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Listings grid */}
      {listings.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center bg-gray-900/50 rounded-xl border border-white/10">
          <div className="text-center p-8">
            <h3 className="text-xl font-medium text-white mb-2">No listings found</h3>
            <p className="text-white/70">Try adjusting your filters or check back later</p>
          </div>
        </div>
      ) : (
        <motion.div 
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(10px,_auto)]"
          }`}
          layout
          transition={{ duration: 0.4 }}
        >
          {listings.map((listing) => (
            <motion.div
              key={listing.id}
              layout
              className={viewMode === "masonry" ? `${getRandomHeight()}` : ""}
            >
              <ListingCard
                listing={listing}
                onDoubleTap={handleDoubleTap}
                isLiked={likedItems.includes(listing.id)}
                isSaved={savedItems.includes(listing.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

// Helper function to create a masonry-like layout with random heights
function getRandomHeight() {
  const heights = [
    "row-span-1", // default height
    "row-span-1",
    "row-span-1",
    "row-span-2", // taller items
  ]
  return heights[Math.floor(Math.random() * heights.length)]
} 