import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired - required for Server Components
  const { data: { session } } = await supabase.auth.getSession()
  
  // Get the pathname of the request
  const path = req.nextUrl.pathname
  
  // Define which paths require authentication
  const protectedPaths = ['/feed', '/closet', '/create-wardrobe', '/closets']
  
  // Define which paths are public only (shouldn't be accessed when logged in)
  const publicOnlyPaths = ['/login', '/signup']
  
  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(pp => path.startsWith(pp))
  
  // Check if the path is public only
  const isPublicOnlyPath = publicOnlyPaths.some(pp => path.startsWith(pp))
  
  // If user is accessing a protected path but isn't authenticated, redirect to login
  if (isProtectedPath && !session) {
    const redirectUrl = new URL('/login', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  // If user is accessing a public-only path (like login) and is authenticated, 
  // redirect to feed page
  if (isPublicOnlyPath && session) {
    const redirectUrl = new URL('/feed', req.url)
    return NextResponse.redirect(redirectUrl)
  }
  
  return res
}

// Specify paths that should trigger this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 