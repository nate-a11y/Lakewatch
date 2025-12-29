import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// GET /api/team - List team members (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('lwp_users')
      .select('id, role')
      .eq('supabase_id', user.id)
      .single()

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')

    let query = supabase
      .from('lwp_users')
      .select('*')
      .in('role', ['admin', 'technician', 'staff', 'owner'])
      .order('last_name')

    if (role) {
      query = query.eq('role', role)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Team GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/team - Create a team member (admin only)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: userData } = await supabase
      .from('lwp_users')
      .select('id, role')
      .eq('supabase_id', user.id)
      .single()

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { firstName, lastName, email, phone, role, sendInvite } = body

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json({ error: 'First name, last name, email, and role are required' }, { status: 400 })
    }

    // Validate role
    if (!['admin', 'technician', 'staff'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from('lwp_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    // Create user in database
    const { data: newUser, error: dbError } = await supabase
      .from('lwp_users')
      .insert({
        first_name: firstName,
        last_name: lastName,
        email: email.toLowerCase(),
        phone: phone || null,
        role,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 })
    }

    // Send invite email if requested
    if (sendInvite) {
      const cookieStore = await cookies()
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll() {},
          },
        }
      )

      const redirectPath = role === 'technician' ? '/field' : '/manage'
      const { error: inviteError } = await adminSupabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`,
      })

      if (inviteError) {
        console.error('Failed to send invite:', inviteError)
      }
    }

    return NextResponse.json({ data: newUser }, { status: 201 })
  } catch (error) {
    console.error('Team POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
