import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import ScheduleCalendar from './ScheduleCalendar'

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

      <ScheduleCalendar items={scheduleItems} technicians={technicians} />
    </div>
  )
}
