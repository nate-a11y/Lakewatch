import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/properties - List user's properties
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
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

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    let query = supabase
      .from('lwp_properties')
      .select(`
        *,
        owner:lwp_users!owner_id(id, first_name, last_name, email),
        service_plan:lwp_service_plans!service_plan_id(id, name, price_monthly)
      `)

    // Filter by owner for customers, show all for admin
    if (userData.role === 'customer') {
      query = query.eq('owner_id', userData.id)
    }

    const { data, error } = await query.order('name')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Properties GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/properties - Create a property
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

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      name,
      street,
      city,
      state,
      zip,
      latitude,
      longitude,
      servicePlanId,
      accessInfo,
      emergencyContacts,
      utilityInfo,
      notes,
    } = body

    if (!name || !street || !city || !state || !zip) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const propertyData = {
      name,
      street,
      city,
      state,
      zip,
      latitude: latitude || null,
      longitude: longitude || null,
      owner_id: userData.id,
      service_plan_id: servicePlanId || null,
      access_info: accessInfo || null,
      emergency_contacts: emergencyContacts || null,
      utility_info: utilityInfo || null,
      notes: notes || null,
      status: 'active',
    }

    const { data, error } = await supabase
      .from('lwp_properties')
      .insert(propertyData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Properties POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
