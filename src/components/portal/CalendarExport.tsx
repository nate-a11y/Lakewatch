'use client'

import { useState } from 'react'
import { Calendar, Download, ExternalLink, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Event {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  location?: string
}

interface CalendarExportProps {
  events: Event[]
  className?: string
}

export function CalendarExport({ events, className }: CalendarExportProps) {
  const [isOpen, setIsOpen] = useState(false)

  const generateICS = (eventsToExport: Event[]) => {
    const formatDate = (dateStr: string) => {
      const date = new Date(dateStr)
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lake Watch Pros//Calendar Export//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      ...eventsToExport.flatMap((event) => [
        'BEGIN:VEVENT',
        `UID:${event.id}@lakewatchpros.com`,
        `DTSTAMP:${formatDate(new Date().toISOString())}`,
        `DTSTART:${formatDate(event.startDate)}`,
        event.endDate ? `DTEND:${formatDate(event.endDate)}` : '',
        `SUMMARY:${event.title}`,
        event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
        event.location ? `LOCATION:${event.location}` : '',
        'END:VEVENT',
      ].filter(Boolean)),
      'END:VCALENDAR',
    ].join('\r\n')

    return icsContent
  }

  const downloadICS = () => {
    const icsContent = generateICS(events)
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'lake-watch-pros-calendar.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    toast.success('Calendar downloaded!')
    setIsOpen(false)
  }

  const openGoogleCalendar = (event: Event) => {
    const startDate = new Date(event.startDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    const endDate = event.endDate
      ? new Date(event.endDate).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      : startDate

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || '',
    })

    window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank')
    setIsOpen(false)
  }

  const copySubscriptionLink = () => {
    // In a real implementation, this would be a server-generated feed URL
    const feedUrl = `${window.location.origin}/api/calendar/feed`
    navigator.clipboard.writeText(feedUrl)
    toast.success('Calendar feed URL copied to clipboard')
    setIsOpen(false)
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg hover:border-[#4cbb17]/50 transition-colors"
      >
        <Calendar className="w-4 h-4 text-[#4cbb17]" />
        <span className="text-sm">Add to Calendar</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-64 bg-[#0f0f0f] border border-[#27272a] rounded-xl shadow-xl z-20 overflow-hidden">
            <div className="p-2 space-y-1">
              <button
                onClick={downloadICS}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272a] transition-colors text-left"
              >
                <Download className="w-4 h-4 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium">Download .ics</p>
                  <p className="text-xs text-[#71717a]">For Apple Calendar & others</p>
                </div>
              </button>

              <button
                onClick={() => openGoogleCalendar(events[0])}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272a] transition-colors text-left"
              >
                <ExternalLink className="w-4 h-4 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium">Add to Google Calendar</p>
                  <p className="text-xs text-[#71717a]">Opens in new tab</p>
                </div>
              </button>

              <div className="border-t border-[#27272a] my-2" />

              <button
                onClick={copySubscriptionLink}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#27272a] transition-colors text-left"
              >
                <Calendar className="w-4 h-4 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium">Subscribe to Calendar</p>
                  <p className="text-xs text-[#71717a]">Copy feed URL for auto-sync</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
