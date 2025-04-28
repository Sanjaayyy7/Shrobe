"use client"

import Link from "next/link"
import Logo from "./logo"
import { useEffect, useState } from "react"

export default function Header() {
  const [heroInView, setHeroInView] = useState(true)

  useEffect(() => {
    // Always target the first section in <main>
    const hero = document.querySelector('main > section')
    if (!hero) return
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setHeroInView(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`backdrop-blur-md bg-black/70 border-b border-white/10 shadow-lg z-50 fixed w-full top-0 left-0 transition-transform duration-500 ${heroInView ? "translate-y-0" : "-translate-y-full"}`}
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center relative min-h-[56px]">
        <div className="flex items-center">
          <Logo size="small" variant="white" />
        </div>
        <nav>
          <ul className="flex space-x-8 items-center">
            <li>
              <Link href="/" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
                <span className="pb-1">Home</span>
                <span className="block h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-primary-pink to-primary-purple rounded-full mx-auto"></span>
              </Link>
            </li>
            <li>
              <Link href="#closets" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
                <span className="pb-1">Browse Closets</span>
                <span className="block h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-primary-pink to-primary-purple rounded-full mx-auto"></span>
              </Link>
            </li>
            <li>
              <Link href="#categories" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
                <span className="pb-1">Categories</span>
                <span className="block h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-primary-pink to-primary-purple rounded-full mx-auto"></span>
              </Link>
            </li>
            <li>
              <Link href="#how-it-works" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
                <span className="pb-1">How It Works</span>
                <span className="block h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-primary-pink to-primary-purple rounded-full mx-auto"></span>
              </Link>
            </li>
            <li className="ml-6">
              <Link href="/signup" className="font-semibold text-base px-6 py-2 rounded-full bg-gradient-to-r from-primary-pink to-primary-purple text-white shadow-md hover:from-primary-purple hover:to-primary-pink transition-all duration-300 border-0">
                Sign In
              </Link>
            </li>
          </ul>
        </nav>
        {/* Subtle animated gradient accent at the bottom of header */}
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-primary-pink via-primary-purple to-primary-pink opacity-70 rounded-b-lg pointer-events-none" />
      </div>
    </header>
  )
}
