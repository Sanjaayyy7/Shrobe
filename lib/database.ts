import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Listing, ListingImage, ListingTag, ListingAvailability, Wishlist, Booking, Review } from './types';
import { supabase } from './supabase';

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
  
  try {
    console.log('Fetching listings with filters:', filters || 'none');
    
    // First fetch the listings themselves
    let query = supabase
      .from('listings')
      .select('*');

    // Apply filters if provided
    if (filters) {
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
    
    // Order by newest first to ensure new listings appear at the top
    query = query.order('created_at', { ascending: false });
    
    const { data: listingsData, error: listingsError } = await query;
    
    if (listingsError) {
      console.error('Error fetching listings:', listingsError);
      return []; // Return empty array instead of throwing
    }

    if (!listingsData || listingsData.length === 0) {
      console.log('No listings found');
      return [];
    }

    // More detailed logging for debugging
    console.log(`Retrieved ${listingsData.length} listings from database`);
    
    // Get listing IDs to fetch related data
    const listingIds = listingsData.map(listing => listing.id);
    
    // Fetch images for all listings
    const { data: allImagesData, error: imagesError } = await supabase
      .from('listing_images')
      .select('*')
      .in('listing_id', listingIds)
      .order('display_order', { ascending: true });
      
    if (imagesError) {
      console.error('Error fetching listing images:', imagesError);
      // Continue with empty images rather than failing
    }
    
    // Create a map of listing_id to images for faster lookup
    const imagesMap: Record<string, any[]> = {};
    if (allImagesData) {
      allImagesData.forEach(image => {
        // Only add images that have a valid listing_id that matches one of our listings
        if (image.listing_id && listingIds.includes(image.listing_id)) {
          if (!imagesMap[image.listing_id]) {
            imagesMap[image.listing_id] = [];
          }
          imagesMap[image.listing_id].push(image);
        }
      });
    }
    
    // Log image counts per listing for debugging
    listingIds.forEach(id => {
      const imageCount = imagesMap[id]?.length || 0;
      console.log(`Listing ${id} has ${imageCount} images`);
    });
    
    // Only fetch tags by category if category filter is applied
    let tagsData: any[] = [];
    if (filters?.category) {
      const { data: filteredTagsData, error: tagsError } = await supabase
        .from('listing_tags')
        .select('*')
        .eq('tag', filters.category);
      
      if (tagsError) {
        console.error('Error fetching listing tags:', tagsError);
      } else if (filteredTagsData) {
        tagsData = filteredTagsData;
        
        // If we have a category filter, only keep listings that have the matching tag
        const listingIdsWithTag = new Set(filteredTagsData.map(tag => tag.listing_id));
        listingsData.forEach((listing, index) => {
          if (!listingIdsWithTag.has(listing.id)) {
            listingsData.splice(index, 1);
          }
        });
      }
    }
    
    // Create a map of listing_id to tags for faster lookup
    const tagsMap: Record<string, any[]> = {};
    tagsData.forEach(tag => {
      if (!tagsMap[tag.listing_id]) {
        tagsMap[tag.listing_id] = [];
      }
      tagsMap[tag.listing_id].push(tag);
    });

    // Combine the data
    const enrichedListings = listingsData.map(listing => {
      return {
        ...listing,
        images: imagesMap[listing.id] || [],
        tags: tagsMap[listing.id] || []
      };
    });

    // Fetch user profiles for unique user_ids
    const userIds = Array.from(new Set(enrichedListings.map((listing: any) => listing.user_id)));
    let userProfiles: Record<string, { user_name: string; full_name?: string }> = {};
    
    if (userIds.length > 0) {
      try {
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
      } catch (userErr) {
        console.error('Exception fetching user profiles:', userErr);
      }
    }

    // Merge user profile into each listing
    const listingsWithUser = enrichedListings.map((listing: any) => ({
      ...listing,
      user: userProfiles[listing.user_id] || null
    }));

    console.log(`Returning ${listingsWithUser.length} enriched listings`);
    return listingsWithUser;
  } catch (err) {
    console.error('Exception in getListings:', err);
    return []; // Return empty array on any error
  }
}

