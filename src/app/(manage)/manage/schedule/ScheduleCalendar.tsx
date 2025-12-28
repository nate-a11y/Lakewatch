'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Building2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduledItem {
  id: number
  type: 'inspection' | 'service'
  title: string
  property: {
    id: number
    name: string
  }
  technician: {
    id: number
    name: string
  } | null
  scheduled_date: string
  time: string | null
  status: string
}

interface ScheduleCalendarProps {
  items: ScheduledItem[]
  technicians: {
    id: number
    name: string
    initials: string
    todayCount: number
  }[]
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function ScheduleCalendar({ items, technicians }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date())

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

  const getItemsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return items.filter(item => item.scheduled_date === dateStr)
  }

  const selectedDayItems = selectedDate ? getItemsForDate(selectedDate) : []

  // Get items for the upcoming week
  const getUpcomingItems = () => {
    const today = new Date()
    const weekFromNow = new Date(today)
    weekFromNow.setDate(weekFromNow.getDate() + 7)

    return items
      .filter(item => {
        const itemDate = new Date(item.scheduled_date)
        return itemDate >= today && itemDate <= weekFromNow
      })
      .sort((a, b) => new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime())
      .slice(0, 6)
  }

  const formatTime = (time: string | null) => {
    if (!time) return 'TBD'
    // Format HH:MM:SS to readable time
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  // Generate calendar days
  const calendarDays: (number | null)[] = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  return (
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
            const dayItems = getItemsForDate(date)
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
                  key={`${item.type}-${item.id}`}
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
                          {formatTime(item.time)}
                        </span>
                        {item.technician && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {item.technician.name}
                          </span>
                        )}
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
            {getUpcomingItems().length > 0 ? (
              getUpcomingItems().map((item) => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-3 text-sm">
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    item.type === 'inspection' ? 'bg-blue-500' : 'bg-purple-500'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{item.property.name}</p>
                    <p className="text-xs text-[#71717a]">{formatTime(item.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#71717a] text-center py-4">No upcoming items</p>
            )}
          </div>
        </div>

        {/* Technician Availability */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Technicians</h2>
          <div className="space-y-3">
            {technicians.length > 0 ? (
              technicians.map((tech) => (
                <div key={tech.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                      tech.todayCount === 0 ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                    )}>
                      {tech.initials}
                    </div>
                    <span className="text-sm">{tech.name}</span>
                  </div>
                  <span className={cn(
                    'text-xs',
                    tech.todayCount === 0 ? 'text-green-500' : 'text-yellow-500'
                  )}>
                    {tech.todayCount === 0 ? 'Available' : `${tech.todayCount} job${tech.todayCount > 1 ? 's' : ''} today`}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#71717a] text-center py-4">No technicians found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
