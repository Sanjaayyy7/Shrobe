"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, MapPin, Clock, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Listing } from "@/lib/types"
import { addToWishlist, removeFromWishlist } from "@/lib/database"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ListingCardProps {
  listing: Listing & { user?: { user_name: string; full_name?: string; profile_picture_url?: string } }
  onDoubleTap?: (id: string) => void
  isSaved?: boolean
  isLiked?: boolean
  selectable?: boolean
  isSelected?: boolean
  onSelect?: (id: string, selected: boolean) => void
}

export default function ListingCard({ 
  listing, 
  onDoubleTap, 
  isSaved = false,
  isLiked = false,
  selectable = false,
  isSelected = false,
  onSelect
}: ListingCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [tapCount, setTapCount] = useState(0)
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null)
  const [imageError, setImageError] = useState(false)
  const supabase = createClientComponentClient()

  const userInfo = listing.user

  const getMainImage = () => {
    if (!listing || !listing.images) return null
    const imagesArray = Array.isArray(listing.images) ? listing.images : []
    const filteredImages = imagesArray.filter(img => img?.listing_id === listing.id)
    return filteredImages.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))[0] || null
  }

  const mainImage = getMainImage()
  const hasValidImageUrl = mainImage?.image_url?.trim() !== ''

  const handleTap = () => {
    if (tapCount === 0) {
      const timer = setTimeout(() => setTapCount(0), 300)
      setTapTimer(timer)
      setTapCount(1)
    } else {
      if (tapTimer) clearTimeout(tapTimer)
      setTapCount(0)
      handleDoubleTap()
    }
  }

  const handleDoubleTap = () => {
    if (!liked) {
      setLiked(true)
      if (onDoubleTap) onDoubleTap(listing.id)
    }
  }

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLiked(!liked)
  }

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    if (!saved) {
      await addToWishlist(session.user.id, listing.id)
    } else {
      await removeFromWishlist(session.user.id, listing.id)
    }
    setSaved(!saved)
  }

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onSelect) onSelect(listing.id, !isSelected)
  }

  const getPriceDisplay = () => {
    if (!listing.listing_type || listing.listing_type === 'Rent') return `$${listing.daily_price}/day`
    if (listing.listing_type === 'Buy') return `$${listing.daily_price}`
    if (listing.listing_type === 'Sell') return 'For Sale'
    if (listing.listing_type === 'Trade') return 'For Trade'
    return `$${listing.daily_price}/day`
  }

  return (
    <Link href={`/listings/${listing.id}`}>
      <motion.div 
        className="group relative rounded-xl overflow-hidden bg-gray-900 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
      >
        {selectable && (
          <div onClick={handleSelect} className="absolute top-3 left-3 z-10">
            <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-[#FF5CB1] border-[#FF5CB1]' : 'border-white/50 bg-black/50'} flex items-center justify-center transition-colors cursor-pointer`}>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        <div className="aspect-[3/4] relative overflow-hidden" onClick={handleTap}>
          {hasValidImageUrl ? (
            <Image src={mainImage?.image_url || ""} alt={listing.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" onError={() => setImageError(true)} />
          ) : (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <p className="text-white text-xs">Image not available</p>
              </div>
            </div>
          )}

          {liked && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.8] }} transition={{ duration: 1 }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart className="w-24 h-24 text-[#FF5CB1] fill-[#FF5CB1]" />
            </motion.div>
          )}

          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white font-medium text-sm">{getPriceDisplay()}</p>
          </div>

          {!listing.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-medium">Currently Unavailable</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-white text-lg line-clamp-1">{listing.title}</h3>
            <button onClick={toggleSave} className="text-white/70 hover:text-white">
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-[#FF5CB1] text-[#FF5CB1]' : ''}`} />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src={userInfo?.profile_picture_url || ""} />
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {userInfo?.profile_picture_url || userInfo?.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">
              {userInfo?.full_name || 'Unknown User'}
            </span>
          </div>

          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 3).map((tag) => (
                <span key={tag.id} className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  {tag.tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full">
                  +{listing.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-2">
            {listing.location ? (
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[100px]">{listing.location}</span>
              </div>
            ) : (
              <div></div>
            )}

            <button onClick={toggleLike} className="text-white/70 hover:text-white">
              <Heart className={`w-5 h-5 ${liked ? 'fill-[#FF5CB1] text-[#FF5CB1]' : ''}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
