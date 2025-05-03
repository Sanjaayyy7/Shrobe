"use client"

import { useState, useEffect } from "react"
import * as THREE from "three"

// Create a fallback texture - a simple colored texture
const createFallbackTexture = (color = "#ff65c5") => {
  const canvas = document.createElement("canvas")
  canvas.width = 256
  canvas.height = 512
  const context = canvas.getContext("2d")
  if (context) {
    // Fill with gradient
    const gradient = context.createLinearGradient(0, 0, 0, 512)
    gradient.addColorStop(0, color)
    gradient.addColorStop(1, "#c7aeef")
    context.fillStyle = gradient
    context.fillRect(0, 0, 256, 512)

    // Add some text
    context.fillStyle = "white"
    context.font = "bold 24px Arial"
    context.textAlign = "center"
    context.fillText("SHROBE", 128, 256)
    context.font = "16px Arial"
    context.fillText("FASHION", 128, 290)
  }

  const texture = new THREE.CanvasTexture(canvas)
  return texture
}

export function useSafeTexture(path: string) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    // Create a texture loader
    const loader = new THREE.TextureLoader()

    // Load the texture
    loader.load(
      path,
      (loadedTexture) => {
        setTexture(loadedTexture)
        setError(false)
      },
      undefined,
      (err) => {
        console.warn(`Could not load texture from ${path}:`, err)
        setTexture(createFallbackTexture())
        setError(true)
      },
    )

    return () => {
      if (texture) texture.dispose()
    }
  }, [path])

  return { texture, error }
}
