'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { getListings } from "@/lib/database"
import { Listing } from '@/lib/types'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Listing[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 1) {
        handleSearch(query)
      } else {
        setResults([])
      }
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [query])

  const handleSearch = async (text: string) => {
    setLoading(true)
    const listings = await getListings({ searchQuery: text })
    setResults(listings)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
        {/* Back button */}
        <div className="mb-2 mt-6">
            <Link
              href="/feed"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Feed
            </Link>
        </div>

        <div className="flex justify-center">
            <input
                type="text"
                placeholder="Search anything..."
                className="w-[80%] bg-neutral-900 text-white border border-neutral-700 px-4 py-2 rounded
                        mt-2 mb-4 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>

      {loading && <p className="text-center text-neutral-400">Searching...</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {results.map((listing) => {
          const imageUrl = listing.images?.[0]?.image_url || "/placeholder.jpg"
          const username = listing.user?.user_name || "unknown"
          const avatar = listing.user?.profile_picture_url

          return (
            <Link 
              key={listing.id} 
              href={`/listings/${listing.id}`} 
              className="relative group block w-full h-64 overflow-hidden rounded-xl border border-white/10"
            >
              <Image 
                src={imageUrl}
                alt={listing.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-2 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center text-sm text-white">
                  {avatar ? (
                    <img src={avatar} alt={username} className="w-full h-full object-cover" />
                  ) : (
                    <span>{username.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span className="text-white text-xs font-medium truncate">@{username}</span>
              </div>
            </Link>
          )
        })}
      </div>


      {!loading && results.length === 0 && query.trim().length > 1 && (
        <p className="text-center mt-10 text-neutral-500">No results found</p>
      )}
    </div>
  )
}
