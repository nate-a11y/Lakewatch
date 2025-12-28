'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'

const propertySizeOptions = [
  { value: 'under-2000', label: 'Under 2,000 sq ft' },
  { value: '2000-4000', label: '2,000 - 4,000 sq ft' },
  { value: '4000-6500', label: '4,000 - 6,500 sq ft' },
  { value: 'over-6500', label: 'Over 6,500 sq ft' },
  { value: 'unknown', label: 'Not sure' },
]

const serviceOptions = [
  { value: 'home-watch', label: 'Home Watch Inspections' },
  { value: 'pre-arrival', label: 'Pre-Arrival Preparation' },
  { value: 'post-departure', label: 'Post-Departure Closing' },
  { value: 'storm-check', label: 'Storm/Weather Checks' },
  { value: 'contractor-coordination', label: 'Contractor Coordination' },
  { value: 'concierge', label: 'Concierge Services' },
  { value: 'winterization', label: 'Winterization' },
  { value: 'summerization', label: 'Summerization' },
  { value: 'emergency', label: 'Emergency Response' },
  { value: 'other', label: 'Other' },
]

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const handleServiceToggle = (value: string) => {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      propertyAddress: formData.get('propertyAddress'),
      propertySize: formData.get('propertySize'),
      serviceInterest: selectedServices,
      message: formData.get('message'),
    }

    try {
      // Submit to Payload CMS API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setIsSubmitted(true)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-[#4cbb17]" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Thank You!</h3>
        <p className="text-[#a1a1aa]">
          We&apos;ve received your message and will get back to you within 24 hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="name"
          name="name"
          label="Full Name *"
          placeholder="John Smith"
          required
        />
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address *"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="(555) 123-4567"
        />
        <Select
          id="propertySize"
          name="propertySize"
          label="Property Size"
          placeholder="Select property size"
          options={propertySizeOptions}
        />
      </div>

      <Textarea
        id="propertyAddress"
        name="propertyAddress"
        label="Property Address"
        placeholder="123 Lake Shore Drive, Lake Ozark, MO 65049"
        className="min-h-[80px]"
      />

      {/* Service Interest Checkboxes */}
      <div>
        <label className="block text-sm font-medium text-white mb-3">
          Services You&apos;re Interested In
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {serviceOptions.map((option) => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedServices.includes(option.value)
                  ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                  : 'border-[#27272a] hover:border-[#4cbb17]/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedServices.includes(option.value)}
                onChange={() => handleServiceToggle(option.value)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center ${
                  selectedServices.includes(option.value)
                    ? 'bg-[#4cbb17] border-[#4cbb17]'
                    : 'border-[#27272a]'
                }`}
              >
                {selectedServices.includes(option.value) && (
                  <Check className="h-3 w-3 text-[#060606]" />
                )}
              </div>
              <span className="text-sm text-[#a1a1aa]">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <Textarea
        id="message"
        name="message"
        label="Message"
        placeholder="Tell us about your property and what you're looking for..."
        className="min-h-[120px]"
      />

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full md:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </Button>
    </form>
  )
}
