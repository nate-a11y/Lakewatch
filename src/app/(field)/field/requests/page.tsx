import { createClient } from '@/lib/supabase/server'
import RequestsList from './RequestsList'

export default async function TechnicianRequestsPage() {
  const supabase = await createClient()

  // Fetch service requests assigned to this technician
  const { data: requests, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, description, request_type, priority, status, scheduled_date, created_at,
      property:lwp_properties(id, name, street, city, owner_id, owner:lwp_users!owner_id(phone))
    `)
    .in('status', ['pending', 'scheduled', 'in_progress', 'completed'])
    .order('scheduled_date', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching requests:', error)
  }

  // Format for client component
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Not scheduled'
    const date = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) return 'Today'
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const mapStatus = (status: string): 'assigned' | 'in_progress' | 'completed' => {
    if (status === 'completed') return 'completed'
    if (status === 'in_progress') return 'in_progress'
    return 'assigned'
  }

  const formattedRequests = (requests || []).map((request) => {
    const propertyData = request.property as {
      id: number;
      name: string;
      street: string;
      city: string;
      owner_id: number;
      owner: { phone: string } | { phone: string }[] | null
    } | {
      id: number;
      name: string;
      street: string;
      city: string;
      owner_id: number;
      owner: { phone: string } | { phone: string }[] | null
    }[] | null
    const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
    const owner = property?.owner
    const ownerData = Array.isArray(owner) ? owner[0] : owner

    return {
      id: request.id,
      title: request.title,
      type: request.request_type || 'Service',
      property: {
        id: property?.id || 0,
        name: property?.name || 'Unknown Property',
        address: property ? `${property.street || ''}, ${property.city || ''}`.trim().replace(/^,\s*/, '') : '',
        ownerPhone: ownerData?.phone || '',
      },
      priority: (request.priority || 'normal') as 'low' | 'normal' | 'high' | 'urgent',
      status: mapStatus(request.status),
      scheduledDate: formatDate(request.scheduled_date),
      scheduledTime: '9:00 AM', // Default time if not stored separately
      estimatedDuration: 60, // Default duration
      notes: request.description || '',
    }
  })

  return <RequestsList requests={formattedRequests} />
}
