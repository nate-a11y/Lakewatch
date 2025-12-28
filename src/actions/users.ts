'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface User {
  id: number
  email: string
  role: 'admin' | 'staff' | 'technician' | 'customer'
  first_name: string | null
  last_name: string | null
  phone: string | null
  supabase_id: string | null
  stripe_customer_id: string | null
  notification_email: boolean
  notification_sms: boolean
  notification_push: boolean
  created_at: string
  updated_at: string
}

// Get current user
export async function getCurrentUser() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_users')
    .select('*')
    .eq('supabase_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Update current user profile
export async function updateProfile(formData: FormData) {
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

  const updateData = {
    first_name: formData.get('first_name') as string || null,
    last_name: formData.get('last_name') as string || null,
    phone: formData.get('phone') as string || null,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('lwp_users')
    .update(updateData)
    .eq('id', userData.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/settings')
  revalidatePath('/field')
  return { error: null, success: true }
}

// Update notification preferences
export async function updateNotificationPreferences(formData: FormData) {
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

  const updateData = {
    notification_email: formData.get('notification_email') === 'true',
    notification_sms: formData.get('notification_sms') === 'true',
    notification_push: formData.get('notification_push') === 'true',
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase
    .from('lwp_users')
    .update(updateData)
    .eq('id', userData.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/portal/settings')
  return { error: null, success: true }
}

// Get all customers (admin)
export async function getAllCustomers() {
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
    .from('lwp_users')
    .select('*')
    .eq('role', 'customer')
    .order('last_name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get customer with properties (admin)
export async function getCustomer(customerId: number) {
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
    .from('lwp_users')
    .select('*')
    .eq('id', customerId)
    .eq('role', 'customer')
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get customer's properties
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select(`
      *,
      service_plan:lwp_service_plans!service_plan_id(id, name)
    `)
    .eq('owner_id', customerId)

  // Get recent invoices
  const { data: invoices } = await supabase
    .from('lwp_invoices')
    .select('id, invoice_number, status, total, due_date')
    .eq('customer_id', customerId)
    .order('issue_date', { ascending: false })
    .limit(5)

  return {
    error: null,
    data: {
      ...data,
      properties: properties || [],
      recent_invoices: invoices || []
    }
  }
}

// Get all team members (admin)
export async function getAllTeamMembers() {
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

  if (!userData || userData.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_users')
    .select('*')
    .in('role', ['admin', 'staff', 'technician'])
    .order('role')
    .order('last_name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get team member with stats (admin)
export async function getTeamMember(memberId: number) {
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

  if (!userData || userData.role !== 'admin') {
    return { error: 'Unauthorized', data: null }
  }

  const { data, error } = await supabase
    .from('lwp_users')
    .select('*')
    .eq('id', memberId)
    .in('role', ['admin', 'staff', 'technician'])
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get inspection stats
  const { data: inspectionStats } = await supabase
    .from('lwp_inspections')
    .select('id, status')
    .eq('technician_id', memberId)

  const stats = {
    total_inspections: inspectionStats?.length || 0,
    completed: inspectionStats?.filter(i => i.status === 'completed').length || 0,
    scheduled: inspectionStats?.filter(i => i.status === 'scheduled').length || 0,
  }

  // Get recent inspections
  const { data: recentInspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status, overall_status,
      property:lwp_properties!property_id(name)
    `)
    .eq('technician_id', memberId)
    .order('scheduled_date', { ascending: false })
    .limit(10)

  return {
    error: null,
    data: {
      ...data,
      stats,
      recent_inspections: recentInspections || []
    }
  }
}

// Update team member role (admin)
export async function updateTeamMemberRole(memberId: number, role: string) {
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

  // Prevent changing own role
  if (userData.id === memberId) {
    return { error: 'Cannot change your own role', success: false }
  }

  const { error } = await supabase
    .from('lwp_users')
    .update({
      role,
      updated_at: new Date().toISOString(),
    })
    .eq('id', memberId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/team')
  return { error: null, success: true }
}

// Get technicians for assignment dropdowns
export async function getTechnicians() {
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
    .from('lwp_users')
    .select('id, first_name, last_name, email')
    .in('role', ['admin', 'staff', 'technician'])
    .order('first_name')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get notifications for current user
export async function getNotifications(limit = 20) {
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
    .from('lwp_notifications')
    .select('*')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Mark notification as read
export async function markNotificationRead(notificationId: number) {
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
    .from('lwp_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', userData.id)

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
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
    .from('lwp_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userData.id)
    .is('read_at', null)

  if (error) {
    return { error: error.message, success: false }
  }

  return { error: null, success: true }
}
