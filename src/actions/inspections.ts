'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Inspection {
  id: number
  property_id: number
  technician_id: number | null
  checklist_id: number | null
  scheduled_date: string
  scheduled_time: string | null
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'missed'
  check_in_time: string | null
  check_out_time: string | null
  weather_temp: number | null
  weather_conditions: string | null
  overall_status: 'good' | 'attention' | 'critical' | null
  summary: string | null
  internal_notes: string | null
  created_at: string
  // Joined
  property?: {
    id: number
    name: string
    street: string
    city: string
    owner: {
      first_name: string
      last_name: string
    }
  }
  technician?: {
    id: number
    first_name: string
    last_name: string
  }
  checklist?: {
    id: number
    name: string
  }
  responses?: InspectionResponse[]
  issues?: InspectionIssue[]
}

export interface InspectionResponse {
  id: number
  category: string
  item: string
  response: 'pass' | 'fail' | 'attention' | 'na'
  notes: string | null
  photo_ids: string[] | null
}

export interface InspectionIssue {
  id: number
  title: string
  description: string | null
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: string | null
  resolution_status: 'open' | 'in_progress' | 'resolved'
  resolution_notes: string | null
  photo_ids: string[] | null
}

// Get inspections for a customer's property
export async function getCustomerInspections(propertyId?: number) {
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
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city, owner_id),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .order('scheduled_date', { ascending: false })

  if (propertyId) {
    query = query.eq('property_id', propertyId)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  // Filter to only the customer's properties
  const customerInspections = data?.filter(
    (i: Inspection & { property?: { owner_id: number } }) => i.property?.owner_id === userData.id
  )

  return { error: null, data: customerInspections }
}

// Get single inspection for customer
export async function getCustomerInspection(inspectionId: number) {
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
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city, owner_id),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .eq('id', inspectionId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Verify ownership
  if ((data as Inspection & { property?: { owner_id: number } }).property?.owner_id !== userData.id) {
    return { error: 'Unauthorized', data: null }
  }

  // Get responses
  const { data: responses } = await supabase
    .from('lwp_inspections_responses')
    .select('*')
    .eq('_parent_id', inspectionId)
    .order('_order')

  // Get issues
  const { data: issues } = await supabase
    .from('lwp_inspections_issues')
    .select('*')
    .eq('_parent_id', inspectionId)
    .order('_order')

  return {
    error: null,
    data: {
      ...data,
      responses: responses || [],
      issues: issues || []
    }
  }
}

