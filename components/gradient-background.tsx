"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function GradientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Create gradient points
    const gradientPoints = [
      { x: canvas.width * 0.2, y: canvas.height * 0.3, color: "#ff65c5", radius: canvas.width * 0.4 },
      { x: canvas.width * 0.8, y: canvas.height * 0.7, color: "#c7aeef", radius: canvas.width * 0.4 },
    ]

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Draw function
    const draw = () => {
      time += 0.005

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update gradient points
      gradientPoints[0].x = canvas.width * (0.3 + 0.1 * Math.sin(time * 0.7))
      gradientPoints[0].y = canvas.height * (0.3 + 0.1 * Math.cos(time * 0.5))
      gradientPoints[1].x = canvas.width * (0.7 + 0.1 * Math.cos(time * 0.6))
      gradientPoints[1].y = canvas.height * (0.7 + 0.1 * Math.sin(time * 0.4))

      // Draw gradients
      gradientPoints.forEach((point) => {
        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)

        gradient.addColorStop(0, `${point.color}30`) // 30 is hex for ~18% opacity
        gradient.addColorStop(1, `${point.color}00`) // 00 is hex for 0% opacity

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = window.requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2 }}
    />
  )
}
