'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  ClipboardCheck,
  Building2,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PastInspection {
  id: string
  property: {
    id: string
    name: string
    address: string
  }
  date: string
  time: string
  duration: string
  type: 'inspection' | 'service'
  checklist: string
  status: 'completed' | 'missed'
  issuesFound: number
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all')

  // Mock data
  const inspections: PastInspection[] = [
    {
      id: '1',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      date: 'Dec 27, 2025',
      time: '9:15 AM',
      duration: '42 min',
      type: 'inspection',
      checklist: 'Premium Weekly',
      status: 'completed',
      issuesFound: 1,
    },
    {
      id: '2',
      property: { id: '2', name: 'Guest Cabin', address: '125 Lakefront Dr' },
      date: 'Dec 27, 2025',
      time: '10:30 AM',
      duration: '28 min',
      type: 'inspection',
      checklist: 'Standard Bi-Weekly',
      status: 'completed',
      issuesFound: 0,
    },
    {
      id: '3',
      property: { id: '3', name: 'Sunset Cove', address: '456 Marina Way' },
      date: 'Dec 26, 2025',
      time: '9:00 AM',
      duration: '45 min',
      type: 'inspection',
      checklist: 'Premium Weekly',
      status: 'completed',
      issuesFound: 0,
    },
    {
      id: '4',
      property: { id: '4', name: 'Hillside Retreat', address: '789 Hill Rd' },
      date: 'Dec 25, 2025',
      time: '11:00 AM',
      duration: '38 min',
      type: 'inspection',
      checklist: 'Basic Monthly',
      status: 'completed',
      issuesFound: 2,
    },
    {
      id: '5',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      date: 'Dec 20, 2025',
      time: '9:00 AM',
      duration: '40 min',
      type: 'inspection',
      checklist: 'Premium Weekly',
      status: 'completed',
      issuesFound: 0,
    },
    {
      id: '6',
      property: { id: '5', name: 'Marina View', address: '200 Harbor Ln' },
      date: 'Dec 19, 2025',
      time: '2:00 PM',
      duration: '—',
      type: 'inspection',
      checklist: 'Standard Bi-Weekly',
      status: 'missed',
      issuesFound: 0,
    },
  ]

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch =
      inspection.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.property.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // Group by date
  const groupedByDate = filteredInspections.reduce((groups, inspection) => {
    const date = inspection.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(inspection)
    return groups
  }, {} as Record<string, PastInspection[]>)

  const stats = {
    total: inspections.length,
    completed: inspections.filter(i => i.status === 'completed').length,
    withIssues: inspections.filter(i => i.issuesFound > 0).length,
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Inspection History</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-xl font-bold">{stats.total}</p>
          <p className="text-xs text-[#71717a]">Total</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-green-500">{stats.completed}</p>
          <p className="text-xs text-[#71717a]">Completed</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-xl font-bold text-yellow-500">{stats.withIssues}</p>
          <p className="text-xs text-[#71717a]">With Issues</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
        <input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17]"
        />
      </div>

      {/* Grouped List */}
      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dateInspections]) => (
          <div key={date}>
            <h2 className="text-sm font-medium text-[#71717a] mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {date}
            </h2>
            <div className="space-y-2">
              {dateInspections.map(inspection => (
                <Link
                  key={inspection.id}
                  href={`/field/history/${inspection.id}`}
                  className={cn(
                    'block p-4 bg-[#0f0f0f] border rounded-xl transition-colors',
                    inspection.status === 'missed'
                      ? 'border-red-500/20 opacity-60'
                      : 'border-[#27272a] hover:border-[#4cbb17]/50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{inspection.property.name}</h3>
                        {inspection.status === 'missed' && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">
                            Missed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#71717a] mb-2">{inspection.property.address}</p>
                      <div className="flex items-center gap-4 text-xs text-[#71717a]">
                        <span>{inspection.time}</span>
                        <span>{inspection.duration}</span>
                        <span>{inspection.checklist}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {inspection.status === 'completed' && (
                        inspection.issuesFound > 0 ? (
                          <div className="flex items-center gap-1 text-yellow-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">{inspection.issuesFound}</span>
                          </div>
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )
                      )}
                      <ChevronRight className="w-5 h-5 text-[#71717a]" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredInspections.length === 0 && (
        <div className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-[#27272a] mx-auto mb-3" />
          <p className="text-[#71717a]">No inspections found</p>
        </div>
      )}
    </div>
  )
}