// Get all inspections (admin)
export async function getAllInspections(filters?: {
  status?: string
  technicianId?: number
  propertyId?: number
  dateFrom?: string
  dateTo?: string
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
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .order('scheduled_date', { ascending: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.technicianId) {
    query = query.eq('technician_id', filters.technicianId)
  }
  if (filters?.propertyId) {
    query = query.eq('property_id', filters.propertyId)
  }
  if (filters?.dateFrom) {
    query = query.gte('scheduled_date', filters.dateFrom)
  }
  if (filters?.dateTo) {
    query = query.lte('scheduled_date', filters.dateTo)
  }

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get technician's today schedule
export async function getTechnicianSchedule(date?: string) {
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

  const targetDate = date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip,
        gate_code, lockbox_code, alarm_code, wifi_network, wifi_password,
        special_instructions,
        owner:lwp_users!owner_id(first_name, last_name, phone)
      ),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .eq('technician_id', userData.id)
    .eq('scheduled_date', targetDate)
    .order('scheduled_time')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get technician's inspection history
export async function getTechnicianHistory(limit = 20) {
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
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .eq('technician_id', userData.id)
    .eq('status', 'completed')
    .order('check_out_time', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Check in to inspection
export async function checkInToInspection(inspectionId: number, gpsData?: { lat: number, lng: number }) {
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

  if (!userData || !['admin', 'staff', 'technician'].includes(userData.role)) {
    return { error: 'Unauthorized', success: false }
  }

  // Verify this inspection is assigned to this technician
  const { data: inspection } = await supabase
    .from('lwp_inspections')
    .select('id, technician_id, status')
    .eq('id', inspectionId)
    .single()

  if (!inspection) {
    return { error: 'Inspection not found', success: false }
  }

  if (inspection.technician_id !== userData.id && userData.role !== 'admin') {
    return { error: 'This inspection is not assigned to you', success: false }
  }

  if (inspection.status !== 'scheduled') {
    return { error: 'Inspection is not in scheduled status', success: false }
  }

  const { error } = await supabase
    .from('lwp_inspections')
    .update({
      status: 'in_progress',
      check_in_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspectionId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/field')
  return { error: null, success: true }
}

// Submit inspection response
export async function submitInspectionResponse(
  inspectionId: number,
  responses: Array<{
    checklist_item_id?: number
    category: string
    item: string
    response: 'pass' | 'fail' | 'attention' | 'na'
    notes?: string
    photo_ids?: string[]
  }>
) {
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

  // Delete existing responses and insert new ones
  await supabase
    .from('lwp_inspections_responses')
    .delete()
    .eq('_parent_id', inspectionId)

  const responsesToInsert = responses.map((r, i) => ({
    _parent_id: inspectionId,
    _order: i,
    checklist_item_id: r.checklist_item_id || null,
    category: r.category,
    item: r.item,
    response: r.response,
    notes: r.notes || null,
    photo_ids: r.photo_ids || null,
  }))

  const { error } = await supabase
    .from('lwp_inspections_responses')
    .insert(responsesToInsert)

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

// Complete inspection
export async function completeInspection(
  inspectionId: number,
  data: {
    overall_status: 'good' | 'attention' | 'critical'
    summary: string
    internal_notes?: string
    issues?: Array<{
      title: string
      description?: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      category?: string
      photo_ids?: string[]
    }>
  }
) {
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

  // Update inspection
  const { error: updateError } = await supabase
    .from('lwp_inspections')
    .update({
      status: 'completed',
      check_out_time: new Date().toISOString(),
      overall_status: data.overall_status,
      summary: data.summary,
      internal_notes: data.internal_notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', inspectionId)

  if (updateError) {
    return { error: updateError.message, success: false }
  }

  // Insert issues if any
  if (data.issues && data.issues.length > 0) {
    const issuesToInsert = data.issues.map((issue, i) => ({
      _parent_id: inspectionId,
      _order: i,
      title: issue.title,
      description: issue.description || null,
      severity: issue.severity,
      category: issue.category || null,
      resolution_status: 'open',
      photo_ids: issue.photo_ids || null,
    }))

    await supabase
      .from('lwp_inspections_issues')
      .insert(issuesToInsert)
  }

  revalidatePath('/field')
  revalidatePath('/field/history')
  return { error: null, success: true }
}

// Schedule inspection (admin)
export async function scheduleInspection(formData: FormData) {
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

  const inspectionData = {
    property_id: parseInt(formData.get('property_id') as string),
    technician_id: formData.get('technician_id') ? parseInt(formData.get('technician_id') as string) : null,
    checklist_id: formData.get('checklist_id') ? parseInt(formData.get('checklist_id') as string) : null,
    scheduled_date: formData.get('scheduled_date') as string,
    scheduled_time: formData.get('scheduled_time') as string || null,
    status: 'scheduled',
  }

  const { data, error } = await supabase
    .from('lwp_inspections')
    .insert(inspectionData)
    .select()
    .single()

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/schedule')
  revalidatePath('/manage/inspections')
  return { error: null, success: true, data }
}

// Get checklist with items
export async function getChecklist(checklistId: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lwp_checklists')
    .select('*')
    .eq('id', checklistId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  const { data: items } = await supabase
    .from('lwp_checklists_items')
    .select('*')
    .eq('_parent_id', checklistId)
    .order('_order')

  return {
    error: null,
    data: {
      ...data,
      items: items || []
    }
  }
}

// Get all checklists
export async function getAllChecklists() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lwp_checklists')
    .select('*')
    .order('name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
