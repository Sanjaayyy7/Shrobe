"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import ListingCard from "@/components/listings/listing-card"
import { getUserListings } from "@/lib/database"

export default function PublicProfilePage() {
  const supabase = createClientComponentClient()
  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userListings, setUserListings] = useState<any[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id || typeof id !== "string") return

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", id)
        .single()

      if (!error && data) {
        setProfile(data)
        // Fetch listings for this user
        const listings = await getUserListings(id)
        setUserListings(listings)
      } else {
        setProfile(null)
      }
      setLoading(false)
    }
    fetchProfile()
  }, [id, supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return <div className="text-white p-6">Profile not found.</div>
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Back button */}
          <div className="mb-8">
            <Link
              href="/feed"
              className="inline-flex items-center text-sm text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Feed
            </Link>
          </div>

          {/* Profile header */}
          <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-xl mb-8">
            {/* Cover image */}
            <div className="h-40 sm:h-60 bg-gradient-to-r from-pink-500/40 via-purple-500/40 to-indigo-500/40 relative">
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
            {/* Profile info */}
            <div className="flex flex-col md:flex-row px-6 py-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-6 md:left-6 md:relative md:top-auto border-4 border-black rounded-full overflow-hidden">
                <Avatar className=" h-24 md:w-32 md:h-32 bg-gray-700 flex items-center justify-center rounded-full">
                  <AvatarImage src={profile.profile_picture_url || ""} />
                  <AvatarFallback className="text-3xl font-bold text-white/60">
                    {profile.full_name?.charAt(0).toUpperCase() || profile.user_name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
              {/* User info */}
              <div className="mt-10 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">{profile.full_name || "Nombre no disponible"}</h1>
                    <p className="text-gray-400">@{profile.user_name}</p>
                    {profile.age && (
                      <p className="text-gray-400">Age: {profile.age}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  {profile.biography && (
                    <div>
                      <h2 className="text-lg font-semibold">Biography</h2>
                      <p className="text-gray-300 mt-1">{profile.biography}</p>
                    </div>
                  )}
                  {profile.location && (
                    <p className="text-sm text-gray-500 mt-2">📍 {profile.location}</p>
                  )}
                  {/* Aquí podrías agregar stats si los tienes, como followers, following, etc. */}
                </div>
              </div>
            </div>
          </div>

          {/* Closet Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Closet</h2>
            </div>
            {userListings.length > 0 ? (
              <div>
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {userListings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <ListingCard listing={listing} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
                <h3 className="text-xl font-medium mb-3">This closet is empty</h3>
                <p className="text-gray-400 mb-6">No items to show yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
