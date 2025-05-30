"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { 
  Upload, 
  X, 
  Plus, 
  Calendar, 
  MapPin, 
  Tag, 
  DollarSign,
  Loader2,
  Info,
  Check,
  RefreshCw
} from "lucide-react"
import Image from "next/image"
import FixStorageButton from "@/components/fix-storage-button"
import LocationPicker from "./location-picker"

import { 
  Listing, 
  ListingCondition, 
  ClothingCategory,
  ListingType
} from "@/lib/types"
import { 
  createListing, 
  updateListing, 
  uploadImage, 
  addListingImages,
  addListingTags,
  deleteListingTags,
  addListingAvailability,
  ensureStorageBucket,
  getListingById
} from "@/lib/database"

const conditions: ListingCondition[] = [
  "New with tags",
  "Like new",
  "Good",
  "Fair",
  "Well-loved"
]

const categories: ClothingCategory[] = [
  "Dresses",
  "Tops",
  "Bottoms",
  "Outerwear",
  "Footwear",
  "Accessories",
  "Formal",
  "Casual",
  "Streetwear",
  "Vintage",
  "Designer",
  "Sustainable"
]

const listingTypes: ListingType[] = [
  "Rent",
  "Sell",
  "Trade"
  // "Buy" option is hidden from listers
]

interface ListingFormProps {
  initialData?: Listing
  mode: "create" | "edit"
}

