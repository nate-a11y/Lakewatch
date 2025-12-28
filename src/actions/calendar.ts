'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface OccupancyEvent {
  id: number
  property_id: number
  event_type: 'owner_visit' | 'guest_visit' | 'rental' | 'maintenance' | 'vacant'
  title: string | null
  start_date: string
  end_date: string
  guest_count: number | null
  notes: string | null
  pre_arrival_request_id: number | null
  post_departure_request_id: number | null
  created_by_id: number | null
  created_at: string
  // Joined
  property?: {
    id: number
    name: string
  }
  pre_arrival_request?: {
    id: number
    status: string
  }
  post_departure_request?: {
    id: number
    status: string
  }
}

// Get customer's calendar events
export async function getCustomerCalendarEvents(
  propertyId?: number,
  startDate?: string,
  endDate?: string
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user.id)
    .single()

  if (!userData) {
    return { error: 'User not found', data: null }
  }

  // Get user's properties first
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id')
    .eq('owner_id', userData.id)

  if (!properties || properties.length === 0) {
    return { error: null, data: [] }
  }

  const propertyIds = properties.map(p => p.id)

  let query = supabase
    .from('lwp_occupancy_calendar')
    .select(`
      *,
      property:lwp_properties!property_id(id, name),
      pre_arrival_request:lwp_service_requests!pre_arrival_request_id(id, status),
      post_departure_request:lwp_service_requests!post_departure_request_id(id, status)
    `)
    .in('property_id', propertyIds)
    .order('start_date')

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }
  if (startDate) {
    query = query.gte('end_date', startDate)
  }
  if (endDate) {
    query = query.lte('start_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create calendar event (customer)
export async function createCalendarEvent(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user.id)
    .single()

  if (!userData) {
    return { error: 'User not found', success: false }
  }

  const propertyId = parseInt(formData.get('property_id') as string)

  // Verify property ownership
  const { data: property } = await supabase
    .from('lwp_properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .single()

  if (!property || property.owner_id !== userData.id) {
    return { error: 'Property not found', success: false }
  }

  const eventData = {
    property_id: propertyId,
    event_type: formData.get('event_type') as string,
    title: formData.get('title') as string || null,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    guest_count: formData.get('guest_count')
      ? parseInt(formData.get('guest_count') as string)
      : null,
    notes: formData.get('notes') as string || null,
    created_by_id: userData.id,
  }

  const { data, error } = await supabase
    .from('lwp_occupancy_calendar')
    .insert(eventData)
    .select()
    .single()

  if (error) {
    return { error: error.message, success: false }
  }

  // If pre-arrival is requested, create a service request
  if (formData.get('request_pre_arrival') === 'true') {
    const { data: preArrivalRequest } = await supabase
      .from('lwp_service_requests')
      .insert({
        property_id: propertyId,
        requested_by_id: userData.id,
        request_type: 'pre_arrival',
        title: `Pre-Arrival Preparation for ${formData.get('start_date')}`,
        description: formData.get('pre_arrival_notes') as string || null,
        priority: 'normal',
        preferred_date: formData.get('start_date') as string,
        status: 'pending',
      })
      .select()
      .single()

    if (preArrivalRequest) {
      await supabase
        .from('lwp_occupancy_calendar')
        .update({ pre_arrival_request_id: preArrivalRequest.id })
        .eq('id', data.id)
    }
  }

  // If post-departure is requested, create a service request
  if (formData.get('request_post_departure') === 'true') {
    const { data: postDepartureRequest } = await supabase
      .from('lwp_service_requests')
      .insert({
        property_id: propertyId,
        requested_by_id: userData.id,
        request_type: 'post_departure',
        title: `Post-Departure Closing for ${formData.get('end_date')}`,
        description: formData.get('post_departure_notes') as string || null,
        priority: 'normal',
        preferred_date: formData.get('end_date') as string,
        status: 'pending',
      })
      .select()
      .single()

    if (postDepartureRequest) {
      await supabase
        .from('lwp_occupancy_calendar')
        .update({ post_departure_request_id: postDepartureRequest.id })
        .eq('id', data.id)
    }
  }

  revalidatePath('/portal/calendar')
  return { error: null, success: true, data }
}

// Update calendar event (customer)
export async function updateCalendarEvent(eventId: number, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user.id)
    .single()

  if (!userData) {
    return { error: 'User not found', success: false }
  }

  // Get the event and verify ownership
  const { data: event } = await supabase
    .from('lwp_occupancy_calendar')
    .select('id, property_id')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { error: 'Event not found', success: false }
  }

  const { data: property } = await supabase
    .from('lwp_properties')
    .select('id, owner_id')
    .eq('id', event.property_id)
    .single()

  if (!property || property.owner_id !== userData.id) {
    return { error: 'Event not found', success: false }
  }

  const updateData = {
    event_type: formData.get('event_type') as string,
    title: formData.get('title') as string || null,
    start_date: formData.get('start_date') as string,
    end_date: formData.get('end_date') as string,
    guest_count: formData.get('guest_count')
      ? parseInt(formData.get('guest_count') as string)
      : null,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('lwp_occupancy_calendar')
    .update(updateData)
    .eq('id', eventId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/calendar')
  return { error: null, success: true }
}

// Delete calendar event (customer)
export async function deleteCalendarEvent(eventId: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user.id)
    .single()

  if (!userData) {
    return { error: 'User not found', success: false }
  }

  // Get the event and verify ownership
  const { data: event } = await supabase
    .from('lwp_occupancy_calendar')
    .select('id, property_id')
    .eq('id', eventId)
    .single()

  if (!event) {
    return { error: 'Event not found', success: false }
  }

  const { data: propertyData } = await supabase
    .from('lwp_properties')
    .select('id, owner_id')
    .eq('id', event.property_id)
    .single()

  if (!propertyData || propertyData.owner_id !== userData.id) {
    return { error: 'Event not found', success: false }
  }

  const { error } = await supabase
    .from('lwp_occupancy_calendar')
    .delete()
    .eq('id', eventId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/calendar')
  return { error: null, success: true }
}

// Get all calendar events (admin)
export async function getAllCalendarEvents(
  startDate?: string,
  endDate?: string,
  propertyId?: number
) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    return { error: 'Unauthorized', data: null }
  }

  let query = supabase
    .from('lwp_occupancy_calendar')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      pre_arrival_request:lwp_service_requests!pre_arrival_request_id(id, status),
      post_departure_request:lwp_service_requests!post_departure_request_id(id, status)
    `)
    .order('start_date')

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }
  if (startDate) {
    query = query.gte('end_date', startDate)
  }
  if (endDate) {
    query = query.lte('start_date', endDate)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get upcoming arrivals (for admin dashboard)
export async function getUpcomingArrivals(days = 7) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    return { error: 'Unauthorized', data: null }
  }

  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  const endDate = futureDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('lwp_occupancy_calendar')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      pre_arrival_request:lwp_service_requests!pre_arrival_request_id(id, status)
    `)
    .gte('start_date', today)
    .lte('start_date', endDate)
    .order('start_date')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get upcoming departures (for admin dashboard)
export async function getUpcomingDepartures(days = 7) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    return { error: 'Unauthorized', data: null }
  }

  const today = new Date().toISOString().split('T')[0]
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + days)
  const endDateStr = futureDate.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('lwp_occupancy_calendar')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      post_departure_request:lwp_service_requests!post_departure_request_id(id, status)
    `)
    .gte('end_date', today)
    .lte('end_date', endDateStr)
    .order('end_date')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
