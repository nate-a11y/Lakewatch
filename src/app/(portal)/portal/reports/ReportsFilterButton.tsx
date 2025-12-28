'use client'

import { Filter } from 'lucide-react'
import { toast } from 'sonner'

export default function ReportsFilterButton() {
  return (
    <button
      onClick={() => toast.info('Filter options coming soon')}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors"
    >
      <Filter className="w-4 h-4" />
      Filter
    </button>
  )
}
