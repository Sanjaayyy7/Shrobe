export interface User {
  id: string;
  mail: string;
  full_name?: string;
  user_name: string;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  brand?: string;
  size?: string;
  condition?: string;
  daily_price: number;
  weekly_price?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations (not from database)
  images?: ListingImage[];
  tags?: ListingTag[];
  availability?: ListingAvailability[];
  user?: User;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

export interface ListingTag {
  id: string;
  listing_id: string;
  tag: string;
  created_at: string;
}

export interface ListingAvailability {
  id: string;
  listing_id: string;
  start_date: string;
  end_date: string;
  is_available: boolean;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  
  // Relations (not from database)
  listing?: Listing;
}

export interface Booking {
  id: string;
  listing_id: string;
  borrower_id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  
  // Relations (not from database)
  listing?: Listing;
  borrower?: User;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  
  // Relations (not from database)
  booking?: Booking;
  reviewer?: User;
}

export type ListingCondition = 'New with tags' | 'Like new' | 'Good' | 'Fair' | 'Well-loved';

export type ClothingCategory = 
  | 'Dresses' 
  | 'Tops' 
  | 'Bottoms' 
  | 'Outerwear' 
  | 'Footwear' 
  | 'Accessories'
  | 'Formal'
  | 'Casual'
  | 'Streetwear'
  | 'Vintage'
  | 'Designer'
  | 'Sustainable'; 