import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/occupancy - List occupancy events
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
    const propertyId = searchParams.get('property_id')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('lwp_occupancy_calendar')
      .select(`
        *,
        property:lwp_properties!property_id(id, name, owner_id),
        created_by:lwp_users!created_by_id(id, first_name, last_name)
      `)

    // Filter based on role
    if (userData.role === 'customer') {
      // Get customer's properties
      const { data: properties } = await supabase
        .from('lwp_properties')
        .select('id')
        .eq('owner_id', userData.id)

      const propertyIds = properties?.map(p => p.id) || []
      if (propertyIds.length === 0) {
        return NextResponse.json({ data: [] })
      }
      query = query.in('property_id', propertyIds)
    }

    if (propertyId) {
      query = query.eq('property_id', parseInt(propertyId))
    }
    if (startDate) {
      query = query.gte('end_date', startDate)
    }
    if (endDate) {
      query = query.lte('start_date', endDate)
    }

    const { data, error } = await query.order('start_date', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Occupancy GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/occupancy - Create an occupancy event
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
      occupancyType,
      startDate,
      endDate,
      guestName,
      guestPhone,
      guestEmail,
      notes,
      preArrivalRequested,
      postDepartureRequested,
    } = body

    if (!propertyId || !occupancyType || !startDate || !endDate) {
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

    const occupancyData = {
      property_id: propertyId,
      occupancy_type: occupancyType,
      start_date: startDate,
      end_date: endDate,
      guest_name: guestName || null,
      guest_phone: guestPhone || null,
      guest_email: guestEmail || null,
      notes: notes || null,
      pre_arrival_requested: preArrivalRequested || false,
      post_departure_requested: postDepartureRequested || false,
      created_by_id: userData.id,
    }

    const { data, error } = await supabase
      .from('lwp_occupancy_calendar')
      .insert(occupancyData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create service requests if pre-arrival or post-departure requested
    if (preArrivalRequested) {
      await supabase.from('lwp_service_requests').insert({
        property_id: propertyId,
        requested_by_id: userData.id,
        request_type: 'pre_arrival',
        title: `Pre-Arrival Service for ${guestName || 'Owner'}`,
        preferred_date: startDate,
        status: 'pending',
        notes: `Occupancy: ${startDate} to ${endDate}`,
      })
    }

    if (postDepartureRequested) {
      await supabase.from('lwp_service_requests').insert({
        property_id: propertyId,
        requested_by_id: userData.id,
        request_type: 'post_departure',
        title: `Post-Departure Service after ${guestName || 'Owner'}`,
        preferred_date: endDate,
        status: 'pending',
        notes: `Occupancy: ${startDate} to ${endDate}`,
      })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Occupancy POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/occupancy - Update an occupancy event
export async function PATCH(request: NextRequest) {
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
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('lwp_occupancy_calendar')
      .select('property:lwp_properties!property_id(owner_id)')
      .eq('id', id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Occupancy event not found' }, { status: 404 })
    }

    const property = Array.isArray(existing.property)
      ? existing.property[0]
      : existing.property

    if (userData.role === 'customer' && property?.owner_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (updates.occupancyType !== undefined) updateData.occupancy_type = updates.occupancyType
    if (updates.startDate !== undefined) updateData.start_date = updates.startDate
    if (updates.endDate !== undefined) updateData.end_date = updates.endDate
    if (updates.guestName !== undefined) updateData.guest_name = updates.guestName
    if (updates.guestPhone !== undefined) updateData.guest_phone = updates.guestPhone
    if (updates.guestEmail !== undefined) updateData.guest_email = updates.guestEmail
    if (updates.notes !== undefined) updateData.notes = updates.notes

    const { data, error } = await supabase
      .from('lwp_occupancy_calendar')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Occupancy PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/occupancy - Delete an occupancy event
export async function DELETE(request: NextRequest) {
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
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('lwp_occupancy_calendar')
      .select('property:lwp_properties!property_id(owner_id)')
      .eq('id', parseInt(id))
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Occupancy event not found' }, { status: 404 })
    }

    const property = Array.isArray(existing.property)
      ? existing.property[0]
      : existing.property

    if (userData.role === 'customer' && property?.owner_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await supabase
      .from('lwp_occupancy_calendar')
      .delete()
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Occupancy DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
