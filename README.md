# Shrobe - Fashion Sharing Platform

A modern platform for renting, sharing, and trading fashion items with location-based features.

## Features

- Responsive design with modern UI
- User authentication with Supabase
- Listing creation and management
- Location-based search and map view
- Image upload and management
- Real-time messaging

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Maps API key with Places API enabled

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
\`\`\`

### Location Features Setup

1. Create a Google Cloud Platform project
2. Enable the Maps JavaScript API and Places API
3. Create an API key with appropriate restrictions
4. Add the API key to your `.env.local` file

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations in `supabase/migrations/` to create the necessary tables

### Installation

\`\`\`bash
# Install dependencies
npm install

# Run the development server
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This project can be deployed on Vercel:

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add the environment variables in the Vercel project settings
4. Deploy!

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Supabase](https://supabase.io/) - Backend as a Service
- [Google Maps Platform](https://cloud.google.com/maps-platform/) - Location services
