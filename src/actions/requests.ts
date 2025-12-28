'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ServiceRequest {
  id: number
  property_id: number
  requested_by_id: number
  assigned_to_id: number | null
  request_type: string
  title: string
  description: string | null
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'pending' | 'approved' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  preferred_date: string | null
  preferred_time_start: string | null
  preferred_time_end: string | null
  scheduled_date: string | null
  scheduled_time: string | null
  completed_at: string | null
  completion_notes: string | null
  estimated_cost: number | null
  actual_cost: number | null
  created_at: string
  updated_at: string
  // Joined
  property?: {
    id: number
    name: string
    street: string
    city: string
  }
  requested_by?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  assigned_to?: {
    id: number
    first_name: string
    last_name: string
  }
}

// Get customer's service requests
export async function getCustomerRequests(propertyId?: number) {
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

  let query = supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .eq('requested_by_id', userData.id)
    .order('created_at', { ascending: false })

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get single service request for customer
export async function getCustomerRequest(requestId: number) {
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

  const { data, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .eq('id', requestId)
    .eq('requested_by_id', userData.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Create service request (customer)
export async function createServiceRequest(formData: FormData) {
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

  // Verify the property belongs to the customer
  const propertyId = parseInt(formData.get('property_id') as string)
  const { data: property } = await supabase
    .from('lwp_properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .single()

  if (!property || property.owner_id !== userData.id) {
    return { error: 'Property not found', success: false }
  }

  const requestData = {
    property_id: propertyId,
    requested_by_id: userData.id,
    request_type: formData.get('request_type') as string,
    title: formData.get('title') as string,
    description: formData.get('description') as string || null,
    priority: (formData.get('priority') as string) || 'normal',
    preferred_date: formData.get('preferred_date') as string || null,
    preferred_time_start: formData.get('preferred_time_start') as string || null,
    preferred_time_end: formData.get('preferred_time_end') as string || null,
    status: 'pending',
  }

  const { data, error } = await supabase
    .from('lwp_service_requests')
    .insert(requestData)
    .select()
    .single()

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/requests')
  return { error: null, success: true, data }
}

// Get all service requests (admin)
export async function getAllRequests(filters?: {
  status?: string
  priority?: string
  assignedTo?: number
  propertyId?: number
}) {
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
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      requested_by:lwp_users!requested_by_id(id, first_name, last_name, email),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.assignedTo) {
    query = query.eq('assigned_to_id', filters.assignedTo)
  }
  if (filters?.propertyId) {
    query = query.eq('property_id', filters.propertyId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get single request (admin)
export async function getRequest(requestId: number) {
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

  const { data, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip,
        owner:lwp_users!owner_id(first_name, last_name, phone, email)
      ),
      requested_by:lwp_users!requested_by_id(id, first_name, last_name, email, phone),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .eq('id', requestId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Update service request (admin)
export async function updateRequest(requestId: number, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    return { error: 'Unauthorized', success: false }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Only update fields that are provided
  const fields = ['status', 'priority', 'assigned_to_id', 'scheduled_date', 'scheduled_time', 'estimated_cost', 'completion_notes']
  for (const field of fields) {
    const value = formData.get(field)
    if (value !== null && value !== '') {
      if (field === 'assigned_to_id' || field === 'estimated_cost') {
        updateData[field] = parseFloat(value as string)
      } else {
        updateData[field] = value
      }
    }
  }

  // Handle completion
  if (formData.get('status') === 'completed' && !formData.get('completed_at')) {
    updateData.completed_at = new Date().toISOString()
    const actualCost = formData.get('actual_cost')
    if (actualCost) {
      updateData.actual_cost = parseFloat(actualCost as string)
    }
  }

  const { error } = await supabase
    .from('lwp_service_requests')
    .update(updateData)
    .eq('id', requestId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/requests')
  revalidatePath(`/manage/requests/${requestId}`)
  return { error: null, success: true }
}

// Get technician's assigned requests
export async function getTechnicianRequests() {
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

  if (!userData || !['admin', 'staff', 'technician'].includes(userData.role)) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip,
        owner:lwp_users!owner_id(first_name, last_name, phone)
      )
    `)
    .eq('assigned_to_id', userData.id)
    .in('status', ['approved', 'scheduled', 'in_progress'])
    .order('scheduled_date', { ascending: true })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Start working on request (technician)
export async function startRequest(requestId: number) {
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

  const { error } = await supabase
    .from('lwp_service_requests')
    .update({
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('assigned_to_id', userData.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/field/requests')
  return { error: null, success: true }
}

// Complete request (technician)
export async function completeRequest(requestId: number, notes?: string) {
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

  const { error } = await supabase
    .from('lwp_service_requests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      completion_notes: notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('assigned_to_id', userData.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/field/requests')
  return { error: null, success: true }
}

// Cancel request (customer)
export async function cancelRequest(requestId: number) {
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

  // Only allow cancelling pending requests
  const { error } = await supabase
    .from('lwp_service_requests')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', requestId)
    .eq('requested_by_id', userData.id)
    .eq('status', 'pending')

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/requests')
  return { error: null, success: true }
}
