'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Phone,
  MapPin,
  Play,
  Camera,
  Plus,
  X,
  Minus,
  CheckCircle,
  FileText,
  Package,
  Timer,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Material {
  id: string
  name: string
  quantity: number
  unit: string
}

type RequestStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed'

interface RequestData {
  id: number
  title: string
  type: string
  property: {
    id: number
    name: string
    address: string
    city: string
    state: string
    zip: string
    ownerName: string
    ownerPhone: string
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: RequestStatus
  scheduledDate: string
  scheduledTime: string
  estimatedDuration: number
  notes: string
  createdAt: string
}

const COMMON_MATERIALS = [
  { id: 'filter-20x25', name: 'HVAC Filter 20x25x1', unit: 'each' },
  { id: 'filter-16x20', name: 'HVAC Filter 16x20x1', unit: 'each' },
  { id: 'caulk-silicone', name: 'Silicone Caulk', unit: 'tube' },
  { id: 'light-bulb-led', name: 'LED Light Bulb 60W', unit: 'each' },
  { id: 'batteries-aa', name: 'AA Batteries', unit: 'pack' },
  { id: 'batteries-9v', name: '9V Batteries', unit: 'each' },
  { id: 'garbage-bags', name: 'Garbage Bags', unit: 'box' },
  { id: 'cleaning-supplies', name: 'Cleaning Supplies', unit: 'lot' },
  { id: 'custom', name: 'Custom Item...', unit: 'each' },
]

export default function RequestDetailClient({ request: initialRequest }: { request: RequestData }) {
  const router = useRouter()
  const materialIdCounter = useRef(0)

  const [request, setRequest] = useState(initialRequest)

  // Completion form state
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)
  const [completionNotes, setCompletionNotes] = useState('')
  const [beforePhotos, setBeforePhotos] = useState<string[]>([])
  const [afterPhotos, setAfterPhotos] = useState<string[]>([])
  const [materialsUsed, setMaterialsUsed] = useState<Material[]>([])
  const [showMaterialPicker, setShowMaterialPicker] = useState(false)
  const [customMaterialName, setCustomMaterialName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFullNotes, setShowFullNotes] = useState(false)
  const photoCounter = useRef(0)

