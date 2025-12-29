import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import RequestFilters from './RequestFilters'
import RequestsClient from './RequestsClient'

export default async function RequestsPage() {
  const supabase = await createClient()

  // Fetch service requests with related data
  const { data: requests, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, description, request_type, priority, status, created_at, scheduled_date,
      property:lwp_properties(id, name),
      requested_by:lwp_users!requested_by_id(id, first_name, last_name),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching requests:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const requestsList = (requests || []).map((r) => {
    const propertyData = r.property as { id: number; name: string } | { id: number; name: string }[] | null
    const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

    const customerData = r.requested_by as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
    const customer = Array.isArray(customerData) ? customerData[0] : customerData

    const assignedData = r.assigned_to as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
    const assignedTo = Array.isArray(assignedData) ? assignedData[0] : assignedData

    return {
      id: r.id,
      title: r.title,
      description: r.description || '',
      property: {
        id: property?.id || 0,
        name: property?.name || 'Unknown',
      },
      customer: {
        id: customer?.id || 0,
        name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
      },
      assignedTo: assignedTo ? {
        id: assignedTo.id,
        name: `${assignedTo.first_name} ${assignedTo.last_name}`,
      } : null,
      priority: r.priority as string,
      status: r.status as string,
      category: r.request_type || 'General',
      createdAt: formatDate(r.created_at),
      scheduledFor: r.scheduled_date ? formatDate(r.scheduled_date) : null,
    }
  })

  const stats = {
    open: requestsList.filter(r => r.status === 'pending').length,
    inProgress: requestsList.filter(r => r.status === 'in_progress').length,
    scheduled: requestsList.filter(r => r.status === 'scheduled').length,
    urgent: requestsList.filter(r => r.priority === 'urgent' && r.status !== 'completed').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Service Requests</h1>
          <p className="text-[#a1a1aa]">
            Manage customer service requests and work orders ({requestsList.length} total)
          </p>
        </div>
        <Link
          href="/manage/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors min-h-[44px]"
        >
          <Plus className="w-5 h-5" />
          New Request
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-[#71717a]" />
            <p className="text-sm text-[#71717a]">Open</p>
          </div>
          <p className="text-2xl font-bold">{stats.open}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-[#71717a]">In Progress</p>
          </div>
          <p className="text-2xl font-bold">{stats.inProgress}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-[#71717a]">Scheduled</p>
          </div>
          <p className="text-2xl font-bold">{stats.scheduled}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-400">Urgent</p>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.urgent}</p>
        </div>
      </div>

      <RequestFilters />

      <RequestsClient requests={requestsList} />
    </div>
  )
}
