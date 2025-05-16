"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Filter, Grid, Layers, MapPin } from "lucide-react"
import ListingCard from "./listing-card"
import MapView from "./map-view"
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
  const [viewMode, setViewMode] = useState<"grid" | "masonry" | "map">("masonry")
  const [likedItems, setLikedItems] = useState<string[]>([])
  const [savedItems, setSavedItems] = useState<string[]>([])
  
  // Fetch listings if not provided
  useEffect(() => {
    if (!initialListings) {
      fetchListings()
    } else {
      // Log the structure of initialListings for debugging
      console.log("Initial listings provided:", initialListings.length);
      console.log("First listing images sample:", initialListings[0]?.images);
    }
  }, [initialListings])
  
  const fetchListings = async (category?: string) => {
    try {
      setIsLoading(true)
      setListings([]) // Reset listings while loading
      
      const filters = category && category !== "All Styles" 
        ? { category } 
        : undefined
        
      const data = await getListings(filters)
      
      // Log success info
      console.log(`Fetched ${data.length} listings with category ${category || 'All'}`);
      
      // Check if we got empty data
      if (data.length === 0) {
        console.log("No listings found for the selected category");
      } else if (data[0]) { // Check if first item exists before accessing
        console.log("First listing sample:", {
          id: data[0].id,
          title: data[0].title,
          has_images: Array.isArray(data[0].images) && data[0].images.length > 0
        });
      }
      
      setListings(data)
    } catch (error) {
      console.error("Error fetching listings:", error)
      // Set empty listings but don't crash
      setListings([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleFilterChange = (category: string) => {
    setActiveFilter(category)
    try {
      fetchListings(category === "All Styles" ? undefined : category)
    } catch (error) {
      console.error("Error changing filter category:", error)
      // Set loading to false in case of error
      setIsLoading(false)
    }
  }
  
  const toggleViewMode = (mode: "grid" | "masonry" | "map") => {
    setViewMode(mode)
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
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleViewMode("masonry")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === "masonry" 
                    ? "bg-[#FF5CB1] text-white" 
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800"
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Masonry</span>
              </button>
              <button
                onClick={() => toggleViewMode("grid")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === "grid" 
                    ? "bg-[#FF5CB1] text-white" 
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800"
                }`}
              >
                <Grid className="w-4 h-4" />
                <span>Grid</span>
              </button>
              <button
                onClick={() => toggleViewMode("map")}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                  viewMode === "map" 
                    ? "bg-[#FF5CB1] text-white" 
                    : "bg-gray-800/50 text-white/70 hover:bg-gray-800"
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Display based on view mode */}
      {listings.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center bg-gray-900/50 rounded-xl border border-white/10">
          <div className="text-center p-8">
            <h3 className="text-xl font-medium text-white mb-2">No listings found</h3>
            <p className="text-white/70">Try adjusting your filters or check back later</p>
          </div>
        </div>
      ) : viewMode === "map" ? (
        <MapView listings={listings} />
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

// Helper function to generate random heights for masonry layout
function getRandomHeight() {
  const heights = ["", "row-span-1", "row-span-2"];
  return heights[Math.floor(Math.random() * heights.length)];
} 