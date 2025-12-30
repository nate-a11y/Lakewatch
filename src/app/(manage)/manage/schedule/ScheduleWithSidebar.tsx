'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ScheduleCalendar from './ScheduleCalendar'
import { UnscheduledQueueSidebar } from '@/components/manage/UnscheduledQueueSidebar'
import { RouteOptimization } from '@/components/manage/RouteOptimization'
import { toast } from 'sonner'
import { Route, ChevronDown, ChevronUp } from 'lucide-react'

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

interface Technician {
  id: number
  name: string
  initials: string
  todayCount: number
}

interface UnscheduledProperty {
  id: string
  name: string
  address: string
  ownerName: string
  servicePlan: string
  lastVisit: string | null
  daysSinceLastVisit: number | null
  visitFrequency: number
  priority: 'overdue' | 'due-soon' | 'upcoming'
}

interface ScheduleWithSidebarProps {
  scheduleItems: ScheduledItem[]
  technicians: Technician[]
  unscheduledProperties: UnscheduledProperty[]
}

export function ScheduleWithSidebar({
  scheduleItems,
  technicians,
  unscheduledProperties,
}: ScheduleWithSidebarProps) {
  const router = useRouter()
  const [showRouteOptimization, setShowRouteOptimization] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<number | null>(
    technicians[0]?.id || null
  )

  const handleScheduleProperty = (propertyId: string) => {
    router.push(`/manage/schedule/new?property=${propertyId}`)
  }

  const handleDragStart = (property: UnscheduledProperty) => {
    toast.info(`Drag ${property.name} to the calendar to schedule`, {
      duration: 2000,
    })
  }

  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0]

  // Get today's stops for the selected technician
  const todayStops = scheduleItems
    .filter(
      (item) =>
        item.technician?.id === selectedTechnician &&
        item.scheduled_date === today
    )
    .map((item, idx) => ({
      id: String(item.id),
      propertyName: item.property.name,
      address: item.title,
      scheduledTime: item.time || '9:00 AM',
      order: idx + 1,
    }))

  const selectedTechName =
    technicians.find((t) => t.id === selectedTechnician)?.name || 'Technician'

  return (
    <div className="space-y-6">
      {/* Route Optimization Toggle */}
      {technicians.length > 0 && (
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowRouteOptimization(!showRouteOptimization)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#1a1a1a] transition-colors"
          >
            <div className="flex items-center gap-2">
              <Route className="w-5 h-5 text-[#4cbb17]" />
              <span className="font-medium">Route Optimization</span>
              {todayStops.length > 0 && (
                <span className="text-xs px-2 py-0.5 bg-[#4cbb17]/10 text-[#4cbb17] rounded">
                  {todayStops.length} stops today
                </span>
              )}
            </div>
            {showRouteOptimization ? (
              <ChevronUp className="w-5 h-5 text-[#71717a]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#71717a]" />
            )}
          </button>

          {showRouteOptimization && (
            <div className="p-4 pt-0 border-t border-[#27272a]">
              {/* Technician selector */}
              <div className="mb-4">
                <label className="text-sm text-[#71717a] mb-2 block">
                  Select Technician
                </label>
                <div className="flex gap-2 flex-wrap">
                  {technicians.map((tech) => (
                    <button
                      key={tech.id}
                      onClick={() => setSelectedTechnician(tech.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedTechnician === tech.id
                          ? 'bg-[#4cbb17] text-black font-medium'
                          : 'bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46]'
                      }`}
                    >
                      {tech.name}
                    </button>
                  ))}
                </div>
              </div>

              {todayStops.length > 0 ? (
                <RouteOptimization
                  technicianName={selectedTechName}
                  stops={todayStops}
                  onReorder={(newOrder) => {
                    toast.success('Route order updated!', {
                      description: `${selectedTechName}'s route has been optimized.`,
                    })
                  }}
                />
              ) : (
                <p className="text-sm text-[#71717a] text-center py-4">
                  No stops scheduled for {selectedTechName} today.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Calendar */}
        <div className="flex-1">
          <ScheduleCalendar items={scheduleItems} technicians={technicians} />
        </div>

        {/* Unscheduled Queue Sidebar - Only show on larger screens and if there are properties */}
        {unscheduledProperties.length > 0 && (
          <div className="hidden xl:block w-80 flex-shrink-0">
            <UnscheduledQueueSidebar
              properties={unscheduledProperties}
              onSchedule={handleScheduleProperty}
              onDragStart={handleDragStart}
              className="sticky top-4 max-h-[calc(100vh-8rem)]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
