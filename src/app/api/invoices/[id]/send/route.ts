import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendInvoice as sendStripeInvoice, finalizeInvoice } from '@/lib/stripe'
import { sendInvoiceEmail } from '@/lib/resend'
import { sendInvoiceReminderSMS } from '@/lib/twilio'

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
      .select('id, role')
      .eq('supabase_id', user.id)
      .single()

    if (!userData || !['admin', 'owner', 'staff'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get invoice with customer details
    const { data: invoice } = await supabase
      .from('lwp_invoices')
      .select(`
        *,
        customer:lwp_users!customer_id(id, first_name, last_name, email, phone, notification_preferences, stripe_customer_id)
      `)
      .eq('id', parseInt(id))
      .single()

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    if (invoice.status === 'paid') {
      return NextResponse.json(
        { error: 'Invoice is already paid' },
        { status: 400 }
      )
    }

    const customer = Array.isArray(invoice.customer)
      ? invoice.customer[0]
      : invoice.customer

    const now = new Date().toISOString()
    let stripeInvoiceUrl = null

    // Finalize and send Stripe invoice if exists
    if (invoice.stripe_invoice_id) {
      try {
        await finalizeInvoice(invoice.stripe_invoice_id)
        const sentInvoice = await sendStripeInvoice(invoice.stripe_invoice_id)
        stripeInvoiceUrl = sentInvoice.hosted_invoice_url
      } catch (stripeError) {
        console.error('Failed to send Stripe invoice:', stripeError)
      }
    }

    // Update invoice status
    const { data, error } = await supabase
      .from('lwp_invoices')
      .update({
        status: 'sent',
        sent_at: now,
        payment_url: stripeInvoiceUrl,
        updated_at: now,
      })
      .eq('id', parseInt(id))
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Create notification
    await supabase.from('lwp_notifications').insert({
      user_id: customer?.id,
      type: 'invoice_sent',
      title: 'New Invoice',
      body: `You have a new invoice for $${invoice.total.toFixed(2)}`,
      data: { invoice_id: parseInt(id) },
      channels: ['email', 'push'],
    })

    // Send email notification
    if (customer?.email) {
      const prefs = customer.notification_preferences as { email?: boolean } | null
      if (prefs?.email !== false) {
        try {
          const paymentUrl = stripeInvoiceUrl || `${process.env.NEXT_PUBLIC_APP_URL}/portal/billing`
          await sendInvoiceEmail({
            to: customer.email,
            customerName: customer.first_name || 'Valued Customer',
            invoiceNumber: `INV-${String(invoice.id).padStart(5, '0')}`,
            amount: invoice.total,
            dueDate: new Date(invoice.due_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }),
            description: 'Lake Watch Pros Services',
            paymentUrl,
          })
        } catch (emailError) {
          console.error('Failed to send invoice email:', emailError)
        }
      }
    }

    // Send SMS notification
    if (customer?.phone) {
      const prefs = customer.notification_preferences as { sms?: boolean } | null
      if (prefs?.sms !== false) {
        try {
          const paymentUrl = stripeInvoiceUrl || `${process.env.NEXT_PUBLIC_APP_URL}/portal/billing`
          await sendInvoiceReminderSMS({
            to: customer.phone,
            amount: invoice.total,
            dueDate: new Date(invoice.due_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            paymentUrl,
          })
        } catch (smsError) {
          console.error('Failed to send invoice SMS:', smsError)
        }
      }
    }

    return NextResponse.json({
      data,
      message: 'Invoice sent successfully',
    })
  } catch (error) {
    console.error('Send invoice error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
