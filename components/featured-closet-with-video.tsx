"use client"

import { useState, useRef } from "react"
import { motion, useInView } from "framer-motion"
import Link from "next/link"
import VideoBackground from "./video-background"

interface FeaturedClosetWithVideoProps {
  id: number
  name: string
  description: string
  videoSrc: string
  fallbackImageSrc: string
  itemCount: number
  size: string
  styles: string[]
}

export default function FeaturedClosetWithVideo({
  id,
  name,
  description,
  videoSrc,
  fallbackImageSrc,
  itemCount,
  size,
  styles,
}: FeaturedClosetWithVideoProps) {
  const [isHovered, setIsHovered] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1.0],
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  }
  
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1.0]
      }
    }
  }
  
  const tagVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6
      }
    }
  }
  
  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    hover: {
      scale: 1.05,
      backgroundColor: "#ff4d9d",
      transition: {
        duration: 0.3
      }
    },
    tap: {
      scale: 0.98
    }
  }

  return (
    <motion.div
      ref={ref}
      className="relative w-full h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-gray-800/50"
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video background */}
      <div className="absolute inset-0">
        <VideoBackground
          videoSrc={videoSrc}
          fallbackImageSrc={fallbackImageSrc}
          alt={name}
          overlayClassName={`bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-700 ${
            isHovered ? "opacity-60" : "opacity-80"
          }`}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-10 z-10">
        <motion.div variants={childVariants}>
          <motion.h3 
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            variants={childVariants}
          >
            {name}
          </motion.h3>
          
          <motion.p 
            className="text-gray-200 mb-5 max-w-md text-lg"
            variants={childVariants}
          >
            {description}
          </motion.p>

        <motion.div
            className="flex justify-between text-gray-300 text-sm mb-5"
            variants={childVariants}
        >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-primary-pink" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"></path>
              </svg>
              {itemCount} items
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-primary-pink" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
              Size {size}
            </span>
          </motion.div>

          <div className="flex flex-wrap gap-2 mb-8">
            {styles.map((style, i) => (
              <motion.span
                key={i}
                className="bg-gray-800/60 backdrop-blur-sm text-gray-200 text-xs px-4 py-1.5 rounded-full border border-gray-700/30"
                variants={tagVariants}
                custom={i}
                transition={{ delay: 0.1 * i }}
              >
                {style}
              </motion.span>
            ))}
          </div>

          <motion.div variants={buttonVariants}>
            <Link href={`#closet-${id}`}>
              <motion.button
                className="bg-primary-pink text-white font-medium py-3 px-8 rounded-lg"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
            >
              Explore Closet
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}
