import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EditRequestClient from './EditRequestClient'

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch request data
  const { data: request, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties!property_id(id, name, owner_id),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  // Fetch customers
  const { data: customers } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'customer')
    .order('last_name')

  // Fetch properties
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name, owner_id')
    .order('name')

  // Fetch technicians
  const { data: technicians } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'technician')
    .order('last_name')

  const propertyData = request.property as { id: number; name: string; owner_id: number } | { id: number; name: string; owner_id: number }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

  const assignedData = request.assigned_to as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
  const assignedTo = Array.isArray(assignedData) ? assignedData[0] : assignedData

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
  }))

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name,
    customerId: String(p.owner_id),
  }))

  const formattedTechnicians = (technicians || []).map(t => ({
    id: String(t.id),
    name: `${t.first_name} ${t.last_name}`,
  }))

  const initialData = {
    id: String(request.id),
    customerId: property ? String(property.owner_id) : '',
    propertyId: property ? String(property.id) : '',
    type: request.request_type || 'repair',
    priority: request.priority || 'normal',
    title: request.title || '',
    description: request.description || '',
    scheduledDate: request.scheduled_date || '',
    assignedTechId: assignedTo ? String(assignedTo.id) : '',
    status: request.status || 'pending',
  }

  return (
    <EditRequestClient
      initialData={initialData}
      customers={formattedCustomers}
      properties={formattedProperties}
      technicians={formattedTechnicians}
    />
  )
}
