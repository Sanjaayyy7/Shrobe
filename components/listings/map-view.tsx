"use client"

import { useState } from "react"
// import { GoogleMap, Marker, useLoadScript, InfoWindow, MarkerClusterer } from "@react-google-maps/api"
import { Listing } from "@/lib/types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DollarSign, MapPin } from "lucide-react"

interface MapViewProps {
  listings: Listing[]
}

export default function MapView({ listings }: MapViewProps) {
  const router = useRouter()
  
  // Simplified version without Google Maps
  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center p-6">
      <MapPin className="w-16 h-16 text-gray-600 mb-4" />
      <h3 className="text-xl font-medium text-white mb-2">Map View Temporarily Disabled</h3>
      <p className="text-gray-400 text-center max-w-md mb-8">
        To improve performance, the map view has been temporarily disabled. 
        You can still view all listings in the grid view.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl overflow-y-auto max-h-[400px] p-4">
        {listings.slice(0, 6).map((listing) => (
          <div 
            key={listing.id}
            className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors"
            onClick={() => router.push(`/listings/${listing.id}`)}
          >
            <div className="aspect-square relative">
              {listing.images && listing.images.length > 0 && listing.images[0].image_url ? (
                <Image
                  src={listing.images[0].image_url}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-500">No image</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                <p className="text-white font-medium text-xs flex items-center">
                  <DollarSign className="w-3 h-3 mr-0.5" />
                  {listing.daily_price}
                </p>
              </div>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm mb-1 text-white">{listing.title}</h3>
              <p className="text-xs text-gray-400">{listing.condition || ''} {listing.brand ? `· ${listing.brand}` : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Original Google Maps Implementation (commented out)
/*
export default function MapView({ listings }: MapViewProps) {
  const router = useRouter()
  const [activeMarker, setActiveMarker] = useState<string | null>(null)
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)
  
  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"]
  })
  
  // Only use listings with valid coordinates
  const validListings = useMemo(() => 
    listings.filter(listing => 
      typeof listing.latitude === 'number' && 
      typeof listing.longitude === 'number' && 
      !isNaN(listing.latitude) && 
      !isNaN(listing.longitude)
    ), 
    [listings]
  )

  // Safe image handling function
  const getMainImage = (listing: Listing) => {
    if (!listing || !listing.images) return null;
    
    // Convert to array if not already
    const imagesArray = Array.isArray(listing.images) 
      ? listing.images 
      : (typeof listing.images === 'object' && listing.images !== null)
        ? [listing.images] 
        : [];
    
    if (imagesArray.length === 0) return null;
    
    try {
      // If the images have display_order property, sort by it
      if (imagesArray.length > 0 && 'display_order' in imagesArray[0] && typeof imagesArray[0].display_order === 'number') {
        const sortedImages = [...imagesArray].sort((a, b) => a.display_order - b.display_order);
        return sortedImages[0];
      }
      
      // Otherwise just return the first image
      return imagesArray[0];
    } catch (error) {
      console.error(`Error getting main image for listing ${listing.id}:`, error);
      return null;
    }
  }
  
  // Check if image URL is valid
  const hasValidImageUrl = (img: any) => {
    return img && 
           typeof img === 'object' && 
           img !== null && 
           'image_url' in img && 
           typeof img.image_url === 'string';
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-900 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading map...</p>
        </div>
      </div>
    )
  }

  // Default map center
  const defaultCenter = { lat: 37.7749, lng: -122.4194 }; // San Francisco
  
  // Center map on first listing or default to a location
  const mapCenter = validListings.length > 0 
    ? { 
        lat: validListings[0].latitude as number, 
        lng: validListings[0].longitude as number 
      }
    : defaultCenter;
  
  const handleMarkerClick = (id: string) => {
    setActiveMarker(id)
  }
  
  const handleOnLoad = (map: google.maps.Map) => {
    setMapRef(map)
  }
  
  const handleCenterChanged = () => {
    if (mapRef) {
      // Do something when map center changes
    }
  }
  
  const onMapClick = () => {
    setActiveMarker(null)
  }

  return (
    <div className="w-full h-[700px] rounded-xl overflow-hidden">
      <GoogleMap
        center={mapCenter}
        zoom={12}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        options={{
          styles: [
            {
              featureType: "all",
              elementType: "all",
              stylers: [
                { saturation: -100 },
                { lightness: -20 }
              ]
            },
            {
              featureType: "road",
              elementType: "all",
              stylers: [
                { lightness: 10 }
              ]
            }
          ],
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false
        }}
        onLoad={handleOnLoad}
        onCenterChanged={handleCenterChanged}
        onClick={onMapClick}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {validListings.map((listing) => {
                // Skip if no coordinates
                if (!listing.latitude || !listing.longitude) return null
                
                return (
                  <Marker
                    key={listing.id}
                    position={{ 
                      lat: listing.latitude as number, 
                      lng: listing.longitude as number 
                    }}
                    onClick={() => handleMarkerClick(listing.id)}
                    clusterer={clusterer}
                    icon={{
                      path: google.maps.SymbolPath.CIRCLE,
                      fillColor: '#FF5CB1',
                      fillOpacity: 1,
                      strokeWeight: 1,
                      strokeColor: '#FFFFFF',
                      scale: 10,
                    }}
                    label={{
                      text: `$${Math.round(listing.daily_price)}`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                  >
                    {/* Info Window *//*}
                    {activeMarker === listing.id && (
                      <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                        <div className="bg-gray-900 text-white rounded-lg overflow-hidden w-[250px]">
                          {(() => {
                            const mainImage = getMainImage(listing);
                            if (hasValidImageUrl(mainImage)) {
                              return (
                                <div className="relative h-[150px] w-full">
                                  <Image
                                    src={mainImage.image_url}
                                    alt={listing.title}
                                    fill
                                    className="object-cover"
                                  />
                                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full">
                                    <p className="text-white font-medium text-xs flex items-center">
                                      <DollarSign className="w-3 h-3 mr-0.5" />
                                      {listing.daily_price}
                                    </p>
                                  </div>
                                </div>
                              );
                            } else {
                              return (
                                <div className="h-[150px] w-full bg-gray-800 flex items-center justify-center">
                                  <span className="text-gray-500 text-sm">No image</span>
                                </div>
                              );
                            }
                          })()}
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 text-white">{listing.title}</h3>
                            <p className="text-xs text-gray-400 mb-2">{listing.condition || ''} {listing.brand ? `· ${listing.brand}` : ''}</p>
                            <button
                              className="w-full bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white text-xs py-2 rounded-lg font-medium transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/listings/${listing.id}`);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                )
              })}
            </>
          )}
        </MarkerClusterer>
      </GoogleMap>
    </div>
  )
}
*/ 