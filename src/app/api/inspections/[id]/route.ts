import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inspections/[id] - Get a specific inspection
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const { data: inspection, error } = await supabase
      .from('lwp_inspections')
      .select(`
        *,
        property:lwp_properties!property_id(*),
        technician:lwp_users!technician_id(id, first_name, last_name, email, phone),
        checklist:lwp_checklists!checklist_id(*)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error || !inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Check access
    const property = Array.isArray(inspection.property)
      ? inspection.property[0]
      : inspection.property

    if (userData.role === 'customer' && property?.owner_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (userData.role === 'technician' && inspection.technician_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark as viewed by customer if applicable
    if (userData.role === 'customer' && !inspection.customer_viewed) {
      await supabase
        .from('lwp_inspections')
        .update({
          customer_viewed: true,
          customer_viewed_at: new Date().toISOString(),
        })
        .eq('id', parseInt(id))
    }

    return NextResponse.json({ data: inspection })
  } catch (error) {
    console.error('Inspection GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/inspections/[id] - Update an inspection
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get existing inspection
    const { data: existingInspection } = await supabase
      .from('lwp_inspections')
      .select('technician_id, status')
      .eq('id', parseInt(id))
      .single()

    if (!existingInspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Check access
    const isAdmin = ['admin', 'owner', 'staff'].includes(userData.role)
    const isTechnician = userData.role === 'technician' && existingInspection.technician_id === userData.id

    if (!isAdmin && !isTechnician) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      technicianId,
      scheduledDate,
      scheduledTimeStart,
      scheduledTimeEnd,
      checklistId,
      status,
      checklistResponses,
      summary,
      issuesFound,
      weather,
      notes,
    } = body

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    // Admin-only fields
    if (isAdmin) {
      if (technicianId !== undefined) updateData.technician_id = technicianId
      if (scheduledDate !== undefined) updateData.scheduled_date = scheduledDate
      if (scheduledTimeStart !== undefined) updateData.scheduled_time_start = scheduledTimeStart
      if (scheduledTimeEnd !== undefined) updateData.scheduled_time_end = scheduledTimeEnd
      if (checklistId !== undefined) updateData.checklist_id = checklistId
    }

    // Fields technician can update
    if (status !== undefined) updateData.status = status
    if (checklistResponses !== undefined) updateData.checklist_responses = checklistResponses
    if (summary !== undefined) updateData.summary = summary
    if (issuesFound !== undefined) updateData.issues_found = issuesFound
    if (weather !== undefined) updateData.weather = weather
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('lwp_inspections')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Inspection PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
