"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
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
  Star,
  Bookmark,
  ShoppingCart,
  X,
  Check,
  RefreshCw,
  CreditCard,
  DollarSign
} from "lucide-react"

import { Listing, Cart, CartItem, TradeProposal, RentalPeriod, ListingType } from "@/lib/types"
import { getListingById, addToWishlist, removeFromWishlist, getUserListings } from "@/lib/database"
import { 
  getCart, 
  addToCart, 
  removeFromCart, 
  clearCart,
  calculateRentalPeriod,
  submitTradeProposal,
  processCheckout,
  saveCart
} from "@/lib/commerce"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ListingImageCarousel component for better organization
const ListingImageCarousel = ({ 
  images, 
  title, 
  isAvailable,
  listingId,
  fallbackImages,
  listingType
}: { 
  images: any[], 
  title: string, 
  isAvailable: boolean,
  listingId: string,
  fallbackImages: string[],
  listingType: string | undefined
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [hasImageError, setHasImageError] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const zoomContainerRef = useRef<HTMLDivElement>(null)
  
  // Filter images to ensure they belong to this listing
  const validImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    
    const filtered = images.filter(img => 
      img && typeof img === 'object' && 
      'listing_id' in img && 
      img.listing_id === listingId &&
      'image_url' in img && 
      typeof img.image_url === 'string'
    );
    
    console.debug(`Filtered ${images.length} images to ${filtered.length} valid images for listing ${listingId}`);
    return filtered;
  }, [images, listingId]);
  
  // Check if we have valid images
  const hasValidImages = validImages.length > 0
  
  const nextImage = () => {
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === validImages.length - 1 ? 0 : prev + 1
      )
      setIsZoomed(false)
    }
  }
  
  const prevImage = () => {
    if (validImages.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? validImages.length - 1 : prev - 1
      )
      setIsZoomed(false)
    }
  }
  
  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
    setIsZoomed(false)
  }
  
  // Get current image or fallback
  const getCurrentImageUrl = () => {
    if (hasValidImages && !hasImageError) {
      const currentImage = validImages[currentImageIndex]
      return currentImage?.image_url
    }
    
    // Use a fallback image if no valid images
    return fallbackImages[0]
  }
  
  // Handle zoom functionality
  const toggleZoom = (e: React.MouseEvent) => {
    if (!hasValidImages || hasImageError) return
    
    setIsZoomed(!isZoomed)
    if (!isZoomed) {
      updateZoomPosition(e)
    }
  }
  
  const updateZoomPosition = (e: React.MouseEvent) => {
    if (!isZoomed || !zoomContainerRef.current) return
    
    const container = zoomContainerRef.current
    const rect = container.getBoundingClientRect()
    
    // Calculate position relative to container
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    
    setZoomPosition({ x, y })
  }
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isZoomed) {
      updateZoomPosition(e)
    }
  }
  
  const handleMouseLeave = () => {
    setIsZoomed(false)
  }
  
  // Get formatted listing type
  const getFormattedListingType = () => {
    if (!listingType) return "For Rent";
    
    switch(listingType) {
      case 'Rent': return "For Rent";
      case 'Sell': return "For Sale";
      case 'Buy': return "For Sale";
      case 'Trade': return "For Trade";
      default: return "For Rent";
    }
  }
  
  return (
    <div className="h-full relative bg-black rounded-xl overflow-hidden">
      {/* Main image - full height */}
      <div 
        ref={zoomContainerRef}
        className="relative h-[calc(100vh-200px)] md:h-[600px] lg:h-[700px] overflow-hidden group cursor-zoom-in"
        onClick={toggleZoom}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className={`w-full h-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
          <Image
            src={getCurrentImageUrl()}
            alt={title}
            fill
            className={`object-contain transition-transform duration-200 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
            onError={() => setHasImageError(true)}
            style={
              isZoomed 
                ? { 
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    pointerEvents: 'none'
                  } 
                : undefined
            }
          />
        </div>
        
        {/* Zoom instructions overlay */}
        {hasValidImages && !hasImageError && !isZoomed && (
          <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-xs flex items-center">
              <span className="mr-1">🔍</span> Click to zoom
            </p>
          </div>
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Navigation arrows */}
        {hasValidImages && validImages.length > 1 && !isZoomed && (
          <>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Previous image"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 rounded-full p-3 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-10"
              aria-label="Next image"
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </button>

            {/* Image indicators */}
            <div className="absolute bottom-6 inset-x-0 flex justify-center gap-2 z-10">
              {validImages.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    goToImage(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === index 
                      ? 'bg-white w-4' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Show message if using fallback */}
        {(!hasValidImages || hasImageError) && (
          <div className="absolute bottom-0 inset-x-0 bg-black/60 p-2 text-center">
            <p className="text-white text-sm">No image available</p>
          </div>
        )}
        
        {/* Availability badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-sm px-6 py-3 rounded-lg">
              <p className="text-white font-bold text-xl">Currently Unavailable</p>
            </div>
          </div>
        )}

        {/* Listing type badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-[#FF5CB1] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            {getFormattedListingType()}
          </div>
        </div>
      </div>
      
      {/* Thumbnail navigation */}
      {hasValidImages && validImages.length > 1 && (
        <div className="px-2 py-4 flex gap-2 overflow-x-auto justify-center">
          {validImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden transition-all ${
                currentImageIndex === index 
                  ? 'border-2 border-[#FF5CB1] shadow-[0_0_10px_rgba(255,92,177,0.5)]' 
                  : 'border border-gray-700 hover:border-white/50'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={image.image_url}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// MetadataBlock component
const ListingMetadataBlock = ({ listing }: { listing: Listing }) => {
  return (
    <div className="space-y-6">
      {/* Item specifications in a grid */}
      <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-5 flex items-center">
          <Tag className="w-4 h-4 mr-2 text-[#FF5CB1]" />
          Item Details
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
          {listing.brand && (
            <div className="border-l-2 border-[#FF5CB1]/40 pl-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Brand</h4>
              <p className="font-medium text-white">{listing.brand}</p>
            </div>
          )}
          
          {listing.size && (
            <div className="border-l-2 border-[#FF5CB1]/40 pl-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Size</h4>
              <div className="flex items-center">
                <span className="bg-gray-800 rounded-md px-2.5 py-1 font-medium text-white">{listing.size}</span>
              </div>
            </div>
          )}
          
          {listing.condition && (
            <div className="border-l-2 border-[#FF5CB1]/40 pl-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Condition</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                listing.condition === 'New with tags' 
                  ? 'bg-green-500/20 text-green-400' 
                  : listing.condition === 'Like new' 
                    ? 'bg-blue-500/20 text-blue-400'
                    : listing.condition === 'Good'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-500/20 text-gray-400'
              }`}>
                {listing.condition}
              </span>
            </div>
          )}
          
          {listing.listing_type && (
            <div className="border-l-2 border-[#FF5CB1]/40 pl-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Listing Type</h4>
              <span className="bg-[#FF5CB1]/20 text-[#FF5CB1] rounded-full px-3 py-0.5 text-xs font-medium">
                {listing.listing_type}
              </span>
            </div>
          )}
          
          {listing.created_at && (
            <div className="border-l-2 border-[#FF5CB1]/40 pl-3">
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-1">Listed</h4>
              <p className="text-white">{new Date(listing.created_at).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Location with map pin */}
      {listing.location && (
        <div className="bg-gradient-to-br from-[#111] to-[#0A0A0A] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-[#FF5CB1]" />
            Location
          </h3>
          <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
            <div className="bg-[#FF5CB1]/20 rounded-full p-2 mr-3">
              <MapPin className="w-5 h-5 text-[#FF5CB1]" />
            </div>
            <div>
              <p className="text-white font-medium">{listing.location}</p>
              <p className="text-xs text-gray-400 mt-1">General area - exact location shared after booking</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// CTAButtonGroup component based on listing type
const CTAButtonGroup = ({ 
  listing, 
  isOwner,
  onRentNow,
  onAddToCart,
  onBuyNow,
  onContactSeller,
  onTradeNow,
  isAddingToCart
}: { 
  listing: Listing, 
  isOwner: boolean,
  onRentNow: () => void,
  onAddToCart: () => void,
  onBuyNow: () => void,
  onContactSeller: () => void,
  onTradeNow: () => void,
  isAddingToCart: boolean
}) => {
  if (isOwner || !listing.is_available) return null
  
  return (
    <div className="space-y-4">
      {/* Purchase guarantee badge for trust-building */}
      <div className="bg-[#111] border border-[#333] rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#FF5CB1]/20 p-2 rounded-full">
            <Check className="w-5 h-5 text-[#FF5CB1]" />
          </div>
          <div>
            <h4 className="font-semibold text-white">Shrobe Purchase Protection</h4>
            <p className="text-gray-400 text-sm">Secure payments and verified authenticity</p>
          </div>
        </div>
      </div>
      
      {(!listing.listing_type || listing.listing_type === 'Rent') && (
        <div className="space-y-4">
          <button 
            onClick={onRentNow}
            className="w-full bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] flex items-center justify-center text-lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Rent This Item
          </button>
          <button
            onClick={onContactSeller}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Message Owner
          </button>
        </div>
      )}
      
      {(listing.listing_type === 'Buy' || listing.listing_type === 'Sell') && (
        <div className="space-y-4">
          <button 
            onClick={onBuyNow}
            className="w-full bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] flex items-center justify-center text-lg"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Buy Now
          </button>
          <div className="flex gap-4">
            <button 
              onClick={onAddToCart}
              disabled={isAddingToCart}
              className="flex-1 border border-white/20 hover:border-white/40 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              {isAddingToCart ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="w-5 h-5 mr-2" />
              )}
              Add to Cart
            </button>
            <button
              onClick={onContactSeller}
              className="flex-1 border border-white/20 hover:border-white/40 bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Message
            </button>
          </div>
        </div>
      )}
      
      {listing.listing_type === 'Trade' && (
        <div className="space-y-4">
          <button 
            onClick={onTradeNow}
            className="w-full bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,92,177,0.3)] flex items-center justify-center text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Propose Trade
          </button>
          <button
            onClick={onContactSeller}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3.5 rounded-xl font-medium transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Message Owner
          </button>
        </div>
      )}
    </div>
  )
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
  
  // Image gallery state
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  // Cart state
  const [showCart, setShowCart] = useState(false)
  const [cart, setCart] = useState<Cart | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  // Rental state
  const [showRentModal, setShowRentModal] = useState(false)
  const [rentalPeriod, setRentalPeriod] = useState<RentalPeriod>({
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    total_days: 3,
    total_price: 0
  })
  
  // Trade state
  const [showTradeModal, setShowTradeModal] = useState(false)
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [selectedListingsForTrade, setSelectedListingsForTrade] = useState<string[]>([])
  const [isSubmittingTrade, setIsSubmittingTrade] = useState(false)
  
  // Checkout state
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)
  
  // Toast state
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'success'
  })
  
  // Fallback images for listings without proper images
  const fallbackImages = [
    'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1770&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1935&auto=format&fit=crop'
  ]
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { id: string }
  const { id } = unwrappedParams
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          setCurrentUser(session.user)
          
          // Load cart from localStorage
          const savedCart = getCart(session.user.id)
          console.log("Loaded cart from storage:", savedCart)
          if (savedCart) {
            setCart(savedCart)
          }
        }
        
        // Get listing details
        const listingData = await getListingById(id)
        
        if (!listingData) {
          setError("Listing not found")
          return
        }
        
        console.log("Loaded listing data:", listingData)
        setListing(listingData)
        
        // Check if user is owner
        if (session?.user && listingData.user_id === session.user.id) {
          setIsOwner(true)
        }
        
        // Check if listing is saved
        if (session?.user) {
          try {
            const { data } = await supabase
              .from('wishlist')
              .select()
              .match({ 
                user_id: session.user.id,
                listing_id: id
              })
              .single();
            
            setIsSaved(!!data);
          } catch (wishlistError) {
            // This is non-critical, just log a message and continue
            console.info('Unable to check if listing is saved - this is not a critical issue');
          }
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
  
  useEffect(() => {
    // Calculate rental price when period or listing changes
    if (listing && rentalPeriod.start_date && rentalPeriod.end_date) {
      const start = new Date(rentalPeriod.start_date)
      const end = new Date(rentalPeriod.end_date)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      
      if (days > 0) {
        // Use weekly price if available and period is 7 days or more
        let totalPrice
        if (listing.weekly_price && days >= 7) {
          const weeks = Math.floor(days / 7)
          const remainingDays = days % 7
          totalPrice = (weeks * listing.weekly_price) + (remainingDays * listing.daily_price)
        } else {
          totalPrice = days * listing.daily_price
        }
        
        setRentalPeriod({
          ...rentalPeriod,
          total_days: days,
          total_price: totalPrice
        })
      }
    }
  }, [rentalPeriod.start_date, rentalPeriod.end_date, listing])
  
  // Load user's listings for trade
  const loadUserListingsForTrade = async () => {
    if (!currentUser) return
    
    try {
      const listings = await getUserListings(currentUser.id)
      // Filter out the current listing
      const filteredListings = listings.filter(item => item.id !== id)
      setUserListings(filteredListings)
    } catch (error) {
      console.error("Error loading user listings for trade:", error)
      showToast("Failed to load your items for trade", "error")
    }
  }
  
  // Handle showing toast notifications
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast({ ...toast, visible: false })
    }, 3000)
  }
  
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
  
  // Format price display based on listing type
  const getPriceDisplay = () => {
    if (!listing) return '';
    
    switch (listing.listing_type) {
      case 'Rent':
        return `$${listing.daily_price}/day`;
      case 'Buy':
      case 'Sell':
        return `$${listing.daily_price}`;
      case 'Trade':
        return 'Available for Trade';
      default:
        // Default to rent if not specified
        return `$${listing.daily_price}/day`;
    }
  };
  
  // Cart related functions
  const handleAddToCart = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (!listing) return
    
    setIsAddingToCart(true)
    
    // Retrieve current cart from localStorage
    const existingCart = localStorage.getItem(`cart_${currentUser.id}`)
    let updatedCart: Cart
    
    if (existingCart) {
      updatedCart = JSON.parse(existingCart)
      
      // Check if item already exists
      const existingItemIndex = updatedCart.items.findIndex(item => item.listing_id === listing.id)
      
      if (existingItemIndex >= 0) {
        // Increment quantity if already in cart
        updatedCart.items[existingItemIndex].quantity += 1
      } else {
        // Add new item
        updatedCart.items.push({
          listing_id: listing.id,
          quantity: 1,
          listing
        })
      }
      
      // Recalculate total
      updatedCart.total = updatedCart.items.reduce((sum, item) => {
        return sum + (item.listing?.daily_price || 0) * item.quantity
      }, 0)
    } else {
      // Create new cart
      updatedCart = {
        user_id: currentUser.id,
        items: [{
          listing_id: listing.id,
          quantity: 1,
          listing
        }],
        total: listing.daily_price
      }
    }
    
    // Save to localStorage
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(updatedCart))
    setCart(updatedCart)
    setShowCart(true)
    setIsAddingToCart(false)
    showToast("Added to cart", "success")
  }
  
  const handleRemoveFromCart = (listingId: string) => {
    if (!currentUser || !cart) return
    
    const updatedCart = {
      ...cart,
      items: cart.items.filter(item => item.listing_id !== listingId)
    }
    
    // Recalculate total
    updatedCart.total = updatedCart.items.reduce((sum, item) => {
      return sum + (item.listing?.daily_price || 0) * item.quantity
    }, 0)
    
    localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(updatedCart))
    setCart(updatedCart)
    
    if (updatedCart.items.length === 0) {
      setShowCart(false)
    }
  }
  
  const handleBuyNow = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (!listing) return
    
    // Create a cart with just this item
    const buyNowCart: Cart = {
      user_id: currentUser.id,
      items: [{
        listing_id: listing.id,
        quantity: 1,
        listing
      }],
      total: listing.daily_price
    }
    
    console.log("Created buy now cart:", buyNowCart);
    
    try {
      // Save cart to localStorage using the utility function
      saveCart(buyNowCart);
      
      // Also save directly to make sure it works
      localStorage.setItem(`cart_${currentUser.id}`, JSON.stringify(buyNowCart));
      
      console.log("Saved cart to localStorage");
      
      // Double-check if cart was saved
      const savedCart = localStorage.getItem(`cart_${currentUser.id}`);
      console.log("Saved cart from localStorage:", savedCart);
    } catch (err) {
      console.error("Error saving cart:", err);
    }
    
    // Update state
    setCart(buyNowCart)
    
    // Show feedback to user
    showToast("Added to cart", "success")
    
    // Give localStorage a moment to update
    setTimeout(() => {
      console.log("Redirecting to checkout...");
      handleCheckout()
    }, 500)
  }
  
  const handleCheckout = () => {
    if (!currentUser || !cart || cart.items.length === 0) return
    
    setIsCheckingOut(true)
    
    // Redirect to checkout page
    router.push('/checkout')
  }
  
  // Rent related functions
  const handleRentNow = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (!listing) return
    
    // Initialize rental period calculation
    if (listing) {
      // Set default dates
      const startDate = new Date().toISOString()
      const endDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      
      const updatedRentalPeriod = calculateRentalPeriod(
        listing,
        startDate,
        endDate
      )
      setRentalPeriod(updatedRentalPeriod)
    }
    
    setShowRentModal(true)
  }
  
  const handleRentalDateChange = (field: 'start_date' | 'end_date', value: string) => {
    // Ensure the value is a proper ISO string by adding the time part
    const dateValue = new Date(value).toISOString()
    console.log(`Setting ${field} to ${dateValue}`)
    
    const updatedPeriod = {
      ...rentalPeriod,
      [field]: dateValue
    }
    
    if (listing) {
      // Recalculate rental details when dates change
      const calculatedPeriod = calculateRentalPeriod(
        listing,
        field === 'start_date' ? dateValue : rentalPeriod.start_date,
        field === 'end_date' ? dateValue : rentalPeriod.end_date
      )
      
      console.log("Calculated rental period:", calculatedPeriod)
      setRentalPeriod(calculatedPeriod)
    } else {
      setRentalPeriod(updatedPeriod)
    }
  }
  
  const confirmRental = () => {
    if (!currentUser || !listing) return
    
    // Simulate rental confirmation
    setIsCheckingOut(true)
    
    setTimeout(() => {
      setIsCheckingOut(false)
      setShowRentModal(false)
      setCheckoutSuccess(true)
      showToast("Rental confirmed successfully!", "success")
      
      setTimeout(() => {
        setCheckoutSuccess(false)
      }, 3000)
    }, 2000)
  }
  
  // Trade related functions
  const handleTradeNow = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (!listing) return
    
    loadUserListingsForTrade()
    setShowTradeModal(true)
  }
  
  const toggleListingForTrade = (listingId: string) => {
    if (selectedListingsForTrade.includes(listingId)) {
      setSelectedListingsForTrade(selectedListingsForTrade.filter(id => id !== listingId))
    } else {
      // Limit to 3 items maximum
      if (selectedListingsForTrade.length < 3) {
        setSelectedListingsForTrade([...selectedListingsForTrade, listingId])
      } else {
        showToast("You can select up to 3 items for trade", "error")
      }
    }
  }
  
  const submitTradeProposalHandler = () => {
    if (!currentUser || !listing || selectedListingsForTrade.length === 0) return
    
    setIsSubmittingTrade(true)
    
    // Create trade proposal
    const proposal: TradeProposal = {
      proposer_id: currentUser.id,
      recipient_id: listing.user_id,
      offered_listing_ids: selectedListingsForTrade,
      requested_listing_id: listing.id
    }
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmittingTrade(false)
      setShowTradeModal(false)
      setSelectedListingsForTrade([])
      showToast("Trade proposal sent successfully!", "success")
    }, 2000)
  }
  
  const handleContactSeller = () => {
    if (!currentUser) {
      router.push('/login')
      return
    }
    
    if (!listing || !listing.user_id) return
    
    router.push(`/messages/${listing.user_id}`)
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing?.title || 'Check out this listing',
          text: `Check out "${listing?.title}" on Shrobe!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      alert('The share function is not available in this browser');
    }
  };
  
  return (
    <>
      {isLoading ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-medium">Loading...</p>
          </div>
        </div>
      ) : error || !listing ? (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center max-w-md p-8">
            <div className="mx-auto w-20 h-20 bg-red-500/20 flex items-center justify-center rounded-full mb-4">
              <X className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Listing Not Found</h1>
            <p className="text-gray-400 mb-8">{error || "The listing you're looking for doesn't exist or has been removed."}</p>
            <Link
              href="/feed"
              className="bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back to Feed
            </Link>
          </div>
        </div>
      ) : (
        <main className="bg-black text-white min-h-screen pb-20">
          {/* Back button with fixed position for better UX */}
          <div className="fixed z-10 top-24 left-4 sm:left-8">
            <Link
              href="/feed"
              className="inline-flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-full w-10 h-10 hover:bg-black/60 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </Link>
          </div>
          
          {/* Main content with left-right split */}
          <div className="container mx-auto pt-20">
            <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12">
              {/* Left side - Image gallery */}
              <div className="lg:w-3/5 mb-8 lg:mb-0 lg:sticky lg:top-24 lg:self-start">
                <ListingImageCarousel 
                  images={sortedImages} 
                  title={listing.title} 
                  isAvailable={listing.is_available} 
                  listingId={listing.id}
                  fallbackImages={fallbackImages}
                  listingType={listing.listing_type}
                />
              </div>
              
              {/* Right side - Product details */}
              <div className="lg:w-2/5">
                <div className="space-y-8">
                  {/* Product header */}
                  <div className="space-y-6">
                    {/* Badge row */}
                    <div className="flex flex-wrap gap-2">
                      {listing.condition === 'New with tags' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                          New with Tags
                        </span>
                      )}
                      {!listing.is_available && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                          Unavailable
                        </span>
                      )}
                    </div>
                    
                    {/* Title and buttons */}
                    <div className="flex justify-between items-start gap-4">
                      <h1 className="text-3xl font-bold text-white tracking-tight leading-tight flex-1">{listing.title}</h1>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={toggleSaved}
                          className={`p-2 rounded-full ${
                            isSaved 
                              ? 'bg-[#FF5CB1]/20 text-[#FF5CB1]' 
                              : 'bg-gray-800/80 text-white/70 hover:text-white hover:bg-gray-700/80'
                          }`}
                          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                        >
                          <Bookmark 
                            className={`w-5 h-5 ${isSaved ? 'fill-[#FF5CB1] text-[#FF5CB1]' : ''}`} 
                          />
                        </button>
                        <button
                          className="p-2 rounded-full bg-gray-800/80 text-white/70 hover:text-white hover:bg-gray-700/80"
                          aria-label="Share listing"
                          onClick={handleShare}
                        >
                          <Share className="w-5 h-5" />
                        </button>
                        {isOwner && (
                          <Link
                            href={`/listings/${listing.id}/edit`}
                            className="p-2 rounded-full bg-gray-800/80 text-white/70 hover:text-white hover:bg-gray-700/80"
                            aria-label="Edit listing"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                        )}
                      </div>
                    </div>
                    
                    {/* Pricing section - only show if not trade type */}
                    {listing.listing_type !== 'Trade' && (
                      <div className="bg-gradient-to-r from-[#FF5CB1]/10 to-[#c7aeef]/10 p-5 rounded-xl border border-[#FF5CB1]/20">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-400 mb-1">Price</p>
                            <div className="flex items-baseline gap-3">
                              <p className="text-3xl font-bold text-white">{getPriceDisplay()}</p>
                              {listing.weekly_price && listing.listing_type === 'Rent' && (
                                <p className="text-gray-400">${listing.weekly_price}/week</p>
                              )}
                            </div>
                          </div>
                          {listing.listing_type === 'Rent' && (
                            <div className="bg-black/30 px-3 py-1 rounded-lg">
                              <p className="text-sm text-white">Rental</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Trade message - only show if trade type */}
                    {listing.listing_type === 'Trade' && (
                      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 p-5 rounded-xl border border-purple-500/20">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="text-purple-400 w-6 h-6" />
                          <div>
                            <p className="text-lg font-semibold text-white">Available for Trade</p>
                            <p className="text-sm text-gray-400">The owner of this item is looking to trade it for other items.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Seller card - attractive, clickable profile */}
                  <div 
                    className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl overflow-hidden hover:shadow-[0_0_20px_rgba(255,92,177,0.15)] transition-all cursor-pointer"
                    onClick={() => router.push(`/profile/${listing.user_id}`)}
                  >
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-14 h-14 border-2 border-[#FF5CB1]">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gray-700 text-white text-lg">
                            {listing.user?.full_name?.charAt(0) || listing.user?.user_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-lg text-white">
                                {listing.user?.full_name || listing.user?.user_name || 'Unknown User'}
                              </p>
                              <div className="flex items-center text-yellow-400 mt-1">
                                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                                <Star className="w-4 h-4 fill-yellow-400 mr-1" />
                                <span className="text-sm text-gray-300 ml-1">5.0 (12)</span>
                              </div>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/messages/${listing.user?.id}`);
                              }}
                              className="bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                              Message
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center text-gray-400 text-sm">
                        <Check className="w-4 h-4 text-green-400 mr-1" />
                        <span>Verified Seller</span>
                        <span className="mx-2">•</span>
                        <span>Member since {new Date(listing.created_at || '').getFullYear()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Description - only show if it exists */}
                  {listing.description && (
                    <div className="bg-[#111] rounded-xl p-5 border border-gray-800">
                      <h2 className="text-xl font-semibold mb-3">About this item</h2>
                      <p className="text-gray-300 whitespace-pre-line">{listing.description}</p>
                    </div>
                  )}
                  
                  {/* Item details section */}
                  <ListingMetadataBlock listing={listing} />
                  
                  {/* Categories/Tags */}
                  {listing.tags && listing.tags.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Categories</h2>
                      <div className="flex flex-wrap gap-2">
                        {listing.tags.map((tag) => (
                          <span 
                            key={tag.id} 
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-full text-sm flex items-center transition-colors cursor-pointer"
                          >
                            <Tag className="w-4 h-4 mr-1.5" />
                            {tag.tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* CTA buttons */}
                  <CTAButtonGroup 
                    listing={listing}
                    isOwner={isOwner}
                    onRentNow={handleRentNow}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onContactSeller={handleContactSeller}
                    onTradeNow={handleTradeNow}
                    isAddingToCart={isAddingToCart}
                  />
                  
                  {/* Edit button for owner */}
                  {isOwner && (
                    <div>
                      <Link 
                        href={`/listings/${listing.id}/edit`}
                        className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center"
                      >
                        <Edit className="w-5 h-5 mr-2" />
                        Edit Your Listing
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
      
      {/* Toast notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium flex items-center z-50`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <X className="w-5 h-5 mr-2" />
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Modals (rent, cart, trade) */}
      {/* These modals should be kept as they are with minimal style updates */}
    </>
  )
} 