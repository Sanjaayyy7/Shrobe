"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface VideoBackgroundProps {
  videoSrc: string
  fallbackImageSrc: string
  alt: string
  className?: string
  overlayClassName?: string
  priority?: boolean
}

export default function VideoBackground({
  videoSrc,
  fallbackImageSrc,
  alt,
  className = "",
  overlayClassName = "",
  priority = false,
}: VideoBackgroundProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleCanPlay = () => {
      setIsVideoLoaded(true)
      // Small delay to ensure smooth transition
      setTimeout(() => {
        setIsVideoPlaying(true)
      }, 300)
    }

    // Check if video is already loaded
    if (video.readyState >= 3) {
      handleCanPlay()
    } else {
      video.addEventListener("canplay", handleCanPlay)
    }

    // Cleanup
    return () => {
      video.removeEventListener("canplay", handleCanPlay)
    }
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Fallback image - always render but fade out when video plays */}
      <div
        className={`absolute inset-0 transition-opacity duration-1000 ${isVideoPlaying ? "opacity-0" : "opacity-100"}`}
      >
        <Image
          src={fallbackImageSrc || "/placeholder.svg"}
          alt={alt}
          fill
          className="object-cover"
          priority={priority}
        />
      </div>

      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          isVideoPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <source src={videoSrc} type="video/mp4" />
      </video>

      {/* Optional overlay */}
      {overlayClassName && <div className={`absolute inset-0 ${overlayClassName}`} />}
    </div>
  )
}
