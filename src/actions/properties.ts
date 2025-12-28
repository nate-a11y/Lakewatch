'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Property {
  id: number
  name: string
  owner_id: number
  service_plan_id: number | null
  status: string
  property_type: string
  street: string
  city: string
  state: string
  zip: string
  square_footage: number | null
  year_built: number | null
  bedrooms: number | null
  bathrooms: number | null
  gate_code: string | null
  lockbox_code: string | null
  alarm_code: string | null
  alarm_company: string | null
  wifi_network: string | null
  wifi_password: string | null
  special_instructions: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
  updated_at: string
  // Joined data
  owner?: {
    id: number
    email: string
    first_name: string | null
    last_name: string | null
    phone: string | null
  }
  service_plan?: {
    id: number
    name: string
    inspection_frequency: string
  }
  next_inspection?: {
    id: number
    scheduled_date: string
    status: string
  }
}

export interface PropertyContact {
  id: number
  name: string
  phone: string
  relationship: string | null
}

export interface PropertyUtility {
  id: number
  utility_type: string
  provider: string
  account_number: string | null
  phone: string | null
}

// Get all properties for a customer
export async function getCustomerProperties() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // First get the user's internal ID
  const { data: userData, error: userError } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user.id)
    .single()

  if (userError || !userData) {
    return { error: 'User not found', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_properties')
    .select(`
      *,
      service_plan:lwp_service_plans(id, name, inspection_frequency)
    `)
    .eq('owner_id', userData.id)
    .order('name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get single property by ID (for customer)
export async function getCustomerProperty(propertyId: number) {
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
    .from('lwp_properties')
    .select(`
      *,
      service_plan:lwp_service_plans(id, name, inspection_frequency, base_price, features)
    `)
    .eq('id', propertyId)
    .eq('owner_id', userData.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get contacts
  const { data: contacts } = await supabase
    .from('lwp_properties_contacts')
    .select('*')
    .eq('_parent_id', propertyId)
    .order('_order')

  // Get utilities
  const { data: utilities } = await supabase
    .from('lwp_properties_utilities')
    .select('*')
    .eq('_parent_id', propertyId)
    .order('_order')

  return {
    error: null,
    data: {
      ...data,
      contacts: contacts || [],
      utilities: utilities || []
    }
  }
}

// Get all properties (admin)
export async function getAllProperties() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Verify admin/staff role
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_properties')
    .select(`
      *,
      owner:lwp_users!owner_id(id, email, first_name, last_name, phone),
      service_plan:lwp_service_plans(id, name, inspection_frequency)
    `)
    .order('name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get single property (admin)
export async function getProperty(propertyId: number) {
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
    .from('lwp_properties')
    .select(`
      *,
      owner:lwp_users!owner_id(id, email, first_name, last_name, phone),
      service_plan:lwp_service_plans(id, name, inspection_frequency, base_price, features)
    `)
    .eq('id', propertyId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get contacts
  const { data: contacts } = await supabase
    .from('lwp_properties_contacts')
    .select('*')
    .eq('_parent_id', propertyId)
    .order('_order')

  // Get utilities
  const { data: utilities } = await supabase
    .from('lwp_properties_utilities')
    .select('*')
    .eq('_parent_id', propertyId)
    .order('_order')

  // Get recent inspections
  const { data: recentInspections } = await supabase
    .from('lwp_inspections')
    .select('id, scheduled_date, status, overall_status')
    .eq('property_id', propertyId)
    .order('scheduled_date', { ascending: false })
    .limit(5)

  return {
    error: null,
    data: {
      ...data,
      contacts: contacts || [],
      utilities: utilities || [],
      recent_inspections: recentInspections || []
    }
  }
}

// Create property
export async function createProperty(formData: FormData) {
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

  const propertyData = {
    name: formData.get('name') as string,
    owner_id: parseInt(formData.get('owner_id') as string),
    service_plan_id: formData.get('service_plan_id') ? parseInt(formData.get('service_plan_id') as string) : null,
    property_type: formData.get('property_type') as string,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string || 'MO',
    zip: formData.get('zip') as string,
    square_footage: formData.get('square_footage') ? parseInt(formData.get('square_footage') as string) : null,
    year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string) : null,
    bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
    bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms') as string) : null,
    gate_code: formData.get('gate_code') as string || null,
    lockbox_code: formData.get('lockbox_code') as string || null,
    alarm_code: formData.get('alarm_code') as string || null,
    alarm_company: formData.get('alarm_company') as string || null,
    wifi_network: formData.get('wifi_network') as string || null,
    wifi_password: formData.get('wifi_password') as string || null,
    special_instructions: formData.get('special_instructions') as string || null,
  }

  const { data, error } = await supabase
    .from('lwp_properties')
    .insert(propertyData)
    .select()
    .single()

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/properties')
  return { error: null, success: true, data }
}

// Update property
export async function updateProperty(propertyId: number, formData: FormData) {
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

  const propertyData = {
    name: formData.get('name') as string,
    service_plan_id: formData.get('service_plan_id') ? parseInt(formData.get('service_plan_id') as string) : null,
    status: formData.get('status') as string || 'active',
    property_type: formData.get('property_type') as string,
    street: formData.get('street') as string,
    city: formData.get('city') as string,
    state: formData.get('state') as string || 'MO',
    zip: formData.get('zip') as string,
    square_footage: formData.get('square_footage') ? parseInt(formData.get('square_footage') as string) : null,
    year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string) : null,
    bedrooms: formData.get('bedrooms') ? parseInt(formData.get('bedrooms') as string) : null,
    bathrooms: formData.get('bathrooms') ? parseFloat(formData.get('bathrooms') as string) : null,
    gate_code: formData.get('gate_code') as string || null,
    lockbox_code: formData.get('lockbox_code') as string || null,
    alarm_code: formData.get('alarm_code') as string || null,
    alarm_company: formData.get('alarm_company') as string || null,
    wifi_network: formData.get('wifi_network') as string || null,
    wifi_password: formData.get('wifi_password') as string || null,
    special_instructions: formData.get('special_instructions') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('lwp_properties')
    .update(propertyData)
    .eq('id', propertyId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/properties')
  revalidatePath(`/manage/properties/${propertyId}`)
  return { error: null, success: true }
}

// Delete property
export async function deleteProperty(propertyId: number) {
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

  if (!userData || userData.role !== 'admin') {
    return { error: 'Unauthorized', success: false }
  }

  const { error } = await supabase
    .from('lwp_properties')
    .delete()
    .eq('id', propertyId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/properties')
  return { error: null, success: true }
}

// Get properties for technician (assigned via inspections or service requests)
export async function getTechnicianProperties() {
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

  // First get the property IDs from inspections assigned to this technician
  const { data: inspections, error: inspError } = await supabase
    .from('lwp_inspections')
    .select('property_id')
    .eq('technician_id', userData.id)

  if (inspError) {
    return { error: inspError.message, data: null }
  }

  if (!inspections || inspections.length === 0) {
    return { error: null, data: [] }
  }

  const propertyIds = [...new Set(inspections.map(i => i.property_id))]

  // Get properties that have inspections assigned to this technician
  const { data, error } = await supabase
    .from('lwp_properties')
    .select(`
      *,
      owner:lwp_users!owner_id(id, first_name, last_name, phone)
    `)
    .in('id', propertyIds)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
