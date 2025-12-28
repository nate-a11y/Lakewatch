import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { isWithinRadius } from '@/lib/maps'
import { sendTechnicianCheckinSMS } from '@/lib/twilio'

const GEOFENCE_RADIUS_MILES = 0.1 // ~528 feet

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
      .select('id, role, first_name, last_name')
      .eq('supabase_id', user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get inspection with property details
    const { data: inspection } = await supabase
      .from('lwp_inspections')
      .select(`
        id, technician_id, status,
        property:lwp_properties!property_id(id, name, latitude, longitude, owner:lwp_users!owner_id(phone))
      `)
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

    if (inspection.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Inspection is not in scheduled status' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { latitude, longitude } = body

    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'GPS coordinates required' },
        { status: 400 }
      )
    }

    const property = Array.isArray(inspection.property)
      ? inspection.property[0]
      : inspection.property

    // Verify GPS location if property has coordinates
    let locationVerified = false
    if (property?.latitude && property?.longitude) {
      locationVerified = isWithinRadius(
        { latitude, longitude },
        { latitude: property.latitude, longitude: property.longitude },
        GEOFENCE_RADIUS_MILES
      )
    } else {
      // If no property coordinates, accept any location
      locationVerified = true
    }

    const now = new Date().toISOString()

    // Update inspection
    const { data, error } = await supabase
      .from('lwp_inspections')
      .update({
        status: 'in_progress',
        check_in_time: now,
        check_in_lat: latitude,
        check_in_lng: longitude,
        check_in_verified: locationVerified,
        updated_at: now,
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send notification to owner (optional - admin can configure)
    try {
      const ownerData = property?.owner as { phone?: string } | undefined
      if (ownerData?.phone) {
        await sendTechnicianCheckinSMS({
          to: ownerData.phone,
          technicianName: `${userData.first_name} ${userData.last_name}`,
          propertyName: property?.name || 'your property',
          time: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        })
      }
    } catch (smsError) {
      console.error('Failed to send check-in SMS:', smsError)
    }

    return NextResponse.json({
      data,
      locationVerified,
      message: locationVerified
        ? 'Check-in successful'
        : 'Check-in recorded, but location could not be verified',
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
