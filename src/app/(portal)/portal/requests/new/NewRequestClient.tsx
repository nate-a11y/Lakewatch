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
  Check,
  Plus,
  Trash2,
  Upload,
  ImageIcon,
  ChevronRight,
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
    priceRange: '$75-150',
    examples: ['Turn on HVAC', 'Stock groceries', 'Fresh linens', 'Open blinds'],
  },
  {
    id: 'post_departure',
    name: 'Post-Departure Closing',
    description: 'Close up the property after you leave',
    icon: Sparkles,
    priceRange: '$75-150',
    examples: ['Set away temps', 'Check all doors/windows', 'Clear fridge'],
  },
  {
    id: 'grocery_stocking',
    name: 'Grocery Stocking',
    description: 'Have groceries waiting when you arrive',
    icon: ShoppingCart,
    priceRange: '$50 + cost of goods',
    examples: ['Provide shopping list', 'We shop and stock'],
    hasShoppingList: true,
  },
  {
    id: 'contractor_meetup',
    name: 'Contractor Meet-up',
    description: 'We meet contractors on your behalf',
    icon: Wrench,
    priceRange: '$40/hour',
    examples: ['HVAC service', 'Pest control', 'Repairs', 'Deliveries'],
  },
  {
    id: 'storm_check',
    name: 'Storm Check',
    description: 'Extra inspection after severe weather',
    icon: CloudRain,
    priceRange: '$60',
    examples: ['Check for damage', 'Document conditions', 'Secure property'],
  },
  {
    id: 'custom',
    name: 'Custom Request',
    description: 'Something else? Let us know!',
    icon: FileText,
    priceRange: 'Quote on request',
    examples: ['We\'ll work with you on any special requests'],
  },
]

interface GroceryItem {
  name: string
  quantity: string
}

