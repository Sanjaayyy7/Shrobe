"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

// Define the features with descriptions and icons/images
const features = [
  {
    id: 1,
    title: "User Profiles with Closet Upload",
    description: "Share your style with personalized profiles and upload your entire wardrobe to showcase your unique fashion sense.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    image: "/images/fashion-trendy-style.jpg",
  },
  {
    id: 2,
    title: "Clothing Item Cards",
    description: "Detailed item cards with photos, size information, and custom tags make it easy to find the perfect piece.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    image: "/images/fashion-urban-street.jpg",
  },
  {
    id: 3,
    title: "Borrow/Rent/Buy System",
    description: "Flexible options to borrow, rent, or buy items, making fashion more accessible and sustainable for everyone.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    image: "/images/fashion-colorful-chic.jpg",
  },
  {
    id: 4,
    title: "In-app Messaging",
    description: "Connect directly with fashion enthusiasts through our seamless in-app messaging system for quick and easy communication.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
    image: "/images/fashion-summer-outfit.jpg",
  },
  {
    id: 5,
    title: "Ratings & Reviews",
    description: "Build trust and confidence with our comprehensive ratings and reviews system for users and items.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    image: "/images/fashion-ethical-clothing.jpg",
  },
  {
    id: 6,
    title: "Advanced Search Options",
    description: "Find the perfect outfit with our powerful search filters by category, size, or event type like Interview, Formal, or Party.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    image: "/images/fashion-spring-collection.jpg",
  },
  {
    id: 7,
    title: "Campus-based Filters",
    description: "Connect with fashion enthusiasts on your campus with location-based filtering to keep fashion exchanges local and convenient.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    image: "/images/fashion-casual-elegant.jpg",
  },
  {
    id: 8,
    title: "Social Fashion Feed",
    description: "Stay inspired with a dynamic feed featuring Outfit of the Day (OOTD) posts and fashion inspiration from the community.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    image: "/images/fashion-bohemian-style.jpg",
  },
  {
    id: 9,
    title: "Early Access Sign-up",
    description: "Get priority access to new features and be the first to know about platform updates with our exclusive email sign-up.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    image: "/images/fashion-contemporary-look.jpg",
  },
  {
    id: 10,
    title: "Instagram-style Interactions",
    description: "Follow your favorite fashion influencers and like their style with our intuitive social interaction system.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    image: "/images/fashion-modern-wardrobe.jpg",
  },
]

export default function FeaturesGallery() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)

  // For infinite loop effect, duplicate features
  const featuresLoop = [...features, ...features]

  // Animation for horizontal glide using translateX
  useEffect(() => {
    let animationFrame: number
    let start: number | null = null
    const speed = 0.05 // px per ms (adjust for desired speed)
    const cardWidth = 320 + 32 // w-80 (320px) + space-x-8 (32px)
    const totalWidth = cardWidth * features.length

    function step(timestamp: number) {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const newOffset = (elapsed * speed) % totalWidth
      setOffset(newOffset)
      animationFrame = requestAnimationFrame(step)
    }
    animationFrame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-b from-black to-gray-900 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            className="text-primary-pink text-sm uppercase tracking-wider mb-2 inline-block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            EXPERIENCE THE FUTURE
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Shrobe's <span className="text-primary-pink">Features</span>
          </motion.h2>
        </div>
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex space-x-8 py-8"
            style={{
              whiteSpace: 'nowrap',
              transform: `translateX(-${offset}px)`,
              transition: 'none',
              willChange: 'transform',
              position: 'relative',
            }}
          >
            {featuresLoop.map((feature, idx) => (
              <motion.div
                key={idx}
                className="flex-shrink-0 w-80 bg-gray-800/70 rounded-2xl p-8 shadow-lg border border-gray-700/30 hover:scale-105 transition-transform duration-300 overflow-hidden"
                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '200px' }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 * idx }}
              >
                <div className="mb-4 text-primary-pink">{feature.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis">{feature.title}</h3>
                <p className="text-gray-300 text-sm overflow-hidden text-ellipsis" style={{display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', whiteSpace: 'normal'}}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
          {/* Subtle gradient fade on edges */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black/90 to-transparent z-10" />
          <div className="pointer-events-none absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black/90 to-transparent z-10" />
        </div>
      </div>
    </section>
  )
} 