import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'
import InvoiceActionButtons, { InvoiceQuickActions } from './InvoiceActionButtons'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch invoice with related data
  const { data: invoice, error } = await supabase
    .from('lwp_invoices')
    .select(`
      *,
      customer:lwp_users!customer_id(id, first_name, last_name, email, phone),
      property:lwp_properties(id, name, street, city, state, zip)
    `)
    .eq('id', id)
    .single()

  if (error || !invoice) {
    notFound()
  }

  // Fetch line items
  const { data: lineItems } = await supabase
    .from('lwp_invoices_line_items')
    .select('*')
    .eq('_parent_id', id)
    .order('_order')

  const customerData = invoice.customer as { id: number; first_name: string; last_name: string; email: string; phone: string | null } | { id: number; first_name: string; last_name: string; email: string; phone: string | null }[] | null
  const customer = Array.isArray(customerData) ? customerData[0] : customerData

  const propertyData = invoice.property as { id: number; name: string; street: string; city: string; state: string; zip: string } | { id: number; name: string; street: string; city: string; state: string; zip: string }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Check if overdue
  const isOverdue = () => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
    const due = new Date(invoice.due_date)
    return due < new Date()
  }

  const status = isOverdue() ? 'overdue' : invoice.status

  const items = (lineItems || []).map(item => ({
    id: item.id.toString(),
    description: item.description,
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unit_price) || 0,
    total: Number(item.amount) || 0,
  }))

  // If no line items, create a placeholder
  if (items.length === 0) {
    items.push({
      id: '1',
      description: 'Service charge',
      quantity: 1,
      unitPrice: Number(invoice.total) || 0,
      total: Number(invoice.total) || 0,
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/manage/invoices"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to invoices
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            status === 'paid' ? 'bg-green-500/10' :
            status === 'overdue' ? 'bg-red-500/10' :
            'bg-yellow-500/10'
          }`}>
            <FileText className={`w-8 h-8 ${
              status === 'paid' ? 'text-green-500' :
              status === 'overdue' ? 'text-red-500' :
              'text-yellow-500'
            }`} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 font-mono">
              {invoice.invoice_number}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                status === 'paid' ? 'bg-green-500/10 text-green-500' :
                status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                'bg-[#27272a] text-[#71717a]'
              }`}>
                {status}
              </span>
              <span className="text-sm">Issued {formatDate(invoice.issue_date)}</span>
            </div>
          </div>
        </div>
        <InvoiceActionButtons invoiceId={id} status={status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Invoice Content */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
            {/* Invoice Header */}
            <div className="p-6 border-b border-[#27272a]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#4cbb17] mb-2">Lake Watch Pros</h2>
                  <p className="text-sm text-[#71717a]">
                    123 Business Ave<br />
                    Lake Ozark, MO 65049<br />
                    info@lakewatchpros.com
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${Number(invoice.total).toLocaleString()}</p>
                  <p className={`text-sm ${
                    status === 'overdue' ? 'text-red-500' : 'text-[#71717a]'
                  }`}>
                    Due {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To / Property */}
            <div className="p-6 border-b border-[#27272a] grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#71717a] mb-2">Bill To</p>
                {customer && (
                  <>
                    <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                    <p className="text-sm text-[#a1a1aa]">{customer.email}</p>
                    {customer.phone && <p className="text-sm text-[#a1a1aa]">{customer.phone}</p>}
                  </>
                )}
              </div>
              {property && (
                <div>
                  <p className="text-sm text-[#71717a] mb-2">Service Property</p>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-[#a1a1aa]">{property.street}, {property.city}</p>
                </div>
              )}
            </div>

            {/* Line Items */}
            <div className="p-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th className="text-left pb-3 text-sm font-medium text-[#71717a]">Description</th>
                    <th className="text-center pb-3 text-sm font-medium text-[#71717a] w-20">Qty</th>
                    <th className="text-right pb-3 text-sm font-medium text-[#71717a] w-24">Price</th>
                    <th className="text-right pb-3 text-sm font-medium text-[#71717a] w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-[#27272a]">
                      <td className="py-4">{item.description}</td>
                      <td className="py-4 text-center text-[#a1a1aa]">{item.quantity}</td>
                      <td className="py-4 text-right text-[#a1a1aa]">${item.unitPrice}</td>
                      <td className="py-4 text-right font-medium">${item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">Subtotal</span>
                    <span>${Number(invoice.subtotal).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">Tax</span>
                    <span>${Number(invoice.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#27272a]">
                    <span>Total</span>
                    <span className="text-[#4cbb17]">${Number(invoice.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="px-6 pb-6">
                <p className="text-sm text-[#71717a]">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Status</h2>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30">
              {status === 'paid' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : status === 'overdue' ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <p className="font-medium capitalize">{status}</p>
                {invoice.paid_date ? (
                  <p className="text-sm text-[#71717a]">Paid on {formatDate(invoice.paid_date)}</p>
                ) : (
                  <p className="text-sm text-[#71717a]">Due {formatDate(invoice.due_date)}</p>
                )}
              </div>
            </div>
          </section>

          {/* Payment Method */}
          {invoice.stripe_payment_intent_id && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="font-medium">Stripe Payment</p>
                  <p className="text-sm text-[#71717a]">{invoice.stripe_payment_intent_id}</p>
                </div>
              </div>
            </section>
          )}

          {/* Customer */}
          {customer && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <Link
                href={`/manage/customers/${customer.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                  {(customer.first_name?.[0] || '?')}{(customer.last_name?.[0] || '')}
                </div>
                <div>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">{customer.email}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Property */}
          {property && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property</h2>
              <Link
                href={`/manage/properties/${property.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-[#71717a]">{property.street}, {property.city}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Details */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Invoice Number</span>
                <span className="font-mono">{invoice.invoice_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Issued</span>
                <span>{formatDate(invoice.issue_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Due</span>
                <span>{formatDate(invoice.due_date)}</span>
              </div>
              {invoice.stripe_invoice_id && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Stripe ID</span>
                  <span className="font-mono text-xs">{invoice.stripe_invoice_id}</span>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <InvoiceQuickActions invoiceId={id} status={status} />
          </section>
        </div>
      </div>
    </div>
  )
}
