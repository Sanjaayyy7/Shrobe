"use client"

import { motion } from "framer-motion"
import NewsletterSignup from "./newsletter-signup"
import Logo from "./logo"
import AnimatedBackground from "./animated-background"

export default function AnimatedSignupSection() {
  return (
    <section className="bg-gradient-to-r from-primary-pink to-primary-purple py-16 md:py-24 relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
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
            className="text-3xl md:text-4xl font-bold text-white text-center mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.2 }}
          >
            Get Early Access
          </motion.h2>

          <motion.p
            className="text-white text-center text-lg mb-8 opacity-90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.3 }}
          >
            Be the first to know when we launch and unlock exclusive deals!
          </motion.p>

          <motion.div
            className="bg-white p-6 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, ease: [0.4, 0.0, 0.2, 1], delay: 0.4 }}
          >
            <NewsletterSignup />
          </motion.div>
        </div>
      </div>

      {/* Background pattern */}
      <AnimatedBackground variant="dots" opacity={0.1} />
    </section>
  )
}
