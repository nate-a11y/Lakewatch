import { createClient } from '@/lib/supabase/server'
import CalendarView from './CalendarView'

export interface CalendarEvent {
  id: string
  date: string
  type: 'inspection' | 'occupancy'
  property: string
  propertyId: number
  label?: string
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's internal ID
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user?.id)
    .single()

  const userId = userData?.id

  // Get user's properties
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name')
    .eq('owner_id', userId || 0)

  const propertyIds = properties?.map(p => p.id) || []
  const propertyMap = new Map(properties?.map(p => [p.id, p.name]) || [])

  // Fetch inspections for user's properties (next 6 months)
  const today = new Date()
  const sixMonthsLater = new Date(today.getFullYear(), today.getMonth() + 6, today.getDate())

  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select('id, scheduled_date, property_id')
    .in('property_id', propertyIds.length > 0 ? propertyIds : [0])
    .gte('scheduled_date', today.toISOString().split('T')[0])
    .lte('scheduled_date', sixMonthsLater.toISOString().split('T')[0])
    .eq('status', 'scheduled')

  // Fetch occupancy events for user's properties
  const { data: occupancyEvents } = await supabase
    .from('lwp_occupancy_calendar')
    .select('id, start_date, end_date, property_id, event_type, guest_name')
    .in('property_id', propertyIds.length > 0 ? propertyIds : [0])
    .gte('end_date', today.toISOString().split('T')[0])
    .lte('start_date', sixMonthsLater.toISOString().split('T')[0])

  // Transform into calendar events
  const events: CalendarEvent[] = []

  // Add inspections
  inspections?.forEach(insp => {
    events.push({
      id: `insp-${insp.id}`,
      date: insp.scheduled_date,
      type: 'inspection',
      property: propertyMap.get(insp.property_id) || 'Property',
      propertyId: insp.property_id,
    })
  })

  // Add occupancy events (expand date ranges into individual days)
  occupancyEvents?.forEach(occ => {
    const start = new Date(occ.start_date)
    const end = new Date(occ.end_date)
    const label = occ.event_type === 'owner_visit'
      ? 'Owner Visit'
      : occ.event_type === 'guest_visit'
      ? `Guest: ${occ.guest_name || 'Guest'}`
      : occ.event_type === 'rental'
      ? 'Rental'
      : 'Occupied'

    // Add event for each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      events.push({
        id: `occ-${occ.id}-${d.toISOString().split('T')[0]}`,
        date: d.toISOString().split('T')[0],
        type: 'occupancy',
        property: propertyMap.get(occ.property_id) || 'Property',
        propertyId: occ.property_id,
        label,
      })
    }
  })

  // Get property options for the add occupancy form
  const propertyOptions = properties?.map(p => ({ id: p.id, name: p.name })) || []

  return <CalendarView initialEvents={events} properties={propertyOptions} />
}
