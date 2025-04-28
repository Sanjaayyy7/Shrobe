# Shrobe Landing Page

A modern landing page for Shrobe, a fashion sharing platform, with Supabase integration for email signups.

## Features

- Responsive landing page with modern design
- Email signup form with Supabase integration
- Mobile-friendly layout
- Tailwind CSS styling

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Environment Setup

Create a `.env.local` file in the root directory with the following variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### Database Setup

1. Create a new Supabase project
2. Run the SQL migration in `supabase/migrations/20240425_create_signups_table.sql` to create the necessary tables

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
\`\`\`

Let's also create a package.json file:
