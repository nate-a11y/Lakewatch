import { CreditCard, Download, FileText } from 'lucide-react'

interface Invoice {
  id: string
  number: string
  date: string
  dueDate: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  description: string
}

interface PaymentMethod {
  id: string
  type: 'card'
  brand: string
  last4: string
  expMonth: number
  expYear: number
  isDefault: boolean
}

export default function BillingPage() {
  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2025-001',
      date: 'December 1, 2025',
      dueDate: 'December 15, 2025',
      amount: 299.00,
      status: 'paid',
      description: 'December 2025 - Premium Watch Service',
    },
    {
      id: '2',
      number: 'INV-2026-001',
      date: 'January 1, 2026',
      dueDate: 'January 15, 2026',
      amount: 299.00,
      status: 'pending',
      description: 'January 2026 - Premium Watch Service',
    },
  ]

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2027,
      isDefault: true,
    },
  ]

  const statusColors: Record<string, string> = {
    paid: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    overdue: 'bg-red-500/10 text-red-500',
  }

  const statusLabels: Record<string, string> = {
    paid: 'Paid',
    pending: 'Pending',
    overdue: 'Overdue',
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Billing</h1>
        <p className="text-[#a1a1aa]">
          Manage payment methods and view invoices
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold mb-1">Premium Watch Service</h2>
            <p className="text-[#a1a1aa]">$299/month • 2 properties</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <button className="text-sm text-[#4cbb17] hover:underline">
            Add payment method
          </button>
        </div>

        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center justify-between p-4 bg-black/30 rounded-lg border border-[#27272a]"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-8 bg-[#27272a] rounded flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#a1a1aa]" />
                </div>
                <div>
                  <p className="font-medium">
                    {method.brand} •••• {method.last4}
                  </p>
                  <p className="text-sm text-[#71717a]">
                    Expires {method.expMonth}/{method.expYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {method.isDefault && (
                  <span className="text-xs bg-[#4cbb17]/10 text-[#4cbb17] px-2 py-1 rounded">
                    Default
                  </span>
                )}
                <button className="text-sm text-[#71717a] hover:text-white transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Invoices */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-6">Invoices</h2>

        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 bg-black/30 rounded-lg border border-[#27272a]"
            >
              <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#a1a1aa]" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{invoice.number}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${statusColors[invoice.status]}`}>
                    {statusLabels[invoice.status]}
                  </span>
                </div>
                <p className="text-sm text-[#71717a]">{invoice.description}</p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                  <p className="text-sm text-[#71717a]">Due {invoice.dueDate}</p>
                </div>
                <div className="flex gap-2">
                  {invoice.status === 'pending' && (
                    <button className="px-3 py-1.5 bg-[#4cbb17] text-black text-sm font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
                      Pay Now
                    </button>
                  )}
                  <button className="p-1.5 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {invoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-[#71717a] mx-auto mb-4" />
            <p className="text-[#a1a1aa]">No invoices yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
