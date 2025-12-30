import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const protectedRoutes = ['/portal', '/manage', '/field']

// Routes only for unauthenticated users
const authRoutes = ['/login', '/signup', '/reset-password']

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname, searchParams } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') || // Payload admin
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // Handle viewAs=customer parameter - set cookie for admin customer view
  if (searchParams.get('viewAs') === 'customer' && pathname.startsWith('/portal')) {
    supabaseResponse.cookies.set('viewAsCustomer', 'true', {
      path: '/',
      maxAge: 60 * 60, // 1 hour
      httpOnly: true,
      sameSite: 'lax',
    })
  }

  // Clear viewAs cookie when returning to manage dashboard
  if (pathname.startsWith('/manage')) {
    supabaseResponse.cookies.delete('viewAsCustomer')
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages to portal
  // (The portal layout will redirect to the correct dashboard based on DB role)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Role-based access is handled by individual layouts which can query the database
  // Middleware cannot efficiently query the database for user roles

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
