'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Home,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AddPropertyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    propertyType: 'house',
    squareFootage: '',
    accessCode: '',
    accessNotes: '',
    notes: '',
  })

  const propertyTypes = [
    { value: 'house', label: 'House' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'other', label: 'Other' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a property name')
      return
    }

    if (!formData.address.trim()) {
      toast.error('Please enter an address')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zipCode,
          accessInfo: {
            code: formData.accessCode,
            notes: formData.accessNotes,
          },
          notes: formData.notes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add property')
      }

      toast.success('Property added! Our team will review and set up your service plan.')
      router.push('/portal/properties')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add property')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/portal/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Add Property</h1>
        <p className="text-[#a1a1aa]">Add a new property to your Lake Watch Pros account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                Square Footage
              </label>
              <input
                type="number"
                value={formData.squareFootage}
                onChange={(e) => setFormData({ ...formData, squareFootage: e.target.value })}
                placeholder="e.g., 2500"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
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
                placeholder="Lake Ozark"
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
                  placeholder="MO"
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
                  placeholder="65049"
                  className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Access Information */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Home className="w-5 h-5 text-[#4cbb17]" />
            Access Information
          </h2>

          <div className="space-y-4">
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
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Access Notes
              </label>
              <textarea
                value={formData.accessNotes}
                onChange={(e) => setFormData({ ...formData, accessNotes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
                placeholder="e.g., Key under mat, enter through side gate..."
              />
            </div>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
            Additional Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
            placeholder="Any special instructions or information about your property..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/portal/properties"
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
                Submitting...
              </>
            ) : (
              'Add Property'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-[#71717a]">
          After submitting, our team will review your property and contact you about service plans.
        </p>
      </form>
    </div>
  )
}
