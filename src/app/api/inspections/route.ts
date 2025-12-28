import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inspections - List inspections
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
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    let query = supabase
      .from('lwp_inspections')
      .select(`
        *,
        property:lwp_properties!property_id(id, name, street, city, owner_id),
        technician:lwp_users!technician_id(id, first_name, last_name)
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
    } else if (userData.role === 'technician') {
      query = query.eq('technician_id', userData.id)
    }

    if (status) {
      query = query.eq('status', status)
    }
    if (propertyId) {
      query = query.eq('property_id', parseInt(propertyId))
    }
    if (startDate) {
      query = query.gte('scheduled_date', startDate)
    }
    if (endDate) {
      query = query.lte('scheduled_date', endDate)
    }

    const { data, error } = await query.order('scheduled_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Inspections GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/inspections - Schedule an inspection (admin only)
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

    if (!userData || !['admin', 'owner', 'staff'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      propertyId,
      technicianId,
      scheduledDate,
      scheduledTimeStart,
      scheduledTimeEnd,
      inspectionType,
      checklistId,
      notes,
    } = body

    if (!propertyId || !scheduledDate || !inspectionType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const inspectionData = {
      property_id: propertyId,
      technician_id: technicianId || null,
      scheduled_date: scheduledDate,
      scheduled_time_start: scheduledTimeStart || null,
      scheduled_time_end: scheduledTimeEnd || null,
      inspection_type: inspectionType,
      checklist_id: checklistId || null,
      notes: notes || null,
      status: technicianId ? 'scheduled' : 'pending',
    }

    const { data, error } = await supabase
      .from('lwp_inspections')
      .insert(inspectionData)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Inspections POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
