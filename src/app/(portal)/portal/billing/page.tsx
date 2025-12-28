'use client'

import { useState } from 'react'
import { CreditCard, Download, FileText, Plus, X } from 'lucide-react'

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
  const [showAddCardModal, setShowAddCardModal] = useState(false)
  const [showChangePlanModal, setShowChangePlanModal] = useState(false)
  const [editingCard, setEditingCard] = useState<PaymentMethod | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

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

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      brand: 'Visa',
      last4: '4242',
      expMonth: 12,
      expYear: 2027,
      isDefault: true,
    },
  ])

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

  const handlePayNow = async (invoiceId: string) => {
    setIsProcessing(true)
    // Simulate payment - in production, this would call Stripe
    await new Promise(resolve => setTimeout(resolve, 1500))
    alert(`Payment processed for invoice ${invoiceId}`)
    setIsProcessing(false)
  }

  const handleDownloadInvoice = (invoiceId: string) => {
    // In production, this would fetch PDF from API
    alert(`Downloading invoice ${invoiceId}`)
  }

  const handleSetDefaultCard = (cardId: string) => {
    setPaymentMethods(prev => prev.map(card => ({
      ...card,
      isDefault: card.id === cardId
    })))
  }

  const handleRemoveCard = (cardId: string) => {
    if (confirm('Are you sure you want to remove this payment method?')) {
      setPaymentMethods(prev => prev.filter(card => card.id !== cardId))
    }
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
            <button
              onClick={() => setShowChangePlanModal(true)}
              className="px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
            >
              Change Plan
            </button>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Payment Methods</h2>
          <button
            onClick={() => setShowAddCardModal(true)}
            className="inline-flex items-center gap-2 text-sm text-[#4cbb17] hover:underline"
          >
            <Plus className="w-4 h-4" />
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
                {method.isDefault ? (
                  <span className="text-xs bg-[#4cbb17]/10 text-[#4cbb17] px-2 py-1 rounded">
                    Default
                  </span>
                ) : (
                  <button
                    onClick={() => handleSetDefaultCard(method.id)}
                    className="text-xs text-[#71717a] hover:text-white transition-colors"
                  >
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => setEditingCard(method)}
                  className="text-sm text-[#71717a] hover:text-white transition-colors"
                >
                  Edit
                </button>
                {!method.isDefault && (
                  <button
                    onClick={() => handleRemoveCard(method.id)}
                    className="text-sm text-red-400 hover:text-red-300 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}

          {paymentMethods.length === 0 && (
            <div className="text-center py-8 text-[#71717a]">
              <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No payment methods on file</p>
              <button
                onClick={() => setShowAddCardModal(true)}
                className="mt-4 text-[#4cbb17] hover:underline"
              >
                Add your first payment method
              </button>
            </div>
          )}
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
                    <button
                      onClick={() => handlePayNow(invoice.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-[#4cbb17] text-black text-sm font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'Pay Now'}
                    </button>
                  )}
                  <button
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    className="p-1.5 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                    title="Download Invoice"
                  >
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

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Add Payment Method</h3>
              <button onClick={() => setShowAddCardModal(false)} className="text-[#71717a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault()
              // In production, this would use Stripe Elements
              const newCard: PaymentMethod = {
                id: String(Date.now()),
                type: 'card',
                brand: 'Visa',
                last4: '1234',
                expMonth: 12,
                expYear: 2028,
                isDefault: paymentMethods.length === 0,
              }
              setPaymentMethods(prev => [...prev, newCard])
              setShowAddCardModal(false)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Card Number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">CVC</label>
                    <input
                      type="text"
                      placeholder="123"
                      className="w-full px-4 py-3 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Card Modal */}
      {editingCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Edit Payment Method</h3>
              <button onClick={() => setEditingCard(null)} className="text-[#71717a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-[#a1a1aa]">
                {editingCard.brand} •••• {editingCard.last4}
              </p>
              <p className="text-sm text-[#71717a]">
                Expires {editingCard.expMonth}/{editingCard.expYear}
              </p>
            </div>
            <div className="space-y-3">
              {!editingCard.isDefault && (
                <button
                  onClick={() => {
                    handleSetDefaultCard(editingCard.id)
                    setEditingCard(null)
                  }}
                  className="w-full py-3 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => {
                  handleRemoveCard(editingCard.id)
                  setEditingCard(null)
                }}
                className="w-full py-3 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                Remove Card
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Change Plan</h3>
              <button onClick={() => setShowChangePlanModal(false)} className="text-[#71717a] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Basic Watch', price: 149, properties: 1 },
                { name: 'Standard Watch', price: 199, properties: 1 },
                { name: 'Premium Watch', price: 299, properties: 2, current: true },
                { name: 'Enterprise', price: 499, properties: 5 },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 rounded-lg border ${
                    plan.current
                      ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                      : 'border-[#27272a] hover:border-[#4cbb17]/50'
                  } cursor-pointer transition-colors`}
                  onClick={() => {
                    if (!plan.current) {
                      alert(`Plan changed to ${plan.name}`)
                      setShowChangePlanModal(false)
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-sm text-[#71717a]">Up to {plan.properties} properties</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${plan.price}/mo</p>
                      {plan.current && (
                        <p className="text-xs text-[#4cbb17]">Current Plan</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
