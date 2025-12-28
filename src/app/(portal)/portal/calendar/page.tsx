'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Mock data
  const events = [
    { id: '1', date: '2026-01-03', type: 'inspection', property: 'Lake House' },
    { id: '2', date: '2026-01-15', type: 'inspection', property: 'Guest Cabin' },
    { id: '3', date: '2026-01-10', type: 'occupancy', property: 'Lake House', label: 'Owner Visit' },
  ]

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()

    return { daysInMonth, startingDay }
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Calendar</h1>
          <p className="text-[#a1a1aa]">
            View inspections and manage occupancy
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Plus className="w-5 h-5" />
          Add Occupancy
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-[#27272a] rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm text-[#71717a] py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before the first */}
          {Array.from({ length: startingDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = events.filter(e => e.date === dateStr)

            return (
              <div
                key={day}
                className="aspect-square p-1 border border-[#27272a] rounded-lg hover:border-[#4cbb17]/50 transition-colors cursor-pointer"
              >
                <div className="text-sm text-[#a1a1aa]">{day}</div>
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded mt-0.5 truncate ${
                      event.type === 'inspection'
                        ? 'bg-[#4cbb17]/20 text-[#4cbb17]'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {event.type === 'inspection' ? '🔍' : '🏠'} {event.property}
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-6 pt-4 border-t border-[#27272a]">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-[#4cbb17]" />
            <span className="text-[#a1a1aa]">Scheduled Inspection</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span className="text-[#a1a1aa]">Occupancy</span>
          </div>
        </div>
      </div>
    </div>
  )
}
