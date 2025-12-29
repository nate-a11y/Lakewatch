import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RequestDetailClient from './RequestDetailClient'

export default async function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the service request
  const { data: request, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, description, request_type, priority, status, scheduled_date, estimated_duration,
      created_at,
      property:lwp_properties(id, name, street, city, state, zip, owner_id, owner:lwp_users!owner_id(first_name, last_name, phone))
    `)
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  const propertyData = request.property as {
    id: number
    name: string
    street: string
    city: string
    state: string
    zip: string
    owner_id: number
    owner: { first_name: string; last_name: string; phone: string } | { first_name: string; last_name: string; phone: string }[] | null
  } | {
    id: number
    name: string
    street: string
    city: string
    state: string
    zip: string
    owner_id: number
    owner: { first_name: string; last_name: string; phone: string } | { first_name: string; last_name: string; phone: string }[] | null
  }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
  const ownerData = property?.owner
  const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled'
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formattedRequest = {
    id: request.id,
    title: request.title,
    type: request.request_type || 'Service',
    property: {
      id: property?.id || 0,
      name: property?.name || 'Unknown Property',
      address: property?.street || '',
      city: property?.city || '',
      state: property?.state || '',
      zip: property?.zip || '',
      ownerName: owner ? `${owner.first_name} ${owner.last_name}` : '',
      ownerPhone: owner?.phone || '',
    },
    priority: (request.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
    status: request.status as 'pending' | 'scheduled' | 'in_progress' | 'completed',
    scheduledDate: formatDate(request.scheduled_date),
    scheduledTime: '9:00 AM', // Default if not stored separately
    estimatedDuration: request.estimated_duration || 60,
    notes: request.description || '',
    createdAt: formatDate(request.created_at),
  }

  return <RequestDetailClient request={formattedRequest} />
}
