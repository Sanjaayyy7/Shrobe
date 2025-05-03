-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create wardrobes table
create table IF NOT EXISTS wardrobes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp default now()
);

-- Create items table
create table IF NOT EXISTS items (
  id uuid primary key default gen_random_uuid(),
  wardrobe_id uuid references wardrobes(id) on delete cascade,
  image_url text not null,
  category text,
  description text,
  created_at timestamp default now()
);

-- Enable Row-Level Security for wardrobes
ALTER TABLE wardrobes ENABLE ROW LEVEL SECURITY;

-- Create policy for wardrobes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'wardrobes' AND policyname = 'Users can manage own wardrobes'
  ) THEN
    create policy "Users can manage own wardrobes"
    on wardrobes
    for all
    using (auth.uid() = user_id);
  END IF;
END
$$;

-- Enable Row-Level Security for items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy for items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE schemaname = 'public' AND tablename = 'items' AND policyname = 'Users manage items in their wardrobes'
  ) THEN
    create policy "Users manage items in their wardrobes"
    on items
    for all
    using (
      wardrobe_id in (select id from wardrobes where user_id = auth.uid())
    );
  END IF;
END
$$; 