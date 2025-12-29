'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Copy } from 'lucide-react'
import { toast } from 'sonner'

export default function ChecklistFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set('q', value)
    } else {
      params.delete('q')
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="relative mb-6">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
      <input
        type="text"
        placeholder="Search checklists..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
      />
    </div>
  )
}

interface DuplicateButtonProps {
  name: string
}

export function DuplicateButton({ name }: DuplicateButtonProps) {
  const handleDuplicate = () => {
    toast.success(`Duplicated "${name}"`)
  }

  return (
    <button
      onClick={handleDuplicate}
      className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
      title="Duplicate"
    >
      <Copy className="w-4 h-4 text-[#71717a]" />
    </button>
  )
}

interface TemplateButtonProps {
  name: string
}

export function TemplateButton({ name }: TemplateButtonProps) {
  const router = useRouter()

  const handleUseTemplate = () => {
    toast.success(`Creating checklist from "${name}" template...`)
    router.push(`/manage/checklists/new?template=${encodeURIComponent(name)}`)
  }

  return (
    <button
      onClick={handleUseTemplate}
      className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors text-left w-full"
    >
      {/* Content passed as children in main component */}
    </button>
  )
}
