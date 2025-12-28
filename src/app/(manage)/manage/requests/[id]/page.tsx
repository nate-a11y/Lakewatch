import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardList,
  Building2,
  Calendar,
  Clock,
} from 'lucide-react'
import EditableNotes from '@/components/EditableNotes'
import RequestActionButtons, {
  RequestQuickActions,
  MessageCustomerButton,
  AssignTechnicianButton,
  ChangeAssignmentButton,
} from './RequestActionButtons'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch request with related data
  const { data: request, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      *,
      property:lwp_properties(id, name, street, city, state, zip),
      requested_by:lwp_users!requested_by_id(id, first_name, last_name, email, phone),
      assigned_to:lwp_users!assigned_to_id(id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  const propertyData = request.property as { id: number; name: string; street: string; city: string; state: string; zip: string } | { id: number; name: string; street: string; city: string; state: string; zip: string }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

  const customerData = request.requested_by as { id: number; first_name: string; last_name: string; email: string; phone: string | null } | { id: number; first_name: string; last_name: string; email: string; phone: string | null }[] | null
  const customer = Array.isArray(customerData) ? customerData[0] : customerData

  const assignedData = request.assigned_to as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
  const assignedTo = Array.isArray(assignedData) ? assignedData[0] : assignedData

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
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

  const getPriorityIconColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500'
      case 'high':
        return 'bg-orange-500/10 text-orange-500'
      case 'medium':
      case 'normal':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-[#27272a] text-[#71717a]'
    }
  }

  // Build activity history from what we have
  const history = [
    {
      id: '1',
      action: 'Request created',
      user: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
      date: formatDate(request.created_at),
    },
  ]

  if (assignedTo) {
    history.push({
      id: '2',
      action: `Assigned to ${assignedTo.first_name} ${assignedTo.last_name}`,
      user: 'Admin',
      date: formatDate(request.updated_at || request.created_at),
    })
  }

  if (request.scheduled_date) {
    history.push({
      id: '3',
      action: `Scheduled for ${formatDate(request.scheduled_date)}`,
      user: assignedTo ? `${assignedTo.first_name} ${assignedTo.last_name}` : 'Admin',
      date: formatDate(request.updated_at || request.created_at),
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/manage/requests"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getPriorityIconColor(request.priority)}`}>
            <ClipboardList className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
              <span className="text-xs text-[#71717a]">{request.request_type || 'General'}</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {request.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                request.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                request.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                request.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {request.status.replace('_', ' ')}
              </span>
              <span className="text-sm">Created {formatDate(request.created_at)}</span>
            </div>
          </div>
        </div>
        <RequestActionButtons requestId={id} customerId={customer?.id || 0} status={request.status} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-[#a1a1aa]">{request.description || 'No description provided.'}</p>
          </section>

          {/* Schedule & Estimate */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule & Estimate</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Scheduled For</p>
                  <p className="font-medium">{request.scheduled_date ? formatDate(request.scheduled_date) : 'Not scheduled'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Preferred Date</p>
                  <p className="font-medium">{request.preferred_date ? formatDate(request.preferred_date) : 'None'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Est. Cost</p>
                <p className="font-medium text-[#4cbb17]">
                  {request.estimated_cost ? `$${request.estimated_cost}` : 'TBD'}
                </p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <EditableNotes
            initialNotes={request.completion_notes || ''}
            title="Notes"
            placeholder="Add request notes..."
          />

          {/* Activity History */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Activity History</h2>
            <div className="space-y-4">
              {history.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-[#4cbb17] rounded-full mt-2" />
                    {index < history.length - 1 && (
                      <div className="absolute top-4 left-0.5 w-0.5 h-full bg-[#27272a]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{event.action}</p>
                    <p className="text-xs text-[#71717a]">{event.user} • {event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Assigned Technician */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Assigned To</h2>
              {assignedTo && <ChangeAssignmentButton requestId={id} />}
            </div>
            {assignedTo ? (
              <Link
                href={`/manage/team/${assignedTo.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                  {(assignedTo.first_name?.[0] || '?')}{(assignedTo.last_name?.[0] || '')}
                </div>
                <div>
                  <p className="font-medium">
                    {assignedTo.first_name} {assignedTo.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">Technician</p>
                </div>
              </Link>
            ) : (
              <AssignTechnicianButton requestId={id} />
            )}
          </section>

          {/* Property */}
          {property && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property</h2>
              <Link
                href={`/manage/properties/${property.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-[#71717a]">{property.street}, {property.city}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Customer */}
          {customer && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <Link
                href={`/manage/customers/${customer.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors mb-3"
              >
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                  {(customer.first_name?.[0] || '?')}{(customer.last_name?.[0] || '')}
                </div>
                <div>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">{customer.email}</p>
                </div>
              </Link>
              <MessageCustomerButton customerId={customer.id} />
            </section>
          )}

          {/* Quick Actions */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <RequestQuickActions requestId={id} customerId={customer?.id || 0} />
          </section>
        </div>
      </div>
    </div>
  )
}
