"use client"

import { useState, useEffect, useRef } from "react"
import { motion, useAnimation, useScroll, useTransform, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

// We'll use the same images as in the tinder component
const styleImages = [
  "/images/uploads/fashion-coastal-sunset.jpg",
  "/images/uploads/fashion-red-sequin.jpg",
  "/images/uploads/fashion-festival-outfit.jpg", 
  "/images/uploads/fashion-western-inspired.jpg"
]

export default function ShareYourStyleSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const controls = useAnimation()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Create parallax effect when scrolling
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  })
  
  // Transform values for parallax effects
  const y = useTransform(scrollYProgress, [0, 1], [0, -100])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.8, 1], [0.3, 1, 1, 0.8])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 1.05])
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100])
  const rotateBackground = useTransform(scrollYProgress, [0, 1], [0, -5])
  
  // Cycle through images in background
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % styleImages.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Animate in when in view
  useEffect(() => {
    controls.start({ opacity: 1, y: 0 })
  }, [controls])
  
  return (
    <motion.section 
      ref={containerRef}
      className="relative overflow-hidden min-h-[90vh] flex items-center"
      style={{ opacity, scale }}
    >
      {/* Animated background dots */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            rotate: rotateBackground
          }}
        />
      </div>
      
      {/* Pink to purple gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-primary-pink/30 via-black/70 to-black/90 z-0"></div>
      
      {/* Rotating background images */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.4, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.2, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <Image
              src={styleImages[currentImageIndex]}
              alt="Fashion style"
              fill
              className="object-cover blur-sm"
              priority
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Subtitle with slide-in animation */}
          <motion.span 
            className="text-primary-pink text-sm md:text-base uppercase tracking-wider inline-block mb-4 font-medium"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.6 }}
          >
            LET YOUR WARDROBE WORK FOR YOU
          </motion.span>
          
          {/* Main title with character-by-character animation */}
          <div className="overflow-hidden">
            <motion.h2 
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tighter"
              style={{ y: textY }}
            >
              {"Share Your Style".split("").map((char, index) => (
                <motion.span
                  key={index}
                  className="inline-block"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: 0.05 * index,
                    ease: "easeOut" 
                  }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h2>
          </div>
          
          {/* Description with fade-in animation */}
          <motion.p 
            className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Rent out pieces you love but rarely wear
          </motion.p>
          
          {/* Button with hover animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={controls}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Link 
              href="#explore"
              className="relative inline-block group"
            >
              <motion.span 
                className="inline-block bg-primary-pink text-white font-medium text-lg py-4 px-10 rounded-full z-10 relative"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                Explore Now
              </motion.span>
              <motion.span 
                className="absolute inset-0 bg-white rounded-full blur-md z-0 opacity-50 group-hover:opacity-70"
                initial={{ scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          </motion.div>
        </div>
        
        {/* Animated floating fashion images */}
        <div className="hidden lg:block">
          {styleImages.map((image, index) => (
            <motion.div
              key={index}
              className="absolute rounded-xl overflow-hidden shadow-2xl border border-white/20 w-48 h-64"
              style={{
                top: `${20 + index * 15}%`,
                left: index % 2 === 0 ? '5%' : 'auto',
                right: index % 2 === 1 ? '5%' : 'auto',
                y: useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -50 : 50]),
                rotate: useTransform(scrollYProgress, [0, 1], [0, index % 2 === 0 ? -5 : 5]),
                scale: 0.85
              }}
              whileHover={{ scale: 1, zIndex: 20 }}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.2 * index + 0.6,
                type: "spring",
                stiffness: 100
              }}
            >
              <Image
                src={image}
                alt="Fashion style"
                fill
                className="object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
} 