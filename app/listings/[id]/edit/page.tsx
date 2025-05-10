"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import React from "react"

import ListingForm from "@/components/listings/listing-form"
import { getListingById } from "@/lib/database"
import { Listing } from "@/lib/types"

export default function EditListingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params as any) as { id: string }
  const { id } = unwrappedParams
  
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true)
        
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        // Get listing details
        const listingData = await getListingById(id)
        
        if (!listingData) {
          setError("Listing not found")
          return
        }
        
        setListing(listingData)
        
        // Check if user is owner
        if (listingData.user_id === session.user.id) {
          setIsOwner(true)
        } else {
          // Not the owner, redirect to view page
          router.push(`/listings/${id}`)
        }
      } catch (err) {
        console.error("Error fetching listing:", err)
        setError("Failed to load listing details")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchListing()
  }, [id, router, supabase])
  
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
  
  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold mb-4 text-[#FF5CB1]">Access Denied</h1>
          <p className="text-lg mb-6">You don't have permission to edit this listing</p>
          <Link
            href={`/listings/${id}`}
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#FF5CB1] text-white font-medium hover:bg-opacity-90 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            View Listing
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/listings/${id}`}
            className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Listing
          </Link>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">
            Edit Listing
          </h1>
          <p className="text-gray-400 mt-2">
            Update your listing details
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-6 md:p-8">
          <ListingForm mode="edit" initialData={listing} />
        </div>
      </div>
    </main>
  )
} 