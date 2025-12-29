'use client'

import { useState } from 'react'
import { Filter, Search, Calendar, Building2, AlertTriangle, Download, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface FilterState {
  search: string
  dateFrom: string
  dateTo: string
  property: string
  hasIssues: boolean | null
  sortBy: 'date' | 'property' | 'duration'
  sortOrder: 'asc' | 'desc'
}

interface Property {
  id: string
  name: string
}

interface AdvancedHistoryFiltersProps {
  properties: Property[]
  onFilterChange: (filters: FilterState) => void
  onExport?: () => void
  className?: string
}

export function AdvancedHistoryFilters({
  properties,
  onFilterChange,
  onExport,
  className,
}: AdvancedHistoryFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    dateFrom: '',
    dateTo: '',
    property: '',
    hasIssues: null,
    sortBy: 'date',
    sortOrder: 'desc',
  })

  const handleFilterChange = (key: keyof FilterState, value: string | boolean | null) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      search: '',
      dateFrom: '',
      dateTo: '',
      property: '',
      hasIssues: null,
      sortBy: 'date',
      sortOrder: 'desc',
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const handleExport = () => {
    toast.success('Exporting to CSV...', {
      description: 'Your download will start shortly.',
    })
    onExport?.()
  }

  const hasActiveFilters = filters.search || filters.dateFrom || filters.dateTo ||
    filters.property || filters.hasIssues !== null

  // Quick date presets
  const setDatePreset = (preset: 'today' | 'week' | 'month' | 'quarter') => {
    const today = new Date()
    const from = new Date()

    if (preset === 'week') {
      from.setDate(today.getDate() - 7)
    } else if (preset === 'month') {
      from.setMonth(today.getMonth() - 1)
    } else if (preset === 'quarter') {
      from.setMonth(today.getMonth() - 3)
    }
    // 'today' keeps from as today's date

    const dateFrom = from.toISOString().split('T')[0]
    const dateTo = today.toISOString().split('T')[0]

    const newFilters = { ...filters, dateFrom, dateTo }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl', className)}>
      {/* Main Search Bar */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717a]" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search notes, properties..."
              className="w-full pl-9 pr-4 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
            />
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors',
              isExpanded || hasActiveFilters
                ? 'border-[#4cbb17] text-[#4cbb17]'
                : 'border-[#27272a] text-[#71717a] hover:text-white'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#4cbb17]" />
            )}
            <ChevronDown className={cn(
              'w-4 h-4 transition-transform',
              isExpanded && 'rotate-180'
            )} />
          </button>
          {onExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 border border-[#27272a] rounded-lg text-[#71717a] hover:text-white hover:border-[#4cbb17] transition-colors"
              title="Export to CSV"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm hidden sm:inline">Export</span>
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-[#27272a] mt-0 pt-4">
          {/* Quick Date Presets */}
          <div className="mb-4">
            <p className="text-xs text-[#71717a] mb-2">Quick Date Filters</p>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'today', label: 'Today' },
                { key: 'week', label: 'Last 7 Days' },
                { key: 'month', label: 'Last 30 Days' },
                { key: 'quarter', label: 'Last 90 Days' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDatePreset(key as 'today' | 'week' | 'month' | 'quarter')}
                  className="px-3 py-1.5 text-xs border border-[#27272a] rounded-lg hover:border-[#4cbb17] hover:text-[#4cbb17] transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date From */}
            <div>
              <label className="block text-xs text-[#71717a] mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-xs text-[#71717a] mb-1.5">
                <Calendar className="w-3 h-3 inline mr-1" />
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              />
            </div>

            {/* Property Filter */}
            <div>
              <label className="block text-xs text-[#71717a] mb-1.5">
                <Building2 className="w-3 h-3 inline mr-1" />
                Property
              </label>
              <select
                value={filters.property}
                onChange={(e) => handleFilterChange('property', e.target.value)}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">All Properties</option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Issues Filter */}
            <div>
              <label className="block text-xs text-[#71717a] mb-1.5">
                <AlertTriangle className="w-3 h-3 inline mr-1" />
                Issues Found
              </label>
              <select
                value={filters.hasIssues === null ? '' : filters.hasIssues.toString()}
                onChange={(e) => {
                  const val = e.target.value
                  handleFilterChange('hasIssues', val === '' ? null : val === 'true')
                }}
                className="w-full px-3 py-2 bg-[#0a0a0a] border border-[#27272a] rounded-lg text-sm focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="">Any</option>
                <option value="true">With Issues</option>
                <option value="false">No Issues</option>
              </select>
            </div>
          </div>

          {/* Sort Options & Clear */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#27272a]">
            <div className="flex items-center gap-3">
              <span className="text-xs text-[#71717a]">Sort by:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-2 py-1 bg-[#0a0a0a] border border-[#27272a] rounded text-xs focus:outline-none focus:border-[#4cbb17]"
              >
                <option value="date">Date</option>
                <option value="property">Property</option>
                <option value="duration">Duration</option>
              </select>
              <button
                onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 bg-[#0a0a0a] border border-[#27272a] rounded text-xs hover:border-[#4cbb17] transition-colors"
              >
                {filters.sortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
              </button>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <X className="w-3 h-3" />
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
