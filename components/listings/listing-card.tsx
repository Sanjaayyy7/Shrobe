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
  listing: Listing & { User?: { user_name: string; full_name?: string }, user?: { user_name: string; full_name?: string } }
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

  // Enhanced console log for debugging images
  useEffect(() => {
    console.log(`Listing ${listing.id} title: ${listing.title}`);
    if (listing.images) {
      console.log(`Listing ${listing.id} images type:`, Array.isArray(listing.images) ? 'Array' : typeof listing.images);
      console.log(`Listing ${listing.id} images length:`, Array.isArray(listing.images) ? listing.images.length : 'Not an array');
      if (Array.isArray(listing.images) && listing.images.length > 0) {
        console.log(`Listing ${listing.id} first image:`, listing.images[0]);
      }
    } else {
      console.log(`Listing ${listing.id} has no images array`);
    }
  }, [listing.id, listing.title, listing.images]);

  // Get the user information consistently across different API responses
  const userInfo = listing.user || listing.User;

  // Enhanced image handling logic with safe type checking
  const getMainImage = () => {
    // Ensure we have an images array
    if (!listing || !listing.images) {
      console.info(`Listing ${listing?.id || 'unknown'} - No images property`);
      return null;
    }
    
    // Convert to array if not already
    const imagesArray = Array.isArray(listing.images) 
      ? listing.images 
      : (typeof listing.images === 'object' && listing.images !== null)
        ? [listing.images] 
        : [];
    
    if (imagesArray.length === 0) {
      console.info(`Listing ${listing.id} - Images array is empty`);
      return null;
    }
    
    // Debug log all images for this listing
    console.info(`Found ${imagesArray.length} images for listing ${listing.id}`);
    imagesArray.forEach((img, index) => {
      if (img && typeof img === 'object' && 'image_url' in img) {
        console.debug(`Image ${index}: ${img.image_url.substring(0, 30)}... (for listing ${img.listing_id || 'unknown'})`);
      }
    });
    
    // Filter out images that don't belong to this listing
    const filteredImages = imagesArray.filter(img => 
      img && 
      typeof img === 'object' && 
      'listing_id' in img && 
      img.listing_id === listing.id
    );
    
    if (filteredImages.length < imagesArray.length) {
      console.debug(`Filtered out ${imagesArray.length - filteredImages.length} images that don't belong to listing ${listing.id}`);
    }
    
    if (filteredImages.length === 0) {
      console.info(`No valid images found for listing ${listing.id} after filtering`);
      return null;
    }
    
    try {
      // If the images have display_order property, sort by it
      if (filteredImages.length > 0 && 'display_order' in filteredImages[0] && typeof filteredImages[0].display_order === 'number') {
        console.debug(`Listing ${listing.id} - Using display_order to sort images`);
        const sortedImages = [...filteredImages].sort((a, b) => a.display_order - b.display_order);
        return sortedImages[0];
      }
      
      // Otherwise just return the first image
      console.debug(`Listing ${listing.id} - Using first image (no display_order)`);
      return filteredImages[0];
    } catch (error) {
      console.error(`Error getting main image for listing ${listing.id}:`, error);
      return null;
    }
  }

  const mainImage = getMainImage();
  
  // Check if mainImage has valid URL
  const hasValidImageUrl = mainImage && 
                          typeof mainImage === 'object' && 
                          mainImage !== null && 
                          'image_url' in mainImage && 
                          typeof mainImage.image_url === 'string' && 
                          mainImage.image_url.trim() !== '';
  
  // Create a fallback URL for missing images
  const getFallbackImageUrl = () => {
    // Generate a deterministic color based on the listing id
    const stringToColor = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const color = '#' + (Math.abs(hash) % 16777215).toString(16).padStart(6, '0');
      return color;
    };
    
    // Use images from Unsplash as fallbacks with deterministic selection based on listing ID
    const placeholderImages = [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=1770&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?q=80&w=1935&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1964&auto=format&fit=crop'
    ];
    
    // Use listing.id to deterministically pick a placeholder image
    const idSum = listing.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const imageIndex = idSum % placeholderImages.length;
    
    return placeholderImages[imageIndex];
  };
  
  const fallbackImageUrl = getFallbackImageUrl();
  
  // Log the main image for debugging
  useEffect(() => {
    if (mainImage) {
      console.log(`Listing ${listing.id} main image:`, mainImage);
      console.log(`Listing ${listing.id} has valid image URL:`, hasValidImageUrl);
      if (hasValidImageUrl) {
        console.log(`Listing ${listing.id} image URL:`, mainImage.image_url);
      }
    } else {
      console.log(`Listing ${listing.id} has no main image`);
    }
  }, [listing.id, mainImage, hasValidImageUrl]);

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

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onSelect) {
      onSelect(listing.id, !isSelected);
    }
  };

  // Format price display based on listing type
  const getPriceDisplay = () => {
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

  return (
    <Link href={`/listings/${listing.id}`}>
      <motion.div 
        className="group relative rounded-xl overflow-hidden bg-gray-900 border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ y: -4 }}
      >
        {/* Checkbox for selectable items */}
        {selectable && (
          <div 
            onClick={handleSelect}
            className="absolute top-3 left-3 z-10"
          >
            <div className={`w-5 h-5 rounded border ${isSelected ? 'bg-[#FF5CB1] border-[#FF5CB1]' : 'border-white/50 bg-black/50'} flex items-center justify-center transition-colors cursor-pointer`}>
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Image */}
        <div 
          className="aspect-[3/4] relative overflow-hidden"
          onClick={handleTap}
        >
          {hasValidImageUrl ? (
            <Image
              src={mainImage.image_url}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => {
                console.error(`Image failed to load: ${mainImage.image_url}`);
                setImageError(true);
              }}
            />
          ) : (
            <div className="w-full h-full relative">
              <Image
                src={fallbackImageUrl}
                alt={listing.title || "Product image"}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <p className="text-white text-xs">Image not available</p>
              </div>
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
            <p className="text-white font-medium text-sm">{getPriceDisplay()}</p>
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
                {userInfo?.full_name?.charAt(0) || userInfo?.user_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-300">
              {userInfo?.full_name || userInfo?.user_name || 'Unknown User'}
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