'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Phone,
  Key,
  Wifi,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  ChevronRight,
  ChevronDown,
  Navigation,
  Clock,
  Send,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type ChecklistItemStatus = 'pass' | 'fail' | 'attention' | 'na' | null

interface ChecklistItem {
  id: string
  category: string
  name: string
  required: boolean
  requiresPhoto: boolean
  status: ChecklistItemStatus
  notes: string
  photos: string[]
}

type InspectionStep = 'info' | 'checkin' | 'checklist' | 'summary' | 'complete'

export default function InspectionPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [step, setStep] = useState<InspectionStep>('info')
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Exterior'])
  const [currentItemId, setCurrentItemId] = useState<string | null>(null)
  const [summaryNotes, setSummaryNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const updateItemStatus = (itemId: string, status: ChecklistItemStatus) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    )
  }

  const updateItemNotes = (itemId: string, notes: string) => {
    setChecklistItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, notes } : item
      )
    )
  }

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    // Simulate GPS verification
    await new Promise(resolve => setTimeout(resolve, 2000))
    setCheckedIn(true)
    setIsCheckingIn(false)
    setStep('checklist')
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setStep('complete')
    setIsSubmitting(false)
  }

  const completedCount = checklistItems.filter(item => item.status !== null).length
  const totalCount = checklistItems.length
  const issuesCount = checklistItems.filter(item => item.status === 'fail' || item.status === 'attention').length
  const progress = (completedCount / totalCount) * 100

  // Property Info Step
  if (step === 'info') {
    return (
      <div className="max-w-lg mx-auto pb-24">
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
              <p className="font-mono font-bold text-lg">{property.accessInfo.gateCode}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Lockbox</p>
              <p className="font-mono font-bold text-lg">{property.accessInfo.lockboxCode}</p>
            </div>
            <div>
              <p className="text-[#71717a]">Alarm</p>
              <p className="font-mono font-bold text-lg">{property.accessInfo.alarmCode}</p>
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
            <button
              onClick={handleCheckIn}
              className="px-8 py-4 bg-[#4cbb17] text-black font-bold text-lg rounded-xl hover:bg-[#60e421] transition-colors"
            >
              <MapPin className="w-6 h-6 inline mr-2" />
              Check In
            </button>
          )}
        </div>
      </div>
    )
  }

  // Checklist Step
  if (step === 'checklist') {
    return (
      <div className="max-w-lg mx-auto pb-32">
        <div className="sticky top-0 bg-black z-10 pb-4 -mx-4 px-4">
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

                          {/* Notes & Photos (show if issue) */}
                          {(item.status === 'fail' || item.status === 'attention' || item.requiresPhoto) && (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Add notes..."
                                value={item.notes}
                                onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                className="w-full px-3 py-2 bg-black/30 border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
                              />
                              <button className="flex items-center gap-2 px-3 py-2 border border-dashed border-[#27272a] rounded-lg text-sm text-[#71717a] hover:border-[#4cbb17] hover:text-[#4cbb17] transition-colors">
                                <Camera className="w-4 h-4" />
                                Add Photo
                              </button>
                            </div>
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
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Summary Notes */}
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-6">
          <h2 className="font-semibold mb-4">Summary Notes</h2>
          <textarea
            value={summaryNotes}
            onChange={(e) => setSummaryNotes(e.target.value)}
            placeholder="Add any additional notes about the inspection..."
            rows={4}
            className="w-full px-3 py-2 bg-black/30 border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17] resize-none"
          />
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

  // Complete Step
  if (step === 'complete') {
    return (
      <div className="max-w-lg mx-auto pb-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Inspection Complete!</h2>
          <p className="text-[#71717a] mb-8">
            The report has been submitted and will be sent to the customer.
          </p>

          <div className="space-y-3">
            <Link
              href="/field"
              className="block w-full py-4 bg-[#4cbb17] text-black font-bold rounded-xl hover:bg-[#60e421] transition-colors text-center"
            >
              Back to Route
            </Link>
            <button className="w-full py-4 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors">
              View Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
