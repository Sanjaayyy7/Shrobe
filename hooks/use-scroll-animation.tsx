"use client"

import { useEffect } from "react"
import { useAnimation } from "framer-motion"

export function useScrollAnimation(elementId: string, threshold = 100) {
  const controls = useAnimation()

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(elementId)
      if (element) {
        const rect = element.getBoundingClientRect()
        const isVisible = rect.top < window.innerHeight - threshold

        if (isVisible) {
          controls.start("visible")
        }
      }
    }

    // Initial check
    handleScroll()

    // Add scroll listener
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [controls, elementId, threshold])

  return controls
}
