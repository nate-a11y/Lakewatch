'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface CustomerActionButtonsProps {
  customerId: string
}

export default function CustomerActionButtons({ customerId }: CustomerActionButtonsProps) {
  const router = useRouter()

  const handleMessage = () => {
    router.push(`/manage/messages/new?customer=${customerId}`)
  }

  const handleEdit = () => {
    toast.info('Edit customer feature coming soon')
    // Future: router.push(`/manage/customers/${customerId}/edit`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleMessage}
        className="p-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
        title="Send message"
      >
        <MessageSquare className="w-5 h-5" />
      </button>
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
