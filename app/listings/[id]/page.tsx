"use client"

import { useState, useEffect } from "react"
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
  processCheckout
} from "@/lib/commerce"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// ListingImageCarousel component for better organization
const ListingImageCarousel = ({ 
  images, 
  title, 
  isAvailable 
}: { 
  images: any[], 
  title: string, 
  isAvailable: boolean 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  
  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === images.length - 1 ? 0 : prev + 1
      )
    }
  }
  
  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? images.length - 1 : prev - 1
      )
    }
  }
  
  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }
  
  // Get current image
  const currentImage = images[currentImageIndex]
  
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 border border-white/10">
      {/* Main image */}
      <div className="aspect-square relative">
        {currentImage ? (
          <Image
            src={currentImage.image_url}
            alt={title}
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
        {images.length > 1 && (
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
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-black/80 backdrop-blur-sm px-4 py-2 rounded-lg">
              <p className="text-white font-medium">Currently Unavailable</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Thumbnail navigation */}
      {images.length > 1 && (
        <div className="p-4 flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
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
  )
}

// MetadataBlock component
const ListingMetadataBlock = ({ listing }: { listing: Listing }) => {
  return (
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
    <div className="pt-4 space-y-3">
      {(!listing.listing_type || listing.listing_type === 'Rent') && (
        <button 
          onClick={onRentNow}
          className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <Calendar className="w-5 h-5 mr-2" />
          Rent Now
        </button>
      )}
      
      {listing.listing_type === 'Buy' && (
        <div className="flex gap-3">
          <button 
            onClick={onAddToCart}
            disabled={isAddingToCart}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            {isAddingToCart ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-5 h-5 mr-2" />
            )}
            Add to Cart
          </button>
          <button 
            onClick={onBuyNow}
            className="flex-1 bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Buy Now
          </button>
        </div>
      )}
      
      {listing.listing_type === 'Sell' && (
        <button 
          onClick={onContactSeller}
          className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Contact Seller
        </button>
      )}
      
      {listing.listing_type === 'Trade' && (
        <button 
          onClick={onTradeNow}
          className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Propose Trade
        </button>
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
    
    if (!listing.listing_type || listing.listing_type === 'Rent') {
      return `$${listing.daily_price}/day`;
    } else if (listing.listing_type === 'Buy') {
      return `$${listing.daily_price}`;
    } else if (listing.listing_type === 'Sell') {
      return 'For Sale';
    } else if (listing.listing_type === 'Trade') {
      return 'For Trade';
    }
    return `$${listing.daily_price}/day`; // Default fallback
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
    
    setCart(buyNowCart)
    handleCheckout()
  }
  
  const handleCheckout = () => {
    if (!currentUser || !cart || cart.items.length === 0) return
    
    setIsCheckingOut(true)
    
    // Simulate API call to payment processor
    setTimeout(() => {
      // Clear cart after successful checkout
      localStorage.removeItem(`cart_${currentUser.id}`)
      setIsCheckingOut(false)
      setCheckoutSuccess(true)
      showToast("Order completed successfully!", "success")
      
      // Reset UI after a delay
      setTimeout(() => {
        setCheckoutSuccess(false)
        setShowCart(false)
        setCart(null)
      }, 3000)
    }, 2000)
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
        
        {/* Debug indicator */}
        <div className="bg-purple-600 text-white p-2 rounded-lg mb-4 inline-block">
          Enhanced E-commerce Interface Active
        </div>
      </div>
      
      {/* Main content */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image gallery */}
          <div className="w-full lg:w-3/5">
            <ListingImageCarousel 
              images={sortedImages} 
              title={listing.title} 
              isAvailable={listing.is_available} 
            />
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
                    <Bookmark 
                      className={`w-5 h-5 ${isSaved ? 'fill-[#FF5CB1] text-[#FF5CB1]' : 'text-white'}`} 
                    />
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
                <div className="bg-[#FF5CB1]/10 px-4 py-3 rounded-lg border border-[#FF5CB1]/30 mb-4">
                  <div className="flex justify-between items-center">
                    <p className="text-white font-medium">{getPriceDisplay()}</p>
                    {listing.weekly_price && listing.listing_type === 'Rent' && (
                      <p className="text-gray-400 text-sm">${listing.weekly_price}/week</p>
                    )}
                  </div>
                </div>
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
                  <button 
                    onClick={() => router.push(`/messages/${listing.user?.id}`)}
                    className="ml-auto bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
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
                <ListingMetadataBlock listing={listing} />
                
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
                
                {/* Action buttons based on listing type */}
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
      
      {/* Toast notification */}
      <AnimatePresence>
        {toast.visible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white font-medium flex items-center`}
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
      
      {/* Modal components */}
      {/* Cart modal */}
      <AnimatePresence>
        {showCart && cart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4"
            onClick={() => setShowCart(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-gray-900 rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="border-b border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Cart ({cart.items.length})
                </h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {cart.items.length > 0 ? (
                <>
                  <div className="max-h-80 overflow-y-auto p-4 space-y-4">
                    {cart.items.map(item => (
                      <div key={item.listing_id} className="flex gap-3 border-b border-gray-800 pb-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-md relative flex-shrink-0">
                          {item.listing?.images && item.listing.images[0] && (
                            <Image
                              src={item.listing.images[0].image_url}
                              alt={item.listing?.title || "Item"}
                              fill
                              className="object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-white">
                            {item.listing?.title || "Unknown item"}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            ${item.listing?.daily_price || 0}
                          </p>
                          <p className="text-sm text-gray-400">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.listing_id)}
                          className="text-gray-400 hover:text-white self-start"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-4 bg-gray-800/50">
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-300">Total</span>
                      <span className="font-bold">${cart.total}</span>
                    </div>
                    
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut || checkoutSuccess}
                      className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                    >
                      {isCheckingOut ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : checkoutSuccess ? (
                        <Check className="w-5 h-5 mr-2" />
                      ) : (
                        <CreditCard className="w-5 h-5 mr-2" />
                      )}
                      {isCheckingOut ? "Processing..." : checkoutSuccess ? "Order Complete!" : "Checkout"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-400 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                  >
                    Continue Shopping
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Rent modal */}
      <AnimatePresence>
        {showRentModal && listing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4"
            onClick={() => setShowRentModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-gray-900 rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="border-b border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Rent {listing.title}
                </h2>
                <button
                  onClick={() => setShowRentModal(false)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={new Date(rentalPeriod.start_date).toISOString().split('T')[0]}
                    onChange={(e) => handleRentalDateChange('start_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={new Date(rentalPeriod.end_date).toISOString().split('T')[0]}
                    onChange={(e) => handleRentalDateChange('end_date', e.target.value)}
                    min={new Date(rentalPeriod.start_date).toISOString().split('T')[0]}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                </div>
                
                <div className="pt-4">
                  <div className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Daily Rate</span>
                      <span>${listing.daily_price}/day</span>
                    </div>
                    
                    {listing.weekly_price && (
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Weekly Rate</span>
                        <span>${listing.weekly_price}/week</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-300">Duration</span>
                      <span>{rentalPeriod.total_days} {rentalPeriod.total_days === 1 ? 'day' : 'days'}</span>
                    </div>
                    
                    <div className="border-t border-gray-700 my-2 pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>${rentalPeriod.total_price}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-800/50">
                <button
                  onClick={confirmRental}
                  disabled={isCheckingOut || checkoutSuccess}
                  className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isCheckingOut ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : checkoutSuccess ? (
                    <Check className="w-5 h-5 mr-2" />
                  ) : (
                    <Calendar className="w-5 h-5 mr-2" />
                  )}
                  {isCheckingOut ? "Processing..." : checkoutSuccess ? "Rental Confirmed!" : "Confirm Rental"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Trade modal */}
      <AnimatePresence>
        {showTradeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 p-4"
            onClick={() => setShowTradeModal(false)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              className="bg-gray-900 rounded-t-xl sm:rounded-xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="border-b border-gray-800 p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Propose Trade
                </h2>
                <button
                  onClick={() => setShowTradeModal(false)}
                  className="p-2 rounded-full hover:bg-gray-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4">
                <p className="text-gray-300 mb-4">
                  Select up to 3 items from your closet to offer in exchange for this item.
                </p>
                
                {userListings.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {userListings.map(item => (
                      <div 
                        key={item.id} 
                        className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedListingsForTrade.includes(item.id) 
                            ? 'bg-[#FF5CB1]/20 border border-[#FF5CB1]/30' 
                            : 'bg-gray-800 border border-transparent hover:border-gray-700'
                        }`}
                        onClick={() => toggleListingForTrade(item.id)}
                      >
                        <div className="w-16 h-16 bg-gray-700 rounded-md relative flex-shrink-0">
                          {item.images && item.images[0] && (
                            <Image
                              src={item.images[0].image_url}
                              alt={item.title}
                              fill
                              className="object-cover rounded-md"
                            />
                          )}
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium text-white text-sm">{item.title}</h3>
                          <p className="text-xs text-gray-400">
                            {item.condition || ''} {item.brand ? `· ${item.brand}` : ''}
                          </p>
                        </div>
                        <div className="self-center">
                          {selectedListingsForTrade.includes(item.id) && (
                            <div className="w-6 h-6 bg-[#FF5CB1] rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-800 rounded-lg">
                    <p className="text-gray-400">
                      You don't have any items in your closet to trade.
                    </p>
                    <Link 
                      href="/listings/create"
                      className="mt-4 inline-block bg-[#FF5CB1] text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Create a Listing
                    </Link>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-gray-800/50">
                <button
                  onClick={submitTradeProposalHandler}
                  disabled={selectedListingsForTrade.length === 0 || isSubmittingTrade}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    selectedListingsForTrade.length === 0
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white'
                  }`}
                >
                  {isSubmittingTrade ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5 mr-2" />
                  )}
                  {isSubmittingTrade 
                    ? "Sending Proposal..." 
                    : `Send Trade Proposal (${selectedListingsForTrade.length}/3)`
                  }
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
} 