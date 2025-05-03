"use client"

import { Suspense, useState, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera, Environment, Float } from "@react-three/drei"
import PhoneModel from "./phone-model"
import LoadingScreen from "./loading-screen"

export default function FashionScene() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="w-full h-full">
      {isLoading && <LoadingScreen />}

      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 10, 20]} />
        <ambientLight intensity={0.2} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />

          {/* Floating phone models with different fashion images */}
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5} position={[-2, 0, 0]}>
            <PhoneModel screenImage="/images/sustainable-fashion-1.png" scale={0.7} />
          </Float>

          <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.6} position={[0, 0.5, 1]}>
            <PhoneModel screenImage="/images/vintage-fashion-1.png" scale={0.8} rotationSpeed={0.0008} />
          </Float>

          <Float speed={1.2} rotationIntensity={0.25} floatIntensity={0.4} position={[2, -0.5, 0.5]}>
            <PhoneModel screenImage="/images/eco-fashion-1.png" scale={0.75} rotationSpeed={0.0012} />
          </Float>

          <Environment preset="city" />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
