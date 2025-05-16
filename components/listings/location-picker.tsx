"use client"

import { useState, useEffect } from "react"
import { MapPin } from "lucide-react"
// import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
// import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete"
// import { Combobox, ComboboxInput, ComboboxPopover, ComboboxList, ComboboxOption } from "@reach/combobox"
// import "@reach/combobox/styles.css"

// Define component props
interface LocationPickerProps {
  initialLocation?: string
  initialLatitude?: number
  initialLongitude?: number
  onLocationChange: (location: string, lat: number, lng: number) => void
}

export default function LocationPicker({
  initialLocation = "",
  initialLatitude,
  initialLongitude,
  onLocationChange
}: LocationPickerProps) {
  // Comment out Google Maps API loading
  // const { isLoaded } = useLoadScript({
  //   googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  //   libraries: ["places"],
  // })

  const [selected, setSelected] = useState<{
    location: string;
    lat: number;
    lng: number;
  }>({
    location: initialLocation,
    lat: initialLatitude || 37.7749,
    lng: initialLongitude || -122.4194,
  })

  // Track whether we need to sync with parent component
  const [shouldSync, setShouldSync] = useState(false)

  // When initial values change, update local state
  useEffect(() => {
    if (initialLocation && initialLatitude && initialLongitude) {
      setSelected({
        location: initialLocation,
        lat: initialLatitude,
        lng: initialLongitude,
      })
    }
  }, [initialLocation, initialLatitude, initialLongitude])

  // Only send updates to parent when shouldSync is true
  useEffect(() => {
    if (shouldSync) {
      onLocationChange(selected.location, selected.lat, selected.lng)
      setShouldSync(false)
    }
  }, [selected, shouldSync, onLocationChange])

  // Locally update location without immediately notifying parent
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLocation = e.target.value
    setSelected({
      location: newLocation,
      lat: selected.lat,
      lng: selected.lng
    })
  }

  // Finalize location change on blur
  const handleBlur = () => {
    setShouldSync(true)
  }

  // Locally update coordinates without immediately notifying parent
  const handleCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'lat' | 'lng') => {
    const value = parseFloat(e.target.value)
    if (!isNaN(value)) {
      setSelected({
        ...selected,
        [type]: value
      })
    }
  }

  // Comment out map options
  // const mapOptions = useMemo(() => ({
  //   disableDefaultUI: true,
  //   clickableIcons: true,
  //   scrollwheel: true,
  //   styles: [
  //     {
  //       featureType: "all",
  //       elementType: "geometry",
  //       stylers: [{ color: "#242f3e" }]
  //     },
  //     {
  //       featureType: "all",
  //       elementType: "labels.text.stroke",
  //       stylers: [{ color: "#242f3e" }]
  //     },
  //     {
  //       featureType: "all",
  //       elementType: "labels.text.fill",
  //       stylers: [{ color: "#746855" }]
  //     },
  //     {
  //       featureType: "water",
  //       elementType: "geometry",
  //       stylers: [{ color: "#172633" }]
  //     },
  //     {
  //       featureType: "water",
  //       elementType: "labels.text.fill",
  //       stylers: [{ color: "#515c6d" }]
  //     },
  //     {
  //       featureType: "road",
  //       elementType: "geometry",
  //       stylers: [{ color: "#38414e" }]
  //     },
  //     {
  //       featureType: "road",
  //       elementType: "geometry.stroke",
  //       stylers: [{ color: "#212a37" }]
  //     },
  //   ],
  // }), [])

  // Comment out marker drag handler
  // const onMarkerDragEnd = async (e: google.maps.MapMouseEvent) => {
  //   if (e.latLng) {
  //     const lat = e.latLng.lat()
  //     const lng = e.latLng.lng()
  //     
  //     // Reverse geocode to get address
  //     try {
  //       const geocoder = new google.maps.Geocoder();
  //       const response = await geocoder.geocode({ location: { lat, lng } });
  //       
  //       if (response.results[0]) {
  //         const address = response.results[0].formatted_address;
  //         setSelected({ location: address, lat, lng });
  //         onLocationChange(address, lat, lng);
  //       }
  //     } catch (error) {
  //       console.error("Error during reverse geocoding:", error);
  //       // Still update coordinates even if geocoding fails
  //       setSelected({ ...selected, lat, lng });
  //       onLocationChange(selected.location, lat, lng);
  //     }
  //   }
  // }

  // Simple UI instead of maps
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <MapPin className="w-4 h-4 text-gray-400" />
        </div>
        
        <input
          type="text"
          value={selected.location}
          onChange={handleLocationChange}
          onBlur={handleBlur}
          placeholder="Enter your city or neighborhood"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
        />
      </div>
      
      {/* Latitude and longitude fields are hidden from user but still functional internally */}
      <input type="hidden" value={selected.lat} />
      <input type="hidden" value={selected.lng} />
      
      <p className="text-xs text-gray-500 mt-1">
        Enter your general location to help local users find your item. Your exact location will not be shared.
      </p>
    </div>
  )
}

// Comment out Places Autocomplete Component
// function PlacesAutocomplete({ setSelected, initialValue = "" }) {
//   const {
//     ready,
//     value,
//     suggestions: { status, data },
//     setValue,
//     clearSuggestions,
//   } = usePlacesAutocomplete({
//     requestOptions: { /* Define search options here if needed */ },
//     debounce: 300,
//     defaultValue: initialValue,
//   })
// 
//   const handleSelect = async (address: string) => {
//     setValue(address, false);
//     clearSuggestions();
//     
//     try {
//       const results = await getGeocode({ address });
//       const { lat, lng } = await getLatLng(results[0]);
//       setSelected(address, lat, lng);
//     } catch (error) {
//       console.error("Error: ", error);
//     }
//   }
// 
//   return (
//     <div className="relative">
//       <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//         <MapPin className="w-4 h-4 text-gray-400" />
//       </div>
//       
//       <Combobox onSelect={handleSelect}>
//         <ComboboxInput
//           value={value}
//           onChange={(e) => setValue(e.target.value)}
//           disabled={!ready}
//           placeholder="Enter your location"
//           className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
//         />
//         <ComboboxPopover className="z-10">
//           <ComboboxList className="bg-gray-800 text-white border border-gray-700 rounded-lg mt-1 overflow-hidden">
//             {status === "OK" &&
//               data.map(({ place_id, description }) => (
//                 <ComboboxOption 
//                   key={place_id} 
//                   value={description}
//                   className="py-2 px-4 cursor-pointer hover:bg-gray-700"
//                 />
//               ))}
//           </ComboboxList>
//         </ComboboxPopover>
//       </Combobox>
//     </div>
//   )
// } 