'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
  Building2,
  User,
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
  }
  time: string
  duration: string
  status: 'scheduled' | 'in_progress' | 'completed'
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ScheduleWeekPage() {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get start of week (Sunday)
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)

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

  // Mock schedule data
  const scheduleItems: ScheduledItem[] = [
    {
      id: '1',
      type: 'inspection',
      title: 'Weekly Inspection',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      technician: { id: '3', name: 'Mike Johnson', initials: 'MJ' },
      time: '9:00 AM',
      duration: '45 min',
      status: 'completed',
    },
    {
      id: '2',
      type: 'service',
      title: 'HVAC Filter Change',
      property: { id: '2', name: 'Guest Cabin', address: '456 Oak Lane' },
      technician: { id: '4', name: 'Sarah Tech', initials: 'ST' },
      time: '11:00 AM',
      duration: '30 min',
      status: 'in_progress',
    },
    {
      id: '3',
      type: 'inspection',
      title: 'Monthly Inspection',
      property: { id: '3', name: 'Sunset Cove', address: '789 Sunset Blvd' },
      technician: { id: '3', name: 'Mike Johnson', initials: 'MJ' },
      time: '2:00 PM',
      duration: '1 hr',
      status: 'scheduled',
    },
    {
      id: '4',
      type: 'inspection',
      title: 'Bi-Weekly Inspection',
      property: { id: '4', name: 'Hillside Retreat', address: '321 Hill Rd' },
      technician: { id: '4', name: 'Sarah Tech', initials: 'ST' },
      time: '10:00 AM',
      duration: '45 min',
      status: 'scheduled',
    },
  ]

  // Generate week days with dates
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return {
      name: DAYS[i],
      shortName: SHORT_DAYS[i],
      date: date.getDate(),
      fullDate: date,
      isToday: date.toDateString() === new Date().toDateString(),
    }
  })

  // Mock: assign items to specific days
  const getItemsForDay = (dayIndex: number): ScheduledItem[] => {
    if (dayIndex === 0) return [] // Sunday - no jobs
    if (dayIndex === 1) return [scheduleItems[0], scheduleItems[1]] // Monday
    if (dayIndex === 2) return [scheduleItems[2]] // Tuesday
    if (dayIndex === 3) return [scheduleItems[3]] // Wednesday
    if (dayIndex === 4) return [scheduleItems[0]] // Thursday
    if (dayIndex === 5) return [scheduleItems[1], scheduleItems[2]] // Friday
    return [] // Saturday
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
        {weekDays.map((day, index) => {
          const items = getItemsForDay(index)
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
                    key={item.id}
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
                    <div className="flex items-center gap-1 mt-1 text-[#71717a]">
                      <div className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold',
                        item.type === 'inspection' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                      )}>
                        {item.technician.initials}
                      </div>
                      <span className="truncate">{item.technician.name}</span>
                    </div>
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
