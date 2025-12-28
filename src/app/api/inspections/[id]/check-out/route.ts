import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
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

    // Get inspection
    const { data: inspection } = await supabase
      .from('lwp_inspections')
      .select('id, technician_id, status')
      .eq('id', parseInt(id))
      .single()

    if (!inspection) {
      return NextResponse.json({ error: 'Inspection not found' }, { status: 404 })
    }

    // Check access
    const isAdmin = ['admin', 'owner', 'staff'].includes(userData.role)
    const isTechnician = inspection.technician_id === userData.id

    if (!isAdmin && !isTechnician) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (inspection.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Inspection is not in progress' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { latitude, longitude } = body

    const now = new Date().toISOString()

    const updateData: Record<string, unknown> = {
      check_out_time: now,
      updated_at: now,
    }

    if (latitude !== undefined) updateData.check_out_lat = latitude
    if (longitude !== undefined) updateData.check_out_lng = longitude

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
    console.error('Check-out error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
