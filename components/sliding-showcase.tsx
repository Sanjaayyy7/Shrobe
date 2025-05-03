"use client"

import { useRef, useEffect } from "react"
import { motion, useAnimation, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

const items = [
  {
    id: 1,
    title: "Sustainable Basics",
    image: "/images/sustainable-fashion-3.png",
  },
  {
    id: 2,
    title: "Vintage Finds",
    image: "/images/vintage-fashion-2.png",
  },
  {
    id: 3,
    title: "Upcycled Treasures",
    image: "/images/upcycled-fashion-1.png",
  },
  {
    id: 4,
    title: "Eco Accessories",
    image: "/images/eco-fashion-2.png",
  },
  {
    id: 5,
    title: "Shared Luxury",
    image: "/images/minimalist-fashion-2.png",
  },
]

export default function SlidingShowcase() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.2 })
  const controls = useAnimation()

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  return (
    <section className="bg-black py-16" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0, transition: { duration: 1.1, ease: [0.4, 0.0, 0.2, 1] } },
          }}
          className="mb-12 text-center"
        >
          <span className="text-primary-pink text-sm uppercase tracking-wider">Browse Categories</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">Explore Sustainable Style</h2>
        </motion.div>

        <motion.div
          className="flex space-x-6 overflow-x-auto pb-8 no-scrollbar"
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
              },
            },
          }}
        >
          {items.map((item) => (
            <motion.div
              key={item.id}
              className="flex-shrink-0 w-[250px]"
              variants={{
                visible: {
                  opacity: 1,
                  x: 0,
                  transition: { duration: 1.1, ease: [0.4, 0.0, 0.2, 1] },
                },
              }}
              initial={{ opacity: 0, x: 50 }}
            >
              <Link href="#" className="block group">
                <div className="relative w-full h-[350px] overflow-hidden rounded-t-[100px]">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-white text-lg font-medium">{item.title}</h3>
                  <span className="text-primary-pink text-sm mt-1 inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore Collection →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
