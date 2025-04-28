"use client"

import { motion } from "framer-motion"

interface AnimatedTextOverlayProps {
  text: string
  delay?: number
  className?: string
}

export default function AnimatedTextOverlay({ text, delay = 0, className = "" }: AnimatedTextOverlayProps) {
  return (
    <motion.div
      className={`absolute z-10 text-white font-bold tracking-wider ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 1.2,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
    >
      {text}
    </motion.div>
  )
}
