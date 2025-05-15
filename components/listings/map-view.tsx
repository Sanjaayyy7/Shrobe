"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { GoogleMap, Marker, useLoadScript, InfoWindow, MarkerClusterer } from "@react-google-maps/api"
import { Listing } from "@/lib/types"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { DollarSign } from "lucide-react"

interface MapViewProps {
  listings: Listing[]
}

export default function MapView({ listings }: MapViewProps) {
  const router = useRouter()
  const [activeMarker, setActiveMarker] = useState<string | null>(null)
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)
  
  // Load Google Maps API
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  })

  // Compute map center from all listings
  const center = useMemo(() => {
    if (!listings.length) return { lat: 37.7749, lng: -122.4194 } // Default to San Francisco
    
    const validListings = listings.filter(listing => 
      listing.latitude && listing.longitude
    )
    
    if (!validListings.length) return { lat: 37.7749, lng: -122.4194 }
    
    const total = validListings.reduce(
      (acc, listing) => {
        return {
          lat: acc.lat + (listing.latitude || 0),
          lng: acc.lng + (listing.longitude || 0),
        }
      },
      { lat: 0, lng: 0 }
    )
    
    return {
      lat: total.lat / validListings.length,
      lng: total.lng / validListings.length,
    }
  }, [listings])

  // Map options with dark theme styling
  const mapOptions = useMemo(() => ({
    disableDefaultUI: false,
    clickableIcons: true,
    scrollwheel: true,
    styles: [
      {
        featureType: "all",
        elementType: "geometry",
        stylers: [{ color: "#242f3e" }]
      },
      {
        featureType: "all",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#242f3e" }]
      },
      {
        featureType: "all",
        elementType: "labels.text.fill",
        stylers: [{ color: "#746855" }]
      },
      {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#172633" }]
      },
      {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }]
      },
      {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }]
      },
      {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }]
      },
    ],
  }), [])

  // Handle clicking a marker
  const handleActiveMarker = (markerId: string) => {
    if (markerId === activeMarker) {
      // Navigate to listing page if clicked again
      const listing = listings.find(l => l.id === markerId)
      if (listing) {
        router.push(`/listings/${listing.id}`)
      }
    } else {
      setActiveMarker(markerId)
    }
  }

  // Reference to Google Map
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map)
  }, [])

  // Only show listings with valid coordinates
  const validListings = useMemo(() => 
    listings.filter(listing => listing.latitude && listing.longitude), 
    [listings]
  )

  if (!isLoaded) {
    return (
      <div className="h-[600px] w-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden">
      <GoogleMap
        onLoad={onMapLoad}
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={12}
        options={mapOptions}
        onClick={() => setActiveMarker(null)}
      >
        <MarkerClusterer>
          {(clusterer) => (
            <>
              {validListings.map((listing) => {
                // Skip if no coordinates
                if (!listing.latitude || !listing.longitude) return null
                
                // Get the main image
                const mainImage = listing.images && listing.images.length > 0
                  ? listing.images.sort((a, b) => a.display_order - b.display_order)[0]
                  : null
                
                return (
                  <Marker
                    key={listing.id}
                    position={{
                      lat: listing.latitude,
                      lng: listing.longitude
                    }}
                    onClick={() => handleActiveMarker(listing.id)}
                    clusterer={clusterer}
                    icon={{
                      url: "data:image/svg+xml,%3Csvg width='32' height='38' viewBox='0 0 28 36' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0ZM14 19C11.239 19 9 16.761 9 14C9 11.239 11.239 9 14 9C16.761 9 19 11.239 19 14C19 16.761 16.761 19 14 19Z' fill='%23FF5CB1'/%3E%3C/svg%3E",
                      scaledSize: new google.maps.Size(32, 38)
                    }}
                    label={{
                      text: `$${Math.round(listing.daily_price)}`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                    }}
                  >
                    {activeMarker === listing.id && (
                      <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                        <div className="bg-gray-900 text-white rounded-lg overflow-hidden w-[250px]">
                          {mainImage ? (
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
                          ) : (
                            <div className="h-[150px] w-full bg-gray-800 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No image</span>
                            </div>
                          )}
                          <div className="p-3">
                            <h3 className="font-medium text-sm mb-1 text-white">{listing.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">
                              {listing.location}
                            </p>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/listings/${listing.id}`)
                              }}
                              className="mt-2 w-full bg-[#FF5CB1] hover:bg-opacity-90 text-white text-xs font-medium py-1.5 px-3 rounded-md transition-colors"
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