  // Update elapsed time every minute
  useEffect(() => {
    if (!startTime) return
    const interval = setInterval(() => {
      setElapsedMinutes(Math.round((new Date().getTime() - startTime.getTime()) / 60000))
    }, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  const handleStart = () => {
    setStartTime(new Date())
    setElapsedMinutes(0)
    setRequest({ ...request, status: 'in_progress' })
    toast.success('Service request started')
  }

  const handleAddPhoto = (type: 'before' | 'after') => {
    photoCounter.current += 1
    const mockUrl = `/api/placeholder/400/300?t=${photoCounter.current}`
    if (type === 'before') {
      setBeforePhotos([...beforePhotos, mockUrl])
    } else {
      setAfterPhotos([...afterPhotos, mockUrl])
    }
    toast.success(`${type === 'before' ? 'Before' : 'After'} photo added`)
  }

  const handleRemovePhoto = (type: 'before' | 'after', index: number) => {
    if (type === 'before') {
      setBeforePhotos(beforePhotos.filter((_, i) => i !== index))
    } else {
      setAfterPhotos(afterPhotos.filter((_, i) => i !== index))
    }
  }

  const handleAddMaterial = (material: typeof COMMON_MATERIALS[0]) => {
    if (material.id === 'custom') {
      if (!customMaterialName.trim()) return
      materialIdCounter.current += 1
      const newMaterial: Material = {
        id: `custom-${materialIdCounter.current}`,
        name: customMaterialName.trim(),
        quantity: 1,
        unit: 'each',
      }
      setMaterialsUsed([...materialsUsed, newMaterial])
      setCustomMaterialName('')
    } else {
      const existing = materialsUsed.find(m => m.id === material.id)
      if (existing) {
        setMaterialsUsed(materialsUsed.map(m =>
          m.id === material.id ? { ...m, quantity: m.quantity + 1 } : m
        ))
      } else {
        setMaterialsUsed([...materialsUsed, { ...material, quantity: 1 }])
      }
    }
    setShowMaterialPicker(false)
  }

  const handleUpdateQuantity = (id: string, delta: number) => {
    setMaterialsUsed(materialsUsed.map(m => {
      if (m.id === id) {
        const newQty = Math.max(0, m.quantity + delta)
        return newQty === 0 ? null : { ...m, quantity: newQty }
      }
      return m
    }).filter(Boolean) as Material[])
  }

  const handleComplete = async () => {
    if (!completionNotes.trim()) {
      toast.error('Please add completion notes')
      return
    }

    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    setRequest({ ...request, status: 'completed' })
    setIsSubmitting(false)
    toast.success('Service request completed!')

    setTimeout(() => {
      router.push('/field/requests')
    }, 1500)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'normal':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-[#27272a] text-[#71717a]'
    }
  }

  // Completed state
  if (request.status === 'completed') {
    return (
      <div className="max-w-lg mx-auto pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Request Completed!</h2>
          <p className="text-[#71717a] mb-6">
            Great work. The completion report has been submitted.
          </p>
          <Link
            href="/field/requests"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#4cbb17] text-black rounded-xl font-medium hover:bg-[#60e421] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Requests
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-32">
      <Link
        href="/field/requests"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(request.priority)}`}>
            {request.priority}
          </span>
          <span className="text-xs text-[#71717a]">{request.type}</span>
          {request.status === 'in_progress' && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-500">
              In Progress
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{request.title}</h1>
      </div>

      {/* Property Info */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#27272a] flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-[#4cbb17]" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{request.property.name}</h3>
            <p className="text-sm text-[#71717a]">
              {request.property.address}, {request.property.city}
            </p>
            <p className="text-sm text-[#71717a]">{request.property.ownerName}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${request.property.address}, ${request.property.city}, ${request.property.state} ${request.property.zip}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#4cbb17]" />
            Navigate
          </a>
          {request.property.ownerPhone && (
            <a
              href={`tel:${request.property.ownerPhone}`}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] transition-colors"
            >
              <Phone className="w-4 h-4 text-[#4cbb17]" />
              Call Owner
            </a>
          )}
        </div>
      </div>

      {/* Schedule & Duration */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#71717a] text-sm mb-1">
            <Calendar className="w-4 h-4" />
            Scheduled
          </div>
          <p className="font-semibold">{request.scheduledDate}</p>
          <p className="text-sm text-[#71717a]">{request.scheduledTime}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[#71717a] text-sm mb-1">
            <Clock className="w-4 h-4" />
            Est. Duration
          </div>
          <p className="font-semibold">{request.estimatedDuration} min</p>
          {startTime && (
            <p className="text-sm text-yellow-500">{elapsedMinutes} min elapsed</p>
          )}
        </div>
      </div>

      {/* Notes from Request */}
      {request.notes && (
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 text-[#71717a] text-sm mb-2">
            <FileText className="w-4 h-4" />
            Request Notes
          </div>
          <p className={cn(
            "text-sm text-[#a1a1aa]",
            !showFullNotes && "line-clamp-3"
          )}>
            {request.notes}
          </p>
          {request.notes.length > 150 && (
            <button
              onClick={() => setShowFullNotes(!showFullNotes)}
              className="flex items-center gap-1 text-xs text-[#4cbb17] mt-2"
            >
              {showFullNotes ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Start Button */}
      {(request.status === 'pending' || request.status === 'scheduled') && (
        <button
          onClick={handleStart}
          className="w-full flex items-center justify-center gap-3 p-4 bg-[#4cbb17] text-black rounded-xl font-semibold text-lg hover:bg-[#60e421] transition-colors mb-6"
        >
          <Play className="w-6 h-6" />
          Start Service
        </button>
      )}

      {/* In Progress - Completion Form */}
      {request.status === 'in_progress' && (
        <div className="space-y-6">
          {/* Timer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Timer className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm text-yellow-500 font-medium">Work in Progress</p>
                <p className="text-xs text-[#71717a]">
                  Started at {startTime?.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-500">
              {Math.floor(elapsedMinutes / 60)}:{String(elapsedMinutes % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Before Photos */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#4cbb17]" />
                Before Photos
              </h3>
              <span className="text-xs text-[#71717a]">{beforePhotos.length} photos</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {beforePhotos.map((_, idx) => (
                <div key={idx} className="relative aspect-square bg-[#27272a] rounded-lg overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#71717a]" />
                  </div>
                  <button
                    onClick={() => handleRemovePhoto('before', idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPhoto('before')}
                className="aspect-square border-2 border-dashed border-[#27272a] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#4cbb17]/50 transition-colors"
              >
                <Plus className="w-6 h-6 text-[#71717a]" />
                <span className="text-xs text-[#71717a]">Add</span>
              </button>
            </div>
          </div>

          {/* Materials Used */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-[#4cbb17]" />
                Materials Used
              </h3>
              <button
                onClick={() => setShowMaterialPicker(!showMaterialPicker)}
                className="text-xs text-[#4cbb17] flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* Material Picker */}
            {showMaterialPicker && (
              <div className="mb-4 p-3 bg-[#171717] rounded-lg border border-[#27272a]">
                <p className="text-xs text-[#71717a] mb-2">Select material:</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {COMMON_MATERIALS.map(material => (
                    <button
                      key={material.id}
                      onClick={() => material.id === 'custom' ? null : handleAddMaterial(material)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#27272a] transition-colors",
                        material.id === 'custom' && "text-[#4cbb17]"
                      )}
                    >
                      {material.name}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    value={customMaterialName}
                    onChange={(e) => setCustomMaterialName(e.target.value)}
                    placeholder="Custom item name..."
                    className="flex-1 px-3 py-2 bg-[#27272a] rounded-lg text-sm border border-transparent focus:border-[#4cbb17] focus:outline-none"
                  />
                  <button
                    onClick={() => handleAddMaterial(COMMON_MATERIALS.find(m => m.id === 'custom')!)}
                    disabled={!customMaterialName.trim()}
                    className="px-4 py-2 bg-[#4cbb17] text-black rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Materials List */}
            {materialsUsed.length > 0 ? (
              <div className="space-y-2">
                {materialsUsed.map(material => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-[#171717] rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{material.name}</p>
                      <p className="text-xs text-[#71717a]">{material.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(material.id, -1)}
                        className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center hover:bg-[#3f3f46] transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{material.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(material.id, 1)}
                        className="w-8 h-8 rounded-lg bg-[#27272a] flex items-center justify-center hover:bg-[#3f3f46] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#71717a] text-center py-4">
                No materials added yet
              </p>
            )}
          </div>

          {/* After Photos */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#4cbb17]" />
                After Photos
              </h3>
              <span className="text-xs text-[#71717a]">{afterPhotos.length} photos</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {afterPhotos.map((_, idx) => (
                <div key={idx} className="relative aspect-square bg-[#27272a] rounded-lg overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-[#71717a]" />
                  </div>
                  <button
                    onClick={() => handleRemovePhoto('after', idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddPhoto('after')}
                className="aspect-square border-2 border-dashed border-[#27272a] rounded-lg flex flex-col items-center justify-center gap-1 hover:border-[#4cbb17]/50 transition-colors"
              >
                <Plus className="w-6 h-6 text-[#71717a]" />
                <span className="text-xs text-[#71717a]">Add</span>
              </button>
            </div>
          </div>

          {/* Completion Notes */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-[#4cbb17]" />
              Completion Notes
              <span className="text-red-500">*</span>
            </h3>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Describe the work completed, any issues found, and recommendations..."
              className="w-full h-32 p-3 bg-[#171717] border border-[#27272a] rounded-lg text-sm resize-none focus:border-[#4cbb17] focus:outline-none"
            />
            {!completionNotes.trim() && (
              <p className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Required to complete
              </p>
            )}
          </div>

          {/* Complete Button */}
          <button
            onClick={handleComplete}
            disabled={isSubmitting || !completionNotes.trim()}
            className={cn(
              "w-full flex items-center justify-center gap-3 p-4 rounded-xl font-semibold text-lg transition-colors",
              isSubmitting || !completionNotes.trim()
                ? "bg-[#27272a] text-[#71717a] cursor-not-allowed"
                : "bg-[#4cbb17] text-black hover:bg-[#60e421]"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle className="w-6 h-6" />
                Complete Service
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
