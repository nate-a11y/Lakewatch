import { createClient } from '@/lib/supabase/server'
import WeekViewClient from './WeekViewClient'

export default async function ScheduleWeekPage() {
  const supabase = await createClient()

  // Get start of current week (Sunday)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  // Get end of week (Saturday)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  // Fetch inspections for the week
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status,
      property:lwp_properties(id, name, street),
      technician:lwp_users!technician_id(id, first_name, last_name)
    `)
    .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
    .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])
    .order('scheduled_date')
    .order('scheduled_time')

  // Fetch service requests for the week
  const { data: serviceRequests } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, scheduled_date, scheduled_time, status, estimated_duration,
      property:lwp_properties(id, name, street),
      technician:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .gte('scheduled_date', startOfWeek.toISOString().split('T')[0])
    .lte('scheduled_date', endOfWeek.toISOString().split('T')[0])
    .order('scheduled_date')
    .order('scheduled_time')

  // Format inspections
  const formattedInspections = (inspections || []).map(insp => {
    const property = Array.isArray(insp.property) ? insp.property[0] : insp.property
    const technician = Array.isArray(insp.technician) ? insp.technician[0] : insp.technician

    return {
      id: String(insp.id),
      type: 'inspection' as const,
      title: 'Inspection',
      property: {
        id: String(property?.id || 0),
        name: property?.name || 'Unknown',
        address: property?.street || '',
      },
      technician: technician ? {
        id: String(technician.id),
        name: `${technician.first_name} ${technician.last_name}`,
        initials: `${technician.first_name?.[0] || ''}${technician.last_name?.[0] || ''}`,
      } : null,
      date: insp.scheduled_date,
      time: insp.scheduled_time ? formatTime(insp.scheduled_time) : '9:00 AM',
      duration: '45 min',
      status: insp.status as 'scheduled' | 'in_progress' | 'completed',
    }
  })

  // Format service requests
  const formattedRequests = (serviceRequests || []).map(req => {
    const property = Array.isArray(req.property) ? req.property[0] : req.property
    const technician = Array.isArray(req.technician) ? req.technician[0] : req.technician

    return {
      id: String(req.id),
      type: 'service' as const,
      title: req.title,
      property: {
        id: String(property?.id || 0),
        name: property?.name || 'Unknown',
        address: property?.street || '',
      },
      technician: technician ? {
        id: String(technician.id),
        name: `${technician.first_name} ${technician.last_name}`,
        initials: `${technician.first_name?.[0] || ''}${technician.last_name?.[0] || ''}`,
      } : null,
      date: req.scheduled_date,
      time: req.scheduled_time ? formatTime(req.scheduled_time) : '9:00 AM',
      duration: req.estimated_duration ? `${req.estimated_duration} min` : '30 min',
      status: req.status as 'scheduled' | 'in_progress' | 'completed',
    }
  })

  // Combine and pass to client
  const scheduleItems = [...formattedInspections, ...formattedRequests]

  return <WeekViewClient initialItems={scheduleItems} />
}

function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}
