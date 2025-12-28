import { createClient } from '@/lib/supabase/server'
import HistoryList from './HistoryList'

export default async function HistoryPage() {
  const supabase = await createClient()

  // Get current user (technician)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch completed inspections for this technician
  const { data: inspections, error: inspectionsError } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status, overall_status, completed_at,
      property:lwp_properties(id, name, street, city),
      checklist:lwp_checklists(name),
      issues:lwp_inspections_issues(count)
    `)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(100)

  if (inspectionsError) {
    console.error('Error fetching inspections:', inspectionsError)
  }

  // Fetch completed service requests for this technician
  const { data: serviceRequests, error: requestsError } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, scheduled_date, status, completed_at,
      property:lwp_properties(id, name, street, city)
    `)
    .eq('status', 'completed')
    .not('scheduled_date', 'is', null)
    .order('scheduled_date', { ascending: false })
    .limit(100)

  if (requestsError) {
    console.error('Error fetching service requests:', requestsError)
  }

  // Format for the client component
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (time: string | null, completedAt: string | null) => {
    if (time) {
      const [hours, minutes] = time.split(':')
      const h = parseInt(hours)
      const ampm = h >= 12 ? 'PM' : 'AM'
      const hour = h % 12 || 12
      return `${hour}:${minutes} ${ampm}`
    }
    if (completedAt) {
      return new Date(completedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    return '—'
  }

  const historyItems = [
    ...(inspections || []).map((inspection) => {
      const propertyData = inspection.property as { id: number; name: string; street: string; city: string } | { id: number; name: string; street: string; city: string }[] | null
      const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
      const checklistData = inspection.checklist as { name: string } | { name: string }[] | null
      const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData
      const issuesData = inspection.issues as { count: number }[] | null
      const issueCount = issuesData?.[0]?.count || 0

      // Calculate duration if we have completed_at
      let durationMinutes = 0
      if (inspection.completed_at && inspection.scheduled_time) {
        const scheduledDateTime = new Date(`${inspection.scheduled_date}T${inspection.scheduled_time}`)
        const completedDateTime = new Date(inspection.completed_at)
        durationMinutes = Math.round((completedDateTime.getTime() - scheduledDateTime.getTime()) / 60000)
        if (durationMinutes < 0 || durationMinutes > 480) durationMinutes = 45 // Default if weird
      } else {
        durationMinutes = 40 // Default
      }

      return {
        id: inspection.id,
        property: property ? {
          id: property.id,
          name: property.name,
          address: `${property.street || ''}, ${property.city || ''}`.trim().replace(/^,\s*/, ''),
        } : { id: 0, name: 'Unknown', address: '' },
        date: formatDate(inspection.scheduled_date),
        dateObj: new Date(inspection.scheduled_date),
        time: formatTime(inspection.scheduled_time, inspection.completed_at),
        durationMinutes,
        type: 'inspection' as const,
        checklist: checklist?.name || 'Inspection',
        status: 'completed' as const,
        issuesFound: issueCount,
      }
    }),
    ...(serviceRequests || []).map((request) => {
      const propertyData = request.property as { id: number; name: string; street: string; city: string } | { id: number; name: string; street: string; city: string }[] | null
      const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

      return {
        id: request.id,
        property: property ? {
          id: property.id,
          name: property.name,
          address: `${property.street || ''}, ${property.city || ''}`.trim().replace(/^,\s*/, ''),
        } : { id: 0, name: 'Unknown', address: '' },
        date: formatDate(request.scheduled_date),
        dateObj: new Date(request.scheduled_date),
        time: formatTime(null, request.completed_at),
        durationMinutes: 30, // Default for services
        type: 'service' as const,
        checklist: request.title,
        status: 'completed' as const,
        issuesFound: 0,
      }
    }),
  ].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime())

  return <HistoryList inspections={historyItems} />
}
