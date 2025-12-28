import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

// Handle Stripe webhook events
export async function handleStripeWebhook(event: Stripe.Event) {
  const supabase = await createClient()

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionChange(supabase, subscription)
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      await handleSubscriptionCanceled(supabase, subscription)
      break
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaid(supabase, invoice)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoicePaymentFailed(supabase, invoice)
      break
    }

    case 'invoice.sent': {
      const invoice = event.data.object as Stripe.Invoice
      await handleInvoiceSent(supabase, invoice)
      break
    }

    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentSucceeded(supabase, paymentIntent)
      break
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent
      await handlePaymentFailed(supabase, paymentIntent)
      break
    }

    default:
      console.log(`Unhandled event type: ${event.type}`)
  }
}

async function handleSubscriptionChange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  // Find user by Stripe customer ID
  const { data: user } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) {
    console.error(`No user found for Stripe customer: ${customerId}`)
    return
  }

  // Update user's subscription info
  // Note: current_period_end is available on the subscription object in the API response
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end
  await supabase
    .from('lwp_users')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  // If subscription includes price metadata with service_plan_id, update properties
  const priceItem = subscription.items.data[0]
  if (priceItem?.price.metadata?.service_plan_id) {
    const servicePlanId = parseInt(priceItem.price.metadata.service_plan_id)

    // Get customer's properties that should use this plan
    await supabase
      .from('lwp_properties')
      .update({ service_plan_id: servicePlanId })
      .eq('owner_id', user.id)
      .is('service_plan_id', null)
  }
}

async function handleSubscriptionCanceled(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string

  const { data: user } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (!user) return

  await supabase
    .from('lwp_users')
    .update({
      subscription_status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  // Create notification
  await supabase
    .from('lwp_notifications')
    .insert({
      user_id: user.id,
      type: 'system',
      title: 'Subscription Canceled',
      body: 'Your subscription has been canceled. Your service will continue until the end of your current billing period.',
      channels: ['email'],
    })
}

async function handleInvoicePaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  // Update invoice in our database
  const { data: dbInvoice } = await supabase
    .from('lwp_invoices')
    .select('id, customer_id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (dbInvoice) {
    const paymentIntent = (invoice as unknown as { payment_intent?: string | null }).payment_intent
    await supabase
      .from('lwp_invoices')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString(),
        stripe_payment_intent_id: paymentIntent || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbInvoice.id)

    // Create notification
    await supabase
      .from('lwp_notifications')
      .insert({
        user_id: dbInvoice.customer_id,
        type: 'payment_received',
        title: 'Payment Received',
        body: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} has been received. Thank you!`,
        data: { invoice_id: dbInvoice.id },
        channels: ['email'],
      })
  }
}

async function handleInvoicePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const { data: dbInvoice } = await supabase
    .from('lwp_invoices')
    .select('id, customer_id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (dbInvoice) {
    await supabase
      .from('lwp_invoices')
      .update({
        status: 'overdue',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbInvoice.id)

    // Create notification
    await supabase
      .from('lwp_notifications')
      .insert({
        user_id: dbInvoice.customer_id,
        type: 'invoice_sent',
        title: 'Payment Failed',
        body: 'Your payment could not be processed. Please update your payment method.',
        data: { invoice_id: dbInvoice.id },
        channels: ['email', 'sms'],
      })
  }
}

async function handleInvoiceSent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  invoice: Stripe.Invoice
) {
  const { data: dbInvoice } = await supabase
    .from('lwp_invoices')
    .select('id, customer_id')
    .eq('stripe_invoice_id', invoice.id)
    .single()

  if (dbInvoice) {
    await supabase
      .from('lwp_invoices')
      .update({
        status: 'sent',
        updated_at: new Date().toISOString(),
      })
      .eq('id', dbInvoice.id)
  }
}

async function handlePaymentSucceeded(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  // Update any invoices linked to this payment intent
  await supabase
    .from('lwp_invoices')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_payment_intent_id', paymentIntent.id)
}

async function handlePaymentFailed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paymentIntent: Stripe.PaymentIntent
) {
  console.log(`Payment failed for intent: ${paymentIntent.id}`)
  // Handle payment failure - could notify admin
}
