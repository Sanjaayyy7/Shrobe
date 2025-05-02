"use client"

import { motion } from "framer-motion"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AnimatedBackground from "@/components/animated-background"
import GradientBackground from "@/components/gradient-background"

export default function HowWorksPage() {
  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up in seconds and join our community of fashion enthusiasts who share their personal style."
    },
    {
      number: 2,
      title: "Build Your Digital Closet",
      description: "Upload photos of your favorite outfits and categorize them for different occasions and styles."
    },
    {
      number: 3,
      title: "Share Your Style",
      description: "Make your closet public and showcase your unique fashion sense to the world."
    },
    {
      number: 4,
      title: "Browse & Get Inspired",
      description: "Explore other users' closets to discover new looks and get inspired for your next outfit."
    }
  ]

  return (
    <main className="bg-black text-white pt-24">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GradientBackground />
        <AnimatedBackground variant="dots" opacity={0.05} />
      </div>

      <Header />

      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
          <span className="text-primary-pink">How</span> It Works
        </h1>

        <section className="py-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-gray-300 text-lg text-center mb-16">
              Our platform makes it easy to digitize your wardrobe, share your unique style, and connect with a community of fashion enthusiasts.
            </p>

            <div className="space-y-20">
              {steps.map((step, index) => (
                <motion.div 
                  key={step.number}
                  className="relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  {index < steps.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 h-20 bg-gradient-to-b from-primary-pink to-transparent z-0"></div>
                  )}

                  <div className="flex items-start gap-8 relative z-10">
                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-primary-pink text-white rounded-full shadow-lg shadow-primary-pink/20">
                      <span className="text-xl font-bold">{step.number}</span>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                      <p className="text-gray-300 text-lg">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div 
              className="mt-24 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <p className="text-xl text-gray-300 mb-6">
                Ready to showcase your unique style to the world?
              </p>
              <p>
                Sign up now and start building your digital closet!
              </p>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  )
}
