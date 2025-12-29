'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  FileText,
  User,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
}

interface Property {
  id: string
  name: string
  customerId: string
}

interface LineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

interface NewInvoiceClientProps {
  customers: Customer[]
  properties: Property[]
}

export default function NewInvoiceClient({
  customers,
  properties,
}: NewInvoiceClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerId: '',
    propertyId: '',
    dueDate: '',
    notes: '',
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', description: '', quantity: 1, unitPrice: 0 },
  ])

  const filteredProperties = formData.customerId
    ? properties.filter(p => p.customerId === formData.customerId)
    : []

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { id: String(Date.now()), description: '', quantity: 1, unitPrice: 0 },
    ])
  }

  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter(item => item.id !== id))
    }
  }

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  const tax = subtotal * 0.08 // 8% tax
  const total = subtotal + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (!formData.dueDate) {
      toast.error('Please set a due date')
      return
    }

    if (lineItems.some(item => !item.description.trim() || item.unitPrice <= 0)) {
      toast.error('Please complete all line items')
      return
    }

    setIsSubmitting(true)

    // TODO: Implement actual API call to create invoice
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Invoice created successfully')
    router.push('/manage/invoices')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/manage/invoices"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to invoices
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create Invoice</h1>
        <p className="text-[#a1a1aa]">Create a new invoice for a customer</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Property */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cbb17]" />
            Customer Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Customer *
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, propertyId: '' })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">Select customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Property (optional)
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                disabled={!formData.customerId}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] disabled:opacity-50"
              >
                <option value="">Select property</option>
                {filteredProperties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4cbb17]" />
            Invoice Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="grid grid-cols-12 gap-2 text-xs text-[#71717a] font-medium px-2">
              <div className="col-span-6">Description</div>
              <div className="col-span-2">Qty</div>
              <div className="col-span-3">Price</div>
              <div className="col-span-1"></div>
            </div>

            {lineItems.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-2">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                  placeholder="Service description"
                  className="col-span-6 px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                  min="1"
                  className="col-span-2 px-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                />
                <div className="col-span-3 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]">$</span>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                    className="w-full pl-7 pr-3 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeLineItem(item.id)}
                  disabled={lineItems.length === 1}
                  className="col-span-1 p-2 text-[#71717a] hover:text-red-500 disabled:opacity-30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addLineItem}
              className="flex items-center gap-2 text-sm text-[#4cbb17] hover:underline mt-2"
            >
              <Plus className="w-4 h-4" />
              Add line item
            </button>
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-[#27272a] space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#71717a]">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#71717a]">Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[#27272a]">
              <span>Total</span>
              <span className="text-[#4cbb17]">${total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
            Notes (optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
            placeholder="Any additional notes for the invoice..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/invoices"
            className="flex-1 px-6 py-3 border border-[#27272a] rounded-lg text-center font-medium hover:bg-[#27272a] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-[#4cbb17] text-black rounded-lg font-semibold hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Invoice'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
