'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduledItem {
  id: string
  type: 'inspection' | 'service'
  title: string
  property: {
    id: string
    name: string
    address: string
  }
  technician: {
    id: string
    name: string
    initials: string
  } | null
  date: string
  time: string
  duration: string
  status: 'scheduled' | 'in_progress' | 'completed'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface WeekViewClientProps {
  initialItems: ScheduledItem[]
}

export default function WeekViewClient({ initialItems }: WeekViewClientProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get start of week (Sunday)
  const startOfWeek = useMemo(() => {
    const date = new Date(currentDate)
    date.setDate(currentDate.getDate() - currentDate.getDay())
    date.setHours(0, 0, 0, 0)
    return date
  }, [currentDate])

  // Get end of week (Saturday)
  const endOfWeek = useMemo(() => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + 6)
    return date
  }, [startOfWeek])

  const formatDateRange = () => {
    const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' })
    const startDay = startOfWeek.getDate()
    const endDay = endOfWeek.getDate()
    const year = endOfWeek.getFullYear()

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay} - ${endDay}, ${year}`
    }
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
  }

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() - 7)
    setCurrentDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + 7)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Generate week days with dates
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return {
        name: DAYS[i],
        shortName: SHORT_DAYS[i],
        date: date.getDate(),
        fullDate: date,
        dateString: date.toISOString().split('T')[0],
        isToday: date.toDateString() === new Date().toDateString(),
      }
    })
  }, [startOfWeek])

  // Filter items by date
  const getItemsForDay = (dateString: string): ScheduledItem[] => {
    return initialItems.filter(item => item.date === dateString)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Link
        href="/manage/schedule"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to schedule
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Week View</h1>
          <p className="text-[#a1a1aa]">{formatDateRange()}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors text-sm font-medium"
          >
            Today
          </button>
          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-px bg-[#27272a] rounded-xl overflow-hidden">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day.name}
            className={cn(
              'bg-[#0f0f0f] p-3 text-center',
              day.isToday && 'bg-[#4cbb17]/10'
            )}
          >
            <p className="text-xs text-[#71717a] uppercase mb-1">{day.shortName}</p>
            <p className={cn(
              'text-lg font-semibold',
              day.isToday && 'text-[#4cbb17]'
            )}>
              {day.date}
            </p>
          </div>
        ))}

        {/* Day Content */}
        {weekDays.map((day) => {
          const items = getItemsForDay(day.dateString)
          return (
            <div
              key={`content-${day.name}`}
              className={cn(
                'bg-[#0a0a0a] min-h-[200px] p-2',
                day.isToday && 'bg-[#4cbb17]/5'
              )}
            >
              <div className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={`/manage/${item.type === 'inspection' ? 'inspections' : 'requests'}/${item.id}`}
                    className={cn(
                      'block p-2 rounded-lg text-xs transition-colors',
                      item.type === 'inspection'
                        ? 'bg-blue-500/10 hover:bg-blue-500/20 border-l-2 border-blue-500'
                        : 'bg-purple-500/10 hover:bg-purple-500/20 border-l-2 border-purple-500'
                    )}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-[#71717a]" />
                      <span className="text-[#a1a1aa]">{item.time}</span>
                      {item.status === 'completed' && (
                        <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                      )}
                    </div>
                    <p className="font-medium truncate">{item.property.name}</p>
                    {item.technician && (
                      <div className="flex items-center gap-1 mt-1 text-[#71717a]">
                        <div className={cn(
                          'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
                          item.type === 'inspection' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        )}>
                          {item.technician.initials}
                        </div>
                        <span className="truncate">{item.technician.name}</span>
                      </div>
                    )}
                  </Link>
                ))}
                {items.length === 0 && (
                  <p className="text-xs text-[#3f3f46] text-center py-4">No jobs</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-6 text-sm text-[#71717a]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span>Inspection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-purple-500" />
          <span>Service Request</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  )
}
