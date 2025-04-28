"use client"

import { useEffect, useRef } from "react"
import { motion, useAnimation, useInView, type Variants } from "framer-motion"
import Link from "next/link"
import Image from "next/image"

// Updated closets with high-quality images
const closets = [
  {
    id: 1,
    name: "Jimena's Closet",
    items: 42,
    size: "S/M",
    styles: ["Festival", "Rave", "Casual"],
    images: [
      "/images/outfit-minimalist.jpg",
      "/images/fashion-social-sharing.jpg",
      "/images/fashion-ethical-clothing.jpg",
      "/images/fashion-contemporary-look.jpg",
      "/images/manifesto-sustainable.jpg",
      "/images/fashion-colorful-chic.jpg",
    ],
    featured: "/images/uploads/fashion-festival-outfit.jpg",
  },
  {
    id: 2,
    name: "Alex's Closet",
    items: 57,
    size: "M/L",
    styles: ["Beach", "Holiday Party", "Job Interview"],
    images: [
      "/images/outfit-upcycled-chic.jpg",
      "/images/fashion-urban-street.jpg",
      "/images/fashion-bohemian-style.jpg",
      "/images/manifesto-community.jpg",
      "/images/fashion-trendy-style.jpg",
      "/images/fashion-casual-elegant.jpg",
    ],
    featured: "/images/uploads/fashion-red-sequin.jpg",
  },
  {
    id: 3,
    name: "Sophia's Closet",
    items: 33,
    size: "XS/S",
    styles: ["Sorority Formal", "Date Night", "Prom"],
    images: [
      "/images/outfit-sustainable-luxury.jpg",
      "/images/manifesto-accessible.jpg",
      "/images/fashion-modern-wardrobe.jpg",
      "/images/outfit-eco-essentials.jpg",
      "/images/fashion-spring-collection.jpg",
      "/images/fashion-summer-outfit.jpg",
    ],
    featured: "/images/uploads/fashion-coastal-sunset.jpg",
  },
]

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.25,
      duration: 1.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  hover: {
    y: -12,
    transition: {
      duration: 0.5,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.0,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.7,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const buttonVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    backgroundColor: "#ff4d9d",
    transition: {
      duration: 0.3,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
  },
}

const tagVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

export default function AnimatedFeaturedClosets() {
  const controls = useAnimation()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })

  useEffect(() => {
    if (isInView) {
          controls.start("visible")
        }
  }, [controls, isInView])

  return (
    <section 
      ref={ref} 
      className="bg-gradient-to-b from-gray-900 to-black py-20 md:py-28 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <motion.div
          className="flex flex-col items-center mb-16"
          variants={titleVariants}
          initial="hidden"
          animate={controls}
        >
          <span className="text-primary-pink text-sm uppercase tracking-wider mb-2">
            Browse Curated Collections
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-center">
            Featured <span className="text-primary-pink">Closets</span>
          </h2>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {closets.map((closet) => (
            <motion.div
              key={closet.id}
              className="bg-gray-800/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-xl border border-gray-700/50"
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Featured image with overlay */}
              <div className="h-80 relative overflow-hidden group">
                <motion.div
                  variants={imageVariants}
                  className="absolute inset-0"
                >
                  <Image
                    src={closet.featured}
                    alt={`Featured item in ${closet.name}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80"></div>
                </motion.div>
                {/* Removed hover grid of images */}
                {/* Closet name overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <motion.h3 
                    className="text-2xl font-bold text-white mb-2"
                    variants={titleVariants}
                  >
                    {closet.name}
                  </motion.h3>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between text-gray-300 text-sm mb-4">
                  <motion.span 
                    variants={tagVariants}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1 text-primary-pink" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
                    </svg>
                    {closet.items} items
                  </motion.span>
                  <motion.span 
                    variants={tagVariants}
                    className="flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1 text-primary-pink" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
                    </svg>
                    Size {closet.size}
                  </motion.span>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {closet.styles.map((style, i) => (
                    <motion.span
                      key={i}
                      className="bg-gray-700/70 text-gray-200 text-xs px-3 py-1 rounded-full backdrop-blur-sm border border-gray-600/30"
                      variants={tagVariants}
                      transition={{ delay: 0.2 + 0.1 * i }}
                    >
                      {style}
                    </motion.span>
                  ))}
                </div>

                <div className="text-center">
                  <motion.button
                    className="w-full bg-primary-pink text-white font-medium py-3 px-6 rounded-lg"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    >
                      Take a look
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
