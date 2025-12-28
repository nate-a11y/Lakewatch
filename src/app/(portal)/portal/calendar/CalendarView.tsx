'use client'

import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { addOccupancyEvent } from '@/actions/calendar'

interface CalendarEvent {
  id: string
  date: string
  type: 'inspection' | 'occupancy'
  property: string
  propertyId: number
  label?: string
}

interface Property {
  id: number
  name: string
}

interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  properties: Property[]
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function CalendarView({ initialEvents, properties }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState(initialEvents)
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    propertyId: properties[0]?.id || 0,
    eventType: 'owner_visit' as 'owner_visit' | 'guest_visit' | 'rental' | 'contractor',
    startDate: '',
    endDate: '',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    notes: '',
    preArrival: false,
    postDeparture: false,
  })

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

  const handleAddOccupancy = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const result = await addOccupancyEvent({
        propertyId: formData.propertyId,
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        guestName: formData.guestName || undefined,
        guestPhone: formData.guestPhone || undefined,
        guestEmail: formData.guestEmail || undefined,
        notes: formData.notes || undefined,
        preArrivalRequested: formData.preArrival,
        postDepartureRequested: formData.postDeparture,
      })

      if (result.success && result.data) {
        // Add new events to the calendar
        const property = properties.find(p => p.id === formData.propertyId)
        const label = formData.eventType === 'owner_visit'
          ? 'Owner Visit'
          : formData.eventType === 'guest_visit'
          ? `Guest: ${formData.guestName || 'Guest'}`
          : formData.eventType === 'rental'
          ? 'Rental'
          : 'Contractor'

        const start = new Date(formData.startDate)
        const end = new Date(formData.endDate)
        const newEvents: CalendarEvent[] = []

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          newEvents.push({
            id: `occ-${result.data.id}-${d.toISOString().split('T')[0]}`,
            date: d.toISOString().split('T')[0],
            type: 'occupancy',
            property: property?.name || 'Property',
            propertyId: formData.propertyId,
            label,
          })
        }

        setEvents([...events, ...newEvents])
        setShowAddModal(false)
        setFormData({
          propertyId: properties[0]?.id || 0,
          eventType: 'owner_visit',
          startDate: '',
          endDate: '',
          guestName: '',
          guestPhone: '',
          guestEmail: '',
          notes: '',
          preArrival: false,
          postDeparture: false,
        })
      }
    } catch (error) {
      console.error('Failed to add occupancy:', error)
    } finally {
      setIsSubmitting(false)
    }
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
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
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
                className="aspect-square p-1 border border-[#27272a] rounded-lg hover:border-[#4cbb17]/50 transition-colors cursor-pointer overflow-hidden"
              >
                <div className="text-sm text-[#a1a1aa]">{day}</div>
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs px-1 py-0.5 rounded mt-0.5 truncate ${
                      event.type === 'inspection'
                        ? 'bg-[#4cbb17]/20 text-[#4cbb17]'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                    title={`${event.property}${event.label ? ` - ${event.label}` : ''}`}
                  >
                    {event.property}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-[#71717a] mt-0.5">
                    +{dayEvents.length - 2} more
                  </div>
                )}
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

      {/* Add Occupancy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <h2 className="text-lg font-semibold">Add Occupancy</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-[#27272a] rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOccupancy} className="p-4 space-y-4">
              {/* Property */}
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">Property</label>
                <select
                  value={formData.propertyId}
                  onChange={(e) => setFormData({ ...formData, propertyId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                  required
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Event Type */}
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">Type</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value as typeof formData.eventType })}
                  className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                  required
                >
                  <option value="owner_visit">Owner Visit</option>
                  <option value="guest_visit">Guest Visit</option>
                  <option value="rental">Rental</option>
                  <option value="contractor">Contractor</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-[#a1a1aa] mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                    required
                  />
                </div>
              </div>

              {/* Guest Info (shown for guest_visit) */}
              {formData.eventType === 'guest_visit' && (
                <>
                  <div>
                    <label className="block text-sm text-[#a1a1aa] mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                      className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[#a1a1aa] mb-1">Guest Phone</label>
                      <input
                        type="tel"
                        value={formData.guestPhone}
                        onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[#a1a1aa] mb-1">Guest Email</label>
                      <input
                        type="email"
                        value={formData.guestEmail}
                        onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
                        className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
                        placeholder="guest@email.com"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm text-[#a1a1aa] mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17] resize-none"
                  rows={3}
                  placeholder="Any special instructions..."
                />
              </div>

              {/* Service Requests */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preArrival}
                    onChange={(e) => setFormData({ ...formData, preArrival: e.target.checked })}
                    className="w-4 h-4 rounded border-[#27272a] bg-black text-[#4cbb17] focus:ring-[#4cbb17]"
                  />
                  <span className="text-sm">Request pre-arrival service</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.postDeparture}
                    onChange={(e) => setFormData({ ...formData, postDeparture: e.target.checked })}
                    className="w-4 h-4 rounded border-[#27272a] bg-black text-[#4cbb17] focus:ring-[#4cbb17]"
                  />
                  <span className="text-sm">Request post-departure service</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Occupancy'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
