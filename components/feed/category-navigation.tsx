"use client"

import { useState } from "react"

// Filter categories for navigation
const categories = [
  {
    id: "styles",
    name: "Styles",
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
  
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
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
  
  return (
    <div className="py-3">
      {/* Category tabs */}
      <div className="mb-3 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-1 px-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "bg-white text-[#121212]"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Filter options for selected category */}
      <div className="overflow-x-auto scrollbar-hide pb-1">
        <div className="flex space-x-2 px-1">
          {activeCategory?.options.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                isFilterSelected(filter.id)
                  ? "bg-[#E91E63] text-white"
                  : "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Selected filters summary (only visible if filters are selected) */}
      {Object.values(selectedFilters).some((filters) => filters.length > 0) && (
        <div className="mt-4 flex items-center">
          <span className="text-xs text-white/50 mr-2">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(selectedFilters).map(([categoryId, filters]) =>
              filters.map((filterId) => {
                const category = categories.find((c) => c.id === categoryId)
                const filter = category?.options.find((o) => o.id === filterId)
                
                if (!filter) return null
                
                return (
                  <div 
                    key={`${categoryId}-${filterId}`}
                    className="inline-flex items-center px-2 py-1 rounded-full bg-white/10 text-[10px] text-white/80"
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
                  </div>
                )
              })
            )}
            
            {/* Clear all filters button */}
            {Object.values(selectedFilters).some((filters) => filters.length > 0) && (
              <button
                className="inline-flex items-center px-2 py-1 rounded-full bg-white/5 text-[10px] text-white/60 hover:bg-white/10 hover:text-white/80"
                onClick={() => {
                  setSelectedFilters({
                    styles: [],
                    occasions: [],
                    themes: [],
                    availability: [],
                    distance: [],
                  })
                }}
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
} 