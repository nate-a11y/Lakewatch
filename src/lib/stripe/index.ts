import Stripe from 'stripe'

// Lazy initialize to avoid build-time errors when env vars aren't set
let _stripe: Stripe | null = null

function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY not configured')
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  }
  return _stripe
}

export { getStripe as stripe }

// Customer Management
export async function createCustomer(data: {
  email: string
  name: string
  phone?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email: data.email,
    name: data.name,
    phone: data.phone,
    metadata: data.metadata,
  })
  return customer
}

export async function getCustomer(customerId: string) {
  const stripe = getStripe()
  const customer = await stripe.customers.retrieve(customerId)
  return customer
}

export async function updateCustomer(
  customerId: string,
  data: {
    email?: string
    name?: string
    phone?: string
    metadata?: Record<string, string>
  }
) {
  const stripe = getStripe()
  const customer = await stripe.customers.update(customerId, data)
  return customer
}

// Subscription Management
export async function createSubscription(data: {
  customerId: string
  priceId: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.create({
    customer: data.customerId,
    items: [{ price: data.priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: data.metadata,
  })
  return subscription
}

export async function getSubscription(subscriptionId: string) {
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

export async function updateSubscription(
  subscriptionId: string,
  data: {
    priceId?: string
    cancelAtPeriodEnd?: boolean
    metadata?: Record<string, string>
  }
) {
  const stripe = getStripe()
  const updateData: Stripe.SubscriptionUpdateParams = {}

  if (data.priceId) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    updateData.items = [{
      id: subscription.items.data[0].id,
      price: data.priceId,
    }]
  }

  if (data.cancelAtPeriodEnd !== undefined) {
    updateData.cancel_at_period_end = data.cancelAtPeriodEnd
  }

  if (data.metadata) {
    updateData.metadata = data.metadata
  }

  const subscription = await stripe.subscriptions.update(subscriptionId, updateData)
  return subscription
}

export async function cancelSubscription(subscriptionId: string, immediate = false) {
  const stripe = getStripe()
  if (immediate) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return subscription
  } else {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })
    return subscription
  }
}

// Invoice Management
export async function createInvoice(data: {
  customerId: string
  description?: string
  metadata?: Record<string, string>
  lineItems: Array<{
    description: string
    amount: number // in cents
    quantity?: number
  }>
  daysUntilDue?: number
}) {
  const stripe = getStripe()
  // Create invoice
  const invoice = await stripe.invoices.create({
    customer: data.customerId,
    description: data.description,
    metadata: data.metadata,
    collection_method: 'send_invoice',
    days_until_due: data.daysUntilDue || 30,
  })

  // Add line items
  for (const item of data.lineItems) {
    await stripe.invoiceItems.create({
      customer: data.customerId,
      invoice: invoice.id,
      description: item.description,
      amount: item.amount,
      quantity: item.quantity || 1,
    })
  }

  return invoice
}

export async function getInvoice(invoiceId: string) {
  const stripe = getStripe()
  const invoice = await stripe.invoices.retrieve(invoiceId)
  return invoice
}

export async function finalizeInvoice(invoiceId: string) {
  const stripe = getStripe()
  const invoice = await stripe.invoices.finalizeInvoice(invoiceId)
  return invoice
}

export async function sendInvoice(invoiceId: string) {
  const stripe = getStripe()
  const invoice = await stripe.invoices.sendInvoice(invoiceId)
  return invoice
}

export async function voidInvoice(invoiceId: string) {
  const stripe = getStripe()
  const invoice = await stripe.invoices.voidInvoice(invoiceId)
  return invoice
}

export async function listCustomerInvoices(customerId: string, limit = 10) {
  const stripe = getStripe()
  const invoices = await stripe.invoices.list({
    customer: customerId,
    limit,
  })
  return invoices.data
}

// Payment Methods
export async function createSetupIntent(customerId: string) {
  const stripe = getStripe()
  const setupIntent = await stripe.setupIntents.create({
    customer: customerId,
    payment_method_types: ['card'],
  })
  return setupIntent
}

export async function listPaymentMethods(customerId: string) {
  const stripe = getStripe()
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: 'card',
  })
  return paymentMethods.data
}

export async function setDefaultPaymentMethod(customerId: string, paymentMethodId: string) {
  const stripe = getStripe()
  const customer = await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  })
  return customer
}

export async function detachPaymentMethod(paymentMethodId: string) {
  const stripe = getStripe()
  const paymentMethod = await stripe.paymentMethods.detach(paymentMethodId)
  return paymentMethod
}

// Webhook Handling
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const stripe = getStripe()
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured')
  }
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  )
}

// Product/Price Management (for syncing service plans)
export async function createProduct(data: {
  name: string
  description?: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  const product = await stripe.products.create({
    name: data.name,
    description: data.description,
    metadata: data.metadata,
  })
  return product
}

export async function createPrice(data: {
  productId: string
  unitAmount: number // in cents
  currency?: string
  recurring?: {
    interval: 'month' | 'year'
    intervalCount?: number
  }
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  const price = await stripe.prices.create({
    product: data.productId,
    unit_amount: data.unitAmount,
    currency: data.currency || 'usd',
    recurring: data.recurring,
    metadata: data.metadata,
  })
  return price
}

// Billing Portal
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
  return session
}

// Checkout Session (for initial subscription)
export async function createCheckoutSession(data: {
  customerId: string
  priceId: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}) {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    customer: data.customerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: data.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: data.successUrl,
    cancel_url: data.cancelUrl,
    metadata: data.metadata,
  })
  return session
}
