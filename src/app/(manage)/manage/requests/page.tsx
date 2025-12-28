import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  ClipboardList,
  Building2,
  User,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import RequestFilters from './RequestFilters'

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium':
      case 'normal':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-[#71717a]" />
      default:
        return <AlertTriangle className="w-4 h-4 text-[#71717a]" />
    }
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
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
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

      {/* Requests List */}
      <div className="space-y-3">
        {requestsList.map((request) => (
          <Link
            key={request.id}
            href={`/manage/requests/${request.id}`}
            className="block bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 hover:border-[#4cbb17]/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="text-xs text-[#71717a]">{request.category}</span>
                </div>
                <h3 className="font-semibold mb-1">{request.title}</h3>
                <p className="text-sm text-[#71717a] line-clamp-1 mb-2">{request.description}</p>
                <div className="flex flex-wrap items-center gap-4 text-sm text-[#71717a]">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {request.property.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {request.customer.name}
                  </span>
                  <span className="text-xs">{request.createdAt}</span>
                </div>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end gap-3">
                <div className="flex items-center gap-2">
                  {getStatusIcon(request.status)}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    request.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    request.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                    request.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                    request.status === 'cancelled' ? 'bg-[#27272a] text-[#71717a]' :
                    'bg-[#27272a] text-[#a1a1aa]'
                  }`}>
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
                {request.assignedTo ? (
                  <span className="text-xs text-[#71717a]">
                    Assigned: {request.assignedTo.name}
                  </span>
                ) : (
                  <span className="text-xs text-yellow-500">Unassigned</span>
                )}
                <ChevronRight className="w-5 h-5 text-[#71717a] hidden sm:block" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {requestsList.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <ClipboardList className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No service requests found</p>
        </div>
      )}
    </div>
  )
}
