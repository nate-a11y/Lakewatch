'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  CheckSquare,
  ChevronRight,
  Copy,
  Edit,
} from 'lucide-react'

interface Checklist {
  id: string
  name: string
  description: string
  itemCount: number
  plan: 'Premium' | 'Standard' | 'Basic' | 'Custom'
  usedBy: number
  lastUpdated: string
}

export default function ChecklistsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data
  const checklists: Checklist[] = [
    {
      id: '1',
      name: 'Premium Weekly Inspection',
      description: 'Comprehensive weekly inspection for premium plan properties',
      itemCount: 24,
      plan: 'Premium',
      usedBy: 5,
      lastUpdated: 'Dec 15, 2025',
    },
    {
      id: '2',
      name: 'Standard Bi-Weekly Inspection',
      description: 'Standard inspection checklist for bi-weekly visits',
      itemCount: 18,
      plan: 'Standard',
      usedBy: 8,
      lastUpdated: 'Dec 10, 2025',
    },
    {
      id: '3',
      name: 'Basic Monthly Inspection',
      description: 'Essential checks for monthly inspection visits',
      itemCount: 12,
      plan: 'Basic',
      usedBy: 4,
      lastUpdated: 'Dec 5, 2025',
    },
    {
      id: '4',
      name: 'Winterization Checklist',
      description: 'Seasonal checklist for preparing properties for winter',
      itemCount: 15,
      plan: 'Custom',
      usedBy: 12,
      lastUpdated: 'Nov 1, 2025',
    },
    {
      id: '5',
      name: 'Storm Damage Assessment',
      description: 'Emergency checklist for post-storm property assessment',
      itemCount: 10,
      plan: 'Custom',
      usedBy: 0,
      lastUpdated: 'Oct 20, 2025',
    },
  ]

  const filteredChecklists = checklists.filter(checklist =>
    checklist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    checklist.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium':
        return 'bg-purple-500/10 text-purple-400'
      case 'Standard':
        return 'bg-blue-500/10 text-blue-400'
      case 'Basic':
        return 'bg-[#27272a] text-[#a1a1aa]'
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
            Manage inspection checklists and templates
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
        <input
          type="text"
          placeholder="Search checklists..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
        />
      </div>

      {/* Checklists Grid */}
      <div className="space-y-4">
        {filteredChecklists.map((checklist) => (
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
                    <span>Used by {checklist.usedBy} properties</span>
                    <span>Updated {checklist.lastUpdated}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors" title="Duplicate">
                  <Copy className="w-4 h-4 text-[#71717a]" />
                </button>
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

      {filteredChecklists.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <CheckSquare className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No checklists found</p>
        </div>
      )}

      {/* Templates Section */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold mb-4">Quick Start Templates</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors text-left">
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Basic Home Inspection</p>
            <p className="text-sm text-[#71717a]">10 essential items for monthly checks</p>
          </button>
          <button className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors text-left">
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Lake Property Special</p>
            <p className="text-sm text-[#71717a]">Includes dock and waterfront checks</p>
          </button>
          <button className="p-4 bg-[#0f0f0f] border border-dashed border-[#27272a] rounded-xl hover:border-[#4cbb17] transition-colors text-left">
            <CheckSquare className="w-8 h-8 text-[#4cbb17] mb-3" />
            <p className="font-medium mb-1">Seasonal Changeover</p>
            <p className="text-sm text-[#71717a]">Spring/Fall preparation checklist</p>
          </button>
        </div>
      </div>
    </div>
  )
}
