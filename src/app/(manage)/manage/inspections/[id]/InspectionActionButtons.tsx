'use client'

import { useRouter } from 'next/navigation'
import { Download, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'

interface InspectionActionButtonsProps {
  inspectionId: string
  customerId: number
}

export default function InspectionActionButtons({ customerId }: InspectionActionButtonsProps) {
  const router = useRouter()

  const handleExportPDF = () => {
    toast.info('PDF export will be generated and downloaded')
    // Future: Generate and download PDF report
  }

  const handleMessage = () => {
    router.push(`/manage/messages/new?customer=${customerId}`)
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleExportPDF}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
      >
        <Download className="w-4 h-4" />
        Export PDF
      </button>
      <button
        onClick={handleMessage}
        className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        Message
      </button>
    </div>
  )
}
