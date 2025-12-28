import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { supabaseResponse, user }
}

export type UserRole = 'customer' | 'technician' | 'admin' | 'owner'

export async function getUserRole(supabase: ReturnType<typeof createServerClient>): Promise<UserRole | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Get role from user metadata or profiles table
  const role = user.user_metadata?.role as UserRole
  return role || 'customer'
}
