"use client"

import { useEffect } from "react"
import { motion, useAnimation, type Variants } from "framer-motion"
import Link from "next/link"
import Logo from "./logo"
import CinematicHero from "./cinematic-hero"
import CinematicHeroFallback from "./cinematic-hero-fallback"
import ErrorBoundary from "./error-boundary"
import AnimatedBackground from "./animated-background"

// Animation variants for different elements
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.25,
      duration: 1.2,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

const logoVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.1,
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
      duration: 0.8,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.4,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
  tap: {
    scale: 0.98,
  },
}

const backgroundVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 1.7,
      ease: [0.4, 0.0, 0.2, 1],
    },
  },
}

export default function AnimatedHero() {
  const controls = useAnimation()

  useEffect(() => {
    controls.start("visible")
  }, [controls])

  return (
    <section className="bg-dark-bg text-white py-16 md:py-24 overflow-hidden relative">
      {/* Animated background elements */}
      <AnimatedBackground variant="gradient" opacity={0.15} />

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
        <motion.div
          className="md:w-1/2 mb-10 md:mb-0 md:pr-10"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-shadow-lg"
            variants={itemVariants}
          >
            <motion.span className="text-primary-pink block mb-2 brightness-110" variants={itemVariants}>
              BUY IT.
            </motion.span>
            <motion.span className="text-primary-pink block mb-2 brightness-110" variants={itemVariants}>
              TRADE IT.
            </motion.span>
            <motion.span className="text-primary-pink block mb-2 brightness-110" variants={itemVariants}>
              RENT IT.
            </motion.span>
            <motion.span variants={itemVariants} className="text-white">
              SHARE YOUR STYLE.
            </motion.span>
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl mb-8 text-white font-medium max-w-lg text-shadow"
            variants={itemVariants}
          >
            Transform your wardrobe with{" "}
            <motion.span variants={logoVariants} className="inline-block align-middle mx-1">
              <Logo size="small" />
            </motion.span>
            . Browse through closets, find your style, and share yours with the world. Sustainable fashion has never
            been this easy.
          </motion.p>

          <motion.div className="flex flex-wrap gap-4" variants={containerVariants}>
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                href="#closets"
                className="bg-primary-pink hover:bg-primary-pink/90 text-white font-bold py-3 px-8 rounded-full transition-all inline-block"
              >
                Explore Closets
              </Link>
            </motion.div>

            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                href="/signup"
                className="bg-transparent border-2 border-primary-purple text-primary-purple font-bold py-3 px-8 rounded-full hover:bg-primary-purple/10 transition-all inline-block"
              >
                Share Your Style
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="md:w-1/2 flex justify-center"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          <motion.div className="relative w-full max-w-md" variants={itemVariants}>
            <ErrorBoundary fallback={<CinematicHeroFallback />}>
              <CinematicHero />
            </ErrorBoundary>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
