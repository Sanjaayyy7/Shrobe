"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

export default function FashionManifesto() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })

  return (
    <section ref={ref} className="py-24 bg-gradient-to-b from-black to-black/95 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,#ff65c5,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,#c7aeef,transparent_50%)]" />
      </div>
      
      {/* Floating cloth pattern background */}
      <div className="absolute inset-0 opacity-5">
        <Image
          src="/images/fashion-modern-wardrobe.jpg"
          alt="Background texture"
          fill
          className="object-cover blur-md"
          priority
          loading="eager"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header with animated underline */}
        <div className="text-center mb-20">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1] }}
          >
            About Shrobe
          </motion.h2>
          
          <motion.div
            className="h-1 w-24 bg-gradient-to-r from-primary-pink to-primary-purple mx-auto rounded-full mb-6"
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: 100, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
          />
          
          <motion.p
            className="text-xl md:text-2xl text-primary-pink font-medium max-w-2xl mx-auto italic"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
          >
            "Where fashion isn't bought — it's shared."
          </motion.p>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row gap-16 items-center mb-20">
          {/* Left side - Brand description */}
          <motion.div
            className="lg:w-1/2"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.1 }}
          >
            <div className="prose prose-xl prose-invert max-w-none">
              <p className="text-lg md:text-xl text-gray-200 leading-relaxed">
                Shrobe is the new way to experience fashion. We're a community-driven platform where closets are shared, styles are discovered, and sustainability meets self-expression. Whether you're looking to rent, trade, or showcase your personal wardrobe, Shrobe lets you connect with others who love fashion as much as you do. Join the movement redefining how we style, shop, and share.
              </p>
            </div>
            
            <motion.div
              className="mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
            >
              <Link 
                href="#join-community" 
                className="inline-block bg-gradient-to-r from-primary-pink to-primary-purple text-white font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                Join Our Community
              </Link>
            </motion.div>
          </motion.div>
          
          {/* Right side - Brand image with animation */}
          <motion.div
            className="lg:w-1/2 relative"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
          >
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/images/fashion-colorful-chic.jpg"
                alt="Shrobe Fashion Community"
                fill
                className="object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white text-2xl font-bold mb-2">Experience Fashion Differently</h3>
                  <p className="text-gray-200">Join thousands already sharing their style</p>
                </div>
              </div>
            </div>
            
            {/* Floating mini images */}
            <motion.div
              className="absolute -top-10 -right-10 w-40 h-40 rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20, rotate: -10 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: -10 } : { opacity: 0, y: 20, rotate: -10 }}
              transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.5 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
            >
              <Image
                src="/images/fashion-ethical-clothing.jpg"
                alt="Ethical Fashion"
                fill
                className="object-cover"
                loading="lazy"
              />
            </motion.div>
            
            <motion.div
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-xl overflow-hidden shadow-xl"
              initial={{ opacity: 0, y: 20, rotate: 10 }}
              animate={isInView ? { opacity: 1, y: 0, rotate: 10 } : { opacity: 0, y: 20, rotate: 10 }}
              transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.6 }}
              whileHover={{ rotate: 0, scale: 1.05 }}
            >
              <Image
                src="/images/fashion-trendy-style.jpg"
                alt="Trendy Style"
                fill
                className="object-cover"
                loading="lazy"
              />
            </motion.div>
          </motion.div>
          </div>

        {/* Key Pillars */}
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-white mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
        >
          Our Key Pillars
        </motion.h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Pillar 1 */}
          <motion.div
            className="bg-black/50 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.5 }}
          >
            <div className="text-5xl mb-6 text-primary-pink group-hover:scale-110 transition-transform duration-300">🌍</div>
            <h4 className="text-xl font-bold text-white mb-4">Sustainable Style</h4>
            <p className="text-gray-300">
              Share fashion, not fast fashion. Save money, save the planet.
            </p>
          </motion.div>

          {/* Pillar 2 */}
          <motion.div
            className="bg-black/50 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.6 }}
          >
            <div className="text-5xl mb-6 text-primary-pink group-hover:scale-110 transition-transform duration-300">🤝</div>
            <h4 className="text-xl font-bold text-white mb-4">Community First</h4>
            <p className="text-gray-300">
              Discover real closets from real people — not just brands.
            </p>
          </motion.div>

          {/* Pillar 3 */}
          <motion.div
            className="bg-black/50 backdrop-blur-sm border border-white/10 p-8 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.7 }}
          >
            <div className="text-5xl mb-6 text-primary-pink group-hover:scale-110 transition-transform duration-300">🚀</div>
            <h4 className="text-xl font-bold text-white mb-4">Your Wardrobe, Amplified</h4>
            <p className="text-gray-300">
              Rent it. Trade it. Flex it. Your closet is your canvas.
            </p>
        </motion.div>
        </div>
      </div>
    </section>
  )
}
