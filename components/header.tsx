"use client"

import Link from "next/link"
import Logo from "./logo"
import { useEffect, useState } from "react"

export default function Header() {
  const [heroInView, setHeroInView] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

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

  // Close menu on route change or scroll
  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    window.addEventListener('scroll', close)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close)
      window.removeEventListener('resize', close)
    }
  }, [menuOpen])

  return (
    <header
      className={`backdrop-blur-md bg-black/70 border-b border-white/10 shadow-lg z-50 fixed w-full top-0 left-0 transition-transform duration-500 ${heroInView ? "translate-y-0" : "-translate-y-full"}`}
      style={{ willChange: "transform" }}
    >
      <div className="container mx-auto px-4 py-2 flex justify-between items-center relative min-h-[56px] sm:min-h-[48px]">
        <div className="flex items-center">
          <Logo size="small" variant="white" />
        </div>
        {/* Desktop nav */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8 items-center">
            <li>
              <Link href="/" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
                <span className="pb-1">Home</span>
                <span className="block h-0.5 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-primary-pink to-primary-purple rounded-full mx-auto"></span>
              </Link>
            </li>
            {/*<li>
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
            </li>*/}
            <li>
              <Link href="/how-works" className="font-medium text-base hover:text-primary-pink transition-colors relative group">
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
        {/* Hamburger for mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 focus:outline-none z-50 relative"
          aria-label="Open menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`block w-6 h-0.5 bg-white rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white rounded mt-1.5 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`block w-6 h-0.5 bg-white rounded mt-1.5 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
        </button>
        {/* Mobile menu overlay */}
        <div className={`fixed inset-0 bg-black/80 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}></div>
        <nav
          className={`fixed top-0 right-0 left-0 z-50 md:hidden transition-transform duration-500 ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}
        >
          <ul className="flex flex-col items-center justify-center bg-black/95 pt-24 pb-8 space-y-8 min-h-screen text-lg font-semibold">
            <li>
              <Link href="/" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2 px-8 hover:text-primary-pink transition-colors">Home</Link>
            </li>
            <li>
              <Link href="#closets" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2 px-8 hover:text-primary-pink transition-colors">Browse Closets</Link>
            </li>
            <li>
              <Link href="#categories" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2 px-8 hover:text-primary-pink transition-colors">Categories</Link>
            </li>
            <li>
              <Link href="/how-works" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2 px-8 hover:text-primary-pink transition-colors">How It Works</Link>
            </li>
            <li>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="block w-full text-center py-3 px-10 rounded-full bg-gradient-to-r from-primary-pink to-primary-purple text-white shadow-md hover:from-primary-purple hover:to-primary-pink transition-all duration-300 border-0">Sign In</Link>
            </li>
          </ul>
        </nav>
        {/* Subtle animated gradient accent at the bottom of header */}
        <div className="absolute left-0 right-0 bottom-0 h-1 bg-gradient-to-r from-primary-pink via-primary-purple to-primary-pink opacity-70 rounded-b-lg pointer-events-none" />
      </div>
    </header>
  )
}
