-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  brand TEXT,
  size TEXT,
  condition TEXT,
  daily_price DECIMAL(10, 2) NOT NULL,
  weekly_price DECIMAL(10, 2),
  location TEXT,
  latitude FLOAT,
  longitude FLOAT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing_images table for multiple images
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing_tags table for categorization
CREATE TABLE IF NOT EXISTS listing_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create listing_availability table for calendar functionality
CREATE TABLE IF NOT EXISTS listing_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table for saved items
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Create bookings table for reservations
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  borrower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row-Level Security for all tables
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for listings
CREATE POLICY "Users can view all listings" ON listings FOR SELECT USING (true);
CREATE POLICY "Users can manage their own listings" ON listings FOR ALL USING (auth.uid() = user_id);

-- Create policies for listing_images
CREATE POLICY "Anyone can view listing images" ON listing_images FOR SELECT USING (true);
CREATE POLICY "Users can manage images of their own listings" ON listing_images
  FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Create policies for listing_tags
CREATE POLICY "Anyone can view listing tags" ON listing_tags FOR SELECT USING (true);
CREATE POLICY "Users can manage tags of their own listings" ON listing_tags
  FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Create policies for listing_availability
CREATE POLICY "Anyone can view listing availability" ON listing_availability FOR SELECT USING (true);
CREATE POLICY "Users can manage availability of their own listings" ON listing_availability
  FOR ALL USING (listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Create policies for wishlist
CREATE POLICY "Users can manage their own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

-- Create policies for bookings
CREATE POLICY "Users can view bookings related to them" ON bookings
  FOR SELECT USING (auth.uid() = borrower_id OR 
                   listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));
CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = borrower_id);
CREATE POLICY "Users can update bookings related to them" ON bookings
  FOR UPDATE USING (auth.uid() = borrower_id OR 
                   listing_id IN (SELECT id FROM listings WHERE user_id = auth.uid()));

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create their own reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings (user_id);
CREATE INDEX IF NOT EXISTS listing_images_listing_id_idx ON listing_images (listing_id);
CREATE INDEX IF NOT EXISTS listing_tags_listing_id_idx ON listing_tags (listing_id);
CREATE INDEX IF NOT EXISTS listing_availability_listing_id_idx ON listing_availability (listing_id);
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON wishlist (user_id);
CREATE INDEX IF NOT EXISTS wishlist_listing_id_idx ON wishlist (listing_id);
CREATE INDEX IF NOT EXISTS bookings_listing_id_idx ON bookings (listing_id);
CREATE INDEX IF NOT EXISTS bookings_borrower_id_idx ON bookings (borrower_id);
CREATE INDEX IF NOT EXISTS reviews_booking_id_idx ON reviews (booking_id); 