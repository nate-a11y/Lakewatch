'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Conversation {
  id: number
  subject: string
  property_id: number | null
  customer_id: number
  status: 'open' | 'closed'
  last_message_at: string | null
  unread_by_customer: boolean
  unread_by_staff: boolean
  created_at: string
  // Joined
  property?: {
    id: number
    name: string
  }
  customer?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  last_message?: Message
}

export interface Message {
  id: number
  conversation_id: number
  sender_id: number
  content: string
  is_internal: boolean
  read_at: string | null
  created_at: string
  // Joined
  sender?: {
    id: number
    first_name: string
    last_name: string
    role: string
  }
  attachments?: Array<{
    id: number
    media_id: number
  }>
}

// Get customer's conversations
export async function getCustomerConversations() {
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
    .from('lwp_conversations')
    .select(`
      *,
      property:lwp_properties!property_id(id, name)
    `)
    .eq('customer_id', userData.id)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get conversation with messages (customer)
export async function getCustomerConversation(conversationId: number) {
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

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .from('lwp_conversations')
    .select(`
      *,
      property:lwp_properties!property_id(id, name)
    `)
    .eq('id', conversationId)
    .eq('customer_id', userData.id)
    .single()

  if (convError) {
    return { error: convError.message, data: null }
  }

  // Get messages (exclude internal messages)
  const { data: messages, error: msgError } = await supabase
    .from('lwp_messages')
    .select(`
      *,
      sender:lwp_users!sender_id(id, first_name, last_name, role)
    `)
    .eq('conversation_id', conversationId)
    .eq('is_internal', false)
    .order('created_at', { ascending: true })

  if (msgError) {
    return { error: msgError.message, data: null }
  }

  // Mark as read by customer
  await supabase
    .from('lwp_conversations')
    .update({ unread_by_customer: false })
    .eq('id', conversationId)

  // Mark individual messages as read
  await supabase
    .from('lwp_messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userData.id)
    .is('read_at', null)

  return {
    error: null,
    data: {
      ...conversation,
      messages: messages || []
    }
  }
}

// Send message (customer)
export async function sendCustomerMessage(conversationId: number, content: string) {
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

  // Verify conversation belongs to customer
  const { data: conversation } = await supabase
    .from('lwp_conversations')
    .select('id, customer_id')
    .eq('id', conversationId)
    .single()

  if (!conversation || conversation.customer_id !== userData.id) {
    return { error: 'Conversation not found', success: false }
  }

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('lwp_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userData.id,
      content,
      is_internal: false,
    })
    .select()
    .single()

  if (msgError) {
    return { error: msgError.message, success: false }
  }

  // Update conversation
  await supabase
    .from('lwp_conversations')
    .update({
      last_message_at: new Date().toISOString(),
      unread_by_staff: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  revalidatePath(`/portal/messages/${conversationId}`)
  return { error: null, success: true, data: message }
}

// Start new conversation (customer)
export async function startConversation(formData: FormData) {
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

  const subject = formData.get('subject') as string
  const message = formData.get('message') as string
  const propertyId = formData.get('property_id')
    ? parseInt(formData.get('property_id') as string)
    : null

  // If property is specified, verify ownership
  if (propertyId) {
    const { data: property } = await supabase
      .from('lwp_properties')
      .select('id, owner_id')
      .eq('id', propertyId)
      .single()

    if (!property || property.owner_id !== userData.id) {
      return { error: 'Property not found', success: false }
    }
  }

  // Create conversation
  const { data: conversation, error: convError } = await supabase
    .from('lwp_conversations')
    .insert({
      subject,
      property_id: propertyId,
      customer_id: userData.id,
      status: 'open',
      last_message_at: new Date().toISOString(),
      unread_by_customer: false,
      unread_by_staff: true,
    })
    .select()
    .single()

  if (convError) {
    return { error: convError.message, success: false }
  }

  // Create first message
  const { error: msgError } = await supabase
    .from('lwp_messages')
    .insert({
      conversation_id: conversation.id,
      sender_id: userData.id,
      content: message,
      is_internal: false,
    })

  if (msgError) {
    return { error: msgError.message, success: false }
  }

  revalidatePath('/portal/messages')
  return { error: null, success: true, data: conversation }
}

// Get all conversations (admin)
export async function getAllConversations(filters?: {
  status?: string
  customerId?: number
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
    .from('lwp_conversations')
    .select(`
      *,
      property:lwp_properties!property_id(id, name),
      customer:lwp_users!customer_id(id, first_name, last_name, email)
    `)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  if (filters?.customerId) {
    query = query.eq('customer_id', filters.customerId)
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

// Get conversation with messages (admin - includes internal messages)
export async function getConversation(conversationId: number) {
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

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .from('lwp_conversations')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city),
      customer:lwp_users!customer_id(id, first_name, last_name, email, phone)
    `)
    .eq('id', conversationId)
    .single()

  if (convError) {
    return { error: convError.message, data: null }
  }

  // Get messages (include internal messages for staff)
  const { data: messages, error: msgError } = await supabase
    .from('lwp_messages')
    .select(`
      *,
      sender:lwp_users!sender_id(id, first_name, last_name, role)
    `)
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (msgError) {
    return { error: msgError.message, data: null }
  }

  // Mark as read by staff
  await supabase
    .from('lwp_conversations')
    .update({ unread_by_staff: false })
    .eq('id', conversationId)

  return {
    error: null,
    data: {
      ...conversation,
      messages: messages || []
    }
  }
}

// Send message (staff)
export async function sendStaffMessage(
  conversationId: number,
  content: string,
  isInternal = false
) {
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

  // Insert message
  const { data: message, error: msgError } = await supabase
    .from('lwp_messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userData.id,
      content,
      is_internal: isInternal,
    })
    .select()
    .single()

  if (msgError) {
    return { error: msgError.message, success: false }
  }

  // Update conversation (only set unread for customer if not internal)
  const updateData: Record<string, unknown> = {
    last_message_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  if (!isInternal) {
    updateData.unread_by_customer = true
  }

  await supabase
    .from('lwp_conversations')
    .update(updateData)
    .eq('id', conversationId)

  revalidatePath(`/manage/messages/${conversationId}`)
  return { error: null, success: true, data: message }
}

// Close conversation
export async function closeConversation(conversationId: number) {
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

  const { error } = await supabase
    .from('lwp_conversations')
    .update({
      status: 'closed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/messages')
  return { error: null, success: true }
}

// Reopen conversation
export async function reopenConversation(conversationId: number) {
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

  const { error } = await supabase
    .from('lwp_conversations')
    .update({
      status: 'open',
      updated_at: new Date().toISOString(),
    })
    .eq('id', conversationId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/messages')
  return { error: null, success: true }
}
