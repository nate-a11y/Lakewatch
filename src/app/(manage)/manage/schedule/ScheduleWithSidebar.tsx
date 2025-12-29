'use client'

import { useRouter } from 'next/navigation'
import ScheduleCalendar from './ScheduleCalendar'
import { UnscheduledQueueSidebar } from '@/components/manage/UnscheduledQueueSidebar'
import { toast } from 'sonner'

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

  const handleScheduleProperty = (propertyId: string) => {
    router.push(`/manage/schedule/new?property=${propertyId}`)
  }

  const handleDragStart = (property: UnscheduledProperty) => {
    toast.info(`Drag ${property.name} to the calendar to schedule`, {
      duration: 2000,
    })
  }

  return (
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
  )
}
