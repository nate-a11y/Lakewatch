'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Edit, Calendar, FileText, XCircle, MessageSquare, UserPlus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface RequestActionButtonsProps {
  requestId: string
  customerId: number
  status: string
}

export default function RequestActionButtons({ requestId, status }: RequestActionButtonsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMarkComplete = async () => {
    setIsUpdating(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!response.ok) {
        throw new Error('Failed to update request')
      }

      toast.success('Request marked as complete')
      router.refresh()
    } catch {
      toast.error('Failed to mark request as complete')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEdit = () => {
    router.push(`/manage/requests/${requestId}/edit`)
  }

  return (
    <div className="flex gap-2">
      {status !== 'completed' && (
        <button
          onClick={handleMarkComplete}
          disabled={isUpdating}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
        >
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          Mark Complete
        </button>
      )}
      <button
        onClick={handleEdit}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
      >
        <Edit className="w-4 h-4" />
        Edit
      </button>
    </div>
  )
}

interface QuickActionsProps {
  requestId: string
  customerId: number
}

export function RequestQuickActions({ requestId }: QuickActionsProps) {
  const router = useRouter()
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [isScheduling, setIsScheduling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleSchedule = async () => {
    if (!scheduledDate) {
      toast.error('Please select a date')
      return
    }

    setIsScheduling(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          scheduledTime: scheduledTime || null,
          status: 'scheduled',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to schedule request')
      }

      toast.success('Request scheduled successfully')
      setShowScheduleModal(false)
      router.refresh()
    } catch {
      toast.error('Failed to schedule request')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleCreateInvoice = () => {
    router.push(`/manage/invoices/new?request=${requestId}`)
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return

    setIsCancelling(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel request')
      }

      toast.success('Request cancelled')
      router.refresh()
    } catch {
      toast.error('Failed to cancel request')
    } finally {
      setIsCancelling(false)
    }
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={() => setShowScheduleModal(true)}
          className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Schedule
        </button>
        <button
          onClick={handleCreateInvoice}
          className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          Create Invoice
        </button>
        <button
          onClick={handleCancel}
          disabled={isCancelling}
          className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Cancel Request
        </button>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Schedule Request</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="p-1 hover:bg-[#27272a] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-4 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#a1a1aa] mb-2">
                  Time (optional)
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-4 py-2 bg-[#171717] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={isScheduling || !scheduledDate}
                  className="flex-1 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isScheduling && <Loader2 className="w-4 h-4 animate-spin" />}
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface MessageCustomerButtonProps {
  customerId: number
}

export function MessageCustomerButton({ customerId }: MessageCustomerButtonProps) {
  const router = useRouter()

  const handleMessage = () => {
    router.push(`/manage/messages/new?customer=${customerId}`)
  }

  return (
    <button
      onClick={handleMessage}
      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors text-sm"
    >
      <MessageSquare className="w-4 h-4" />
      Message Customer
    </button>
  )
}

interface Technician {
  id: number
  first_name: string
  last_name: string
}

interface AssignTechnicianButtonProps {
  requestId: string
}

export function AssignTechnicianButton({ requestId }: AssignTechnicianButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedTech, setSelectedTech] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (showModal) {
      loadTechnicians()
    }
  }, [showModal])

  const loadTechnicians = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/team?role=technician')
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data.data || [])
      }
    } catch {
      toast.error('Failed to load technicians')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedTech) {
      toast.error('Please select a technician')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selectedTech }),
      })

      if (!response.ok) {
        throw new Error('Failed to assign technician')
      }

      toast.success('Technician assigned successfully')
      setShowModal(false)
      router.refresh()
    } catch {
      toast.error('Failed to assign technician')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#27272a] rounded-lg text-[#71717a] hover:text-white hover:border-[#4cbb17] transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-sm">Assign technician</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Assign Technician</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#27272a] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#4cbb17]" />
              </div>
            ) : technicians.length === 0 ? (
              <p className="text-center text-[#71717a] py-8">No technicians available</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTech(tech.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedTech === tech.id
                        ? 'bg-[#4cbb17]/10 border border-[#4cbb17]'
                        : 'bg-[#171717] border border-transparent hover:border-[#27272a]'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                      {tech.first_name?.[0]}{tech.last_name?.[0]}
                    </div>
                    <span className="font-medium">
                      {tech.first_name} {tech.last_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-4 border-t border-[#27272a]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning || !selectedTech}
                className="flex-1 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

interface ChangeAssignmentButtonProps {
  requestId: string
}

export function ChangeAssignmentButton({ requestId }: ChangeAssignmentButtonProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [selectedTech, setSelectedTech] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)

  useEffect(() => {
    if (showModal) {
      loadTechnicians()
    }
  }, [showModal])

  const loadTechnicians = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/team?role=technician')
      if (response.ok) {
        const data = await response.json()
        setTechnicians(data.data || [])
      }
    } catch {
      toast.error('Failed to load technicians')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedTech) {
      toast.error('Please select a technician')
      return
    }

    setIsAssigning(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedToId: selectedTech }),
      })

      if (!response.ok) {
        throw new Error('Failed to reassign technician')
      }

      toast.success('Technician reassigned successfully')
      setShowModal(false)
      router.refresh()
    } catch {
      toast.error('Failed to reassign technician')
    } finally {
      setIsAssigning(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="text-sm text-[#4cbb17] hover:underline"
      >
        Change
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Change Assignment</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-[#27272a] rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#4cbb17]" />
              </div>
            ) : technicians.length === 0 ? (
              <p className="text-center text-[#71717a] py-8">No technicians available</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {technicians.map((tech) => (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTech(tech.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                      selectedTech === tech.id
                        ? 'bg-[#4cbb17]/10 border border-[#4cbb17]'
                        : 'bg-[#171717] border border-transparent hover:border-[#27272a]'
                    }`}
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                      {tech.first_name?.[0]}{tech.last_name?.[0]}
                    </div>
                    <span className="font-medium">
                      {tech.first_name} {tech.last_name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-4 mt-4 border-t border-[#27272a]">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={isAssigning || !selectedTech}
                className="flex-1 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isAssigning && <Loader2 className="w-4 h-4 animate-spin" />}
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
