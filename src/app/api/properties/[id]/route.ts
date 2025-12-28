import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress } from '@/lib/maps'

// GET /api/properties/[id] - Get a specific property
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

    const { data: property, error } = await supabase
      .from('lwp_properties')
      .select(`
        *,
        owner:lwp_users!owner_id(id, first_name, last_name, email, phone),
        service_plan:lwp_service_plans!service_plan_id(*)
      `)
      .eq('id', parseInt(id))
      .single()

    if (error || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check access - customers can only view their own properties
    if (userData.role === 'customer' && property.owner_id !== userData.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ data: property })
  } catch (error) {
    console.error('Property GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/properties/[id] - Update a property
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

    // Get existing property
    const { data: existingProperty } = await supabase
      .from('lwp_properties')
      .select('owner_id')
      .eq('id', parseInt(id))
      .single()

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // Check access
    if (
      userData.role === 'customer' &&
      existingProperty.owner_id !== userData.id
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      street,
      city,
      state,
      zip,
      servicePlanId,
      accessInfo,
      emergencyContacts,
      utilityInfo,
      notes,
      status,
    } = body

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (name !== undefined) updateData.name = name
    if (street !== undefined) updateData.street = street
    if (city !== undefined) updateData.city = city
    if (state !== undefined) updateData.state = state
    if (zip !== undefined) updateData.zip = zip
    if (servicePlanId !== undefined) updateData.service_plan_id = servicePlanId
    if (accessInfo !== undefined) updateData.access_info = accessInfo
    if (emergencyContacts !== undefined) updateData.emergency_contacts = emergencyContacts
    if (utilityInfo !== undefined) updateData.utility_info = utilityInfo
    if (notes !== undefined) updateData.notes = notes

    // Only admin can change status
    if (status !== undefined && ['admin', 'owner', 'staff'].includes(userData.role)) {
      updateData.status = status
    }

    // Re-geocode if address changed
    if (street || city || state || zip) {
      const { data: currentProperty } = await supabase
        .from('lwp_properties')
        .select('street, city, state, zip')
        .eq('id', parseInt(id))
        .single()

      if (currentProperty) {
        const newStreet = street || currentProperty.street
        const newCity = city || currentProperty.city
        const newState = state || currentProperty.state
        const newZip = zip || currentProperty.zip
        const fullAddress = `${newStreet}, ${newCity}, ${newState} ${newZip}`

        try {
          const geocoded = await geocodeAddress(fullAddress)
          if (geocoded) {
            updateData.latitude = geocoded.coordinates.latitude
            updateData.longitude = geocoded.coordinates.longitude
          }
        } catch (geoError) {
          console.error('Geocoding failed:', geoError)
        }
      }
    }

    const { data, error } = await supabase
      .from('lwp_properties')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Property PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/properties/[id] - Delete a property (admin only)
export async function DELETE(
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

    if (!userData || !['admin', 'owner'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Soft delete by setting status to inactive
    const { error } = await supabase
      .from('lwp_properties')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', parseInt(id))

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Property DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
