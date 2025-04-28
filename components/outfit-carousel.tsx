"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const outfits = [
  {
    id: 1,
    title: "Vintage Denim",
    description: "Classic denim with a modern twist",
    image: "/images/outfit-vintage-denim.jpg",
  },
  {
    id: 2,
    title: "Eco Essentials",
    description: "Sustainable everyday staples",
    image: "/images/outfit-eco-essentials.jpg",
  },
  {
    id: 3,
    title: "Upcycled Chic",
    description: "Creative reuse and stylish design",
    image: "/images/outfit-upcycled-chic.jpg",
  },
  {
    id: 4,
    title: "Sustainable Luxury",
    description: "Eco-conscious premium fashion",
    image: "/images/outfit-sustainable-luxury.jpg",
  },
  {
    id: 5,
    title: "Minimalist Style",
    description: "Clean lines and essential pieces",
    image: "/images/outfit-minimalist.jpg",
  },
]

export default function OutfitCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % outfits.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full py-12 bg-black overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          {/* Text section */}
          <div className="md:w-1/3 mb-8 md:mb-0">
            <motion.span
              className="inline-block text-sm uppercase tracking-wider text-primary-pink mb-2"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Featured Collections
            </motion.span>
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-white mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Trending Styles
            </motion.h2>
            <motion.p
              className="text-gray-300 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Discover sustainable fashion pieces curated by our community. Each item tells a unique story of conscious
              style and creative expression.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="flex space-x-2">
                {outfits.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === activeIndex ? "bg-primary-pink w-6" : "bg-white/30"
                    }`}
                    aria-label={`View outfit ${index + 1}`}
                  />
                ))}
              </div>
            </motion.div>
          </div>

          {/* Outfit carousel */}
          <div className="md:w-2/3 relative h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {outfits.map((outfit, index) => {
                  // Calculate position based on index relative to active
                  const position = (index - activeIndex + outfits.length) % outfits.length
                  const isActive = position === 0
                  const isPrev = position === outfits.length - 1
                  const isNext = position === 1
                  const isHidden = !isActive && !isPrev && !isNext

                  return (
                    <motion.div
                      key={outfit.id}
                      className={`absolute transition-all duration-500 ease-in-out ${
                        isHidden ? "opacity-0 pointer-events-none" : "opacity-100"
                      }`}
                      style={{
                        left: isActive ? "50%" : isPrev ? "15%" : "85%",
                        transform: `translateX(-50%) scale(${isActive ? 1 : 0.7})`,
                        zIndex: isActive ? 30 : 20,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHidden ? 0 : 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div
                        className={`relative overflow-hidden rounded-t-[120px] ${
                          isActive ? "w-[300px] h-[450px]" : "w-[200px] h-[300px]"
                        }`}
                      >
                        <Image
                          src={outfit.image || "/placeholder.svg"}
                          alt={outfit.title}
                          fill
                          className="object-cover"
                          sizes={isActive ? "300px" : "200px"}
                        />
                        {isActive && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                          >
                            <span className="text-primary-pink text-sm uppercase">{outfit.title}</span>
                            <h3 className="text-white text-xl font-medium">{outfit.description}</h3>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
