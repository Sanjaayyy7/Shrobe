-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create signups table
CREATE TABLE public.signups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add row level security
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can sign up)
CREATE POLICY "Allow public to insert their email" ON public.signups
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy for selecting (anyone can select their own email)
CREATE POLICY "Allow public to select limited data" ON public.signups
  FOR SELECT
  TO public
  USING (true);

-- Create index on email for faster lookups and constraint enforcement
CREATE UNIQUE INDEX IF NOT EXISTS signups_email_idx ON public.signups (email);
