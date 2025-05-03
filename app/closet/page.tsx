import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'

// Define types
type Item = {
  id: string
  image_url: string
  category: string | null
  description: string | null
}

type Wardrobe = {
  id: string
  title: string
  items: Item[]
}

export default async function ClosetPage() {
  // Initialize Supabase client with cookies for server component
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Not logged in</h1>
          <p className="text-lg text-gray-600 mb-8">Please sign in to view your closet</p>
          <Link
            href="/login"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }
  
  // Fetch user's wardrobes with associated items
  const { data: wardrobes, error } = await supabase
    .from('wardrobes')
    .select('id, title, items(*)')
    .eq('user_id', user.id)
  
  if (error) {
    console.error('Error fetching wardrobes:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600 mb-2">Error loading closet</h1>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    )
  }
  
  // Handle case where user has no wardrobes yet
  if (!wardrobes || wardrobes.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16 px-4 sm:px-6 lg:px-8 bg-white rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Closet</h1>
          <p className="text-lg text-gray-600 mb-8">You don't have any wardrobes yet.</p>
          <Link
            href="/create-wardrobe"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
          >
            Create Your First Wardrobe
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Closet</h1>
      
      <div className="space-y-12">
        {wardrobes.map((wardrobe: Wardrobe) => (
          <div key={wardrobe.id} className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">{wardrobe.title}</h2>
              <Link 
                href={`/wardrobe/${wardrobe.id}`}
                className="text-sm font-medium text-pink-600 hover:text-pink-500"
              >
                Manage Wardrobe
              </Link>
            </div>
            
            <div className="px-6 py-5">
              {wardrobe.items && wardrobe.items.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {wardrobe.items.map((item: Item) => (
                    <div key={item.id} className="group relative">
                      <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
                        {item.image_url ? (
                          <div className="relative w-full h-48">
                            <Image
                              src={item.image_url}
                              alt={item.description || 'Clothing item'}
                              fill
                              className="object-cover object-center group-hover:opacity-75"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-48 flex items-center justify-center bg-gray-200">
                            <span className="text-gray-400">No Image</span>
                          </div>
                        )}
                      </div>
                      {item.category && (
                        <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                      )}
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-900 truncate">{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No items in this wardrobe yet.</p>
                  <Link
                    href={`/wardrobe/${wardrobe.id}/add-item`}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-pink-600 bg-pink-50 hover:bg-pink-100"
                  >
                    Add Items
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 