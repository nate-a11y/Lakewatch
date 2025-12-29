import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import PropertyDetailClient from './PropertyDetailClient'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the property
  const { data: property, error } = await supabase
    .from('lwp_properties')
    .select(`
      id, name, street, city, state, zip, property_type, square_footage, status,
      gate_code, lockbox_code, alarm_code, alarm_company, wifi_network, wifi_password, access_notes,
      service_plan, service_frequency
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Fetch recent inspections for this property
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status, overall_status,
      issues:lwp_inspections_issues(count)
    `)
    .eq('property_id', id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(5)

  // Format inspections for client
  const recentInspections = (inspections || []).map((inspection) => {
    const issuesData = inspection.issues as { count: number }[] | null
    const issueCount = issuesData?.[0]?.count || 0
    return {
      id: inspection.id,
      date: new Date(inspection.scheduled_date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      status: issueCount > 0 ? 'issues_found' : 'all_clear',
    }
  })

  // Format property data for client
  const formattedProperty = {
    id: property.id,
    name: property.name,
    address: {
      street: property.street || '',
      city: property.city || '',
      state: property.state || '',
      zip: property.zip || '',
    },
    type: property.property_type || 'house',
    squareFootage: property.square_footage || 0,
    status: property.status || 'active',
    servicePlan: {
      name: property.service_plan || 'Standard Service',
      frequency: property.service_frequency || 'Bi-weekly',
      nextInspection: 'Check schedule for details',
    },
    accessInfo: {
      gateCode: property.gate_code || '',
      lockboxCode: property.lockbox_code || '',
      alarmCode: property.alarm_code || '',
      alarmCompany: property.alarm_company || '',
      wifiNetwork: property.wifi_network || '',
      wifiPassword: property.wifi_password || '',
      specialInstructions: property.access_notes || '',
    },
    recentInspections,
  }

  return <PropertyDetailClient property={formattedProperty} />
}