export async function getListingById(id: string) {
  const supabase = createClient();
  
  try {
    // First, check if the ID is valid to avoid Supabase error
    if (!id || typeof id !== 'string' || id.trim() === '') {
      console.error('Invalid listing ID provided:', id);
      return null;
    }

    console.log(`Fetching listing with ID: ${id}`);
    
    // Query the main listing data
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *
      `)
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching listing:', error);
      return null;
    }

    if (!data) {
      console.log(`No listing found with ID: ${id}`);
      return null;
    }

    // Separately fetch images to avoid potential join issues
    const { data: imagesData, error: imagesError } = await supabase
      .from('listing_images')
      .select('*')
      .eq('listing_id', id)
      .order('display_order', { ascending: true });
    
    if (imagesError) {
      console.error('Error fetching listing images:', imagesError);
      // Continue with empty images rather than failing
    }

    // Log retrieved images for debugging
    console.log(`Retrieved ${imagesData?.length || 0} images for listing ${id}`);
    if (imagesData && imagesData.length > 0) {
      console.log('First image URL:', imagesData[0].image_url);
    } else {
      console.log('No images found for this listing');
    }

    // Verify each image belongs to this listing
    const verifiedImages = imagesData?.filter(img => img.listing_id === id) || [];
    if (verifiedImages.length !== imagesData?.length) {
      console.warn(`Filtered out ${(imagesData?.length || 0) - verifiedImages.length} images that don't belong to this listing`);
    }

    // Separately fetch tags to avoid potential join issues
    const { data: tagsData, error: tagsError } = await supabase
      .from('listing_tags')
      .select('*')
      .eq('listing_id', id);
    
    if (tagsError) {
      console.warn('Note: Tags unavailable for this listing - this is not a critical issue');
      // Continue with empty tags rather than failing
    }

    // Separately fetch availability to avoid potential join issues
    const { data: availabilityData, error: availabilityError } = await supabase
      .from('listing_availability')
      .select('*')
      .eq('listing_id', id);
    
    if (availabilityError) {
      // Change from error to warning since this is non-critical
      console.warn('Note: Availability data unavailable for this listing - this is not a critical issue');
      // Continue with empty availability rather than failing
    }

    // Fetch user profile for this listing
    let userProfile = null;
    if (data.user_id) {
      try {
        const { data: user, error: userError } = await supabase
          .from('profile')
          .select('*')
          .eq('id', data.user_id)
          .single();
        if (userError) {
          console.error('Error fetching user profile:', userError);
        } else if (user) {
          userProfile = { 
            user_name: user.user_name, 
            full_name: user.full_name, 
            profile_picture_url: user.profile_picture_url };
        }
      } catch (err) {
        console.error('Exception fetching user profile:', err);
        // Continue without user profile
      }
    }

    // Process the data and ensure all collections are arrays
    const processed = { 
      ...data, 
      images: Array.isArray(verifiedImages) ? verifiedImages : [],
      listing_images: Array.isArray(verifiedImages) ? verifiedImages : [],
      listing_tags: Array.isArray(tagsData) ? tagsData : [],
      listing_availability: Array.isArray(availabilityData) ? availabilityData : [],
      user: userProfile 
    };
    
    console.log(`Successfully fetched listing ${id} with ${processed.images.length} images`);
    
    return processed;
  } catch (err) {
    console.error('Exception in getListingById:', err);
    return null;
  }
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
      // Return empty array instead of throwing
      return [];
    }
    
    console.log(`Successfully fetched ${data?.length || 0} listings for user`);
    
    // If we need images, we can fetch them separately
    if (data && data.length > 0) {
      // For each listing, we'll need to get its images and tags separately
      const enrichedListings = await Promise.all(data.map(async (listing) => {
        try {
          // Get images - wrap in try/catch for safety
          let imageData = [];
          try {
            const { data: fetchedImages, error: imageError } = await supabase
              .from('listing_images')
              .select('*')
              .eq('listing_id', listing.id);
              
            if (imageError) {
              console.warn('Note: Unable to fetch images - non-critical issue');
            } else {
              imageData = fetchedImages || [];
            }
          } catch (imgErr) {
            console.warn('Note: Image retrieval issues - continuing without images');
            // Continue with empty array
          }
          
          // More defensive tag handling - always using empty array if anything fails
          let tagData = [];
          
          // This is the line causing the error - wrap in extra defensive code
          try {
            // Use a safer approach to get tags, avoiding template string in error message
            const tagResponse = await supabase
              .from('listing_tags')
              .select('*')
              .eq('listing_id', listing.id);
              
            if (tagResponse.error) {
              // Don't use template strings with listing IDs that could cause console errors
              console.warn('Note: Unable to retrieve tags - non-critical issue');
            } else if (tagResponse.data) {
              tagData = tagResponse.data;
            }
          } catch (err) {
            console.warn('Tag data unavailable');
            // Continue with empty tag array
          }
          
          // Ensure everything is a proper array
          const safeImageData = Array.isArray(imageData) ? imageData : [];
          const safeTagData = Array.isArray(tagData) ? tagData : [];
          
          return {
            ...listing,
            images: safeImageData,
            tags: safeTagData
          };
        } catch (err) {
          console.log('Error fetching details for listing:', listing.id);
          return {
            ...listing,
            images: [],
            tags: []
          };
        }
      }));
      
      // Extra validation to ensure every listing has array properties
      return enrichedListings.map(listing => ({
        ...listing,
        images: Array.isArray(listing.images) ? listing.images : [],
        tags: Array.isArray(listing.tags) ? listing.tags : []
      })) as unknown as Listing[];
    }
    
    return data as unknown as Listing[];
  } catch (err) {
    console.error('Exception in getUserListings:', err);
    // Return empty array on error
    return [];
  }
}

