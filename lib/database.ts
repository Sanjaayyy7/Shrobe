import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Listing, ListingImage, ListingTag, ListingAvailability, Wishlist, Booking, Review } from './types';

// Initialize Supabase client
const createClient = () => createClientComponentClient();

// Listings
export async function getListings(filters?: {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  distance?: number;
  userLocation?: { lat: number; lng: number };
  searchQuery?: string;
  available?: boolean;
}) {
  const supabase = createClient();
  
  let query = supabase
    .from('listings')
    .select(`
      *,
      listing_images (*),
      listing_tags (*)
    `);

  // Apply filters if provided
  if (filters) {
    if (filters.category) {
      query = query.in('listing_tags.tag', [filters.category]);
    }
    
    if (filters.priceMin !== undefined) {
      query = query.gte('daily_price', filters.priceMin);
    }
    
    if (filters.priceMax !== undefined) {
      query = query.lte('daily_price', filters.priceMax);
    }
    
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%`);
    }
    
    if (filters.available !== undefined) {
      query = query.eq('is_available', filters.available);
    }
    
    // Note: Distance filtering would require PostGIS extension in Supabase
    // This is a simplified version
    if (filters.distance && filters.userLocation) {
      // This is a simplification - would need proper geospatial queries for accuracy
      const { lat, lng } = filters.userLocation;
      query = query.not('latitude', 'is', null).not('longitude', 'is', null);
    }
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching listings:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      error
    });
    throw error;
  }

  if (!data) return [];

  // Fetch user profiles for unique user_ids
  const userIds = Array.from(new Set(data.map((listing: any) => listing.user_id)));
  let userProfiles: Record<string, { user_name: string; full_name?: string }> = {};
  if (userIds.length > 0) {
    const { data: users, error: userError } = await supabase
      .from('User')
      .select('id, user_name, full_name')
      .in('id', userIds);
    if (userError) {
      console.error('Error fetching user profiles:', userError);
    } else if (users) {
      users.forEach((user: any) => {
        userProfiles[user.id] = { user_name: user.user_name, full_name: user.full_name };
      });
    }
  }

  // Merge user profile into each listing
  const listingsWithUser = data.map((listing: any) => ({
    ...listing,
    user: userProfiles[listing.user_id] || null
  }));

  return listingsWithUser as (Listing & { user: { user_name: string; full_name?: string } })[];
}

export async function getListingById(id: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      listing_images (*),
      listing_tags (*),
      listing_availability (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching listing:', error);
    throw error;
  }

  if (!data) return null;

  // Fetch user profile for this listing
  let userProfile = null;
  if (data.user_id) {
    const { data: user, error: userError } = await supabase
      .from('User')
      .select('id, user_name, full_name')
      .eq('id', data.user_id)
      .single();
    if (userError) {
      console.error('Error fetching user profile:', userError);
    } else if (user) {
      userProfile = { user_name: user.user_name, full_name: user.full_name };
    }
  }

  return { ...data, user: userProfile } as Listing & { user: { user_name: string; full_name?: string } };
}

export async function getUserListings(userId: string) {
  const supabase = createClient();
  
  console.log('Fetching listings for user ID:', userId);
  
  try {
    // Simplify the query to avoid joins that require foreign keys
    const { data, error } = await supabase
      .from('listings')
      .select('*')  // Only select from the listings table
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error fetching user listings:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }
    
    console.log(`Successfully fetched ${data?.length || 0} listings for user`);
    
    // If we need images, we can fetch them separately
    if (data && data.length > 0) {
      // For each listing, we'll need to get its images and tags separately
      const enrichedListings = await Promise.all(data.map(async (listing) => {
        try {
          // Get images
          const { data: imageData } = await supabase
            .from('listing_images')
            .select('*')
            .eq('listing_id', listing.id);
            
          // Get tags  
          const { data: tagData } = await supabase
            .from('listing_tags')
            .select('*')
            .eq('listing_id', listing.id);
            
          return {
            ...listing,
            images: imageData || [],
            tags: tagData || []
          };
        } catch (err) {
          console.log(`Error fetching details for listing ${listing.id}:`, err);
          return {
            ...listing,
            images: [],
            tags: []
          };
        }
      }));
      
      return enrichedListings as unknown as Listing[];
    }
    
    return data as unknown as Listing[];
  } catch (err) {
    console.error('Exception in getUserListings:', err);
    throw err;
  }
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();

  // Log the listing data and user session
  console.log('Creating listing with data:', JSON.stringify(listing, null, 2));
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', sessionData, 'Session error:', sessionError);

  // Check for required fields
  if (!listing.user_id || !listing.title || !listing.description || !listing.daily_price) {
    throw new Error('Missing required fields for listing');
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      // Log the full error object
      console.error('Error creating listing:', JSON.stringify(error, null, 2));
      throw error;
    }

    console.log('Listing created successfully:', data);
    return data as Listing;
  } catch (error) {
    console.error('Exception creating listing:', error);
    throw error;
  }
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating listing:', error);
    throw error;
  }
  
  return data as Listing;
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('listings')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
  
  return true;
}

// Listing Images
export async function addListingImages(images: Omit<ListingImage, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listing_images')
    .insert(images)
    .select();
  
  if (error) {
    console.error('Error adding listing images:', error);
    throw error;
  }
  
  return data as ListingImage[];
}

export async function deleteListingImage(id: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('listing_images')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting listing image:', error);
    throw error;
  }
  
  return true;
}

// Listing Tags
export async function addListingTags(tags: Omit<ListingTag, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listing_tags')
    .insert(tags)
    .select();
  
  if (error) {
    console.error('Error adding listing tags:', error);
    throw error;
  }
  
  return data as ListingTag[];
}

export async function deleteListingTags(listingId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('listing_tags')
    .delete()
    .eq('listing_id', listingId);
  
  if (error) {
    console.error('Error deleting listing tags:', error);
    throw error;
  }
  
  return true;
}

// Listing Availability
export async function addListingAvailability(availability: Omit<ListingAvailability, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listing_availability')
    .insert(availability)
    .select();
  
  if (error) {
    console.error('Error adding listing availability:', error);
    throw error;
  }
  
  return data as ListingAvailability[];
}

export async function updateListingAvailability(id: string, updates: Partial<ListingAvailability>) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('listing_availability')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating listing availability:', error);
    throw error;
  }
  
  return data as ListingAvailability;
}

// Wishlist
export async function addToWishlist(userId: string, listingId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: userId,
      listing_id: listingId
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
  
  return data as Wishlist;
}

export async function removeFromWishlist(userId: string, listingId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .match({
      user_id: userId,
      listing_id: listingId
    });
  
  if (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
  
  return true;
}

export async function getUserWishlist(userId: string) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('wishlist')
    .select(`
      *,
      listing:listing_id (
        *,
        listing_images (*),
        user:user_id (user_name, full_name)
      )
    `)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching user wishlist:', error);
    throw error;
  }
  
  return data as unknown as (Wishlist & { listing: Listing & { user: { user_name: string; full_name?: string } } })[];
}

// Ensure storage bucket exists with proper policies
export async function ensureStorageBucket(bucketName: string = 'listings') {
  const supabase = createClient();
  
  try {
    // Check if the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error checking storage buckets:', listError);
      throw listError;
    }
    
    // If the bucket doesn't exist, create it
    const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`Creating storage bucket: ${bucketName}`);
      const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true, // Make the bucket public so files can be accessed without authentication
        fileSizeLimit: 5242880, // 5MB limit
      });
      
      if (createError) {
        console.error(`Error creating storage bucket ${bucketName}:`, createError);
        throw createError;
      }
      
      // Set up RLS policies for the bucket
      await setupStoragePolicies(bucketName);
      
      return { created: true, bucket: data };
    } else {
      // Bucket exists, ensure policies are set up
      await setupStoragePolicies(bucketName);
    }
    
    return { created: false, bucket: buckets.find(bucket => bucket.name === bucketName) };
  } catch (error) {
    console.error('Exception in ensureStorageBucket:', error);
    throw error;
  }
}

// Set up storage policies for a bucket
async function setupStoragePolicies(bucketName: string) {
  const supabase = createClient();
  
  try {
    // SQL to create policies
    const { error } = await supabase.rpc('setup_storage_policies', { bucket_name: bucketName });
    
    if (error) {
      console.error('Error setting up storage policies:', error);
      throw error;
    }
    
    console.log(`Storage policies for ${bucketName} set up successfully`);
    return true;
  } catch (error) {
    console.error('Exception in setupStoragePolicies:', error);
    throw error;
  }
}

// File upload helper
export async function uploadImage(file: File, path: string) {
  const supabase = createClient();
  
  // Ensure the listings bucket exists
  try {
    await ensureStorageBucket('listings');
  } catch (error) {
    console.error('Error ensuring storage bucket exists:', error);
    // Continue anyway, as the bucket might exist but the RPC function might not
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${path}/${fileName}`;
  
  try {
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('You must be logged in to upload images');
    }
    
    // Try to upload the file
    const { data, error } = await supabase.storage
      .from('listings')
      .upload(filePath, file);
    
    if (error) {
      // If RLS policy error, try to handle it
      if (error.message.includes('row-level security')) {
        console.error('RLS policy error, please run the fix-storage-policies script');
        throw new Error('Permission denied: Unable to upload image due to security settings');
      }
      
      console.error('Error uploading image:', error);
      throw error;
    }
    
    const { data: publicUrlData } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Exception in uploadImage:', error);
    throw error;
  }
} 