'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  Clock,
  User,
  Building2,
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
  }
  time: string
  status: 'scheduled' | 'in_progress' | 'completed'
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

  // Mock schedule data
  const scheduleItems: ScheduledItem[] = [
    {
      id: '1',
      type: 'inspection',
      title: 'Weekly Inspection',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      technician: { id: '3', name: 'Mike Johnson' },
      time: '9:00 AM',
      status: 'scheduled',
    },
    {
      id: '2',
      type: 'inspection',
      title: 'Bi-weekly Inspection',
      property: { id: '2', name: 'Guest Cabin', address: '125 Lakefront Dr' },
      technician: { id: '3', name: 'Mike Johnson' },
      time: '10:30 AM',
      status: 'scheduled',
    },
    {
      id: '3',
      type: 'service',
      title: 'Gutter Cleaning',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      technician: { id: '4', name: 'Sarah Tech' },
      time: '2:00 PM',
      status: 'scheduled',
    },
    {
      id: '4',
      type: 'inspection',
      title: 'Weekly Inspection',
      property: { id: '3', name: 'Sunset Cove', address: '456 Marina Way' },
      technician: { id: '4', name: 'Sarah Tech' },
      time: '9:00 AM',
      status: 'scheduled',
    },
  ]

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const startingDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date: Date) => {
    if (!selectedDate) return false
    return date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
  }

  const getItemsForDate = (day: number) => {
    // For demo, show items on specific days
    if (day === 3 || day === 10 || day === 17 || day === 24) {
      return scheduleItems.slice(0, 2)
    }
    if (day === 5 || day === 12 || day === 19 || day === 26) {
      return scheduleItems.slice(2, 4)
    }
    return []
  }

  const selectedDayItems = selectedDate ? getItemsForDate(selectedDate.getDate()) : []

  // Generate calendar days
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Schedule</h1>
          <p className="text-[#a1a1aa]">
            Manage inspections and service appointments
          </p>
        </div>
        <Link
          href="/manage/schedule/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Inspection
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                {MONTHS[month]} {year}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-[#71717a] py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />
              }

              const date = new Date(year, month, day)
              const dayItems = getItemsForDate(day)
              const hasItems = dayItems.length > 0

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'aspect-square p-1 rounded-lg transition-colors relative',
                    isToday(date) && 'bg-[#4cbb17]/10 border border-[#4cbb17]/30',
                    isSelected(date) && !isToday(date) && 'bg-[#27272a]',
                    !isSelected(date) && !isToday(date) && 'hover:bg-[#171717]'
                  )}
                >
                  <span className={cn(
                    'text-sm',
                    isToday(date) && 'text-[#4cbb17] font-bold',
                    !isToday(date) && isSelected(date) && 'font-medium'
                  )}>
                    {day}
                  </span>
                  {hasItems && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayItems.slice(0, 3).map((item, i) => (
                        <div
                          key={i}
                          className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            item.type === 'inspection' ? 'bg-blue-500' : 'bg-purple-500'
                          )}
                        />
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#27272a]">
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span>Inspection</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#71717a]">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Service</span>
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-6">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">
              {selectedDate ? (
                <>
                  {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {selectedDate.getFullYear()}
                </>
              ) : (
                'Select a date'
              )}
            </h2>

            {selectedDayItems.length > 0 ? (
              <div className="space-y-3">
                {selectedDayItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.type === 'inspection' ? `/manage/inspections/${item.id}` : `/manage/requests/${item.id}`}
                    className="block p-4 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center',
                        item.type === 'inspection' ? 'bg-blue-500/10' : 'bg-purple-500/10'
                      )}>
                        {item.type === 'inspection' ? (
                          <Calendar className={cn('w-5 h-5', 'text-blue-500')} />
                        ) : (
                          <Building2 className={cn('w-5 h-5', 'text-purple-500')} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.title}</p>
                        <p className="text-sm text-[#71717a] truncate">{item.property.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-[#71717a]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.technician.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-[#27272a] mx-auto mb-3" />
                <p className="text-[#71717a]">No scheduled items</p>
                <Link href="/manage/schedule/new" className="mt-4 text-sm text-[#4cbb17] hover:underline inline-block">
                  + Add inspection
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming This Week */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming This Week</h2>
            <div className="space-y-3">
              {scheduleItems.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.type === 'inspection' ? 'bg-blue-500' : 'bg-purple-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.property.name}</p>
                    <p className="text-xs text-[#71717a]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/manage/schedule/week"
              className="block mt-4 text-sm text-center text-[#4cbb17] hover:underline"
            >
              View full week
            </Link>
          </div>

          {/* Technician Availability */}
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Technicians</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 text-xs font-bold">
                    MJ
                  </div>
                  <span className="text-sm">Mike Johnson</span>
                </div>
                <span className="text-xs text-green-500">Available</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500 text-xs font-bold">
                    ST
                  </div>
                  <span className="text-sm">Sarah Tech</span>
                </div>
                <span className="text-xs text-yellow-500">2 jobs today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