export default function NewRequestClient({ properties }: { properties: Property[] }) {
  const router = useRouter()
  const [step, setStep] = useState(properties.length > 1 ? 1 : 2)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedProperty, setSelectedProperty] = useState<string>(
    properties.length === 1 ? properties[0].id : ''
  )
  const [preferredDate, setPreferredDate] = useState('')
  const [isFlexible, setIsFlexible] = useState(true)
  const [preferredTime, setPreferredTime] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'normal' | 'high' | 'urgent'>('normal')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([{ name: '', quantity: '' }])
  const [photos, setPhotos] = useState<File[]>([])

  const totalSteps = properties.length > 1 ? 4 : 3
  const adjustedStep = properties.length > 1 ? step : step + 1

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const groceryList = selectedType === 'grocery_stocking'
        ? groceryItems.filter(item => item.name.trim()).map(item => `${item.quantity} ${item.name}`.trim()).join('\n')
        : ''

      const fullDescription = groceryList
        ? `${description}\n\nGrocery List:\n${groceryList}`
        : description

      const response = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: parseInt(selectedProperty),
          requestType: selectedType,
          title: selectedTypeData?.name || 'Service Request',
          description: fullDescription,
          priority,
          preferredDate: preferredDate || null,
          preferredTimeStart: preferredTime || null,
          isFlexible,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit request')
      }

      toast.success('Request submitted successfully!')
      router.push('/portal/requests?success=true')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit request')
      setIsSubmitting(false)
    }
  }

  const selectedTypeData = REQUEST_TYPES.find(t => t.id === selectedType)
  const selectedPropertyData = properties.find(p => p.id === selectedProperty)

  const addGroceryItem = () => {
    setGroceryItems([...groceryItems, { name: '', quantity: '' }])
  }

  const removeGroceryItem = (index: number) => {
    setGroceryItems(groceryItems.filter((_, i) => i !== index))
  }

  const updateGroceryItem = (index: number, field: 'name' | 'quantity', value: string) => {
    const newItems = [...groceryItems]
    newItems[index][field] = value
    setGroceryItems(newItems)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPhotos([...photos, ...Array.from(e.target.files)])
    }
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const canProceedToReview = selectedProperty !== '' && selectedType !== null

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/portal/requests"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors min-h-[44px]"
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
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
              adjustedStep >= s + (properties.length > 1 ? 0 : 1)
                ? 'bg-[#4cbb17] text-black'
                : 'bg-[#27272a] text-[#71717a]'
            }`}>
              {adjustedStep > s + (properties.length > 1 ? 0 : 1) ? (
                <Check className="w-4 h-4" />
              ) : (
                s
              )}
            </div>
            {s < totalSteps && (
              <div className={`w-8 sm:w-12 h-0.5 ${
                adjustedStep > s + (properties.length > 1 ? 0 : 1) ? 'bg-[#4cbb17]' : 'bg-[#27272a]'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Property (only if multiple) */}
      {step === 1 && properties.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">Select Property</h2>
          <div className="grid gap-3">
            {properties.map((property) => (
              <button
                key={property.id}
                onClick={() => {
                  setSelectedProperty(property.id)
                  setStep(2)
                }}
                className={`text-left p-4 rounded-xl border transition-all ${
                  selectedProperty === property.id
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] bg-[#0f0f0f] hover:border-[#4cbb17]/50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    selectedProperty === property.id ? 'bg-[#4cbb17]/20' : 'bg-[#27272a]'
                  }`}>
                    <Building2 className={`w-6 h-6 ${
                      selectedProperty === property.id ? 'text-[#4cbb17]' : 'text-[#71717a]'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-[#71717a]">{property.address}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#71717a]" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Select Type */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold mb-4">What do you need?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {REQUEST_TYPES.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  setSelectedType(type.id)
                  setStep(3)
                }}
                className={`text-left p-4 rounded-xl border transition-all hover:scale-[1.01] active:scale-[0.99] ${
                  selectedType === type.id
                    ? 'border-[#4cbb17] bg-[#4cbb17]/10'
                    : 'border-[#27272a] bg-[#0f0f0f] hover:border-[#4cbb17]/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    selectedType === type.id ? 'bg-[#4cbb17]/20' : 'bg-[#27272a]'
                  }`}>
                    <type.icon className={`w-5 h-5 ${
                      selectedType === type.id ? 'text-[#4cbb17]' : 'text-[#71717a]'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{type.name}</p>
                    <p className="text-sm text-[#71717a] mt-0.5">{type.description}</p>
                    <p className="text-sm text-[#4cbb17] mt-2 font-medium">{type.priceRange}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
          {properties.length > 1 && (
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-[#71717a] hover:text-white transition-colors min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4 inline mr-2" />
              Change property
            </button>
          )}
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Selected items summary */}
          <div className="flex flex-wrap gap-2">
            {selectedPropertyData && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#27272a] rounded-full text-sm">
                <Building2 className="w-4 h-4 text-[#4cbb17]" />
                {selectedPropertyData.name}
              </div>
            )}
            {selectedTypeData && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#27272a] rounded-full text-sm">
                <selectedTypeData.icon className="w-4 h-4 text-[#4cbb17]" />
                {selectedTypeData.name}
                <button
                  onClick={() => setStep(2)}
                  className="text-[#71717a] hover:text-white ml-1"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Date/Time with Flexible toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">When do you need this?</label>
              <button
                onClick={() => setIsFlexible(!isFlexible)}
                className={`text-sm px-3 py-1 rounded-full transition-colors ${
                  isFlexible
                    ? 'bg-[#4cbb17]/10 text-[#4cbb17]'
                    : 'bg-[#27272a] text-[#71717a]'
                }`}
              >
                {isFlexible ? 'Flexible' : 'Specific time'}
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#71717a] mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17] min-h-[44px]"
                />
              </div>
              {!isFlexible && (
                <div>
                  <label className="block text-sm text-[#71717a] mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Preferred Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17] min-h-[44px]"
                  >
                    <option value="">Select time</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="12:00">12:00 PM</option>
                    <option value="13:00">1:00 PM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Grocery Shopping List (for grocery_stocking type) */}
          {selectedType === 'grocery_stocking' && (
            <div>
              <label className="block text-sm font-medium mb-3">
                <ShoppingCart className="w-4 h-4 inline mr-2" />
                Shopping List
              </label>
              <div className="space-y-2">
                {groceryItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateGroceryItem(index, 'quantity', e.target.value)}
                      className="w-24 px-3 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateGroceryItem(index, 'name', e.target.value)}
                      className="flex-1 px-3 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] text-sm"
                    />
                    {groceryItems.length > 1 && (
                      <button
                        onClick={() => removeGroceryItem(index)}
                        className="p-2 text-[#71717a] hover:text-red-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addGroceryItem}
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm text-[#4cbb17] hover:bg-[#4cbb17]/10 rounded-lg transition-colors min-h-[44px]"
                >
                  <Plus className="w-4 h-4" />
                  Add item
                </button>
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Special Instructions
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`Tell us more about what you need...\n\n${
                selectedTypeData?.examples?.map(e => `• ${e}`).join('\n') || ''
              }`}
              rows={4}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17] resize-none"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">
              <ImageIcon className="w-4 h-4 inline mr-2" />
              Reference Photos (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#27272a]">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#27272a] flex flex-col items-center justify-center cursor-pointer hover:border-[#4cbb17]/50 transition-colors">
                <Upload className="w-5 h-5 text-[#71717a]" />
                <span className="text-xs text-[#71717a] mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Priority */}
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
                  className={`flex-1 p-3 rounded-xl border text-center transition-all active:scale-[0.98] ${
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
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors min-h-[44px]"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!canProceedToReview}
              className="flex-1 px-6 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Review Request
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Review Your Request</h2>

          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl divide-y divide-[#27272a]">
            <div className="p-4">
              <p className="text-sm text-[#71717a]">Request Type</p>
              <div className="flex items-center gap-2 mt-1">
                {selectedTypeData && <selectedTypeData.icon className="w-5 h-5 text-[#4cbb17]" />}
                <p className="font-medium">{selectedTypeData?.name}</p>
              </div>
              <p className="text-sm text-[#4cbb17] mt-1">{selectedTypeData?.priceRange}</p>
            </div>
            <div className="p-4">
              <p className="text-sm text-[#71717a]">Property</p>
              <p className="font-medium">{selectedPropertyData?.name}</p>
              <p className="text-sm text-[#71717a]">{selectedPropertyData?.address}</p>
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
                  {!isFlexible && preferredTime && ` at ${preferredTime}`}
                </p>
                {isFlexible && (
                  <p className="text-sm text-[#4cbb17]">Flexible timing</p>
                )}
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
            {selectedType === 'grocery_stocking' && groceryItems.some(item => item.name.trim()) && (
              <div className="p-4">
                <p className="text-sm text-[#71717a]">Shopping List</p>
                <ul className="mt-1 space-y-1">
                  {groceryItems
                    .filter(item => item.name.trim())
                    .map((item, i) => (
                      <li key={i} className="text-sm">
                        {item.quantity && <span className="text-[#71717a]">{item.quantity} </span>}
                        {item.name}
                      </li>
                    ))}
                </ul>
              </div>
            )}
            {description && (
              <div className="p-4">
                <p className="text-sm text-[#71717a]">Special Instructions</p>
                <p className="whitespace-pre-wrap">{description}</p>
              </div>
            )}
            {photos.length > 0 && (
              <div className="p-4">
                <p className="text-sm text-[#71717a] mb-2">Reference Photos</p>
                <div className="flex gap-2">
                  {photos.map((photo, i) => (
                    <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-[#27272a]">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
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
              onClick={() => setStep(3)}
              className="px-6 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors min-h-[44px]"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 min-h-[44px]"
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

          {/* Success state would show confetti and "Add to Calendar" option */}
        </div>
      )}
    </div>
  )
}
