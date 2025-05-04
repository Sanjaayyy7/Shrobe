import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // If user is authenticated, redirect to the feed page
  if (session) {
    return NextResponse.redirect(new URL('/feed', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'))
  }
  
  // If not authenticated, let the page component handle it
  return NextResponse.next()
} 