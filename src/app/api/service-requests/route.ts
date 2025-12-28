import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/service-requests - List service requests
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

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const propertyId = searchParams.get('property_id')
    const priority = searchParams.get('priority')

    let query = supabase
      .from('lwp_service_requests')
      .select(`
        *,
        property:lwp_properties!property_id(id, name, street, city, owner_id),
        requested_by:lwp_users!requested_by_id(id, first_name, last_name, email),
        assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
      `)

    // Filter based on role
    if (userData.role === 'customer') {
      query = query.eq('requested_by_id', userData.id)
    } else if (userData.role === 'technician') {
      query = query.eq('assigned_to_id', userData.id)
    }

    if (status) {
      if (status === 'active') {
        query = query.in('status', ['pending', 'approved', 'scheduled', 'in_progress'])
      } else {
        query = query.eq('status', status)
      }
    }
    if (propertyId) {
      query = query.eq('property_id', parseInt(propertyId))
    }
    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Service requests GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/service-requests - Create a service request
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
      propertyId,
      requestType,
      title,
      description,
      preferredDate,
      preferredTimeStart,
      preferredTimeEnd,
      priority,
      estimatedDuration,
      pricing,
    } = body

    if (!propertyId || !requestType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify property ownership for customers
    if (userData.role === 'customer') {
      const { data: property } = await supabase
        .from('lwp_properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single()

      if (!property || property.owner_id !== userData.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const requestData = {
      property_id: propertyId,
      requested_by_id: userData.id,
      request_type: requestType,
      title,
      description: description || null,
      preferred_date: preferredDate || null,
      preferred_time_start: preferredTimeStart || null,
      preferred_time_end: preferredTimeEnd || null,
      priority: priority || 'normal',
      estimated_duration: estimatedDuration || null,
      pricing: pricing || null,
      status: 'pending',
    }

    const { data, error } = await supabase
      .from('lwp_service_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification for admins
    const { data: admins } = await supabase
      .from('lwp_users')
      .select('id')
      .in('role', ['admin', 'owner', 'staff'])

    if (admins && admins.length > 0) {
      const notifications = admins.map((admin) => ({
        user_id: admin.id,
        type: 'service_request_update',
        title: 'New Service Request',
        body: `New ${requestType} request: ${title}`,
        data: { service_request_id: data.id },
        channels: ['push'],
      }))

      await supabase.from('lwp_notifications').insert(notifications)
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Service request POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
