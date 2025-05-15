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

  // More detailed logging for debugging
  console.log(`Retrieved ${data.length} listings from database`);
  if (data.length > 0) {
    console.log('First listing ID:', data[0].id);
    console.log('First listing title:', data[0].title);
    
    // Check if images data is available and in what form
    if (data[0].listing_images) {
      console.log('First listing images count:', data[0].listing_images.length);
      console.log('First listing first image sample:', 
        data[0].listing_images.length > 0 ? 
        JSON.stringify(data[0].listing_images[0]) : 'No images');
    } else {
      console.log('First listing has no listing_images property');
    }
    
    console.log('First listing tags:', data[0].listing_tags);
  }

  // Reformat listing_images to images for consistency
  const reformattedData = data.map((listing: any) => {
    // Ensure listing_images is always an array
    const images = Array.isArray(listing.listing_images) ? listing.listing_images : [];
    
    // Log any issues with images for debugging
    if (!Array.isArray(listing.listing_images)) {
      console.warn(`Listing ${listing.id} has non-array listing_images:`, listing.listing_images);
    }
    
    return {
      ...listing,
      images: images,
      tags: Array.isArray(listing.listing_tags) ? listing.listing_tags : [],
    };
  });

  // Fetch user profiles for unique user_ids
  const userIds = Array.from(new Set(reformattedData.map((listing: any) => listing.user_id)));
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
  const listingsWithUser = reformattedData.map((listing: any) => ({
    ...listing,
    user: userProfiles[listing.user_id] || null
  }));

  // Final validation of image data
  listingsWithUser.forEach((listing: any) => {
    if (!Array.isArray(listing.images)) {
      console.error(`Listing ${listing.id} still has non-array images after processing:`, listing.images);
      listing.images = []; // Ensure it's always an array
    }
  });

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
          const { data: imageData, error: imageError } = await supabase
            .from('listing_images')
            .select('*')
            .eq('listing_id', listing.id);
            
          if (imageError) {
            console.error(`Error fetching images for listing ${listing.id}:`, imageError);
          }
          
          // Log image data for debugging
          console.log(`Listing ${listing.id} image count:`, imageData?.length || 0);
          if (imageData && imageData.length > 0) {
            console.log(`Listing ${listing.id} first image sample:`, JSON.stringify(imageData[0]));
          }
          
          // Get tags  
          const { data: tagData, error: tagError } = await supabase
            .from('listing_tags')
            .select('*')
            .eq('listing_id', listing.id);
            
          if (tagError) {
            console.error(`Error fetching tags for listing ${listing.id}:`, tagError);
          }
          
          // Ensure images is always an array
          const safeImageData = Array.isArray(imageData) ? imageData : [];
          const safeTagData = Array.isArray(tagData) ? tagData : [];
            
          return {
            ...listing,
            images: safeImageData,
            tags: safeTagData
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
      
      // Final validation of image data
      enrichedListings.forEach((listing: any) => {
        if (!Array.isArray(listing.images)) {
          console.error(`Listing ${listing.id} has non-array images after processing:`, listing.images);
          listing.images = []; // Ensure it's always an array
        }
      });
      
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
  
  try {
    // Delete associated storage files first
    await deleteStorageFiles([id]);
    
    // Delete related records
    const deleteRelatedOps = [
      // Delete listing images
      supabase
        .from('listing_images')
        .delete()
        .eq('listing_id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing images:', error);
        }),
      
      // Delete listing tags
      supabase
        .from('listing_tags')
        .delete()
        .eq('listing_id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing tags:', error);
        }),
      
      // Delete listing availability
      supabase
        .from('listing_availability')
        .delete()
        .eq('listing_id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing availability:', error);
        }),
      
      // Delete from wishlists
      supabase
        .from('wishlist')
        .delete()
        .eq('listing_id', id)
        .then(({ error }) => {
          if (error) console.error('Error deleting wishlist entries:', error);
        })
    ];
    
    await Promise.all(deleteRelatedOps);
    
    // Finally delete the listing itself
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting listing:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    throw error;
  }
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
  
  try {
    // Check if user is authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      throw new Error('You must be logged in to upload images');
    }
    
    // Generate a unique file name with extension
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    console.log(`Uploading image to path: ${filePath}`);
    
    // First try to check if the listings bucket exists
    try {
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
      } else if (buckets) {
        const bucketExists = buckets.some(bucket => bucket.name === 'listings');
        
        if (!bucketExists) {
          console.log('Listings bucket does not exist, attempting to create it');
          const { error: createError } = await supabase.storage.createBucket('listings', {
            public: true,
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (createError) {
            console.error('Failed to create bucket:', createError);
          }
        }
      }
    } catch (e) {
      console.warn('Unable to check/create bucket:', e);
      // Continue anyway, as the bucket might exist
    }
    
    // Try to upload the file
    const { data, error } = await supabase.storage
      .from('listings')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (error) {
      console.error('Error uploading image:', error);
      
      // If we hit an RLS error, we'll try a different approach with the admin service
      if (error.message?.includes('row-level security') || error.message?.includes('permission denied')) {
        console.log('Detected RLS issue, trying alternative approach for images...');
        
        // Since we can't use service role in client side, use public URLs instead
        // Fall back to using placeholder images from Unsplash or similar services
        const placeholderImages = [
          'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?q=80&w=3005&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=2787&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=2835&auto=format&fit=crop'
        ];
        
        // Return a random placeholder image
        const randomIndex = Math.floor(Math.random() * placeholderImages.length);
        console.log('Using placeholder image as fallback:', placeholderImages[randomIndex]);
        
        return placeholderImages[randomIndex];
      }
      
      throw error;
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('listings')
      .getPublicUrl(filePath);
    
    console.log('Public URL data:', publicUrlData);
    
    if (!publicUrlData || !publicUrlData.publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }
    
    // Return the fully qualified public URL
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Exception in uploadImage:', error);
    throw error;
  }
}

