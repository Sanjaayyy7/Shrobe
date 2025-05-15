"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import Link from "next/link"
import { LogOut, Settings, ChevronLeft, Plus } from "lucide-react"
import Header from "@/components/feed/header"
import { getUserListings } from "@/lib/database"
import { Listing } from "@/lib/types"
import ListingGrid from "@/components/listings/listing-grid"
import ListingCard from "@/components/listings/listing-card"
import DeleteSelectedListingsButton from "@/components/delete-selected-listings-button"
import { useUser } from "../context/userContext"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or ANON key is missing. Check your env variables.")
}

const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey
})

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const { profile, setProfile } = useUser()
  const [userListings, setUserListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [selectedListings, setSelectedListings] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    username: '',
    profilePic: '',
    biography: '',
    age: '',
  })

  // Handle toggling selection of listings
  const handleSelectListing = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedListings(prev => [...prev, id]);
    } else {
      setSelectedListings(prev => prev.filter(listingId => listingId !== id));
    }
  };

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    // Refresh listings
    setUserListings(prev => prev.filter(listing => !selectedListings.includes(listing.id)));
    // Clear selection
    setSelectedListings([]);
  };

  const loadUserProfile = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        alert("Could not get authenticated user")
        return
      }

      setUser(user)

      // Cargar desde localStorage si existe
      const localProfile = localStorage.getItem("userProfile")
      if (localProfile) {
        try {
          const parsed = JSON.parse(localProfile)
          setUserProfile({
            fullName: parsed.fullName || user.user_metadata?.full_name || "User",
            username: parsed.username || user.user_metadata?.user_name || user.email?.split('@')[0] || "username",
            profilePic: user.user_metadata?.avatar_url || "",
            biography: parsed.biography || "",
            age: parsed.age || ""
          })
        } catch (e) {
          console.error("Error parsing localStorage", e)
        }
      }

      // Cargar desde Supabase (tabla user)
      const { data: userData, error } = await supabase
        .from("user")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!error && userData) {
        setUserProfile(prev => ({
          ...prev,
          fullName: userData.full_name || prev.fullName,
          username: userData.user_name || prev.username,
          biography: userData.biography || prev.biography,
          age: userData.age?.toString() || prev.age
        }))
        localStorage.setItem("userProfile", JSON.stringify({
          fullName: userData.full_name,
          username: userData.user_name,
          email: userData.mail,
          biography: userData.biography,
          age: userData.age?.toString()
        }))
      }
    } catch (err) {
      console.error("Error loading user profile:", err)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadUserListings = async (userId: string) => {
    try {
      const listings = await getUserListings(userId)
      setUserListings(listings)
    } catch (err) {
      console.error("Error loading listings:", err)
    } finally {
      setListingsLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  useEffect(() => {
    loadUserProfile()
  }, [])

  useEffect(() => {
    if (user?.id) loadUserListings(user.id)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Fixed Header */}
      <Header />
      
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
                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-700 flex items-center justify-center rounded-full">
                  <div className="text-3xl font-bold text-white/60">
                    {userProfile.fullName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              
              {/* User info */}
              <div className="mt-10 md:mt-0 md:ml-6 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">
                      {userProfile.fullName}
                    </h1>
                    <p className="text-gray-400">@{userProfile.username}</p>
                    {userProfile.age && (
                      <p className="text-gray-400">Age: {userProfile.age}</p>
                    )}
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex space-x-3">
                    <Link
                      href="/settings"
                      className="px-4 py-2 text-sm font-medium text-white/80 border border-white/20 rounded-full hover:bg-white/10 transition-colors flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-1.5 md:hidden" />
                      <span>Edit Profile</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 rounded-full hover:from-pink-700 hover:to-purple-700 transition-colors flex items-center"
                    >
                      <LogOut className="w-4 h-4 mr-1.5" />
                      <span>Sign Out</span>
                    </button>

                  </div>
                </div>
                
                <div className="mt-6 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">Biography</h2>
                    <p className="text-gray-300 mt-1">
                      {userProfile.biography}
                    </p>
                  </div>
                  
                  <div className="flex space-x-6">
                    <div>
                      <span className="text-white font-bold">42</span>
                      <span className="text-gray-400 ml-1">Items</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">138</span>
                      <span className="text-gray-400 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="text-white font-bold">96</span>
                      <span className="text-gray-400 ml-1">Following</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Your Closet Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Closet</h2>
              <div className="flex gap-2">
                <DeleteSelectedListingsButton
                  userId={user?.id}
                  selectedListings={selectedListings}
                  onSuccess={handleDeleteSuccess}
                />
                <Link 
                  href="/listings/create" 
                  className="bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Item
                </Link>
              </div>
            </div>
            
            {listingsLoading ? (
              <div className="min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-t-[#ff65c5] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-white/70">Loading your closet...</p>
                </div>
              </div>
            ) : userListings.length > 0 ? (
              <div>
                {/* Create a custom listing grid with selectable items */}
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {userListings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      {/* Use the ListingCard component with selectable prop */}
                      <ListingCard
                        listing={listing}
                        selectable={true}
                        isSelected={selectedListings.includes(listing.id)}
                        onSelect={handleSelectListing}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
                <h3 className="text-xl font-medium mb-3">Your closet is empty</h3>
                <p className="text-gray-400 mb-6">Start sharing your style by adding items to your closet</p>
                <Link 
                  href="/listings/create" 
                  className="inline-flex items-center px-6 py-3 bg-[#FF5CB1] hover:bg-[#ff3d9f] text-white font-medium rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Listing
                </Link>
              </div>
            )}
          </div>
          
          {/* Saved Items Section */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Saved Items</h2>
            <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10 p-8 text-center">
              <h3 className="text-xl font-medium mb-3">No saved items yet</h3>
              <p className="text-gray-400 mb-6">Items you save will appear here</p>
              <Link 
                href="/feed" 
                className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              >
                Browse Listings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
