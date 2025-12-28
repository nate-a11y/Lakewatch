import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  CheckSquare,
  ChevronRight,
  Edit,
} from 'lucide-react'
import ChecklistFilters, { DuplicateButton } from './ChecklistFilters'

export default async function ChecklistsPage() {
  const supabase = await createClient()

  // Fetch checklists with item count
  const { data: checklists, error } = await supabase
    .from('lwp_checklists')
    .select(`
      id, name, description, property_type, is_default, created_at, updated_at,
      items:lwp_checklists_items(count)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching checklists:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const checklistsList = (checklists || []).map((checklist) => {
    const itemsData = checklist.items as { count: number }[] | null
    const itemCount = itemsData?.[0]?.count || 0

    // Determine plan type based on property_type or is_default
    let plan = 'Custom'
    if (checklist.is_default) {
      plan = 'Default'
    } else if (checklist.property_type) {
      plan = checklist.property_type.charAt(0).toUpperCase() + checklist.property_type.slice(1)
    }

    return {
      id: checklist.id,
      name: checklist.name,
      description: checklist.description || 'No description',
      itemCount,
      plan,
      lastUpdated: formatDate(checklist.updated_at || checklist.created_at),
    }
  })

  const getPlanColor = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-purple-500/10 text-purple-400'
      case 'standard':
        return 'bg-blue-500/10 text-blue-400'
      case 'basic':
        return 'bg-[#27272a] text-[#a1a1aa]'
      case 'default':
        return 'bg-green-500/10 text-green-400'
      default:
        return 'bg-[#4cbb17]/10 text-[#4cbb17]'
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Checklists</h1>
          <p className="text-[#a1a1aa]">
            Manage inspection checklists and templates ({checklistsList.length} total)
          </p>
        </div>
        <Link
          href="/manage/checklists/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Checklist
        </Link>
      </div>

      <ChecklistFilters />

      {/* Checklists Grid */}
      <div className="space-y-4">
        {checklistsList.map((checklist) => (
          <div
            key={checklist.id}
            className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 hover:border-[#4cbb17]/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-6 h-6 text-[#71717a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold">{checklist.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${getPlanColor(checklist.plan)}`}>
                      {checklist.plan}
                    </span>
                  </div>
                  <p className="text-sm text-[#71717a] mb-3">{checklist.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#71717a]">
                    <span>{checklist.itemCount} items</span>
                    <span>Updated {checklist.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DuplicateButton name={checklist.name} />
                <Link
                  href={`/manage/checklists/${checklist.id}`}
                  className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4 text-[#71717a]" />
                </Link>
                <Link
                  href={`/manage/checklists/${checklist.id}`}
                  className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-[#71717a]" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {checklistsList.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <CheckSquare className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No checklists found</p>
        </div>
      )}

      {/* Templates Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Quick Start Templates</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link
            href="/manage/checklists/new?template=basic-home"
            className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors"
          >
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Basic Home Inspection</p>
            <p className="text-sm text-[#71717a]">10 essential items for monthly checks</p>
          </Link>
          <Link
            href="/manage/checklists/new?template=lake-property"
            className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors"
          >
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Lake Property Special</p>
            <p className="text-sm text-[#71717a]">Includes dock and waterfront checks</p>
          </Link>
          <Link
            href="/manage/checklists/new?template=seasonal"
            className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors"
          >
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Seasonal Changeover</p>
            <p className="text-sm text-[#71717a]">Spring/Fall preparation checklist</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
