'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  User,
  MapPin,
  Droplets,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function NewPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerId: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    accessCode: '',
    accessNotes: '',
    waterType: 'lake',
    propertyType: 'residential',
    notes: '',
  })

  // Mock customers
  const customers = [
    { id: '5', name: 'John Smith' },
    { id: '6', name: 'Jane Doe' },
    { id: '7', name: 'Bob Wilson' },
    { id: '8', name: 'Sarah Johnson' },
  ]

  const waterTypes = [
    { value: 'lake', label: 'Lake' },
    { value: 'pond', label: 'Pond' },
    { value: 'pool', label: 'Pool' },
    { value: 'fountain', label: 'Fountain' },
    { value: 'other', label: 'Other' },
  ]

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'hoa', label: 'HOA/Community' },
    { value: 'municipal', label: 'Municipal' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a property name')
      return
    }

    if (!formData.address.trim()) {
      toast.error('Please enter an address')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Property created successfully')
    router.push('/manage/properties')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/manage/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Add Property</h1>
        <p className="text-[#a1a1aa]">Add a new property to manage</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cbb17]" />
            Customer
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Property Owner *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            >
              <option value="">Select customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#4cbb17]" />
            Property Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Property Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lake House, Main Residence"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                {propertyTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Water Type
              </label>
              <select
                value={formData.waterType}
                onChange={(e) => setFormData({ ...formData, waterType: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                {waterTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#4cbb17]" />
            Address
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Lakeshore Drive"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Austin"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="TX"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="78701"
                  className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-[#4cbb17]" />
            Access Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Gate/Access Code
              </label>
              <input
                type="text"
                value={formData.accessCode}
                onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                placeholder="e.g., #1234"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Access Notes
              </label>
              <textarea
                value={formData.accessNotes}
                onChange={(e) => setFormData({ ...formData, accessNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
                placeholder="e.g., Enter through side gate, dogs on property..."
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
            placeholder="Any other relevant information about this property..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/properties"
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
              'Add Property'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
