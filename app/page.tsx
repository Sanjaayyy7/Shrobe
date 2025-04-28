"use client"

import { useState, useEffect } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import CinematicShowcase from "@/components/cinematic-showcase"
import OutfitCarousel from "@/components/outfit-carousel"
import SlidingShowcase from "@/components/sliding-showcase"
import FashionManifesto from "@/components/fashion-manifesto"
import AnimatedFeaturedClosets from "@/components/animated-featured-closets"
import AnimatedCtaBanner from "@/components/animated-cta-banner"
import AnimatedSignupSection from "@/components/animated-signup-section"
import DebugSupabaseSimple from "@/components/debug-supabase-simple"
import { isSupabaseDemoMode } from "@/lib/supabase"
import AnimatedBackground from "@/components/animated-background"
import GradientBackground from "@/components/gradient-background"
import TinderStyleCloset from "@/components/tinder-style-closet"
import FeaturesGallery from "@/components/features-gallery"
import ShareYourStyleSection from "@/components/share-your-style-section"

export default function Home() {
  return (
    <main className="bg-black text-white">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GradientBackground />
        <AnimatedBackground variant="dots" opacity={0.05} />
      </div>
      <Header />

      {/* New Animated Share Your Style Section */}
      <ShareYourStyleSection />

      {/* Hero Section with Cinematic Showcase */}
      {/* <CinematicShowcase /> */}

      {/* Trending Closet with Tinder-style Swiping */}
      <TinderStyleCloset />

      {/* Featured Closets */}
      <AnimatedFeaturedClosets />

      {/* Outfit Carousel */}
      <OutfitCarousel />

      {/* About Shrobe Section */}
      <FashionManifesto />

      {/* Features Gallery */}
      <FeaturesGallery />

      {/* CTA Banner */}
      <AnimatedCtaBanner />

      {/* Signup Section */}
      <AnimatedSignupSection />

      <Footer />
      <DebugSupabaseSimple />
    </main>
  )
}
