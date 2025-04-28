"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Logo from "./logo"
import AnimatedBackground from "./animated-background"

export default function AnimatedCtaBanner() {
  return (
    <section className="bg-gradient-to-r from-primary-pink to-primary-pink/80 text-white py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            className="flex justify-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1] }}
          >
            <Logo size="medium" />
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
          >
            Join the Style-Sharing Revolution
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
          >
            Connect with fashion-forward individuals, discover new styles, and share your unique wardrobe with the
            world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href="/signup"
              className="inline-block bg-white text-primary-pink font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Download the App
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Background pattern */}
      <AnimatedBackground variant="dots" opacity={0.1} />
    </section>
  )
}
