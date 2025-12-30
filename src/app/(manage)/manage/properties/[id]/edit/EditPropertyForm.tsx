'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Building2, User, MapPin, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
}

interface PropertyData {
  id: string
  name: string
  ownerId: string
  street: string
  city: string
  state: string
  zip: string
  propertyType: string
  gateCode: string
  specialInstructions: string
  status: string
}

interface EditPropertyFormProps {
  property: PropertyData
  customers: Customer[]
}

export default function EditPropertyForm({ property, customers }: EditPropertyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: property.name,
    ownerId: property.ownerId,
    street: property.street,
    city: property.city,
    state: property.state,
    zip: property.zip,
    propertyType: property.propertyType,
    gateCode: property.gateCode,
    specialInstructions: property.specialInstructions,
    status: property.status,
  })

  const propertyTypes = [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'hoa', label: 'HOA/Community' },
    { value: 'municipal', label: 'Municipal' },
  ]

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a property name')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          ownerId: parseInt(formData.ownerId),
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          propertyType: formData.propertyType,
          gateCode: formData.gateCode,
          specialInstructions: formData.specialInstructions,
          status: formData.status,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update property')
      }

      toast.success('Property updated successfully')
      router.push(`/manage/properties/${property.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update property')
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Status */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Status</h2>
        <div className="flex gap-2">
          {statuses.map(status => (
            <button
              key={status.value}
              type="button"
              onClick={() => setFormData({ ...formData, status: status.value })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.status === status.value
                  ? status.value === 'active' ? 'bg-green-500/20 text-green-500' :
                    status.value === 'inactive' ? 'bg-red-500/20 text-red-500' :
                    'bg-yellow-500/20 text-yellow-500'
                  : 'bg-[#171717] text-[#71717a] hover:bg-[#27272a]'
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[#4cbb17]" />
          Owner
        </h2>
        <select
          value={formData.ownerId}
          onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
          className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
        >
          <option value="">Select owner</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>{customer.name}</option>
          ))}
        </select>
      </div>

      {/* Property Details */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#4cbb17]" />
          Property Details
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Property Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Property Type
            </label>
            <div className="flex flex-wrap gap-2">
              {propertyTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, propertyType: type.value })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    formData.propertyType === type.value
                      ? 'bg-[#4cbb17]/20 text-[#4cbb17]'
                      : 'bg-[#171717] text-[#71717a] hover:bg-[#27272a]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#4cbb17]" />
          Address
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Street Address
            </label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                State
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                ZIP
              </label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Access Info */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4">Access Information</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Gate/Access Code
            </label>
            <input
              type="text"
              value={formData.gateCode}
              onChange={(e) => setFormData({ ...formData, gateCode: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Special Instructions
            </label>
            <textarea
              value={formData.specialInstructions}
              onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Link
          href={`/manage/properties/${property.id}`}
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
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}
