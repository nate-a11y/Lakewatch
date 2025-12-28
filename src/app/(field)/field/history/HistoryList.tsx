'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  ClipboardCheck,
  Calendar,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Clock,
  Filter,
  Wrench,
  Download,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface PastInspection {
  id: number
  property: {
    id: number
    name: string
    address: string
  }
  date: string
  dateObj: Date
  time: string
  durationMinutes: number
  type: 'inspection' | 'service'
  checklist: string
  status: 'completed' | 'missed'
  issuesFound: number
}

type DateFilter = 'all' | 'today' | 'week' | 'month'
type TypeFilter = 'all' | 'inspection' | 'service'

interface HistoryListProps {
  inspections: PastInspection[]
}

export default function HistoryList({ inspections }: HistoryListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState<DateFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter logic
  const filteredInspections = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)
    const monthAgo = new Date(today)
    monthAgo.setMonth(monthAgo.getMonth() - 1)

    return inspections.filter(inspection => {
      // Search filter
      const matchesSearch =
        inspection.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inspection.checklist.toLowerCase().includes(searchQuery.toLowerCase())

      // Date filter
      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = inspection.dateObj.toDateString() === today.toDateString()
      } else if (dateFilter === 'week') {
        matchesDate = inspection.dateObj >= weekAgo
      } else if (dateFilter === 'month') {
        matchesDate = inspection.dateObj >= monthAgo
      }

      // Type filter
      const matchesType = typeFilter === 'all' || inspection.type === typeFilter

      return matchesSearch && matchesDate && matchesType
    })
  }, [inspections, searchQuery, dateFilter, typeFilter])

  // Group by date
  const groupedByDate = useMemo(() => {
    return filteredInspections.reduce((groups, inspection) => {
      const date = inspection.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(inspection)
      return groups
    }, {} as Record<string, PastInspection[]>)
  }, [filteredInspections])

  // Calculate stats
  const stats = useMemo(() => {
    const completed = inspections.filter(i => i.status === 'completed')
    const totalMinutes = completed.reduce((sum, i) => sum + i.durationMinutes, 0)
    const avgDuration = completed.length > 0 ? Math.round(totalMinutes / completed.length) : 0
    const completionRate = inspections.length > 0
      ? Math.round((completed.length / inspections.length) * 100)
      : 0

    // This week's stats
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 7)
    const thisWeek = inspections.filter(i => i.dateObj >= weekStart && i.status === 'completed')
    const thisWeekMinutes = thisWeek.reduce((sum, i) => sum + i.durationMinutes, 0)

    return {
      total: inspections.length,
      completed: completed.length,
      withIssues: inspections.filter(i => i.issuesFound > 0).length,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      avgDuration,
      completionRate,
      thisWeekCount: thisWeek.length,
      thisWeekHours: Math.round(thisWeekMinutes / 60 * 10) / 10,
    }
  }, [inspections])

  const formatDuration = (minutes: number) => {
    if (minutes === 0) return '—'
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  // Get week range for display
  const getWeekRange = () => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - 6)
    return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">History</h1>
        <button
          className="flex items-center gap-2 px-3 py-2 text-sm text-[#71717a] hover:text-white transition-colors"
          onClick={() => toast.success('Exporting history to CSV...')}
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Weekly Performance Card */}
      <div className="bg-gradient-to-br from-[#4cbb17]/20 to-[#4cbb17]/5 border border-[#4cbb17]/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-[#4cbb17]" />
            This Week
          </h2>
          <span className="text-xs text-[#71717a]">{getWeekRange()}</span>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-[#4cbb17]">{stats.thisWeekCount}</p>
            <p className="text-xs text-[#71717a]">Completed</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.thisWeekHours}h</p>
            <p className="text-xs text-[#71717a]">Time Logged</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-500">{stats.completionRate}%</p>
            <p className="text-xs text-[#71717a]">Completion</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{stats.total}</p>
          <p className="text-[10px] text-[#71717a]">Total</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-lg font-bold text-green-500">{stats.completed}</p>
          <p className="text-[10px] text-[#71717a]">Completed</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{stats.totalHours}h</p>
          <p className="text-[10px] text-[#71717a]">Total Time</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{stats.avgDuration}m</p>
          <p className="text-[10px] text-[#71717a]">Avg Time</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
            <input
              type="text"
              placeholder="Search properties, tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#0f0f0f] border border-[#27272a] rounded-xl focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3 border rounded-xl transition-colors",
              showFilters
                ? "bg-[#4cbb17]/10 border-[#4cbb17] text-[#4cbb17]"
                : "bg-[#0f0f0f] border-[#27272a] text-[#71717a]"
            )}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 space-y-4">
            {/* Date Filter */}
            <div>
              <label className="text-xs text-[#71717a] mb-2 block">Date Range</label>
              <div className="grid grid-cols-4 gap-2">
                {(['all', 'today', 'week', 'month'] as DateFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={cn(
                      "py-2 text-xs rounded-lg transition-colors",
                      dateFilter === filter
                        ? "bg-[#4cbb17] text-black font-medium"
                        : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
                    )}
                  >
                    {filter === 'all' ? 'All' : filter === 'today' ? 'Today' : filter === 'week' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs text-[#71717a] mb-2 block">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['all', 'inspection', 'service'] as TypeFilter[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTypeFilter(filter)}
                    className={cn(
                      "py-2 text-xs rounded-lg transition-colors flex items-center justify-center gap-1",
                      typeFilter === filter
                        ? "bg-[#4cbb17] text-black font-medium"
                        : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]"
                    )}
                  >
                    {filter === 'all' ? 'All' : filter === 'inspection' ? (
                      <><ClipboardCheck className="w-3 h-3" /> Inspections</>
                    ) : (
                      <><Wrench className="w-3 h-3" /> Services</>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(dateFilter !== 'all' || typeFilter !== 'all') && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#71717a]">Filters:</span>
            {dateFilter !== 'all' && (
              <button
                onClick={() => setDateFilter('all')}
                className="flex items-center gap-1 px-2 py-1 bg-[#27272a] rounded text-xs"
              >
                {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Last 7 days' : 'Last 30 days'}
                <span className="text-[#71717a]">&times;</span>
              </button>
            )}
            {typeFilter !== 'all' && (
              <button
                onClick={() => setTypeFilter('all')}
                className="flex items-center gap-1 px-2 py-1 bg-[#27272a] rounded text-xs"
              >
                {typeFilter === 'inspection' ? 'Inspections' : 'Services'}
                <span className="text-[#71717a]">&times;</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results Count */}
      <p className="text-xs text-[#71717a] mb-4">
        Showing {filteredInspections.length} of {inspections.length} items
      </p>

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
                  key={`${inspection.type}-${inspection.id}`}
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
                        {inspection.type === 'inspection' ? (
                          <ClipboardCheck className="w-4 h-4 text-[#4cbb17]" />
                        ) : (
                          <Wrench className="w-4 h-4 text-blue-500" />
                        )}
                        <h3 className="font-semibold">{inspection.property.name}</h3>
                        {inspection.status === 'missed' && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-500 rounded">
                            Missed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#71717a] mb-2">{inspection.property.address}</p>
                      <div className="flex items-center gap-3 text-xs text-[#71717a]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {inspection.time}
                        </span>
                        <span>{formatDuration(inspection.durationMinutes)}</span>
                        <span className={cn(
                          "px-2 py-0.5 rounded",
                          inspection.type === 'inspection'
                            ? "bg-[#4cbb17]/10 text-[#4cbb17]"
                            : "bg-blue-500/10 text-blue-500"
                        )}>
                          {inspection.checklist}
                        </span>
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
          <p className="text-[#71717a]">No items found</p>
          {(dateFilter !== 'all' || typeFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setDateFilter('all')
                setTypeFilter('all')
                setSearchQuery('')
              }}
              className="mt-3 text-sm text-[#4cbb17]"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}
