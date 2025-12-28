import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  Building2,
  User,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Send,
  Printer,
  CreditCard,
} from 'lucide-react'

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const invoice = {
    id,
    number: 'INV-2026-001',
    customer: {
      id: '5',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.customer@example.com',
      address: '456 Main St, St. Louis, MO 63101',
    },
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    status: 'pending',
    type: 'subscription',
    issuedDate: 'Jan 1, 2026',
    dueDate: 'Jan 15, 2026',
    paidDate: null,
    lineItems: [
      { id: '1', description: 'Premium Monitoring Plan - January 2026', quantity: 1, unitPrice: 349, total: 349 },
    ],
    subtotal: 349,
    tax: 0,
    total: 349,
    notes: 'Thank you for your business. Payment is due within 15 days.',
    paymentMethod: {
      type: 'card',
      last4: '4242',
      brand: 'Visa',
    },
    stripeInvoiceId: 'in_1ABC123',
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
            invoice.status === 'paid' ? 'bg-green-500/10' :
            invoice.status === 'overdue' ? 'bg-red-500/10' :
            'bg-yellow-500/10'
          }`}>
            <FileText className={`w-8 h-8 ${
              invoice.status === 'paid' ? 'text-green-500' :
              invoice.status === 'overdue' ? 'text-red-500' :
              'text-yellow-500'
            }`} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1 font-mono">
              {invoice.number}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                'bg-[#27272a] text-[#71717a]'
              }`}>
                {invoice.status}
              </span>
              <span className="text-sm">Issued {invoice.issuedDate}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {invoice.status === 'pending' && (
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
              <CreditCard className="w-4 h-4" />
              Record Payment
            </button>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Send className="w-4 h-4" />
            Send
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
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
                  <p className="text-2xl font-bold">${invoice.total}</p>
                  <p className={`text-sm ${
                    invoice.status === 'overdue' ? 'text-red-500' : 'text-[#71717a]'
                  }`}>
                    Due {invoice.dueDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Bill To / Property */}
            <div className="p-6 border-b border-[#27272a] grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[#71717a] mb-2">Bill To</p>
                <p className="font-medium">{invoice.customer.firstName} {invoice.customer.lastName}</p>
                <p className="text-sm text-[#a1a1aa]">{invoice.customer.email}</p>
                <p className="text-sm text-[#a1a1aa]">{invoice.customer.address}</p>
              </div>
              {invoice.property && (
                <div>
                  <p className="text-sm text-[#71717a] mb-2">Service Property</p>
                  <p className="font-medium">{invoice.property.name}</p>
                  <p className="text-sm text-[#a1a1aa]">{invoice.property.address}</p>
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
                  {invoice.lineItems.map((item) => (
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
                    <span>${invoice.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#71717a]">Tax</span>
                    <span>${invoice.tax}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[#27272a]">
                    <span>Total</span>
                    <span className="text-[#4cbb17]">${invoice.total}</span>
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
              {invoice.status === 'paid' ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : invoice.status === 'overdue' ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
              <div>
                <p className="font-medium capitalize">{invoice.status}</p>
                {invoice.paidDate ? (
                  <p className="text-sm text-[#71717a]">Paid on {invoice.paidDate}</p>
                ) : (
                  <p className="text-sm text-[#71717a]">Due {invoice.dueDate}</p>
                )}
              </div>
            </div>
          </section>

          {/* Payment Method */}
          {invoice.paymentMethod && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <div className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="font-medium">{invoice.paymentMethod.brand} •••• {invoice.paymentMethod.last4}</p>
                  <p className="text-sm text-[#71717a]">Auto-pay enabled</p>
                </div>
              </div>
            </section>
          )}

          {/* Customer */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <Link
              href={`/manage/customers/${invoice.customer.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                {invoice.customer.firstName[0]}{invoice.customer.lastName[0]}
              </div>
              <div>
                <p className="font-medium">
                  {invoice.customer.firstName} {invoice.customer.lastName}
                </p>
                <p className="text-sm text-[#71717a]">{invoice.customer.email}</p>
              </div>
            </Link>
          </section>

          {/* Property */}
          {invoice.property && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property</h2>
              <Link
                href={`/manage/properties/${invoice.property.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <p className="font-medium">{invoice.property.name}</p>
                  <p className="text-sm text-[#71717a]">{invoice.property.address}</p>
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
                <span className="font-mono">{invoice.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Type</span>
                <span className="capitalize">{invoice.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Issued</span>
                <span>{invoice.issuedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Due</span>
                <span>{invoice.dueDate}</span>
              </div>
              {invoice.stripeInvoiceId && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Stripe ID</span>
                  <span className="font-mono text-xs">{invoice.stripeInvoiceId}</span>
                </div>
              )}
            </div>
          </section>

          {/* Actions */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2">
                <Send className="w-4 h-4" />
                Send reminder
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print invoice
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Duplicate
              </button>
              {invoice.status !== 'paid' && (
                <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                  Void invoice
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