export async function createListing(listing: Omit<Listing, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();

  // Log the listing data and user session
  console.log('Creating listing with data:', JSON.stringify(listing, null, 2));
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  console.log('Current session:', sessionData, 'Session error:', sessionError);

  try {
    // Check for required fields
    if (!listing.user_id || !listing.title || !listing.description || !listing.daily_price) {
      console.error('Missing required fields for listing');
      return null;
    }

    const { data, error } = await supabase
      .from('listings')
      .insert(listing)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return null;
    }

    console.log('Listing created successfully:', data);
    return data as Listing;
  } catch (error) {
    console.error('Exception creating listing:', error);
    return null;
  }
}

export async function updateListing(id: string, updates: Partial<Listing>) {
  const supabase = createClient();
  
  try {
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
      return null;
    }
    
    return data as Listing;
  } catch (error) {
    console.error('Error updating listing:', error);
    return null;
  }
}

export async function deleteListing(id: string) {
  const supabase = createClient();
  
  try {
    // Try to delete associated storage files but don't let errors stop the process
    try {
      await deleteStorageFiles([id]);
    } catch (storageError) {
      console.error('Error deleting storage files:', storageError);
      // Continue with deletion even if storage deletion fails
    }
    
    // Delete related records with graceful error handling
    const deleteRelatedOps = [
      // Delete listing images
      (async () => {
        try {
          const { error } = await supabase
            .from('listing_images')
            .delete()
            .eq('listing_id', id);
            
          if (error) {
            console.error('Error deleting listing images:', error);
            // Don't throw, just log
          }
        } catch (err: unknown) {
          console.error('Exception deleting listing images:', err);
          // Don't throw, just log
        }
      })(),
      
      // Delete listing tags
      (async () => {
        try {
          const { error } = await supabase
            .from('listing_tags')
            .delete()
            .eq('listing_id', id);
            
          if (error) {
            console.error('Error deleting listing tags:', error);
            // Don't throw, just log
          }
        } catch (err: unknown) {
          console.error('Exception deleting listing tags:', err);
          // Don't throw, just log
        }
      })(),
      
      // Delete listing availability
      (async () => {
        try {
          const { error } = await supabase
            .from('listing_availability')
            .delete()
            .eq('listing_id', id);
            
          if (error) {
            console.error('Error deleting listing availability:', error);
            // Don't throw, just log
          }
        } catch (err: unknown) {
          console.error('Exception deleting listing availability:', err);
          // Don't throw, just log
        }
      })(),
      
      // Delete from wishlists
      (async () => {
        try {
          const { error } = await supabase
            .from('wishlist')
            .delete()
            .eq('listing_id', id);
            
          if (error) {
            console.error('Error deleting wishlist entries:', error);
            // Don't throw, just log
          }
        } catch (err: unknown) {
          console.error('Exception deleting wishlist entries:', err);
          // Don't throw, just log
        }
      })()
    ];
    
    // Wait for all delete operations to complete (or fail gracefully)
    await Promise.allSettled(deleteRelatedOps);
    
    // Finally delete the listing itself
    const { error } = await supabase
      .from('listings')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting listing:', error);
      // Don't throw, just return false to indicate failure
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting listing:', error);
    // Don't throw, just return false to indicate failure
    return false;
  }
}

// Listing Images
export async function addListingImages(images: Omit<ListingImage, 'id' | 'created_at'>[]) {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('listing_images')
      .insert(images)
      .select();
    
    if (error) {
      console.error('Error adding listing images:', error);
      return [] as ListingImage[];
    }
    
    return data as ListingImage[];
  } catch (error) {
    console.error('Error adding listing images:', error);
    return [] as ListingImage[];
  }
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
  
  // If no tags to add, just return empty array (this is not an error)
  if (!tags || tags.length === 0) {
    return [] as ListingTag[];
  }
  
  try {
    const { data, error } = await supabase
      .from('listing_tags')
      .insert(tags)
      .select();
    
    if (error) {
      // Determine if it's a critical error or just an expected limitation
      if (error.code === 'PGRST116' || error.message?.includes('permission denied')) {
        console.warn('Tags not added - permission issue. This is expected in some cases and won\'t affect the listing display.');
      } else {
        console.warn('Unable to add tags:', error.message);
      }
      return [] as ListingTag[]; // Return empty array instead of throwing
    }
    
    return data as ListingTag[];
  } catch (err) {
    console.warn('Exception in addListingTags - continuing without tags');
    return [] as ListingTag[]; // Return empty array on any error
  }
}

export async function deleteListingTags(listingId: string) {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('listing_tags')
      .delete()
      .eq('listing_id', listingId);
    
    if (error) {
      console.error('Error deleting listing tags:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting listing tags:', error);
    return false;
  }
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
export async function uploadImage(file: File, path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("profile-pics") // nombre del bucket
    .upload(path, file, {
      cacheControl: "3600",
      upsert: true, // reemplaza si ya existe
    })

  if (error) {
    throw new Error(error.message)
  }

  // Obtener la URL pública (si es bucket público)
  const {
    data: { publicUrl },
  } = supabase.storage.from("profile-pics").getPublicUrl(path)

  return publicUrl
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