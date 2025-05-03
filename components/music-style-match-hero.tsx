"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"

const vibes = [
  {
    genre: "Indie Dream",
    artist: "Phoebe Bridgers",
    image: "/images/fashion-casual-elegant.jpg",
    closet: [
      "/images/fashion-modern-wardrobe.jpg",
      "/images/fashion-ethical-clothing.jpg",
      "/images/fashion-bohemian-style.jpg"
    ],
    color: "from-[#ff65c5] via-[#c7aeef] to-[#6e72fc]"
  },
  {
    genre: "R&B Glow",
    artist: "SZA",
    image: "/images/fashion-bold-color.jpg",
    closet: [
      "/images/fashion-colorful-chic.jpg",
      "/images/fashion-summer-outfit.jpg",
      "/images/fashion-urban-street.jpg"
    ],
    color: "from-[#ffb86c] via-[#ff65c5] to-[#c7aeef]"
  },
  {
    genre: "Techno Pulse",
    artist: "Peggy Gou",
    image: "/images/fashion-trendy-style.jpg",
    closet: [
      "/images/fashion-artisan-made.jpg",
      "/images/fashion-elegant-style.jpg",
      "/images/fashion-casual-elegant.jpg"
    ],
    color: "from-[#6e72fc] via-[#c7aeef] to-[#ff65c5]"
  },
  {
    genre: "Pop Punk Energy",
    artist: "Paramore",
    image: "/images/fashion-red-sequin.jpg",
    closet: [
      "/images/fashion-festival-outfit.jpg",
      "/images/fashion-western-inspired.jpg",
      "/images/fashion-colorful-chic.jpg"
    ],
    color: "from-[#ff65c5] via-[#ffb86c] to-[#6e72fc]"
  },
  {
    genre: "Sunset Chill",
    artist: "Tame Impala",
    image: "/images/fashion-coastal-sunset.jpg",
    closet: [
      "/images/fashion-modern-wardrobe.jpg",
      "/images/fashion-summer-outfit.jpg",
      "/images/fashion-ethical-clothing.jpg"
    ],
    color: "from-[#c7aeef] via-[#ffb86c] to-[#ff65c5]"
  }
]

export default function MusicStyleMatchHero() {
  const [current, setCurrent] = useState(0)

  const next = () => setCurrent((c) => (c + 1) % vibes.length)
  const prev = () => setCurrent((c) => (c - 1 + vibes.length) % vibes.length)

  const vibe = vibes[current]

  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-black">
      {/* Animated background gradients and sparkles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className={`absolute inset-0 bg-gradient-to-br ${vibe.color} opacity-60 animate-pulse-slow`} />
        <div className="absolute inset-0 bg-gradient-radial from-primary-pink/20 via-black/60 to-black/90" />
        {/* Sparkles */}
        <div className="absolute inset-0">
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/30 blur-md animate-pulse"
              style={{
                width: `${8 + Math.random() * 16}px`,
                height: `${8 + Math.random() * 16}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                opacity: 0.2 + Math.random() * 0.3
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Your Style Sounds Like This
          </motion.h2>
          <motion.p
            className="text-xl md:text-2xl text-primary-pink font-semibold mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Match your closet to your music vibes
          </motion.p>
        </div>

        {/* Carousel */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={prev}
            className="hidden md:block p-3 rounded-full bg-white/10 hover:bg-primary-pink/40 transition"
            aria-label="Previous vibe"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>

          <div className="w-full max-w-lg">
            <AnimatePresence mode="wait">
              <motion.div
                key={vibe.genre}
                initial={{ opacity: 0, scale: 0.95, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -40 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.25 }}
                className="relative bg-black/70 rounded-3xl shadow-2xl p-8 flex flex-col items-center border border-white/10"
                style={{ boxShadow: "0 8px 48px 0 #ff65c555, 0 1.5px 8px 0 #c7aeef55" }}
              >
                {/* Main vibe image */}
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden mb-6 shadow-xl border-4 border-primary-pink/40">
                  <Image
                    src={vibe.image}
                    alt={vibe.genre}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <div className="mb-4 text-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-1 drop-shadow">
                    {vibe.genre}
                  </h3>
                  <span className="text-primary-pink text-lg font-semibold">{vibe.artist}</span>
                </div>
                {/* Mini closet preview */}
                <div className="flex justify-center gap-3 mb-6">
                  {vibe.closet.map((img, i) => (
                    <div key={i} className="w-16 h-20 rounded-xl overflow-hidden shadow-lg border-2 border-white/10 bg-gray-900">
                      <Image src={img} alt="Closet item" fill className="object-cover" />
                    </div>
                  ))}
                </div>
                <motion.button
                  className="bg-gradient-to-r from-primary-pink to-primary-purple text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-lg"
                  whileHover={{ scale: 1.07 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Vibe Match
                </motion.button>
              </motion.div>
            </AnimatePresence>
          </div>

          <button
            onClick={next}
            className="hidden md:block p-3 rounded-full bg-white/10 hover:bg-primary-pink/40 transition"
            aria-label="Next vibe"
          >
            <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {/* Mobile swipe dots */}
        <div className="flex justify-center gap-2 mt-8">
          {vibes.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${i === current ? "bg-primary-pink" : "bg-white/30"}`}
              aria-label={`Go to vibe ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
} 