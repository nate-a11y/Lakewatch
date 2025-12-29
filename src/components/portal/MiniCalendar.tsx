'use client'

import { useState } from 'react'
import { Home, Wrench, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduledEvent {
  date: string
  type: 'inspection' | 'occupancy' | 'service'
  title?: string
}

interface MiniCalendarProps {
  events?: ScheduledEvent[]
  className?: string
}

export function MiniCalendar({ events = [], className }: MiniCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Get next 7 days starting from today
  const today = new Date()
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    return date
  })

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter((e) => e.date === dateStr)
  }

  const formatDayName = (date: Date) => {
    if (date.toDateString() === today.toDateString()) return 'Today'
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }

  const selectedDateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : []

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#4cbb17]" />
          Upcoming Week
        </h3>
      </div>

      {/* Day dots */}
      <div className="flex justify-between gap-1 mb-4">
        {days.map((date) => {
          const dateStr = date.toISOString().split('T')[0]
          const dayEvents = getEventsForDate(date)
          const hasInspection = dayEvents.some((e) => e.type === 'inspection')
          const hasOccupancy = dayEvents.some((e) => e.type === 'occupancy')
          const hasService = dayEvents.some((e) => e.type === 'service')
          const isSelected = selectedDate === dateStr

          return (
            <button
              key={dateStr}
              onClick={() => setSelectedDate(isSelected ? null : dateStr)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors min-w-[40px]',
                isSelected
                  ? 'bg-[#4cbb17]/20 border border-[#4cbb17]'
                  : 'hover:bg-[#27272a]'
              )}
            >
              <span className="text-xs text-[#71717a]">{formatDayName(date)}</span>
              <span className={cn(
                'text-sm font-medium',
                date.toDateString() === today.toDateString() && 'text-[#4cbb17]'
              )}>
                {date.getDate()}
              </span>
              <div className="flex gap-0.5 h-2">
                {hasInspection && (
                  <span className="w-2 h-2 rounded-full bg-[#4cbb17]" title="Inspection" />
                )}
                {hasOccupancy && (
                  <span className="w-2 h-2 rounded-full bg-blue-500" title="Occupancy" />
                )}
                {hasService && (
                  <span className="w-2 h-2 rounded-full bg-yellow-500" title="Service" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Event details when date selected */}
      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-[#27272a]">
          {selectedDateEvents.map((event, i) => (
            <div
              key={i}
              className="flex items-center gap-3 text-sm p-2 rounded-lg bg-[#0a0a0a]"
            >
              {event.type === 'inspection' && (
                <span className="w-6 h-6 rounded-full bg-[#4cbb17]/20 flex items-center justify-center">
                  <Home className="w-3 h-3 text-[#4cbb17]" />
                </span>
              )}
              {event.type === 'occupancy' && (
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Home className="w-3 h-3 text-blue-500" />
                </span>
              )}
              {event.type === 'service' && (
                <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <Wrench className="w-3 h-3 text-yellow-500" />
                </span>
              )}
              <span>{event.title || event.type}</span>
            </div>
          ))}
        </div>
      )}

      {selectedDate && selectedDateEvents.length === 0 && (
        <div className="pt-3 border-t border-[#27272a] text-center text-sm text-[#71717a]">
          No events scheduled
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-[#27272a] text-xs text-[#71717a]">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#4cbb17]" />
          Inspection
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Occupancy
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-yellow-500" />
          Service
        </span>
      </div>
    </div>
  )
}
