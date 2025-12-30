'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Wrench,
  Building2,
  User,
  Calendar,
  Loader2,
  AlertTriangle,
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

interface Technician {
  id: string
  name: string
}

interface InitialData {
  id: string
  customerId: string
  propertyId: string
  type: string
  priority: string
  title: string
  description: string
  scheduledDate: string
  assignedTechId: string
  status: string
}

interface EditRequestClientProps {
  initialData: InitialData
  customers: Customer[]
  properties: Property[]
  technicians: Technician[]
}

export default function EditRequestClient({
  initialData,
  customers,
  properties,
  technicians,
}: EditRequestClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerId: initialData.customerId,
    propertyId: initialData.propertyId,
    type: initialData.type,
    priority: initialData.priority,
    title: initialData.title,
    description: initialData.description,
    scheduledDate: initialData.scheduledDate,
    assignedTechId: initialData.assignedTechId,
    status: initialData.status,
  })

  const requestTypes = [
    { value: 'repair', label: 'Repair', icon: Wrench },
    { value: 'maintenance', label: 'Maintenance', icon: Building2 },
    { value: 'emergency', label: 'Emergency', icon: AlertTriangle },
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const filteredProperties = formData.customerId
    ? properties.filter(p => p.customerId === formData.customerId)
    : properties

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/service-requests/${initialData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType: formData.type,
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status: formData.status,
          scheduledDate: formData.scheduledDate || null,
          assignedToId: formData.assignedTechId ? parseInt(formData.assignedTechId) : null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update service request')
      }

      toast.success('Service request updated successfully')
      router.push(`/manage/requests/${initialData.id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update service request')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/manage/requests/${initialData.id}`}
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to request
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Edit Service Request</h1>
        <p className="text-[#a1a1aa]">Update the service request details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Status</h2>
          <div className="flex flex-wrap gap-2">
            {statuses.map(status => (
              <button
                key={status.value}
                type="button"
                onClick={() => setFormData({ ...formData, status: status.value })}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.status === status.value
                    ? status.value === 'completed' ? 'bg-green-500/20 text-green-500' :
                      status.value === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                      status.value === 'in_progress' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-[#4cbb17]/20 text-[#4cbb17]'
                    : 'bg-[#171717] text-[#71717a] hover:bg-[#27272a]'
                }`}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request Type */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Request Type</h2>
          <div className="grid grid-cols-3 gap-3">
            {requestTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.value })}
                className={`p-4 rounded-lg border transition-colors text-center ${
                  formData.type === type.value
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] hover:border-[#4cbb17]/50'
                }`}
              >
                <type.icon className={`w-6 h-6 mx-auto mb-2 ${
                  formData.type === type.value ? 'text-[#4cbb17]' : 'text-[#71717a]'
                }`} />
                <span className={formData.type === type.value ? 'text-[#4cbb17]' : ''}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Customer & Property */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[#4cbb17]" />
            Customer & Property
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Customer
              </label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value, propertyId: '' })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">All customers</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>{customer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Property *
              </label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">Select property</option>
                {filteredProperties.map(property => (
                  <option key={property.id} value={property.id}>{property.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#4cbb17]" />
            Request Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Fix leaky faucet, Replace HVAC filter"
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the issue or work needed..."
                rows={4}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Priority
              </label>
              <div className="flex gap-2">
                {priorities.map(priority => (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: priority.value })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      formData.priority === priority.value
                        ? priority.value === 'urgent' ? 'bg-red-500/20 text-red-500' :
                          priority.value === 'high' ? 'bg-orange-500/20 text-orange-500' :
                          'bg-[#4cbb17]/20 text-[#4cbb17]'
                        : 'bg-[#171717] text-[#71717a] hover:bg-[#27272a]'
                    }`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Assignment */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4cbb17]" />
            Assignment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Assign Technician
              </label>
              <select
                value={formData.assignedTechId}
                onChange={(e) => setFormData({ ...formData, assignedTechId: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">Unassigned</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href={`/manage/requests/${initialData.id}`}
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
    </div>
  )
}
