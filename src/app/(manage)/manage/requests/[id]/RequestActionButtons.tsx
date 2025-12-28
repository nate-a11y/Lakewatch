'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle, Edit, Calendar, FileText, XCircle, MessageSquare, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface RequestActionButtonsProps {
  requestId: string
  customerId: number
  status: string
}

export default function RequestActionButtons({ requestId, customerId, status }: RequestActionButtonsProps) {
  const router = useRouter()

  const handleMarkComplete = () => {
    toast.success('Request marked as complete')
    router.refresh()
  }

  const handleEdit = () => {
    router.push(`/manage/requests/${requestId}/edit`)
  }

  return (
    <div className="flex gap-2">
      {status !== 'completed' && (
        <button
          onClick={handleMarkComplete}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
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

export function RequestQuickActions({ requestId, customerId }: QuickActionsProps) {
  const router = useRouter()

  const handleReschedule = () => {
    router.push(`/manage/schedule/new?request=${requestId}`)
  }

  const handleCreateInvoice = () => {
    router.push(`/manage/invoices/new?request=${requestId}`)
  }

  const handleCancel = () => {
    toast.info('Request cancelled')
    router.refresh()
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleReschedule}
        className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors flex items-center gap-2"
      >
        <Calendar className="w-4 h-4" />
        Reschedule
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
        className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
      >
        <XCircle className="w-4 h-4" />
        Cancel Request
      </button>
    </div>
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

interface AssignTechnicianButtonProps {
  requestId: string
}

export function AssignTechnicianButton({ requestId }: AssignTechnicianButtonProps) {
  const router = useRouter()

  const handleAssign = () => {
    toast.info('Assign technician modal will open here')
  }

  return (
    <button
      onClick={handleAssign}
      className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#27272a] rounded-lg text-[#71717a] hover:text-white hover:border-[#4cbb17] transition-colors"
    >
      <UserPlus className="w-4 h-4" />
      <span className="text-sm">Assign technician</span>
    </button>
  )
}

interface ChangeAssignmentButtonProps {
  requestId: string
}

export function ChangeAssignmentButton({ requestId }: ChangeAssignmentButtonProps) {
  const handleChange = () => {
    toast.info('Change assignment modal will open here')
  }

  return (
    <button
      onClick={handleChange}
      className="text-sm text-[#4cbb17] hover:underline"
    >
      Change
    </button>
  )
}
