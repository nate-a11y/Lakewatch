'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  User,
  Mail,
  Building2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NewCustomerPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    plan: 'standard',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Please enter customer name')
      return
    }

    if (!formData.email.trim()) {
      toast.error('Please enter email address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes,
          sendInvite: true,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create customer')
      }

      toast.success('Customer created successfully')
      router.push('/manage/customers')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create customer')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/manage/customers"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Add New Customer</h1>
        <p className="text-[#a1a1aa]">Create a new customer account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cbb17]" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                placeholder="Smith"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#4cbb17]" />
            Contact Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#4cbb17]" />
            Subscription Plan
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'basic', name: 'Basic', price: '$99/mo', desc: 'Monthly inspections' },
              { id: 'standard', name: 'Standard', price: '$199/mo', desc: 'Bi-weekly inspections' },
              { id: 'premium', name: 'Premium', price: '$349/mo', desc: 'Weekly inspections + concierge' },
            ].map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setFormData({ ...formData, plan: plan.id })}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  formData.plan === plan.id
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] hover:border-[#3f3f46]'
                }`}
              >
                <p className="font-semibold">{plan.name}</p>
                <p className="text-[#4cbb17] font-bold">{plan.price}</p>
                <p className="text-xs text-[#71717a] mt-1">{plan.desc}</p>
              </button>
            ))}
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
            placeholder="Any additional notes about this customer..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/customers"
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
              'Create Customer'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
