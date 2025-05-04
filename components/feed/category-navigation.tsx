"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Tag, MapPin, Clock, Sliders, Check } from "lucide-react"

// Filter categories for navigation
const categories = [
  {
    id: "styles",
    name: "Styles",
    icon: <Tag className="w-4 h-4" />,
    options: [
      { id: "y2k", label: "Y2K" },
      { id: "streetwear", label: "Streetwear" },
      { id: "minimalist", label: "Minimalist" },
      { id: "vintage", label: "Vintage" },
      { id: "luxury", label: "Luxury" },
      { id: "athleisure", label: "Athleisure" },
    ],
  },
  {
    id: "occasions",
    name: "Occasions",
    icon: <Tag className="w-4 h-4" />,
    options: [
      { id: "festival", label: "Festival" },
      { id: "party", label: "Party" },
      { id: "work", label: "Work" },
      { id: "everyday", label: "Everyday" },
      { id: "formal", label: "Formal" },
      { id: "beach", label: "Beach" },
    ],
  },
  {
    id: "themes",
    name: "Themes",
    icon: <Tag className="w-4 h-4" />,
    options: [
      { id: "monochrome", label: "Monochrome" },
      { id: "spring23", label: "Spring '23" },
      { id: "summer-vibes", label: "Summer Vibes" },
      { id: "fall-layers", label: "Fall Layers" },
      { id: "neon", label: "Neon Accents" },
      { id: "pastel", label: "Pastel" },
    ],
  },
  {
    id: "availability",
    name: "Availability",
    icon: <Clock className="w-4 h-4" />,
    options: [
      { id: "now", label: "Available Now" },
      { id: "this-weekend", label: "This Weekend" },
      { id: "next-week", label: "Next Week" },
      { id: "this-month", label: "This Month" },
    ],
  },
  {
    id: "distance",
    name: "Distance",
    icon: <MapPin className="w-4 h-4" />,
    options: [
      { id: "nearby", label: "Nearby" },
      { id: "within-5mi", label: "Within 5 miles" },
      { id: "within-10mi", label: "Within 10 miles" },
      { id: "within-25mi", label: "Within 25 miles" },
    ],
  },
]

export default function CategoryNavigation() {
  const [selectedCategory, setSelectedCategory] = useState("styles")
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({
    styles: [],
    occasions: [],
    themes: [],
    availability: [],
    distance: [],
  })
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (!showFilterMenu) setShowFilterMenu(true)
  }
  
  const handleFilterToggle = (filterId: string) => {
    setSelectedFilters((prev) => {
      const category = selectedCategory
      const categoryFilters = [...prev[category]]
      
      // Toggle the filter
      if (categoryFilters.includes(filterId)) {
        return {
          ...prev,
          [category]: categoryFilters.filter((id) => id !== filterId),
        }
      } else {
        return {
          ...prev,
          [category]: [...categoryFilters, filterId],
        }
      }
    })
  }
  
  const isFilterSelected = (filterId: string) => {
    return selectedFilters[selectedCategory].includes(filterId)
  }
  
  const activeCategory = categories.find((cat) => cat.id === selectedCategory)
  
  // Calculate total selected filters
  const totalSelectedFilters = Object.values(selectedFilters).reduce(
    (total, filters) => total + filters.length,
    0
  )
  
  return (
    <div className="relative">
      {/* Category tabs */}
      <div className="overflow-x-auto no-scrollbar">
        <div className="flex space-x-2 w-max min-w-full">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white"
                  : "bg-[#1a1a1a] text-white/80 hover:text-white hover:bg-[#222]"
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
              {selectedFilters[category.id].length > 0 && (
                <span className="ml-1.5 w-5 h-5 rounded-full bg-white text-[#0f0f0f] text-xs flex items-center justify-center">
                  {selectedFilters[category.id].length}
                </span>
              )}
            </motion.button>
          ))}

          {/* Advanced filter button */}
          <motion.button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="px-4 py-2 rounded-full text-sm flex items-center bg-[#1a1a1a] text-white/80 hover:text-white hover:bg-[#222] whitespace-nowrap"
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
          >
            <Sliders className="w-4 h-4 mr-1.5" />
            Filters
            {totalSelectedFilters > 0 && (
              <span className="ml-1.5 w-5 h-5 rounded-full bg-white text-[#0f0f0f] text-xs flex items-center justify-center">
                {totalSelectedFilters}
              </span>
            )}
          </motion.button>
        </div>
      </div>
      
      {/* Filter options dropdown */}
      {showFilterMenu && (
        <div className="mt-2 pt-3 pb-3 px-3 bg-[#1a1a1a] rounded-xl shadow-lg absolute z-30 w-full max-w-full left-0 right-0">
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white/90 mb-1">
              {activeCategory?.name} Options
            </h3>
            <button 
              onClick={() => setShowFilterMenu(false)}
              className="text-xs text-white/60 hover:text-white"
            >
              Close
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {activeCategory?.options.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => handleFilterToggle(filter.id)}
                className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center ${
                  isFilterSelected(filter.id)
                    ? "bg-[#ff65c5] text-white"
                    : "bg-[#292929] text-white/70 hover:bg-[#333] hover:text-white"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isFilterSelected(filter.id) && (
                  <Check className="w-3 h-3 mr-1" />
                )}
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      )}
      
      {/* Selected filters summary */}
      {totalSelectedFilters > 0 && (
        <div className="mt-3 flex flex-wrap items-center">
          <span className="text-xs text-white/50 mr-2">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(selectedFilters).map(([categoryId, filters]) =>
              filters.map((filterId) => {
                const category = categories.find((c) => c.id === categoryId)
                const filter = category?.options.find((o) => o.id === filterId)
                
                if (!filter) return null
                
                return (
                  <motion.div 
                    key={`${categoryId}-${filterId}`}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-[#292929] text-[10px] text-white/80"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {filter.label}
                    <button 
                      className="ml-1 text-white/60 hover:text-white"
                      onClick={() => {
                        setSelectedFilters((prev) => ({
                          ...prev,
                          [categoryId]: prev[categoryId].filter((id) => id !== filterId),
                        }))
                      }}
                    >
                      ×
                    </button>
                  </motion.div>
                )
              })
            )}
            
            {/* Clear all filters button */}
            {totalSelectedFilters > 0 && (
              <motion.button
                className="inline-flex items-center px-2 py-1 rounded-full bg-[#1a1a1a] text-[10px] text-white/60 hover:bg-[#292929] hover:text-white/80"
                onClick={() => {
                  setSelectedFilters({
                    styles: [],
                    occasions: [],
                    themes: [],
                    availability: [],
                    distance: [],
                  })
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear all
              </motion.button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 