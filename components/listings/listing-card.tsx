"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Heart, MessageCircle, MapPin, Clock, Bookmark } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Listing } from "@/lib/types"
import { addToWishlist, removeFromWishlist } from "@/lib/database"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

interface ListingCardProps {
  listing: Listing & { User?: { user_name: string; full_name?: string } }
  onDoubleTap?: (id: string) => void
  isSaved?: boolean
  isLiked?: boolean
}

export default function ListingCard({ 
  listing, 
  onDoubleTap, 
  isSaved = false,
  isLiked = false
}: ListingCardProps) {
  const [liked, setLiked] = useState(isLiked)
  const [saved, setSaved] = useState(isSaved)
  const [tapCount, setTapCount] = useState(0)
  const [tapTimer, setTapTimer] = useState<NodeJS.Timeout | null>(null)
  const supabase = createClientComponentClient()

  const mainImage = listing.images && listing.images.length > 0
    ? listing.images.sort((a, b) => a.display_order - b.display_order)[0]
    : null

  const handleTap = () => {
    if (tapCount === 0) {
      const timer = setTimeout(() => {
        setTapCount(0)
      }, 300)
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
    // API call to like/unlike would go here
  }

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      
      if (!saved) {
        await addToWishlist(session.user.id, listing.id)
      } else {
        await removeFromWishlist(session.user.id, listing.id)
      }
      
      setSaved(!saved)
    } catch (error) {
      console.error('Error toggling wishlist:', error)
    }
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
        {/* Image */}
        <div 
          className="aspect-[3/4] relative overflow-hidden"
          onClick={handleTap}
        >
          {mainImage ? (
            <Image
              src={mainImage.image_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gray-800 flex items-center justify-center">
              <span className="text-gray-500">No image</span>
            </div>
          )}
          
          {/* Like animation */}
          {liked && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.8] }}
              transition={{ duration: 1 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-[#FF5CB1] fill-[#FF5CB1]" />
            </motion.div>
          )}
          
          {/* Price tag */}
          <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full">
            <p className="text-white font-medium text-sm">${listing.daily_price}/day</p>
          </div>
          
          {/* Availability badge */}
          {!listing.is_available && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                <p className="text-white font-medium">Currently Unavailable</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-medium text-white text-lg line-clamp-1">{listing.title}</h3>
            <button 
              onClick={toggleSave}
              className="text-white/70 hover:text-white"
            >
              <Bookmark 
                className={`w-5 h-5 ${saved ? 'fill-[#FF5CB1] text-[#FF5CB1]' : ''}`} 
              />
            </button>
          </div>
          
          {/* User info */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="w-6 h-6">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gray-700 text-white text-xs">
                {listing.User?.full_name?.charAt(0) || listing.User?.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">
              {listing.User?.full_name || listing.User?.user_name || 'Unknown User'}
            </span>
          </div>
          
          {/* Tags */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {listing.tags.slice(0, 3).map((tag) => (
                <span 
                  key={tag.id} 
                  className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded-full"
                >
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
          
          {/* Location and actions */}
          <div className="flex justify-between items-center mt-2">
            {listing.location ? (
              <div className="flex items-center text-gray-400 text-sm">
                <MapPin className="w-3 h-3 mr-1" />
                <span className="truncate max-w-[100px]">{listing.location}</span>
              </div>
            ) : (
              <div></div>
            )}
            
            <button 
              onClick={toggleLike}
              className="text-white/70 hover:text-white"
            >
              <Heart 
                className={`w-5 h-5 ${liked ? 'fill-[#FF5CB1] text-[#FF5CB1]' : ''}`} 
              />
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  )
} 