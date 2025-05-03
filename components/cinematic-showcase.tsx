"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import AnimatedBackground from "./animated-background"
import VideoBackground from "./video-background"

// User avatars for social proof
const userAvatars = [
  "/images/uploads/fashion-festival-outfit.jpg",
  "/images/uploads/fashion-red-sequin.jpg",
  "/images/uploads/fashion-coastal-sunset.jpg",
  "/images/fashion-modern-wardrobe.jpg",
  "/images/fashion-ethical-clothing.jpg"
]

// Define our showcase items
const showcaseItems = [
  {
    id: 1,
    title: "Sustainable Closets",
    subtitle: "Discover pre-loved fashion treasures",
    description: "Browse through curated collections of sustainable style options",
    image: "/images/fashion-modern-wardrobe.jpg",
    video: "/videos/sustainable-fashion.mp4",
    position: "left",
    hasVideo: true,
  },
  {
    id: 2,
    title: "Share Your Style",
    subtitle: "Let your wardrobe work for you",
    description: "Rent out pieces you love but rarely wear",
    image: "/images/fashion-ethical-clothing.jpg",
    position: "right",
    hasVideo: false,
  },
  {
    id: 3,
    title: "Community Closet",
    subtitle: "Fashion that connects",
    description: "Join a community of style-conscious individuals",
    image: "/images/fashion-casual-elegant.jpg",
    video: "/videos/community-fashion.mp4",
    position: "center",
    hasVideo: true,
  },
  {
    id: 4,
    title: "Circular Fashion",
    subtitle: "Style with purpose",
    description: "Reduce waste while discovering your unique look",
    image: "/images/fashion-artisan-made.jpg",
    position: "left",
    hasVideo: false,
  },
]

export default function CinematicShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-advance the showcase
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (!isAnimating) {
        setIsAnimating(true)
        setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseItems.length)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }, 8000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAnimating])

  // Manual navigation
  const goToSlide = (index: number) => {
    if (!isAnimating && index !== currentIndex) {
      setIsAnimating(true)
      setCurrentIndex(index)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const nextSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentIndex((prevIndex) => (prevIndex + 1) % showcaseItems.length)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const prevSlide = () => {
    if (!isAnimating) {
      setIsAnimating(true)
      setCurrentIndex((prevIndex) => (prevIndex - 1 + showcaseItems.length) % showcaseItems.length)
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const currentItem = showcaseItems[currentIndex]

  return (
    <section className="relative w-full bg-black text-white overflow-hidden">
      {/* Animated dot pattern and gradient for cohesion */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <AnimatedBackground variant="dots" opacity={0.08} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>
      {/* Edge-to-edge hero image/video with soft overlay */}
      <div className="relative h-[90vh] min-h-[600px] max-h-[950px] w-full flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            {currentItem.hasVideo ? (
              <VideoBackground
                videoSrc={currentItem.video!}
                fallbackImageSrc={currentItem.image}
                alt={currentItem.title}
                overlayClassName="bg-gradient-to-t from-black/60 via-black/20 to-transparent"
                priority={true}
              />
            ) : (
              <Image
                src={currentItem.image || "/placeholder.svg"}
                alt={currentItem.title}
                fill
                className="object-cover"
                priority
              />
            )}
            {/* Soft dark overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
          </motion.div>
        </AnimatePresence>
        {/* Text content with staggered animation */}
        <div className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="block text-white">Style is a Conversation.</span>
            <span className="block text-primary-pink">Let Yours Speak.</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            Discover, share, and rent unique closets from the Shrobe community.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link
              href="#explore"
              className="inline-flex items-center bg-primary-pink hover:bg-primary-pink/90 text-white font-bold text-lg py-4 px-10 rounded-full shadow-xl transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-pink/60"
            >
              Start Exploring
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center border-2 border-primary-pink text-primary-pink font-bold text-lg py-4 px-10 rounded-full bg-white/10 hover:bg-primary-pink/10 transition-all hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary-pink/60"
            >
              How Shrobe Works
            </Link>
          </motion.div>
          {/* Social proof (optional, minimal) */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-2"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <span className="text-white/80 text-base font-medium">Trusted by <span className="text-primary-pink font-bold">12,000+</span> style-sharers</span>
          </motion.div>
        </div>
        {/* Curved bottom edge for flow */}
        <svg className="absolute bottom-0 left-0 w-full h-24 z-20" viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0C480 100 960 0 1440 100V100H0V0Z" fill="currentColor" className="text-black"/></svg>
        {/* Navigation dots */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-30 flex space-x-3">
          {showcaseItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-primary-pink w-6" : "bg-white/50"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
          aria-label="Previous slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
          aria-label="Next slide"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        {/* Scroll down indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-30 flex flex-col items-center">
          <span className="block w-1.5 h-8 rounded-full bg-primary-pink animate-bounce mb-1" />
          <span className="text-xs text-white/60 tracking-widest uppercase">Scroll</span>
        </div>
      </div>
    </section>
  )
}
