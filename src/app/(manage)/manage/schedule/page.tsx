import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ScheduleCalendar from './ScheduleCalendar'
import { ScheduleWithSidebar } from './ScheduleWithSidebar'

// Helper to get today's date string (server-side only)
function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

export default async function SchedulePage() {
  const supabase = await createClient()
  const today = getTodayString()

  // Fetch scheduled inspections (no date filter - show all scheduled)
  const { data: inspections, error: inspectionsError } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status,
      property:lwp_properties(id, name),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists(name)
    `)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_date')

  if (inspectionsError) {
    console.error('Error fetching inspections:', inspectionsError)
  }

  // Fetch scheduled service requests
  const { data: serviceRequests, error: requestsError } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, scheduled_date, status,
      property:lwp_properties(id, name),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .in('status', ['scheduled', 'pending', 'in_progress'])
    .not('scheduled_date', 'is', null)
    .order('scheduled_date')

  if (requestsError) {
    console.error('Error fetching service requests:', requestsError)
  }

  // Fetch technicians
  const { data: techniciansData } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'technician')
    .eq('status', 'active')

  // Count today's jobs per technician
  const { data: todayInspections } = await supabase
    .from('lwp_inspections')
    .select('technician_id')
    .eq('scheduled_date', today)
    .in('status', ['scheduled', 'in_progress'])

  const { data: todayRequests } = await supabase
    .from('lwp_service_requests')
    .select('assigned_to_id')
    .eq('scheduled_date', today)
    .in('status', ['scheduled', 'in_progress'])

  // Build technician counts
  const techJobCounts: Record<number, number> = {}
  ;(todayInspections || []).forEach((i) => {
    if (i.technician_id) {
      techJobCounts[i.technician_id] = (techJobCounts[i.technician_id] || 0) + 1
    }
  })
  ;(todayRequests || []).forEach((r) => {
    if (r.assigned_to_id) {
      techJobCounts[r.assigned_to_id] = (techJobCounts[r.assigned_to_id] || 0) + 1
    }
  })

  // Format items for calendar
  const scheduleItems = [
    ...(inspections || []).map((inspection) => {
      const propertyData = inspection.property as { id: number; name: string } | { id: number; name: string }[] | null
      const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
      const techData = inspection.technician as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
      const tech = Array.isArray(techData) ? techData[0] : techData
      const checklistData = inspection.checklist as { name: string } | { name: string }[] | null
      const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData

      return {
        id: inspection.id,
        type: 'inspection' as const,
        title: checklist?.name || 'Inspection',
        property: property ? { id: property.id, name: property.name } : { id: 0, name: 'Unknown Property' },
        technician: tech ? { id: tech.id, name: `${tech.first_name} ${tech.last_name}` } : null,
        scheduled_date: inspection.scheduled_date,
        time: inspection.scheduled_time,
        status: inspection.status,
      }
    }),
    ...(serviceRequests || []).map((request) => {
      const propertyData = request.property as { id: number; name: string } | { id: number; name: string }[] | null
      const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
      const techData = request.assigned_to as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
      const tech = Array.isArray(techData) ? techData[0] : techData

      return {
        id: request.id,
        type: 'service' as const,
        title: request.title,
        property: property ? { id: property.id, name: property.name } : { id: 0, name: 'Unknown Property' },
        technician: tech ? { id: tech.id, name: `${tech.first_name} ${tech.last_name}` } : null,
        scheduled_date: request.scheduled_date,
        time: null,
        status: request.status,
      }
    }),
  ]

  // Format technicians
  const technicians = (techniciansData || []).map((tech) => ({
    id: tech.id,
    name: `${tech.first_name} ${tech.last_name}`,
    initials: `${tech.first_name?.[0] || ''}${tech.last_name?.[0] || ''}`,
    todayCount: techJobCounts[tech.id] || 0,
  }))

  // Fetch properties that need visits (for unscheduled queue)
  const { data: propertiesData } = await supabase
    .from('lwp_properties')
    .select(`
      id, name, street, city, status,
      service_plan:lwp_service_plans(name, visit_frequency),
      owner:lwp_users!owner_id(first_name, last_name)
    `)
    .eq('status', 'active')
    .limit(50)

  // Get last inspection date for each property
  const propertyIds = (propertiesData || []).map(p => p.id)
  let lastInspections: { property_id: number; scheduled_date: string }[] = []
  if (propertyIds.length > 0) {
    const { data: inspData } = await supabase
      .from('lwp_inspections')
      .select('property_id, scheduled_date')
      .in('property_id', propertyIds)
      .eq('status', 'completed')
      .order('scheduled_date', { ascending: false })

    // Get most recent inspection per property
    const latestMap = new Map<number, string>()
    inspData?.forEach(i => {
      if (!latestMap.has(i.property_id)) {
        latestMap.set(i.property_id, i.scheduled_date)
      }
    })
    lastInspections = Array.from(latestMap, ([property_id, scheduled_date]) => ({ property_id, scheduled_date }))
  }

  // Build unscheduled properties list
  const unscheduledProperties = (propertiesData || [])
    .map(prop => {
      const planData = prop.service_plan as { name: string; visit_frequency: number } | { name: string; visit_frequency: number }[] | null
      const plan = Array.isArray(planData) ? planData[0] : planData
      const ownerData = prop.owner as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
      const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

      const lastVisit = lastInspections.find(i => i.property_id === prop.id)
      const lastVisitDate = lastVisit ? lastVisit.scheduled_date : null
      const visitFrequency = plan?.visit_frequency || 30 // default 30 days

      let daysSinceLastVisit: number | null = null
      let priority: 'overdue' | 'due-soon' | 'upcoming' = 'upcoming'

      if (lastVisitDate) {
        daysSinceLastVisit = Math.floor((new Date().getTime() - new Date(lastVisitDate).getTime()) / (1000 * 60 * 60 * 24))
        if (daysSinceLastVisit > visitFrequency) {
          priority = 'overdue'
        } else if (daysSinceLastVisit > visitFrequency - 7) {
          priority = 'due-soon'
        }
      } else {
        // Never visited - consider overdue
        priority = 'overdue'
      }

      return {
        id: String(prop.id),
        name: prop.name,
        address: `${prop.street}, ${prop.city}`,
        ownerName: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
        servicePlan: plan?.name || 'Standard',
        lastVisit: lastVisitDate,
        daysSinceLastVisit,
        visitFrequency,
        priority,
      }
    })
    .filter(p => p.priority === 'overdue' || p.priority === 'due-soon')
    .sort((a, b) => {
      // Sort by priority (overdue first, then due-soon)
      if (a.priority === 'overdue' && b.priority !== 'overdue') return -1
      if (a.priority !== 'overdue' && b.priority === 'overdue') return 1
      // Then by days since last visit (descending)
      return (b.daysSinceLastVisit || 999) - (a.daysSinceLastVisit || 999)
    })
    .slice(0, 20)

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

      <ScheduleWithSidebar
        scheduleItems={scheduleItems}
        technicians={technicians}
        unscheduledProperties={unscheduledProperties}
      />
    </div>
  )
}
