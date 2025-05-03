"use client"

import { motion } from "framer-motion"
import FeaturedClosetWithVideo from "./featured-closet-with-video"

export default function FeaturedClosetsWithVideo() {
  return (
    <section className="bg-black py-20 md:py-28">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-primary-pink text-sm uppercase tracking-wider inline-block mb-2">Exclusive Collections</span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mt-2">
            Trending <span className="text-primary-pink">Closets</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FeaturedClosetWithVideo
            id={1}
            name="Sustainable Summer Collection"
            description="Explore eco-friendly summer essentials curated for conscious style enthusiasts."
            videoSrc="/videos/summer-collection.mp4"
            fallbackImageSrc="/images/outfit-vintage-denim.jpg"
            itemCount={42}
            size="S/M"
            styles={["Sustainable", "Summer", "Casual"]}
          />

          <FeaturedClosetWithVideo
            id={2}
            name="Urban Minimalist"
            description="Clean lines and versatile pieces for the modern city dweller."
            videoSrc="/videos/urban-collection.mp4"
            fallbackImageSrc="/images/outfit-eco-essentials.jpg"
            itemCount={38}
            size="M/L"
            styles={["Minimalist", "Urban", "Monochrome"]}
          />
        </div>
      </div>
    </section>
  )
}
