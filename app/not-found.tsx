"use client"

import Link from "next/link"
import Header from "@/components/header"
import Footer from "@/components/footer"
import AnimatedBackground from "@/components/animated-background"
import GradientBackground from "@/components/gradient-background"

export default function NotFound() {
  return (
    <main className="bg-black text-white min-h-screen flex flex-col">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <GradientBackground />
        <AnimatedBackground variant="dots" opacity={0.05} />
      </div>
      <Header />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 text-primary-pink">404</h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Page Not Found</h2>
          <p className="text-gray-300 text-lg max-w-lg mx-auto mb-10">
            We couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
          <Link 
            href="/"
            className="inline-block px-8 py-3 rounded-full bg-gradient-to-r from-primary-pink to-primary-purple text-white font-medium hover:from-primary-purple hover:to-primary-pink transition-all duration-300 shadow-lg shadow-primary-pink/20"
          >
            Return Home
          </Link>
        </div>
      </div>
      
      <Footer />
    </main>
  )
} 