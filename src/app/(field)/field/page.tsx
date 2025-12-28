import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TodaySchedule from './TodaySchedule'

export default async function TodayPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/field')
  }

  // Get technician's internal ID
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name, role')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff', 'technician'].includes(userData.role)) {
    redirect('/portal')
  }

  const today = new Date().toISOString().split('T')[0]

  // Get today's inspections
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip,
        gate_code, lockbox_code
      ),
      checklist:lwp_checklists!checklist_id(id, name)
    `)
    .eq('technician_id', userData.id)
    .eq('scheduled_date', today)
    .order('scheduled_time')

  // Get today's service requests assigned to technician
  const { data: serviceRequests } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, scheduled_date, scheduled_time, status, request_type,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip
      )
    `)
    .eq('assigned_to_id', userData.id)
    .eq('scheduled_date', today)
    .in('status', ['scheduled', 'in_progress'])
    .order('scheduled_time')

  // Merge and format schedule items
  const scheduleItems = [
    ...(inspections || []).map((insp, idx) => {
      // Handle Supabase join which can return object or array
      const propData = insp.property as unknown
      const property = Array.isArray(propData) ? propData[0] : propData
      const checkData = insp.checklist as unknown
      const checklist = Array.isArray(checkData) ? checkData[0] : checkData
      return {
        id: String(insp.id),
        type: 'inspection' as const,
        property: {
          id: String(property?.id || 0),
          name: property?.name || 'Property',
          address: property?.street || '',
          city: property?.city || '',
        },
        timeWindow: insp.scheduled_time
          ? formatTimeWindow(insp.scheduled_time)
          : `${9 + idx}:00 AM - ${10 + idx}:00 AM`,
        status: insp.status as 'scheduled' | 'in_progress' | 'completed',
        checklist: checklist?.name || 'Standard',
        estimatedDuration: 45,
        order: idx + 1,
      }
    }),
    ...(serviceRequests || []).map((req, idx) => {
      const propData = req.property as unknown
      const property = Array.isArray(propData) ? propData[0] : propData
      return {
        id: `sr-${req.id}`,
        type: 'service' as const,
        property: {
          id: String(property?.id || 0),
          name: property?.name || 'Property',
          address: property?.street || '',
          city: property?.city || '',
        },
        timeWindow: req.scheduled_time
          ? formatTimeWindow(req.scheduled_time)
          : '2:00 PM - 3:00 PM',
        status: req.status === 'in_progress' ? 'in_progress' as const : 'scheduled' as const,
        checklist: req.title,
        estimatedDuration: 60,
        order: (inspections?.length || 0) + idx + 1,
      }
    }),
  ].sort((a, b) => a.order - b.order)

  return <TodaySchedule initialItems={scheduleItems} technicianName={userData.first_name || 'Technician'} />
}

function formatTimeWindow(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  const endHour = displayHour + 1 > 12 ? 1 : displayHour + 1
  const endPeriod = hours + 1 >= 12 ? 'PM' : 'AM'
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period} - ${endHour}:00 ${endPeriod}`
}
