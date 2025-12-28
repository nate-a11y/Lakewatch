import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createInvoice as createStripeInvoice } from '@/lib/stripe'

// GET /api/invoices - List invoices
export async function GET(request: NextRequest) {
  try {
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

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const customerId = searchParams.get('customer_id')

    let query = supabase
      .from('lwp_invoices')
      .select(`
        *,
        customer:lwp_users!customer_id(id, first_name, last_name, email),
        property:lwp_properties!property_id(id, name)
      `)

    // Filter based on role
    if (userData.role === 'customer') {
      query = query.eq('customer_id', userData.id)
    }

    if (status) {
      query = query.eq('status', status)
    }
    if (customerId && ['admin', 'owner', 'staff'].includes(userData.role)) {
      query = query.eq('customer_id', parseInt(customerId))
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Invoices GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/invoices - Create an invoice (admin only)
export async function POST(request: NextRequest) {
  try {
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

    if (!userData || !['admin', 'owner', 'staff'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      customerId,
      propertyId,
      lineItems,
      dueDate,
      notes,
      createInStripe,
    } = body

    if (!customerId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get customer details
    const { data: customer } = await supabase
      .from('lwp_users')
      .select('id, first_name, last_name, email, stripe_customer_id')
      .eq('id', customerId)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Calculate totals
    const subtotal = lineItems.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    )
    const tax = 0 // Could calculate based on location
    const total = subtotal + tax

    const invoiceData = {
      customer_id: customerId,
      property_id: propertyId || null,
      line_items: lineItems,
      subtotal,
      tax,
      total,
      due_date: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: notes || null,
      status: 'draft',
    }

    // Create in Stripe if requested and customer has Stripe ID
    let stripeInvoiceId = null
    if (createInStripe && customer.stripe_customer_id) {
      try {
        const stripeInvoice = await createStripeInvoice({
          customerId: customer.stripe_customer_id,
          description: `Invoice for ${customer.first_name} ${customer.last_name}`,
          lineItems: lineItems.map((item: { description: string; unitPrice: number; quantity: number }) => ({
            description: item.description,
            amount: Math.round(item.unitPrice * 100), // Convert to cents
            quantity: item.quantity,
          })),
          daysUntilDue: dueDate
            ? Math.ceil((new Date(dueDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
            : 30,
        })
        stripeInvoiceId = stripeInvoice.id
      } catch (stripeError) {
        console.error('Failed to create Stripe invoice:', stripeError)
      }
    }

    const { data, error } = await supabase
      .from('lwp_invoices')
      .insert({
        ...invoiceData,
        stripe_invoice_id: stripeInvoiceId,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Invoice POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
