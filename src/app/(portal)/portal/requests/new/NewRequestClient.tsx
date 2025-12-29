'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  Send,
  Home,
  ShoppingCart,
  Wrench,
  CloudRain,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

interface Property {
  id: string
  name: string
  address: string
}

const REQUEST_TYPES = [
  {
    id: 'pre_arrival',
    name: 'Pre-Arrival Prep',
    description: 'Get your property ready before you arrive',
    icon: Home,
    examples: ['Turn on HVAC', 'Stock groceries', 'Fresh linens', 'Open blinds'],
  },
  {
    id: 'post_departure',
    name: 'Post-Departure',
    description: 'Close up the property after you leave',
    icon: Sparkles,
    examples: ['Set away temps', 'Check all doors/windows', 'Clear fridge'],
  },
  {
    id: 'grocery_stocking',
    name: 'Grocery Stocking',
    description: 'Have groceries waiting when you arrive',
    icon: ShoppingCart,
    examples: ['Provide shopping list', 'We shop and stock'],
  },
  {
    id: 'contractor_meetup',
    name: 'Contractor Meet-up',
    description: 'We meet contractors on your behalf',
    icon: Wrench,
    examples: ['HVAC service', 'Pest control', 'Repairs', 'Deliveries'],
  },
  {
    id: 'storm_check',
    name: 'Storm Check',
    description: 'Extra inspection after severe weather',
    icon: CloudRain,
    examples: ['Check for damage', 'Document conditions', 'Secure property'],
  },
  {
    id: 'custom',
    name: 'Custom Request',
    description: 'Something else? Let us know!',
    icon: FileText,
    examples: ['We\'ll work with you on any special requests'],
  },
]

export default function NewRequestClient({ properties }: { properties: Property[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string>('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: parseInt(selectedProperty),
          requestType: selectedType,
          title: selectedTypeData?.name || 'Service Request',
          description,
          priority,
          preferredDate: preferredDate || null,
          preferredTimeStart: preferredTime || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      router.push('/portal/requests?success=true')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request')
      setIsSubmitting(false)
    }
  }

  const selectedTypeData = REQUEST_TYPES.find(t => t.id === selectedType)

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/portal/requests"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to requests
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">New Service Request</h1>
        <p className="text-[#a1a1aa]">Tell us what you need help with</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a] text-[#71717a]'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-0.5 ${step > s ? 'bg-[#4cbb17]' : 'bg-[#27272a]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">What do you need?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id)
                  setStep(2)
                }}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  selectedType === type.id
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] bg-[#0f0f0f] hover:border-[#4cbb17]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    selectedType === type.id ? 'bg-[#4cbb17]/20' : 'bg-[#27272a]'
                  }`}>
                    <type.icon className={`w-5 h-5 ${
                      selectedType === type.id ? 'text-[#4cbb17]' : 'text-[#71717a]'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-[#71717a] mt-1">{type.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 p-4 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
            {selectedTypeData && (
              <>
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center">
                  <selectedTypeData.icon className="w-5 h-5 text-[#4cbb17]" />
                </div>
                <div>
                  <p className="font-medium">{selectedTypeData.name}</p>
                  <p className="text-sm text-[#71717a]">{selectedTypeData.description}</p>
                </div>
              </>
            )}
            <button
              onClick={() => setStep(1)}
              className="ml-auto text-sm text-[#4cbb17] hover:underline"
            >
              Change
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Property
            </label>
            <select
              value={selectedProperty}
              onChange={(e) => setSelectedProperty(e.target.value)}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17]"
            >
              <option value="">Select a property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} - {property.address}
                </option>
              ))}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Preferred Date
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">Any time</option>
                <option value="morning">Morning (8am - 12pm)</option>
                <option value="afternoon">Afternoon (12pm - 5pm)</option>
                <option value="specific">I have a specific time</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Tell us more about what you need...\n\n${
                selectedTypeData?.examples?.map(e => `• ${e}`).join('\n') || ''
              }`}
              rows={5}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17] resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <div className="flex gap-3">
              {[
                { value: 'normal' as const, label: 'Normal', desc: 'Within 48 hours' },
                { value: 'high' as const, label: 'High', desc: 'Within 24 hours' },
                { value: 'urgent' as const, label: 'Urgent', desc: 'ASAP' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={`flex-1 p-3 rounded-xl border text-center transition-colors ${
                    priority === option.value
                      ? option.value === 'urgent'
                        ? 'border-red-500 bg-red-500/10'
                        : option.value === 'high'
                        ? 'border-yellow-500 bg-yellow-500/10'
                        : 'border-[#4cbb17] bg-[#4cbb17]/10'
                      : 'border-[#27272a] bg-[#0f0f0f] hover:border-[#4cbb17]/50'
                  }`}
                >
                  <p className={`font-medium ${
                    priority === option.value
                      ? option.value === 'urgent' ? 'text-red-500' :
                        option.value === 'high' ? 'text-yellow-500' : 'text-[#4cbb17]'
                      : ''
                  }`}>{option.label}</p>
                  <p className="text-xs text-[#71717a] mt-1">{option.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedProperty}
              className="flex-1 px-6 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review & Submit */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Review Your Request</h2>

          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl divide-y divide-[#27272a]">
            <div className="p-4">
              <p className="text-sm text-[#71717a]">Request Type</p>
              <p className="font-medium">{selectedTypeData?.name}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#71717a]">Property</p>
              <p className="font-medium">
                {properties.find(p => p.id === selectedProperty)?.name}
              </p>
              <p className="text-sm text-[#71717a]">
                {properties.find(p => p.id === selectedProperty)?.address}
              </p>
            </div>
            {preferredDate && (
              <div className="p-4">
                <p className="text-sm text-[#71717a]">Preferred Date/Time</p>
                <p className="font-medium">
                  {new Date(preferredDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {preferredTime && ` • ${
                    preferredTime === 'morning' ? 'Morning (8am - 12pm)' :
                    preferredTime === 'afternoon' ? 'Afternoon (12pm - 5pm)' :
                    'Specific time'
                  }`}
                </p>
              </div>
            )}
            <div className="p-4">
              <p className="text-sm text-[#71717a]">Priority</p>
              <span className={`inline-block px-2 py-1 rounded text-sm ${
                priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
                priority === 'high' ? 'bg-yellow-500/10 text-yellow-500' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </span>
            </div>
            {description && (
              <div className="p-4">
                <p className="text-sm text-[#71717a]">Details</p>
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-[#4cbb17]/10 border border-[#4cbb17]/20 rounded-xl">
            <p className="text-sm text-[#4cbb17]">
              We&apos;ll review your request and get back to you shortly with confirmation and any questions.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
