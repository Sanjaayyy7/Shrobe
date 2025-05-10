"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import React from "react"
import { 
  ChevronLeft, 
  Heart, 
  Share, 
  MessageCircle, 
  Calendar, 
  MapPin,
  User,
  Tag,
  Edit,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Star
} from "lucide-react"

import { Listing } from "@/lib/types"
import { getListingById, addToWishlist, removeFromWishlist } from "@/lib/database"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { id: string }
  const { id } = unwrappedParams
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setCurrentUser(session.user)
        }
        
        // Get listing details
        const listingData = await getListingById(id)
        
        if (!listingData) {
          setError("Listing not found")
          return
        }
        
        setListing(listingData)
        
        // Check if user is owner
        if (session?.user && listingData.user_id === session.user.id) {
          setIsOwner(true)
        }
        
        // Check if listing is saved
        if (session?.user) {
          const { data } = await supabase
            .from('wishlist')
            .select()
            .match({ 
              user_id: session.user.id,
              listing_id: id
            })
            .single()
          
          setIsSaved(!!data)
        }
      } catch (err) {
        console.error("Error fetching listing:", err)
        setError("Failed to load listing details")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchListing()
  }, [id, supabase])
  
  const toggleSaved = async () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    try {
      if (isSaved) {
        await removeFromWishlist(currentUser.id, id)
      } else {
        await addToWishlist(currentUser.id, id)
      }
      
      setIsSaved(!isSaved)
    } catch (err) {
      console.error("Error toggling wishlist:", err)
    }
  }
  
  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      )
    }
  }
  
  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
      )
    }
  }
  
  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading listing details...</p>
        </div>
      </div>
    )
  }
  
  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4 text-[#FF5CB1]">Oops!</h1>
          <p className="text-lg mb-6">{error || "This listing could not be found"}</p>
          <Link
            href="/feed"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#FF5CB1] text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }
  
  // Sort images by display order
  const sortedImages = [...(listing.images || [])].sort(
    (a, b) => a.display_order - b.display_order
  )
  
  // Get current image
  const currentImage = sortedImages[currentImageIndex]
  
  return (
    <main className="min-h-screen bg-black text-white pb-16">
      {/* Back button */}
      <div className="container mx-auto px-4 pt-6">
        <Link
          href="/feed"
          className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Feed
        </Link>
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image gallery */}
          <div className="w-full lg:w-3/5">
            <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10">
              {/* Main image */}
              <div className="aspect-square relative">
                {currentImage ? (
                  <Image
                    src={currentImage.image_url}
                    alt={listing.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}
                
                {/* Navigation arrows */}
                {sortedImages.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
                      aria-label="Previous image"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 rounded-full p-3 transition-colors"
                      aria-label="Next image"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </>
                )}
                
                {/* Availability badge */}
                {!listing.is_available && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
                      <p className="text-white font-medium">Currently Unavailable</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Thumbnail navigation */}
              {sortedImages.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {sortedImages.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => goToImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index 
                          ? 'border-[#FF5CB1]' 
                          : 'border-transparent hover:border-white/30'
                      }`}
                    >
                      <div className="relative w-full h-full">
                        <Image
                          src={image.image_url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Listing details */}
          <div className="w-full lg:w-2/5">
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
              {/* Title and actions */}
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={toggleSaved}
                    className={`p-2 rounded-full ${
                      isSaved 
                        ? 'bg-[#FF5CB1]/20 text-[#FF5CB1]' 
                        : 'bg-gray-800 text-white/70 hover:text-white hover:bg-gray-700'
                    }`}
                    aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={isSaved ? "w-5 h-5 fill-[#FF5CB1]" : "w-5 h-5"} />
                  </button>
                  <button
                    className="p-2 rounded-full bg-gray-800 text-white/70 hover:text-white hover:bg-gray-700"
                    aria-label="Share listing"
                  >
                    <Share className="w-5 h-5" />
                  </button>
                  {isOwner && (
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="p-2 rounded-full bg-gray-800 text-white/70 hover:text-white hover:bg-gray-700"
                      aria-label="Edit listing"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Price */}
              <div className="mb-6">
                <div className="text-2xl font-bold text-[#FF5CB1]">
                  ${listing.daily_price}/day
                </div>
                {listing.weekly_price && (
                  <div className="text-sm text-gray-400">
                    ${listing.weekly_price}/week
                  </div>
                )}
              </div>
              
              {/* User info */}
              <div className="flex items-center gap-3 mb-6 p-3 bg-gray-800/50 rounded-lg">
                <Avatar className="w-12 h-12 border-2 border-[#FF5CB1]">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gray-700 text-white">
                    {listing.user?.full_name?.charAt(0) || listing.user?.user_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">
                    {listing.user?.full_name || listing.user?.user_name || 'Unknown User'}
                  </div>
                  <div className="text-sm text-gray-400 flex items-center">
                    <Star className="w-3 h-3 text-yellow-400 mr-1 fill-yellow-400" />
                    <span>4.9 (12 reviews)</span>
                  </div>
                </div>
                {!isOwner && (
                  <button className="ml-auto bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
                    Message
                  </button>
                )}
              </div>
              
              {/* Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-lg font-medium mb-2">Description</h2>
                  <p className="text-gray-300">{listing.description}</p>
                </div>
                
                {/* Item details */}
                <div className="grid grid-cols-2 gap-4">
                  {listing.brand && (
                    <div>
                      <h3 className="text-sm text-gray-400">Brand</h3>
                      <p className="text-white">{listing.brand}</p>
                    </div>
                  )}
                  
                  {listing.size && (
                    <div>
                      <h3 className="text-sm text-gray-400">Size</h3>
                      <p className="text-white">{listing.size}</p>
                    </div>
                  )}
                  
                  {listing.condition && (
                    <div>
                      <h3 className="text-sm text-gray-400">Condition</h3>
                      <p className="text-white">{listing.condition}</p>
                    </div>
                  )}
                  
                  {listing.location && (
                    <div>
                      <h3 className="text-sm text-gray-400">Location</h3>
                      <p className="text-white flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {listing.location}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Categories */}
                {listing.tags && listing.tags.length > 0 && (
                  <div>
                    <h2 className="text-lg font-medium mb-2">Categories</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag) => (
                        <span 
                          key={tag.id} 
                          className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full flex items-center"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag.tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Booking button */}
                {!isOwner && listing.is_available && (
                  <div className="pt-4">
                    <button className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center">
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </button>
                  </div>
                )}
                
                {/* Edit button for owner */}
                {isOwner && (
                  <div className="pt-4">
                    <Link 
                      href={`/listings/${listing.id}/edit`}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Listing
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
} 