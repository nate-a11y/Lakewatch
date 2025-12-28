import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const protectedRoutes = ['/portal', '/manage', '/field']

// Routes only for unauthenticated users
const authRoutes = ['/login', '/signup', '/reset-password']

// Role-based route access
const roleRoutes: Record<string, string[]> = {
  '/portal': ['customer', 'admin', 'owner'],
  '/manage': ['admin', 'owner'],
  '/field': ['technician', 'admin', 'owner'],
}

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') || // Payload admin
    pathname.includes('.')
  ) {
    return supabaseResponse
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    // Redirect based on role
    const role = user.user_metadata?.role || 'customer'
    let redirectPath = '/portal'
    if (role === 'admin' || role === 'owner') {
      redirectPath = '/manage'
    } else if (role === 'technician') {
      redirectPath = '/field'
    }
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Check role-based access
  if (isProtectedRoute && user) {
    const role = user.user_metadata?.role || 'customer'

    for (const [routePrefix, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname.startsWith(routePrefix)) {
        if (!allowedRoles.includes(role)) {
          // Redirect to appropriate dashboard based on role
          let redirectPath = '/portal'
          if (role === 'admin' || role === 'owner') {
            redirectPath = '/manage'
          } else if (role === 'technician') {
            redirectPath = '/field'
          }
          return NextResponse.redirect(new URL(redirectPath, request.url))
        }
        break
      }
    }
  }

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
