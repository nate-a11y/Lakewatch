'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Key,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  ChevronDown,
  Navigation,
  Send,
  Loader2,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Mic,
  X,
  ChevronRight,
  WifiOff,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type ChecklistItemStatus = 'pass' | 'fail' | 'attention' | 'na' | null
type IssueSeverity = 'low' | 'medium' | 'high' | 'critical'

interface ChecklistItem {
  id: string
  category: string
  name: string
  required: boolean
  requiresPhoto: boolean
  status: ChecklistItemStatus
  notes: string
  photos: string[]
  severity?: IssueSeverity
  actionTaken?: string
  followUpRequired?: boolean
}

type InspectionStep = 'info' | 'checkin' | 'checklist' | 'summary' | 'checkout' | 'complete'

export default function InspectionPage() {
  const params = useParams()
  const inspectionId = params.id as string

  const [step, setStep] = useState<InspectionStep>('info')
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [checkInTime, setCheckInTime] = useState<Date | null>(null)
  const [checkOutTime, setCheckOutTime] = useState<Date | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Exterior'])
  const [summaryNotes, setSummaryNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({})
  // Initialize offline state lazily to avoid SSR issues
  const [isOffline, setIsOffline] = useState(() =>
    typeof window !== 'undefined' ? !navigator.onLine : false
  )
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Mock property data
  const property = {
    id: '1',
    name: 'Lake House',
    address: '123 Lakefront Dr',
    city: 'Lake Ozark',
    state: 'MO',
    zip: '65049',
    owner: 'John Smith',
    phone: '(314) 555-1001',
    accessInfo: {
      gateCode: '1234',
      lockboxCode: '5678',
      alarmCode: '9012',
      wifiNetwork: 'LakeHouse_5G',
      wifiPassword: 'welcome123',
      notes: 'Key in lockbox on back porch. Dog is friendly. Check boat dock after storms.',
    },
    checklist: 'Premium Weekly',
    previousIssues: [
      { item: 'Boat dock', note: 'Minor damage to railing noted on last visit', date: 'Dec 20, 2025' },
    ],
  }

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([
    // Exterior
    { id: '1', category: 'Exterior', name: 'Check front door and locks', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '2', category: 'Exterior', name: 'Check back door and locks', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '3', category: 'Exterior', name: 'Inspect windows for damage', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    { id: '4', category: 'Exterior', name: 'Check garage door operation', required: false, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '5', category: 'Exterior', name: 'Inspect roof and gutters', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    { id: '6', category: 'Exterior', name: 'Check boat dock', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    // Interior
    { id: '7', category: 'Interior', name: 'Check HVAC operation', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '8', category: 'Interior', name: 'Check water heater', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '9', category: 'Interior', name: 'Inspect for water leaks (sinks)', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    { id: '10', category: 'Interior', name: 'Inspect for water leaks (toilets)', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    { id: '11', category: 'Interior', name: 'Check basement/crawl space', required: true, requiresPhoto: true, status: null, notes: '', photos: [] },
    // Systems
    { id: '12', category: 'Systems', name: 'Test smoke detectors', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '13', category: 'Systems', name: 'Test CO detectors', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '14', category: 'Systems', name: 'Check security system', required: false, requiresPhoto: false, status: null, notes: '', photos: [] },
    { id: '15', category: 'Systems', name: 'Check sump pump', required: true, requiresPhoto: false, status: null, notes: '', photos: [] },
  ])

  const categories = [...new Set(checklistItems.map(item => item.category))]

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleCodeVisibility = (code: string) => {
    setShowCodes(prev => ({ ...prev, [code]: !prev[code] }))
  }

  const updateItemStatus = (itemId: string, status: ChecklistItemStatus) => {
    setChecklistItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          // Auto-suggest severity based on item type
          let suggestedSeverity: IssueSeverity = 'medium'
          if (item.name.toLowerCase().includes('smoke') || item.name.toLowerCase().includes('co')) {
            suggestedSeverity = 'critical'
          } else if (item.name.toLowerCase().includes('water') || item.name.toLowerCase().includes('leak')) {
            suggestedSeverity = 'high'
          }
          return {
            ...item,
            status,
            severity: (status === 'fail' || status === 'attention') ? suggestedSeverity : undefined,
            followUpRequired: status === 'fail',
          }
        }
        return item
      })
    )
    if (status === 'fail' || status === 'attention') {
      setExpandedIssue(itemId)
    }
  }

  const updateItemField = (itemId: string, field: keyof ChecklistItem, value: unknown) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    // Simulate GPS verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCheckedIn(true)
    setCheckInTime(new Date())
    setIsCheckingIn(false)
    toast.success('Checked in successfully', { description: 'Location verified' })
    setStep('checklist')
  }

  const handleCheckOut = async () => {
    setCheckOutTime(new Date())
    setStep('complete')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))

    if (isOffline) {
      toast.success('Inspection saved offline', {
        description: 'Will sync when back online',
      })
    } else {
      toast.success('Inspection submitted', {
        description: 'Report sent to customer',
      })
    }

    setStep('checkout')
    setIsSubmitting(false)
  }

  const handleAddPhoto = (itemId: string) => {
    // In production, this would open camera
    toast.info('Camera would open here')
    updateItemField(itemId, 'photos', [...(checklistItems.find(i => i.id === itemId)?.photos || []), 'photo-placeholder'])
  }

  const completedCount = checklistItems.filter(item => item.status !== null).length
  const totalCount = checklistItems.length
  const progress = (completedCount / totalCount) * 100

  const nextInspection = {
    id: '2',
    property: { name: 'Guest Cabin', address: '125 Lakefront Dr, Lake Ozark' },
    time: '10:30 AM',
  }

  const duration = checkInTime && checkOutTime
    ? Math.round((checkOutTime.getTime() - checkInTime.getTime()) / 60000)
    : null

  // Offline indicator - inline JSX to avoid component-in-render issue
  const offlineIndicator = isOffline ? (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-1 text-sm font-medium z-50 flex items-center justify-center gap-2">
      <WifiOff className="w-4 h-4" />
      Offline Mode - Data will sync when connected
    </div>
  ) : null

  // Property Info Step
  if (step === 'info') {
    return (
      <div className="max-w-lg mx-auto pb-24">
        {offlineIndicator}
        <Link
          href="/field"
          className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to route
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">{property.name}</h1>
          <p className="text-[#71717a]">{property.address}, {property.city}</p>
          <p className="text-sm text-[#71717a]">{property.checklist}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.state} ${property.zip}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 p-4 bg-[#0f0f0f] border border-[#27272a] rounded-xl hover:border-[#4cbb17]/50 transition-colors"
          >
            <Navigation className="w-5 h-5 text-[#4cbb17]" />
            <span className="font-medium">Navigate</span>
          </a>
          <a
            href={`tel:${property.phone}`}
            className="flex items-center justify-center gap-2 p-4 bg-[#0f0f0f] border border-[#27272a] rounded-xl hover:border-[#4cbb17]/50 transition-colors"
          >
            <Phone className="w-5 h-5 text-[#4cbb17]" />
            <span className="font-medium">Call Owner</span>
          </a>
        </div>

        {/* Access Codes */}
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#4cbb17]" />
            Access Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#71717a]">Gate Code</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-lg">
                  {showCodes['gate'] ? property.accessInfo.gateCode : '••••'}
                </p>
                <button onClick={() => toggleCodeVisibility('gate')} className="text-[#71717a]">
                  {showCodes['gate'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[#71717a]">Lockbox</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-lg">
                  {showCodes['lockbox'] ? property.accessInfo.lockboxCode : '••••'}
                </p>
                <button onClick={() => toggleCodeVisibility('lockbox')} className="text-[#71717a]">
                  {showCodes['lockbox'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[#71717a]">Alarm</p>
              <div className="flex items-center gap-2">
                <p className="font-mono font-bold text-lg">
                  {showCodes['alarm'] ? property.accessInfo.alarmCode : '••••'}
                </p>
                <button onClick={() => toggleCodeVisibility('alarm')} className="text-[#71717a]">
                  {showCodes['alarm'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <p className="text-[#71717a]">WiFi</p>
              <p className="font-mono text-sm">{property.accessInfo.wifiNetwork}</p>
              <p className="font-mono text-xs text-[#71717a]">{property.accessInfo.wifiPassword}</p>
            </div>
          </div>
          {property.accessInfo.notes && (
            <div className="mt-4 pt-4 border-t border-[#27272a]">
              <p className="text-sm text-[#a1a1aa]">{property.accessInfo.notes}</p>
            </div>
          )}
        </section>

        {/* Previous Issues */}
        {property.previousIssues.length > 0 && (
          <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              Previous Issues to Follow Up
            </h2>
            <div className="space-y-2">
              {property.previousIssues.map((issue, i) => (
                <div key={i} className="p-3 bg-black/30 rounded-lg">
                  <p className="font-medium text-sm">{issue.item}</p>
                  <p className="text-xs text-[#a1a1aa]">{issue.note}</p>
                  <p className="text-xs text-[#71717a] mt-1">{issue.date}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Start Button */}
        <button
          onClick={() => setStep('checkin')}
          className="w-full py-4 bg-[#4cbb17] text-black font-bold text-lg rounded-xl hover:bg-[#60e421] transition-colors"
        >
          Start Inspection
        </button>
      </div>
    )
  }

  // Check-in Step
  if (step === 'checkin') {
    return (
      <div className="max-w-lg mx-auto pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        {offlineIndicator}
        <div className="text-center">
          <div className={cn(
            'w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6',
            checkedIn ? 'bg-green-500/10' : 'bg-[#27272a]'
          )}>
            {isCheckingIn ? (
              <Loader2 className="w-16 h-16 text-[#4cbb17] animate-spin" />
            ) : checkedIn ? (
              <CheckCircle className="w-16 h-16 text-green-500" />
            ) : (
              <MapPin className="w-16 h-16 text-[#71717a]" />
            )}
          </div>

          <h2 className="text-xl font-bold mb-2">
            {isCheckingIn ? 'Verifying Location...' : checkedIn ? 'Checked In!' : 'GPS Check-In'}
          </h2>
          <p className="text-[#71717a] mb-8">
            {isCheckingIn
              ? 'Please wait while we verify your location'
              : checkedIn
              ? 'Location verified. Starting checklist...'
              : 'Tap below to check in at the property'}
          </p>

          {!checkedIn && !isCheckingIn && (
            <>
              <button
                onClick={handleCheckIn}
                className="px-8 py-4 bg-[#4cbb17] text-black font-bold text-lg rounded-xl hover:bg-[#60e421] transition-colors"
              >
                <MapPin className="w-6 h-6 inline mr-2" />
                Check In
              </button>
              <button
                onClick={() => {
                  toast.info('Manual check-in', { description: 'Please note the reason' })
                  setCheckedIn(true)
                  setCheckInTime(new Date())
                  setStep('checklist')
                }}
                className="block mx-auto mt-4 text-sm text-[#71717a] hover:text-white"
              >
                Manual override (not at location)
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // Checklist Step
  if (step === 'checklist') {
    return (
      <div className="max-w-lg mx-auto pb-32">
        {offlineIndicator}
        <div className={cn("sticky top-0 bg-black z-10 pb-4 -mx-4 px-4", isOffline && "pt-8")}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">{property.name}</h1>
            <span className="text-sm text-[#71717a]">
              {completedCount}/{totalCount}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#4cbb17] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Check-in time */}
          {checkInTime && (
            <p className="text-xs text-[#71717a] mt-2 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Checked in at {checkInTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>

        {/* Checklist Categories */}
        <div className="space-y-3">
          {categories.map(category => {
            const categoryItems = checklistItems.filter(item => item.category === category)
            const categoryComplete = categoryItems.filter(item => item.status !== null).length
            const isExpanded = expandedCategories.includes(category)

            return (
              <div key={category} className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{category}</span>
                    <span className="text-xs text-[#71717a]">
                      {categoryComplete}/{categoryItems.length}
                    </span>
                  </div>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-[#71717a] transition-transform',
                    isExpanded && 'rotate-180'
                  )} />
                </button>

                {isExpanded && (
                  <div className="border-t border-[#27272a]">
                    {categoryItems.map(item => (
                      <div key={item.id} className="border-b border-[#27272a] last:border-b-0">
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.name}
                                {item.required && <span className="text-red-500 ml-1">*</span>}
                              </p>
                              {item.requiresPhoto && (
                                <p className="text-xs text-[#71717a] flex items-center gap-1 mt-1">
                                  <Camera className="w-3 h-3" /> Photo required
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Status Buttons */}
                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <button
                              onClick={() => updateItemStatus(item.id, 'pass')}
                              className={cn(
                                'p-2 rounded-lg border text-xs font-medium transition-colors flex flex-col items-center gap-1',
                                item.status === 'pass'
                                  ? 'bg-green-500/10 border-green-500 text-green-500'
                                  : 'border-[#27272a] text-[#71717a] hover:border-green-500/50'
                              )}
                            >
                              <CheckCircle className="w-5 h-5" />
                              Pass
                            </button>
                            <button
                              onClick={() => updateItemStatus(item.id, 'fail')}
                              className={cn(
                                'p-2 rounded-lg border text-xs font-medium transition-colors flex flex-col items-center gap-1',
                                item.status === 'fail'
                                  ? 'bg-red-500/10 border-red-500 text-red-500'
                                  : 'border-[#27272a] text-[#71717a] hover:border-red-500/50'
                              )}
                            >
                              <XCircle className="w-5 h-5" />
                              Fail
                            </button>
                            <button
                              onClick={() => updateItemStatus(item.id, 'attention')}
                              className={cn(
                                'p-2 rounded-lg border text-xs font-medium transition-colors flex flex-col items-center gap-1',
                                item.status === 'attention'
                                  ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500'
                                  : 'border-[#27272a] text-[#71717a] hover:border-yellow-500/50'
                              )}
                            >
                              <AlertTriangle className="w-5 h-5" />
                              Attn
                            </button>
                            <button
                              onClick={() => updateItemStatus(item.id, 'na')}
                              className={cn(
                                'p-2 rounded-lg border text-xs font-medium transition-colors flex flex-col items-center gap-1',
                                item.status === 'na'
                                  ? 'bg-[#27272a] border-[#71717a] text-white'
                                  : 'border-[#27272a] text-[#71717a] hover:border-[#71717a]'
                              )}
                            >
                              <span className="text-lg font-bold">—</span>
                              N/A
                            </button>
                          </div>

                          {/* Issue Details Panel */}
                          {(item.status === 'fail' || item.status === 'attention') && expandedIssue === item.id && (
                            <div className="p-3 bg-black/30 rounded-lg border border-[#27272a] space-y-3">
                              {/* Severity */}
                              <div>
                                <label className="text-xs text-[#71717a] block mb-2">Severity</label>
                                <div className="grid grid-cols-4 gap-2">
                                  {(['low', 'medium', 'high', 'critical'] as IssueSeverity[]).map(sev => (
                                    <button
                                      key={sev}
                                      onClick={() => updateItemField(item.id, 'severity', sev)}
                                      className={cn(
                                        'p-2 rounded text-xs font-medium capitalize transition-colors',
                                        item.severity === sev
                                          ? sev === 'critical' ? 'bg-red-500 text-white'
                                          : sev === 'high' ? 'bg-orange-500 text-white'
                                          : sev === 'medium' ? 'bg-yellow-500 text-black'
                                          : 'bg-blue-500 text-white'
                                          : 'bg-[#27272a] text-[#71717a]'
                                      )}
                                    >
                                      {sev}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Notes */}
                              <div>
                                <label className="text-xs text-[#71717a] block mb-2">Description</label>
                                <div className="relative">
                                  <input
                                    type="text"
                                    placeholder="Describe the issue..."
                                    value={item.notes}
                                    onChange={(e) => updateItemField(item.id, 'notes', e.target.value)}
                                    className="w-full px-3 py-2 pr-10 bg-[#0f0f0f] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
                                  />
                                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white">
                                    <Mic className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Action Taken */}
                              <div>
                                <label className="text-xs text-[#71717a] block mb-2">Action Taken</label>
                                <select
                                  value={item.actionTaken || ''}
                                  onChange={(e) => updateItemField(item.id, 'actionTaken', e.target.value)}
                                  className="w-full px-3 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
                                >
                                  <option value="">Select action...</option>
                                  <option value="documented">Documented only</option>
                                  <option value="temporary_fix">Temporary fix applied</option>
                                  <option value="owner_notified">Owner notified</option>
                                  <option value="service_scheduled">Service scheduled</option>
                                  <option value="emergency_repair">Emergency repair initiated</option>
                                </select>
                              </div>

                              {/* Follow-up checkbox */}
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.followUpRequired || false}
                                  onChange={(e) => updateItemField(item.id, 'followUpRequired', e.target.checked)}
                                  className="w-4 h-4 rounded border-[#27272a] bg-[#0f0f0f] text-[#4cbb17] focus:ring-[#4cbb17]"
                                />
                                <span className="text-sm">Follow-up required on next visit</span>
                              </label>

                              {/* Photos */}
                              <div>
                                <label className="text-xs text-[#71717a] block mb-2">
                                  Photos {item.requiresPhoto && <span className="text-red-500">*</span>}
                                </label>
                                <div className="flex gap-2 flex-wrap">
                                  {item.photos.map((_, idx) => (
                                    <div key={idx} className="w-16 h-16 bg-[#27272a] rounded-lg flex items-center justify-center relative">
                                      <Camera className="w-6 h-6 text-[#71717a]" />
                                      <button
                                        onClick={() => updateItemField(item.id, 'photos', item.photos.filter((__, i) => i !== idx))}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleAddPhoto(item.id)}
                                    className="w-16 h-16 border-2 border-dashed border-[#27272a] rounded-lg flex items-center justify-center text-[#71717a] hover:border-[#4cbb17] hover:text-[#4cbb17] transition-colors"
                                  >
                                    <Camera className="w-6 h-6" />
                                  </button>
                                </div>
                              </div>

                              <button
                                onClick={() => setExpandedIssue(null)}
                                className="w-full py-2 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] transition-colors"
                              >
                                Done
                              </button>
                            </div>
                          )}

                          {/* Collapsed issue indicator */}
                          {(item.status === 'fail' || item.status === 'attention') && expandedIssue !== item.id && (
                            <button
                              onClick={() => setExpandedIssue(item.id)}
                              className="w-full p-2 bg-black/30 rounded-lg text-xs text-[#71717a] flex items-center justify-between hover:bg-black/50 transition-colors"
                            >
                              <span>
                                {item.severity && <span className="capitalize">{item.severity} severity</span>}
                                {item.notes && <span> • {item.notes.slice(0, 30)}...</span>}
                                {!item.severity && !item.notes && 'Tap to add details'}
                              </span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}

                          {/* Photo button for required photos without issues */}
                          {item.requiresPhoto && item.status && item.status !== 'fail' && item.status !== 'attention' && (
                            <button
                              onClick={() => handleAddPhoto(item.id)}
                              className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#27272a] rounded-lg text-sm text-[#71717a] hover:border-[#4cbb17] hover:text-[#4cbb17] transition-colors"
                            >
                              <Camera className="w-4 h-4" />
                              {item.photos.length > 0 ? `${item.photos.length} photo(s)` : 'Add Photo'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom Action */}
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto">
          <button
            onClick={() => setStep('summary')}
            disabled={completedCount < totalCount}
            className="w-full py-4 bg-[#4cbb17] text-black font-bold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completedCount < totalCount
              ? `Complete All Items (${totalCount - completedCount} remaining)`
              : 'Review & Submit'}
          </button>
        </div>
      </div>
    )
  }

  // Summary Step
  if (step === 'summary') {
    const issues = checklistItems.filter(item => item.status === 'fail' || item.status === 'attention')

    return (
      <div className="max-w-lg mx-auto pb-32">
        {offlineIndicator}
        <button
          onClick={() => setStep('checklist')}
          className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to checklist
        </button>

        <h1 className="text-2xl font-bold mb-6">Review Inspection</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
            <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-green-500">
              {checklistItems.filter(i => i.status === 'pass').length}
            </p>
            <p className="text-xs text-green-500/70">Passed</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-yellow-500">
              {checklistItems.filter(i => i.status === 'attention').length}
            </p>
            <p className="text-xs text-yellow-500/70">Attention</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
            <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
            <p className="text-xl font-bold text-red-500">
              {checklistItems.filter(i => i.status === 'fail').length}
            </p>
            <p className="text-xs text-red-500/70">Failed</p>
          </div>
        </div>

        {/* Issues List */}
        {issues.length > 0 && (
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
            <h2 className="font-semibold mb-4">Issues Found ({issues.length})</h2>
            <div className="space-y-3">
              {issues.map(issue => (
                <div key={issue.id} className={cn(
                  'p-3 rounded-lg border',
                  issue.status === 'fail' ? 'border-red-500/20 bg-red-500/5' : 'border-yellow-500/20 bg-yellow-500/5'
                )}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-2">
                      {issue.status === 'fail' ? (
                        <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{issue.name}</p>
                        {issue.notes && (
                          <p className="text-xs text-[#71717a] mt-1">{issue.notes}</p>
                        )}
                      </div>
                    </div>
                    {issue.severity && (
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded capitalize',
                        issue.severity === 'critical' ? 'bg-red-500/20 text-red-400'
                        : issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400'
                        : issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-blue-500/20 text-blue-400'
                      )}>
                        {issue.severity}
                      </span>
                    )}
                  </div>
                  {issue.actionTaken && (
                    <p className="text-xs text-[#a1a1aa] mt-2">
                      <strong>Action:</strong> {issue.actionTaken.replace('_', ' ')}
                    </p>
                  )}
                  {issue.followUpRequired && (
                    <p className="text-xs text-yellow-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Follow-up required
                    </p>
                  )}
                  {issue.photos.length > 0 && (
                    <p className="text-xs text-[#71717a] mt-1 flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      {issue.photos.length} photo(s) attached
                    </p>
                  )}
                  <button
                    onClick={() => { setStep('checklist'); setExpandedIssue(issue.id) }}
                    className="text-xs text-[#4cbb17] mt-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summary Notes */}
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4cbb17]" />
            Summary Notes
          </h2>
          <div className="relative">
            <textarea
              value={summaryNotes}
              onChange={(e) => setSummaryNotes(e.target.value)}
              placeholder="Add any additional notes about the inspection..."
              rows={4}
              className="w-full px-3 py-2 bg-black/30 border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17] resize-none"
            />
            <button className="absolute right-2 bottom-2 text-[#71717a] hover:text-white p-1">
              <Mic className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-4 bg-[#4cbb17] text-black font-bold rounded-xl hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Inspection
            </>
          )}
        </button>
      </div>
    )
  }

  // Check-out Step
  if (step === 'checkout') {
    return (
      <div className="max-w-lg mx-auto pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        {offlineIndicator}
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-[#27272a] flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-16 h-16 text-[#4cbb17]" />
          </div>

          <h2 className="text-xl font-bold mb-2">GPS Check-Out</h2>
          <p className="text-[#71717a] mb-8">
            Tap to record your departure and complete the inspection
          </p>

          <button
            onClick={handleCheckOut}
            className="px-8 py-4 bg-[#4cbb17] text-black font-bold text-lg rounded-xl hover:bg-[#60e421] transition-colors"
          >
            <MapPin className="w-6 h-6 inline mr-2" />
            Check Out
          </button>
        </div>
      </div>
    )
  }

  // Complete Step
  if (step === 'complete') {
    return (
      <div className="max-w-lg mx-auto pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        {offlineIndicator}
        <div className="text-center w-full">
          <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Inspection Complete!</h2>
          <p className="text-[#71717a] mb-2">
            {isOffline
              ? 'Report saved locally and will sync when online.'
              : 'The report has been submitted and will be sent to the customer.'}
          </p>

          {duration && (
            <p className="text-sm text-[#71717a] mb-6 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4" />
              Duration: {duration} minutes
            </p>
          )}

          {/* Next Stop Card */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-[#4cbb17] font-medium mb-2">NEXT STOP</p>
            <h3 className="font-semibold mb-1">{nextInspection.property.name}</h3>
            <p className="text-sm text-[#71717a] mb-3">{nextInspection.property.address}</p>
            <div className="flex items-center gap-2 text-xs text-[#71717a] mb-3">
              <Clock className="w-3 h-3" />
              <span>{nextInspection.time}</span>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(nextInspection.property.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#4cbb17] text-black rounded-lg font-bold hover:bg-[#60e421] transition-colors"
            >
              <Navigation className="w-4 h-4" />
              Start Navigation
            </a>
          </div>

          <div className="space-y-3">
            <Link
              href="/field"
              className="block w-full py-4 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors text-center"
            >
              Back to Route
            </Link>
            <Link
              href={`/field/history/${inspectionId}`}
              className="block w-full py-3 text-[#4cbb17] hover:underline text-center"
            >
              View Report
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
