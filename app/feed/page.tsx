"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import Header from "@/components/feed/header"
import DiscoveryCarousel from "@/components/feed/discovery-carousel"
import CategoryNavigation from "@/components/feed/category-navigation"
import MasonryGrid from "@/components/feed/masonry-grid"

export default function FeedPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, supabase])

  return (
    <main className="min-h-screen bg-[#121212] text-white">
      <div className="fixed inset-0 z-0 pointer-events-none opacity-50">
        {/* Background gradient/animation can go here */}
      </div>
      
      {/* Fixed Header */}
      <Header />
      
      <div className="container mx-auto px-4 pt-20 pb-12">
        {/* Discovery Carousel (Tinder-inspired) */}
        <section className="mb-8">
          <DiscoveryCarousel />
        </section>
        
        {/* Category Navigation (Spotify/Airbnb-inspired) */}
        <section className="mb-8">
          <CategoryNavigation />
        </section>
        
        {/* Pinterest-Style Masonry Grid */}
        <section>
          <MasonryGrid />
        </section>
      </div>
    </main>
  )
} 