'use client'

import { useState } from 'react'
import { Calendar, Clock, AlertTriangle, ChevronRight, GripVertical, Building2, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UnscheduledProperty {
  id: string
  name: string
  address: string
  ownerName: string
  servicePlan: string
  lastVisit: string | null
  daysSinceLastVisit: number | null
  visitFrequency: number // days between visits
  priority: 'overdue' | 'due-soon' | 'upcoming'
}

interface UnscheduledQueueSidebarProps {
  properties: UnscheduledProperty[]
  onSchedule?: (propertyId: string) => void
  onDragStart?: (property: UnscheduledProperty) => void
  className?: string
}

export function UnscheduledQueueSidebar({
  properties,
  onSchedule,
  onDragStart,
  className,
}: UnscheduledQueueSidebarProps) {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'due-soon'>('all')
  const [isDragging, setIsDragging] = useState<string | null>(null)

  const filteredProperties = properties.filter(p => {
    if (filter === 'all') return true
    return p.priority === filter
  })

  const stats = {
    overdue: properties.filter(p => p.priority === 'overdue').length,
    dueSoon: properties.filter(p => p.priority === 'due-soon').length,
    total: properties.length,
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'overdue':
        return {
          badge: 'bg-red-500/10 text-red-500 border-red-500/20',
          border: 'border-l-red-500',
          icon: 'text-red-500',
        }
      case 'due-soon':
        return {
          badge: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
          border: 'border-l-yellow-500',
          icon: 'text-yellow-500',
        }
      default:
        return {
          badge: 'bg-[#27272a] text-[#71717a] border-[#27272a]',
          border: 'border-l-[#27272a]',
          icon: 'text-[#71717a]',
        }
    }
  }

  const handleDragStart = (e: React.DragEvent, property: UnscheduledProperty) => {
    setIsDragging(property.id)
    e.dataTransfer.setData('propertyId', property.id)
    e.dataTransfer.setData('propertyName', property.name)
    e.dataTransfer.effectAllowed = 'move'
    onDragStart?.(property)
  }

  const handleDragEnd = () => {
    setIsDragging(null)
  }

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-[#27272a]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#4cbb17]" />
            <h3 className="font-semibold">Unscheduled</h3>
          </div>
          <span className="text-sm text-[#71717a]">{stats.total} properties</span>
        </div>

        {/* Stats */}
        {(stats.overdue > 0 || stats.dueSoon > 0) && (
          <div className="flex gap-2 mb-3">
            {stats.overdue > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs text-red-500">{stats.overdue} overdue</span>
              </div>
            )}
            {stats.dueSoon > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-500/10 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span className="text-xs text-yellow-500">{stats.dueSoon} due soon</span>
              </div>
            )}
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-1 p-1 bg-[#0a0a0a] rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors',
              filter === 'all'
                ? 'bg-[#27272a] text-white'
                : 'text-[#71717a] hover:text-white'
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors',
              filter === 'overdue'
                ? 'bg-red-500/20 text-red-500'
                : 'text-[#71717a] hover:text-white'
            )}
          >
            Overdue
          </button>
          <button
            onClick={() => setFilter('due-soon')}
            className={cn(
              'flex-1 px-2 py-1 text-xs rounded transition-colors',
              filter === 'due-soon'
                ? 'bg-yellow-500/20 text-yellow-500'
                : 'text-[#71717a] hover:text-white'
            )}
          >
            Due Soon
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredProperties.length === 0 ? (
          <div className="text-center py-8 text-[#71717a]">
            <Filter className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No properties match filter</p>
          </div>
        ) : (
          filteredProperties.map((property) => {
            const styles = getPriorityStyles(property.priority)
            return (
              <div
                key={property.id}
                draggable
                onDragStart={(e) => handleDragStart(e, property)}
                onDragEnd={handleDragEnd}
                className={cn(
                  'p-3 bg-[#0a0a0a] rounded-lg border-l-4 cursor-grab active:cursor-grabbing transition-all',
                  styles.border,
                  isDragging === property.id ? 'opacity-50 scale-95' : 'hover:bg-[#171717]'
                )}
              >
                <div className="flex items-start gap-2">
                  <GripVertical className="w-4 h-4 text-[#27272a] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-[#71717a]" />
                      <p className="text-sm font-medium truncate">{property.name}</p>
                    </div>
                    <p className="text-xs text-[#71717a] truncate">{property.ownerName}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded border',
                        styles.badge
                      )}>
                        {property.daysSinceLastVisit !== null
                          ? `${property.daysSinceLastVisit}d ago`
                          : 'Never visited'}
                      </span>
                      <span className="text-xs text-[#71717a]">
                        Every {property.visitFrequency}d
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onSchedule?.(property.id)}
                    className="p-1.5 hover:bg-[#27272a] rounded transition-colors"
                    title="Schedule now"
                  >
                    <ChevronRight className="w-4 h-4 text-[#71717a]" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#27272a] text-center">
        <p className="text-xs text-[#71717a]">
          Drag properties to calendar to schedule
        </p>
      </div>
    </div>
  )
}
