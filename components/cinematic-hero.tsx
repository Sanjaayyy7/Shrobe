"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import AnimatedTextOverlay from "./animated-text-overlay"
import CinematicHeroFallback from "./cinematic-hero-fallback"
import VideoBackground from "./video-background"

// Dynamically import the 3D scene with no SSR to avoid hydration issues
const FashionScene = dynamic(() => import("./3d/fashion-scene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#050505]">
      <div className="animate-pulse text-white">Loading experience...</div>
    </div>
  ),
})

export default function CinematicHero() {
  const [mounted, setMounted] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [use3D, setUse3D] = useState(true)

  // Ensure the component is mounted before rendering Three.js content
  useEffect(() => {
    setMounted(true)

    // Add error handling for WebGL
    const checkWebGLSupport = () => {
      try {
        const canvas = document.createElement("canvas")
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
        if (!gl) {
          setHasError(true)
          setUse3D(false)
        }
      } catch (e) {
        setHasError(true)
        setUse3D(false)
      }
    }

    checkWebGLSupport()
  }, [])

  // If there's an error or WebGL is not supported, show the fallback
  if (hasError) {
    return <CinematicHeroFallback />
  }

  return (
    <div className="relative w-full h-[600px] md:h-[700px] overflow-hidden bg-[#050505] rounded-xl shadow-2xl">
      {/* Video background (shown when not using 3D) */}
      {!use3D && (
        <div className="absolute inset-0 z-0">
          <VideoBackground
            videoSrc="/videos/hero-background.mp4"
            fallbackImageSrc="/images/sustainable-fashion-4.png"
            alt="Fashion showcase"
            overlayClassName="bg-gradient-to-t from-[#050505] via-black/50 to-[#050505] opacity-70"
          />
        </div>
      )}

      {/* Parallax background elements */}
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", ease: "linear" }}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fillOpacity='0.2' fillRule='evenodd'/%3E%3C/svg%3E\")",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] opacity-70 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505] opacity-70 z-[1]" />

      {/* 3D Scene */}
      {mounted && use3D && (
        <div className="absolute inset-0 z-0">
          <FashionScene />
        </div>
      )}

      {/* Text overlays */}
      <AnimatedTextOverlay
        text="SHARE YOUR STYLE"
        delay={1.0}
        className="top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl md:text-5xl lg:text-6xl text-shadow-lg"
      />

      <AnimatedTextOverlay
        text="EXPLORE CLOSETS"
        delay={2.0}
        className="bottom-1/4 left-1/2 transform -translate-x-1/2 translate-y-1/2 text-3xl md:text-4xl lg:text-5xl text-shadow-lg"
      />

      <AnimatedTextOverlay
        text="FASHION FORWARD"
        delay={3.0}
        className="top-3/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl text-shadow-lg opacity-70"
      />

      <AnimatedTextOverlay
        text="SUSTAINABLE STYLE"
        delay={3.5}
        className="top-1/3 right-1/4 transform translate-x-1/2 -translate-y-1/2 text-2xl md:text-3xl text-shadow-lg opacity-70"
      />

      {/* Animated gradient accent */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-pink via-primary-purple to-primary-pink z-[2]"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
    </div>
  )
}
