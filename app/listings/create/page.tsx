"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

import ListingForm from "@/components/listings/listing-form"

export default function CreateListingPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error("Create listing - Session error:", error)
          router.push("/login")
          return
        }
        
        if (!data?.session?.user) {
          console.log("Create listing - No active session, redirecting to login")
          router.push("/login")
        } else {
          setIsAuthenticated(true)
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Create listing - Authentication error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [router, supabase])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0B0B] text-white">
        <div className="text-center p-8">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">Authentication Required</h1>
          <p className="text-lg mb-8 text-gray-300">Please sign in to create a listing</p>
          <Link href="/login" className="relative inline-block group">
            <span className="inline-block bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] text-white font-medium text-lg py-3 px-8 rounded-full z-10 relative transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,101,197,0.4)]">
              Sign In
            </span>
            <span className="absolute inset-0 bg-white rounded-full blur-md z-0 opacity-50 group-hover:opacity-70"></span>
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
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff65c5] to-[#c7aeef] bg-clip-text text-transparent">
            Create New Listing
          </h1>
          <p className="text-gray-400 mt-2">
            Share your style with the community and earn by lending your clothes
          </p>
        </div>
        
        {/* Form */}
        <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-6 md:p-8">
          <ListingForm mode="create" />
        </div>
      </div>
    </main>
  )
} 