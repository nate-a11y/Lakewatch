'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Invoice {
  id: number
  invoice_number: string
  customer_id: number
  property_id: number | null
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date: string | null
  subtotal: number
  tax: number
  total: number
  notes: string | null
  stripe_invoice_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
  // Joined
  customer?: {
    id: number
    first_name: string
    last_name: string
    email: string
  }
  property?: {
    id: number
    name: string
  }
  line_items?: InvoiceLineItem[]
}

export interface InvoiceLineItem {
  id: number
  description: string
  quantity: number
  unit_price: number
  amount: number
  service_request_id: number | null
}

// Get customer's invoices
export async function getCustomerInvoices() {
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
    .from('lwp_invoices')
    .select(`
      *,
      property:lwp_properties!property_id(id, name)
    `)
    .eq('customer_id', userData.id)
    .neq('status', 'draft')
    .order('issue_date', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}

// Get single invoice for customer
export async function getCustomerInvoice(invoiceId: number) {
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
    .from('lwp_invoices')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, street, city, state, zip)
    `)
    .eq('id', invoiceId)
    .eq('customer_id', userData.id)
    .neq('status', 'draft')
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get line items
  const { data: lineItems } = await supabase
    .from('lwp_invoices_line_items')
    .select('*')
    .eq('_parent_id', invoiceId)
    .order('_order')

  return {
    error: null,
    data: {
      ...data,
      line_items: lineItems || []
    }
  }
}

// Get customer billing summary
export async function getCustomerBillingSummary() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, stripe_customer_id')
    .eq('supabase_id', user.id)
    .single()

  if (!userData) {
    return { error: 'User not found', data: null }
  }

  // Get unpaid invoices
  const { data: unpaidInvoices } = await supabase
    .from('lwp_invoices')
    .select('total')
    .eq('customer_id', userData.id)
    .in('status', ['sent', 'overdue'])

  const outstandingBalance = unpaidInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  // Get last payment
  const { data: lastPayment } = await supabase
    .from('lwp_invoices')
    .select('paid_date, total')
    .eq('customer_id', userData.id)
    .eq('status', 'paid')
    .order('paid_date', { ascending: false })
    .limit(1)
    .single()

  // Get next invoice due
  const { data: nextDue } = await supabase
    .from('lwp_invoices')
    .select('id, invoice_number, due_date, total')
    .eq('customer_id', userData.id)
    .in('status', ['sent', 'overdue'])
    .order('due_date')
    .limit(1)
    .single()

  return {
    error: null,
    data: {
      outstanding_balance: outstandingBalance,
      last_payment: lastPayment,
      next_due: nextDue,
      has_payment_method: !!userData.stripe_customer_id,
    }
  }
}

// Get all invoices (admin)
export async function getAllInvoices(filters?: {
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
    .from('lwp_invoices')
    .select(`
      *,
      customer:lwp_users!customer_id(id, first_name, last_name, email),
      property:lwp_properties!property_id(id, name)
    `)
    .order('issue_date', { ascending: false })

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

// Get single invoice (admin)
export async function getInvoice(invoiceId: number) {
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
    .from('lwp_invoices')
    .select(`
      *,
      customer:lwp_users!customer_id(id, first_name, last_name, email, phone, stripe_customer_id),
      property:lwp_properties!property_id(id, name, street, city, state, zip)
    `)
    .eq('id', invoiceId)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  // Get line items
  const { data: lineItems } = await supabase
    .from('lwp_invoices_line_items')
    .select('*')
    .eq('_parent_id', invoiceId)
    .order('_order')

  return {
    error: null,
    data: {
      ...data,
      line_items: lineItems || []
    }
  }
}

// Create invoice (admin)
export async function createInvoice(formData: FormData) {
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

  // Generate invoice number
  const { data: lastInvoice } = await supabase
    .from('lwp_invoices')
    .select('invoice_number')
    .order('id', { ascending: false })
    .limit(1)
    .single()

  let invoiceNumber = 'INV-0001'
  if (lastInvoice?.invoice_number) {
    const lastNum = parseInt(lastInvoice.invoice_number.replace('INV-', ''))
    invoiceNumber = `INV-${String(lastNum + 1).padStart(4, '0')}`
  }

  const subtotal = parseFloat(formData.get('subtotal') as string) || 0
  const tax = parseFloat(formData.get('tax') as string) || 0

  const invoiceData = {
    invoice_number: invoiceNumber,
    customer_id: parseInt(formData.get('customer_id') as string),
    property_id: formData.get('property_id')
      ? parseInt(formData.get('property_id') as string)
      : null,
    status: formData.get('status') as string || 'draft',
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    subtotal,
    tax,
    total: subtotal + tax,
    notes: formData.get('notes') as string || null,
  }

  const { data, error } = await supabase
    .from('lwp_invoices')
    .insert(invoiceData)
    .select()
    .single()

  if (error) {
    return { error: error.message, success: false }
  }

  // Add line items if provided
  const lineItemsJson = formData.get('line_items')
  if (lineItemsJson) {
    const lineItems = JSON.parse(lineItemsJson as string) as Array<{
      description: string
      quantity: number
      unit_price: number
      service_request_id?: number
    }>

    const lineItemsToInsert = lineItems.map((item, i) => ({
      _parent_id: data.id,
      _order: i,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.quantity * item.unit_price,
      service_request_id: item.service_request_id || null,
    }))

    await supabase.from('lwp_invoices_line_items').insert(lineItemsToInsert)
  }

  revalidatePath('/manage/invoices')
  return { error: null, success: true, data }
}

// Update invoice (admin)
export async function updateInvoice(invoiceId: number, formData: FormData) {
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

  const subtotal = parseFloat(formData.get('subtotal') as string) || 0
  const tax = parseFloat(formData.get('tax') as string) || 0

  const updateData: Record<string, unknown> = {
    status: formData.get('status') as string,
    issue_date: formData.get('issue_date') as string,
    due_date: formData.get('due_date') as string,
    subtotal,
    tax,
    total: subtotal + tax,
    notes: formData.get('notes') as string || null,
    updated_at: new Date().toISOString(),
  }

  // Handle paid status
  if (formData.get('status') === 'paid' && !formData.get('paid_date')) {
    updateData.paid_date = new Date().toISOString().split('T')[0]
  } else if (formData.get('paid_date')) {
    updateData.paid_date = formData.get('paid_date')
  }

  const { error } = await supabase
    .from('lwp_invoices')
    .update(updateData)
    .eq('id', invoiceId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/invoices')
  revalidatePath(`/manage/invoices/${invoiceId}`)
  return { error: null, success: true }
}

// Mark invoice as paid
export async function markInvoicePaid(invoiceId: number) {
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
    .from('lwp_invoices')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/manage/invoices')
  return { error: null, success: true }
}

// Send invoice to customer
export async function sendInvoice(invoiceId: number) {
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

  // Update status to sent
  const { error } = await supabase
    .from('lwp_invoices')
    .update({
      status: 'sent',
      updated_at: new Date().toISOString(),
    })
    .eq('id', invoiceId)
    .eq('status', 'draft')

  if (error) {
    return { error: error.message, success: false }
  }

  // TODO: Send email notification to customer

  revalidatePath('/manage/invoices')
  return { error: null, success: true }
}

// Get service plans (for pricing/billing)
export async function getServicePlans() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('lwp_service_plans')
    .select('*')
    .eq('is_active', true)
    .order('base_price')

  if (error) {
    return { error: error.message, data: null }
  }

  return { error: null, data }
}