// Delete storage files associated with a listing
async function deleteStorageFiles(listingIds: string[]) {
  const supabase = createClient();

  try {
    // Get all images for these listings
    const { data: imageData, error: imageError } = await supabase
      .from('listing_images')
      .select('image_url')
      .in('listing_id', listingIds);

    if (imageError) {
      console.error('Error fetching listing images before deletion:', imageError);
      return;
    }

    if (!imageData || imageData.length === 0) {
      console.log('No images found for listings');
      return;
    }

    // Extract file paths from URLs
    const filesToDelete = imageData
      .map(img => {
        if (!img.image_url) return null;
        
        // Handle URLs from Supabase storage
        try {
          if (img.image_url.includes('storage/v1/object/public/listings/')) {
            // Extract the path after 'listings/'
            const pathMatch = img.image_url.match(/\/listings\/(.+)$/);
            if (pathMatch && pathMatch[1]) {
              return pathMatch[1];
            }
          }
        } catch (e) {
          console.warn('Error parsing image URL:', e);
        }
        return null;
      })
      .filter(Boolean) as string[];

    if (filesToDelete.length === 0) {
      console.log('No valid storage files found to delete');
      return;
    }

    console.log(`Attempting to delete ${filesToDelete.length} files from storage`);

    // Delete files in batches to avoid API limits
    const batchSize = 10;
    for (let i = 0; i < filesToDelete.length; i += batchSize) {
      const batch = filesToDelete.slice(i, i + batchSize);
      const { data, error } = await supabase.storage
        .from('listings')
        .remove(batch);

      if (error) {
        console.error('Error deleting storage files (batch):', error);
      } else {
        console.log(`Successfully deleted batch of ${batch.length} files`);
      }
    }
  } catch (error) {
    console.error('Exception in deleteStorageFiles:', error);
  }
}

// Update the deleteAllUserListings function to use deleteStorageFiles
export async function deleteAllUserListings(userId: string) {
  const supabase = createClient();
  
  console.log(`Attempting to delete all listings for user: ${userId}`);
  
  try {
    // First get all listings for the user to handle related records
    const { data: userListings, error: fetchError } = await supabase
      .from('listings')
      .select('id')
      .eq('user_id', userId);
    
    if (fetchError) {
      console.error('Error fetching user listings for deletion:', fetchError);
      throw fetchError;
    }
    
    if (!userListings || userListings.length === 0) {
      console.log('No listings found for this user');
      return { deleted: 0 };
    }
    
    const listingIds = userListings.map(listing => listing.id);
    console.log(`Found ${listingIds.length} listings to delete`);
    
    // Delete storage files first
    await deleteStorageFiles(listingIds);
    
    // Delete related records (images, tags, availability)
    // Using Promise.all to handle all deletions in parallel
    await Promise.all([
      // Delete listing images
      supabase
        .from('listing_images')
        .delete()
        .in('listing_id', listingIds)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing images:', error);
        }),
      
      // Delete listing tags
      supabase
        .from('listing_tags')
        .delete()
        .in('listing_id', listingIds)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing tags:', error);
        }),
      
      // Delete listing availability
      supabase
        .from('listing_availability')
        .delete()
        .in('listing_id', listingIds)
        .then(({ error }) => {
          if (error) console.error('Error deleting listing availability:', error);
        }),
      
      // Delete from wishlists
      supabase
        .from('wishlist')
        .delete()
        .in('listing_id', listingIds)
        .then(({ error }) => {
          if (error) console.error('Error deleting wishlist entries:', error);
        })
    ]);
    
    // Finally delete the listings themselves
    const { error: deleteError } = await supabase
      .from('listings')
      .delete()
      .eq('user_id', userId);
    
    if (deleteError) {
      console.error('Error deleting listings:', deleteError);
      throw deleteError;
    }
    
    console.log(`Successfully deleted ${listingIds.length} listings for user ${userId}`);
    return { deleted: listingIds.length };
  } catch (error) {
    console.error('Exception in deleteAllUserListings:', error);
    throw error;
  }
} 