export default function ListingForm({ initialData, mode }: ListingFormProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  // Form state
  const [formData, setFormData] = useState<Partial<Listing>>(
    initialData || {
      title: "",
      description: "",
      brand: "",
      size: "",
      condition: "",
      daily_price: 0,
      weekly_price: 0,
      location: "",
      is_available: true,
      listing_type: "Rent" // Default to Rent
    }
  )
  
  // Additional form state
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({
    start: null,
    end: null
  })
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Track if the form was explicitly submitted
  const [formSubmitted, setFormSubmitted] = useState(false)
  
  // Initialize form with existing data
  useEffect(() => {
    if (initialData) {
      // Set tags if available
      if (initialData.tags && initialData.tags.length > 0) {
        setSelectedTags(initialData.tags.map(tag => tag.tag))
      }
      
      // Set image URLs if available
      if (initialData.images && initialData.images.length > 0) {
        setImageUrls(initialData.images.map(img => img.image_url))
      }
      
      // Set availability if available
      if (initialData.availability && initialData.availability.length > 0) {
        const firstAvailability = initialData.availability[0]
        setDateRange({
          start: new Date(firstAvailability.start_date),
          end: new Date(firstAvailability.end_date)
        })
      }
    }
  }, [initialData])
  
  // Update form field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name === "daily_price" || name === "weekly_price") {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }
  
  // Update location data from picker
  const handleLocationChange = (location: string, lat: number, lng: number) => {
    // Only update if this is a deliberate user action, not an automatic update
    setFormData(prev => ({
      ...prev,
      location: location,
      latitude: lat,
      longitude: lng
    }))
  }
  
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      
      // Limit to 5 images total
      const totalImages = images.length + selectedFiles.length
      if (totalImages > 5) {
        setError("You can upload a maximum of 5 images")
        return
      }
      
      setImages([...images, ...selectedFiles])
      
      // Create preview URLs
      const newImageUrls = selectedFiles.map(file => URL.createObjectURL(file))
      setImageUrls([...imageUrls, ...newImageUrls])
    }
  }
  
  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    
    const newImageUrls = [...imageUrls]
    URL.revokeObjectURL(newImageUrls[index])
    newImageUrls.splice(index, 1)
    setImageUrls(newImageUrls)
  }
  
  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }
  
  // Navigate between form steps
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Safeguard: Only proceed with form submission if we're on the final step
    // This prevents accidental submissions from other steps
    if (currentStep !== 4) {
      console.log("Form submission prevented - not on final step")
      return
    }
    
    // Set flag that form was explicitly submitted by user
    setFormSubmitted(true)
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError("You must be logged in to create a listing")
        setIsLoading(false)
        return
      }
      
      // Validate required fields
      if (!formData.title || !formData.description) {
        setError("Please fill in all required fields")
        setIsLoading(false)
        return
      }
      
      // Validate pricing based on listing type
      if (formData.listing_type === 'Rent' || formData.listing_type === 'Sell') {
        if (!formData.daily_price) {
          setError(`Please enter a${formData.listing_type === 'Rent' ? ' daily' : ''} price`)
          setIsLoading(false)
          return
        }
      } else if (formData.listing_type === 'Trade') {
        // For trade listings, set price to 0
        formData.daily_price = 0
        formData.weekly_price = 0
      }
      
      if (imageUrls.length === 0 && images.length === 0) {
        setError("Please upload at least one image")
        setIsLoading(false)
        return
      }
      
      console.log("Form data before submission:", formData);
      console.log("User ID:", session.user.id);
      
      // Create or update listing
      let listing: Listing | null = null
      
      if (mode === "create") {
        // Create new listing with proper typing
        // Create a properly typed object that satisfies Omit<Listing, 'id' | 'created_at' | 'updated_at'>
        const listingData: Omit<Listing, 'id' | 'created_at' | 'updated_at'> = {
          user_id: session.user.id,
          title: formData.title || "",
          description: formData.description || "",
          daily_price: formData.daily_price || 0,
          is_available: formData.is_available !== undefined ? formData.is_available : true,
          // Optional fields
          brand: formData.brand,
          size: formData.size,
          condition: formData.condition as ListingCondition | undefined,
          weekly_price: formData.weekly_price,
          location: formData.location,
          latitude: formData.latitude,
          longitude: formData.longitude,
          listing_type: formData.listing_type as ListingType
        };
        
        console.log("Creating listing with:", listingData);
        
        // Try to create the listing
        listing = await createListing(listingData);
        
        // Check if the listing was created
        if (!listing) {
          setError("Failed to create listing. Please try again later.");
          setIsLoading(false);
          return;
        }
      } else {
        // Update existing listing
        if (!initialData?.id) {
          setError("Cannot update listing without ID");
          setIsLoading(false);
          return;
        }
        
        // Only update fields that have changed
        const updates: Partial<Listing> = {}
        
        if (formData.title !== initialData.title) updates.title = formData.title || ""
        if (formData.description !== initialData.description) updates.description = formData.description || ""
        if (formData.brand !== initialData.brand) updates.brand = formData.brand
        if (formData.size !== initialData.size) updates.size = formData.size
        if (formData.condition !== initialData.condition) updates.condition = formData.condition as ListingCondition | undefined
        if (formData.daily_price !== initialData.daily_price) updates.daily_price = formData.daily_price || 0
        if (formData.weekly_price !== initialData.weekly_price) updates.weekly_price = formData.weekly_price
        if (formData.location !== initialData.location) updates.location = formData.location
        if (formData.is_available !== initialData.is_available) updates.is_available = formData.is_available || false
        if (formData.listing_type !== initialData.listing_type) updates.listing_type = formData.listing_type as ListingType
        
        // If no fields have changed, but we have new images, we still want to call update
        if (Object.keys(updates).length === 0 && images.length === 0) {
          setSuccess(true)
          // Add a slight delay before redirecting to show success message
          setTimeout(() => {
            router.push(`/listings/${initialData.id}`)
          }, 1500)
          return
        }
        
        console.log("Updating listing with:", updates);
        listing = await updateListing(initialData.id, updates);
        
        // Check if the listing was updated
        if (!listing) {
          setError("Failed to update listing. Please try again later.");
          setIsLoading(false);
          return;
        }
        
        // Delete existing tags to replace them - handle possible failure
        const tagDeleteResult = await deleteListingTags(listing.id);
        if (!tagDeleteResult) {
          console.warn("Failed to delete existing tags. Continuing with tag creation.");
        }
      }
      
      // Add tags - handle possible empty result
      if (selectedTags.length > 0) {
        const tagsToAdd = selectedTags.map(tag => ({
          listing_id: listing!.id,
          tag
        }));
        
        const addedTags = await addListingTags(tagsToAdd);
        if (addedTags.length === 0) {
          console.warn("Failed to add tags. Continuing with image upload.");
        }
      }
      
      // Handle images - only upload new images (not existing URLs)
      let newImageSuccess = true;
      let imageSaveError = null;
      
      try {
        if (images.length > 0) {
          // First, try to fix storage policies
          try {
            await supabase.rpc('fix_storage_policies');
          } catch (rpcError) {
            console.info('Storage policy helper function not available - this is expected on first setup');
          }
          
          // Ensure the listings bucket exists before uploading
          try {
            await supabase.storage.createBucket('listings', {
              public: true,
              fileSizeLimit: 5242880 // 5MB
            });
          } catch (bucketError) {
            // Bucket might already exist, that's fine
            console.info('Bucket already exists or creation not needed');
          }
          
          const uploadPromises = images.map(async (file) => {
            try {
              const imageUrl = await uploadImage(file, `listings/${listing!.id}`);
              console.log("Successfully uploaded image:", imageUrl);
              return { success: true, url: imageUrl };
            } catch (uploadError) {
              console.error("Failed to upload image:", uploadError);
              return { success: false, error: uploadError };
            }
          });
          
          const results = await Promise.all(uploadPromises);
          
          // Check if all uploads were successful
          const failedUploads = results.filter(result => !result.success);
          if (failedUploads.length > 0) {
            newImageSuccess = false;
            const firstError = failedUploads[0].error;
            imageSaveError = firstError instanceof Error ? firstError.message : 'Failed to upload one or more images';
          }
          
          // Add the successful image uploads to the database
          const successfulUrls = results
            .filter(result => result.success)
            .map(result => (result as { url: string }).url);
          
          if (successfulUrls.length > 0) {
            // Ensure each image is correctly associated with this listing
            const imagesToAdd = successfulUrls.map((url, index) => ({
              listing_id: listing!.id,
              image_url: url,
              display_order: index
            }));
            
            console.log(`Adding ${imagesToAdd.length} images to listing ${listing!.id}:`, imagesToAdd);
            
            // First, delete any existing images to avoid duplication
            try {
              const { error: deleteError } = await supabase
                .from('listing_images')
                .delete()
                .eq('listing_id', listing!.id);
                
              if (deleteError) {
                console.warn("Failed to delete existing images before adding new ones:", deleteError);
              } else {
                console.log("Successfully deleted existing images before adding new ones");
              }
            } catch (deleteError) {
              console.warn("Error trying to delete existing images:", deleteError);
            }
            
            // Now add the new images
            const addedImages = await addListingImages(imagesToAdd);
            
            if (!addedImages || addedImages.length === 0) {
              console.warn("Failed to add images to database. Images may have uploaded but not saved.");
              // Attempt to add images again with a direct database call
              try {
                const { error: imageInsertError } = await supabase
                  .from('listing_images')
                  .insert(imagesToAdd);
                  
                if (imageInsertError) {
                  console.error("Second attempt to add images failed:", imageInsertError);
                } else {
                  console.log("Second attempt to add images succeeded");
                }
              } catch (retryError) {
                console.error("Error in second attempt to add images:", retryError);
              }
            } else {
              console.log("Successfully added images to database:", addedImages);
            }
          }
        }
      } catch (imageError) {
        newImageSuccess = false;
        imageSaveError = imageError instanceof Error ? imageError.message : 'Unknown error uploading images';
      }
      
      // Force a cache refresh to ensure the listing is visible in the feed
      try {
        await getListingById(listing!.id);
      } catch (refreshError) {
        console.warn("Error refreshing listing data:", refreshError);
      }
      
      // Show success and redirect, but include warning about images if needed
      setSuccess(true);
      setTimeout(() => {
        if (newImageSuccess) {
          router.push(`/listings/${listing!.id}`);
        } else {
          // If there was an image upload error, stay on the page and show the error
          setSuccess(false);
          setError(imageSaveError || 'Error uploading images. Your listing was saved, but images failed to upload.');
        }
      }, 1500);
      
    } catch (error) {
      console.error("Error submitting listing:", error);
      setError(error instanceof Error ? error.message : "An error occurred while submitting the listing");
    } finally {
      setIsLoading(false);
    }
  }
  
  // Render form steps
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                  Title <span className="text-[#FF5CB1]">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                  placeholder="Describe your item in a few words"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                  Description <span className="text-[#FF5CB1]">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                  placeholder="Provide details about your item, including any special features or details borrowers should know"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="listing_type" className="block text-sm font-medium text-gray-300 mb-1">
                  Listing Type <span className="text-[#FF5CB1]">*</span>
                </label>
                <select
                  id="listing_type"
                  name="listing_type"
                  value={formData.listing_type || "Rent"}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                  required
                >
                  {listingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.listing_type === 'Rent' && 'Rent your item for daily use'}
                  {formData.listing_type === 'Sell' && 'Indicate your item is for sale'}
                  {formData.listing_type === 'Trade' && 'Indicate your item is available for trade'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                    placeholder="e.g. Zara, H&M, Vintage"
                  />
                </div>
                
                <div>
                  <label htmlFor="size" className="block text-sm font-medium text-gray-300 mb-1">
                    Size
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size || ""}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                    placeholder="e.g. S, M, L, 10, 42"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-300 mb-1">
                  Condition
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition || ""}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                >
                  <option value="">Select condition</option>
                  {conditions.map((condition) => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )
        
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Images</h2>
            
            <div>
              <p className="text-sm text-gray-400 mb-4">
                Upload up to 5 high-quality images of your item. The first image will be your main image.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                {/* Existing images */}
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-700">
                    <Image
                      src={url}
                      alt={`Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1 hover:bg-black"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                    {index === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 py-1 px-2">
                        <span className="text-xs text-white">Main Image</span>
                      </div>
                    )}
                  </div>
                ))}
                
                {/* Upload button */}
                {imageUrls.length < 5 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-[#FF5CB1] transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-400">Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              {/* Add the FixStorageButton to address RLS policy errors */}
              {error && error.toLowerCase().includes('row-level security policy') && (
                <FixStorageButton />
              )}
            </div>
          </div>
        )
        
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Categories & Tags</h2>
            
            <div>
              <p className="text-sm text-gray-400 mb-4">
                Select categories that best describe your item to help others find it.
              </p>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleTag(category)}
                    className={`px-3 py-2 rounded-full text-sm transition-colors ${
                      selectedTags.includes(category)
                        ? "bg-[#FF5CB1] text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white">Pricing & Availability</h3>
              
              {formData.listing_type === 'Rent' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="daily_price" className="block text-sm font-medium text-gray-300 mb-1">
                      Daily Price ($) <span className="text-[#FF5CB1]">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="daily_price"
                        name="daily_price"
                        value={formData.daily_price || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="weekly_price" className="block text-sm font-medium text-gray-300 mb-1">
                      Weekly Price ($) <span className="text-gray-500">(optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        id="weekly_price"
                        name="weekly_price"
                        value={formData.weekly_price || ""}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {formData.listing_type === 'Sell' && (
                <div>
                  <label htmlFor="daily_price" className="block text-sm font-medium text-gray-300 mb-1">
                    Price ($) <span className="text-[#FF5CB1]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="daily_price"
                      name="daily_price"
                      value={formData.daily_price || ""}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#FF5CB1] focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
              )}
              
              {formData.listing_type === 'Trade' && (
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center mb-2">
                    <RefreshCw className="w-5 h-5 mr-2 text-[#FF5CB1]" />
                    <h4 className="font-medium text-white">Trade Item</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Your item will be listed for trade. Interested users will be able to contact you directly to suggest trades.
                  </p>
                  <input 
                    type="hidden" 
                    name="daily_price" 
                    value="0" 
                    onChange={() => {}} 
                  />
                </div>
              )}
            </div>
          </div>
        )
        
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">Location & Availability</h2>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-1">
                Location
              </label>
              <LocationPicker
                initialLocation={formData.location}
                initialLatitude={formData.latitude}
                initialLongitude={formData.longitude}
                onLocationChange={(loc, lat, lng) => {
                  // Prevent location updates from accidentally triggering form actions
                  // Only update local state without side effects
                  handleLocationChange(loc, lat, lng)
                }}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your city or neighborhood to help local users find your item.
              </p>
            </div>
            
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Review & Submit</h3>
                <div className="flex items-center">
                  <Info className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-400">Review your listing before submitting</span>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Title:</span>
                    <span className="text-white font-medium">{formData.title || "Not provided"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price:</span>
                    <span className="text-white font-medium">
                      {formData.listing_type === 'Rent' && (
                        <>
                          ${formData.daily_price}/day
                          {formData.weekly_price ? ` or $${formData.weekly_price}/week` : ""}
                        </>
                      )}
                      {formData.listing_type === 'Sell' && (
                        <>${formData.daily_price}</>
                      )}
                      {formData.listing_type === 'Trade' && (
                        <>For Trade</>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Images:</span>
                    <span className="text-white font-medium">{imageUrls.length} uploaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Categories:</span>
                    <span className="text-white font-medium">
                      {selectedTags.length > 0 ? selectedTags.join(", ") : "None selected"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-900/30 border border-yellow-500/50 text-yellow-200 px-4 py-3 rounded-lg mt-4">
              <div className="flex items-center">
                <Info className="w-5 h-5 mr-2" />
                <p className="font-medium">Final Step:</p>
              </div>
              <p className="text-sm mt-1">
                Your listing will only be created when you click the "{mode === "create" ? "Create Listing" : "Update Listing"}" button below.
                No data will be saved to the database until you explicitly click this button.
              </p>
            </div>
          </div>
        )
        
      default:
        return null
    }
  }
  
  // Progress bar
  const progress = (currentStep / 4) * 100
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#FF5CB1] to-[#c7aeef] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-gray-400">Step {currentStep} of 4</span>
          <span className="text-xs text-gray-400">{Math.round(progress)}% Complete</span>
        </div>
      </div>
      
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current step content */}
        {renderStep()}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
            <p>{error}</p>
            {error.toLowerCase().includes('row-level security policy') && (
              <div className="mt-3">
                <FixStorageButton />
              </div>
            )}
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <p>Listing {mode === "create" ? "created" : "updated"} successfully! Redirecting...</p>
          </div>
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg text-white font-medium transition-colors ${
              currentStep === 1
                ? "bg-gray-800 cursor-not-allowed opacity-50"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Back
          </button>
          
          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 rounded-lg bg-[#FF5CB1] text-white font-medium hover:bg-[#ff3d9f] transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={isLoading || success}
              className={`px-6 py-3 rounded-lg bg-[#FF5CB1] text-white font-medium transition-colors flex items-center justify-center ${
                isLoading || success ? "opacity-70 cursor-not-allowed" : "hover:bg-[#ff3d9f] animate-pulse"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creating..." : "Updating..."}
                </span>
              ) : (
                <span className="flex items-center">
                  <Check className="w-5 h-5 mr-2" />
                  {mode === "create" ? "Create Listing" : "Update Listing"}
                </span>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 