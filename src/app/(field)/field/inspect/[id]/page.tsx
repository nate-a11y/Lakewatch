import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InspectionClient from './InspectionClient'

export default async function InspectionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the inspection with property and checklist details
  const { data: inspection, error } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status, notes,
      property:lwp_properties(
        id, name, street, city, state, zip,
        gate_code, lockbox_code, alarm_code, wifi_network, wifi_password, access_notes,
        owner:lwp_users!owner_id(first_name, last_name, phone)
      ),
      checklist:lwp_checklists(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !inspection) {
    notFound()
  }

  const propertyData = inspection.property as {
    id: number
    name: string
    street: string
    city: string
    state: string
    zip: string
    gate_code: string | null
    lockbox_code: string | null
    alarm_code: string | null
    wifi_network: string | null
    wifi_password: string | null
    access_notes: string | null
    owner: { first_name: string; last_name: string; phone: string } | { first_name: string; last_name: string; phone: string }[] | null
  } | {
    id: number
    name: string
    street: string
    city: string
    state: string
    zip: string
    gate_code: string | null
    lockbox_code: string | null
    alarm_code: string | null
    wifi_network: string | null
    wifi_password: string | null
    access_notes: string | null
    owner: { first_name: string; last_name: string; phone: string } | { first_name: string; last_name: string; phone: string }[] | null
  }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
  const ownerData = property?.owner
  const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

  const checklistData = inspection.checklist as { id: number; name: string } | { id: number; name: string }[] | null
  const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData

  // Fetch checklist items
  let checklistItems: { id: number; item_text: string; category: string; is_required: boolean; requires_photo: boolean }[] = []
  if (checklist?.id) {
    const { data: items } = await supabase
      .from('lwp_checklist_items')
      .select('id, item_text, category, is_required, requires_photo')
      .eq('checklist_id', checklist.id)
      .order('sort_order', { ascending: true })
    checklistItems = items || []
  }

  // Fetch any previous issues for follow-up
  const { data: previousInspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date,
      issues:lwp_inspections_issues(id, description, category, severity)
    `)
    .eq('property_id', property?.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(1)

  const prevInspection = previousInspections?.[0]
  const issuesData = prevInspection?.issues as { id: number; description: string; category: string; severity: string }[] | null
  const previousIssues = (issuesData || []).map(issue => ({
    item: issue.category,
    note: issue.description,
    date: new Date(prevInspection?.scheduled_date || '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }))

  // Format property data for client
  const formattedProperty = {
    id: property?.id || 0,
    name: property?.name || 'Property',
    address: property?.street || '',
    city: property?.city || '',
    state: property?.state || '',
    zip: property?.zip || '',
    owner: owner ? `${owner.first_name} ${owner.last_name}` : '',
    phone: owner?.phone || '',
    accessInfo: {
      gateCode: property?.gate_code || '',
      lockboxCode: property?.lockbox_code || '',
      alarmCode: property?.alarm_code || '',
      wifiNetwork: property?.wifi_network || '',
      wifiPassword: property?.wifi_password || '',
      notes: property?.access_notes || '',
    },
    checklist: checklist?.name || 'Standard Inspection',
    previousIssues,
  }

  // Format checklist items for client
  const formattedChecklistItems = checklistItems.map(item => ({
    id: String(item.id),
    category: item.category || 'General',
    name: item.item_text,
    required: item.is_required,
    requiresPhoto: item.requires_photo,
  }))

  // If no checklist items from database, use default
  const defaultItems = formattedChecklistItems.length > 0 ? formattedChecklistItems : [
    { id: '1', category: 'Exterior', name: 'Check front door and locks', required: true, requiresPhoto: false },
    { id: '2', category: 'Exterior', name: 'Check back door and locks', required: true, requiresPhoto: false },
    { id: '3', category: 'Exterior', name: 'Inspect windows for damage', required: true, requiresPhoto: true },
    { id: '4', category: 'Interior', name: 'Check HVAC operation', required: true, requiresPhoto: false },
    { id: '5', category: 'Interior', name: 'Check water heater', required: true, requiresPhoto: false },
    { id: '6', category: 'Interior', name: 'Inspect for water leaks', required: true, requiresPhoto: true },
    { id: '7', category: 'Systems', name: 'Test smoke detectors', required: true, requiresPhoto: false },
    { id: '8', category: 'Systems', name: 'Test CO detectors', required: true, requiresPhoto: false },
  ]

  return (
    <InspectionClient
      inspectionId={inspection.id}
      property={formattedProperty}
      checklistItems={defaultItems}
    />
  )
}
