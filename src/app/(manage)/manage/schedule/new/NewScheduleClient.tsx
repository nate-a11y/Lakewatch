'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  Building2,
  Clock,
  Repeat,
  Loader2,
  Users,
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

interface NewScheduleClientProps {
  customers: Customer[]
  properties: Property[]
  technicians: Technician[]
}

export default function NewScheduleClient({
  customers,
  properties,
  technicians,
}: NewScheduleClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    propertyId: '',
    customerId: '',
    technicianId: '',
    date: '',
    time: '09:00',
    type: 'inspection',
    priority: 'normal',
    recurring: 'none',
    notes: '',
  })

  const filteredProperties = formData.customerId
    ? properties.filter(p => p.customerId === formData.customerId)
    : properties

  const jobTypes = [
    { value: 'inspection', label: 'Routine Inspection' },
    { value: 'service', label: 'Service Call' },
    { value: 'treatment', label: 'Treatment' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'followup', label: 'Follow-up Visit' },
  ]

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ]

  const recurringOptions = [
    { value: 'none', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 weeks' },
    { value: 'monthly', label: 'Monthly' },
  ]

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00',
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.propertyId) {
      toast.error('Please select a property')
      return
    }

    if (!formData.date) {
      toast.error('Please select a date')
      return
    }

    if (!formData.technicianId) {
      toast.error('Please assign a technician')
      return
    }

    setIsSubmitting(true)

    // TODO: Implement actual API call to create inspection
    await new Promise(resolve => setTimeout(resolve, 1000))

    toast.success('Inspection scheduled successfully')
    router.push('/manage/schedule')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/manage/schedule"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to schedule
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Schedule Inspection</h1>
        <p className="text-[#a1a1aa]">Schedule a new inspection or service visit</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Property Selection */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#4cbb17]" />
            Property
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Customer (optional filter)
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

        {/* Date & Time */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4cbb17]" />
            Date & Time
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Time *
              </label>
              <select
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                {timeSlots.map(time => (
                  <option key={time} value={time}>
                    {new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#4cbb17]" />
            Job Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Job Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                {jobTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
              >
                {priorities.map(priority => (
                  <option key={priority.value} value={priority.value}>{priority.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Technician Assignment */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#4cbb17]" />
            Technician
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Assign Technician *
            </label>
            <select
              value={formData.technicianId}
              onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            >
              <option value="">Select technician</option>
              {technicians.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurring */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Repeat className="w-5 h-5 text-[#4cbb17]" />
            Recurring Schedule
          </h2>

          <div>
            <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
              Repeat
            </label>
            <select
              value={formData.recurring}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
              className="w-full px-4 py-3 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
            >
              {recurringOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {formData.recurring !== 'none' && (
              <p className="text-xs text-[#71717a] mt-2">
                This will create recurring visits at the selected interval.
              </p>
            )}
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
            placeholder="Any special instructions for this visit..."
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/manage/schedule"
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
                Scheduling...
              </>
            ) : (
              'Schedule'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
