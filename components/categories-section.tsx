"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from "next/image"
import Link from "next/link"

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Seasonal Collections",
    slug: "seasonal",
    image: "/images/hero-sustainable-fashion.jpg",
  },
  {
    id: 2,
    name: "Everyday Essentials",
    slug: "essentials",
    image: "/images/hero-closet-sharing.jpg",
  },
  {
    id: 3,
    name: "Statement Pieces",
    slug: "statement",
    image: "/images/hero-community-fashion.jpg",
  },
  {
    id: 4,
    name: "Eco-Friendly",
    slug: "eco-friendly",
    image: "/images/hero-upcycled-fashion.jpg",
  },
]

export default function CategoriesSection() {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <motion.span
            className="text-primary-pink text-sm uppercase tracking-wider mb-2 inline-block"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            BROWSE CATEGORIES
          </motion.span>
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Explore Fashion Forward Style
          </motion.h2>
          <motion.p
            className="text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover curated collections organized by style, occasion, and aesthetic expression
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <Link
                href={`/categories/${category.slug}`}
                className="block group relative overflow-hidden rounded-lg aspect-[4/5]"
              >
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl font-medium mb-2">{category.name}</h3>
                    <span className="inline-block text-primary-pink text-sm opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      Explore Collection →
                    </span>
              </div>
            </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
