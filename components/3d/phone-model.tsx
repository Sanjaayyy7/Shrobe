"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"
import type { GroupProps } from "@react-three/fiber"
import { useSafeTexture } from "./use-safe-texture"

interface PhoneModelProps extends GroupProps {
  screenImage: string
  rotationSpeed?: number
}

export default function PhoneModel({ screenImage, rotationSpeed = 0.001, ...props }: PhoneModelProps) {
  const groupRef = useRef<THREE.Group>(null)
  const { texture } = useSafeTexture(screenImage)

  // Slow, smooth rotation
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed
    }
  })

  return (
    <group ref={groupRef} {...props}>
      {/* Phone body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.4, 5, 0.2]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Phone screen */}
      <mesh position={[0, 0, 0.11]}>
        <planeGeometry args={[2.2, 4.8]} />
        {texture ? <meshBasicMaterial map={texture} /> : <meshBasicMaterial color="#333333" />}
      </mesh>

      {/* Phone camera */}
      <mesh position={[0, 2.2, 0.11]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 32]} />
        <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}
