import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
} from 'lucide-react'
import CancelRequestButton from '@/components/buttons/CancelRequestButton'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  scheduled: 'bg-purple-500/10 text-purple-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-[#27272a] text-[#71717a]',
}

const priorityColors: Record<string, string> = {
  urgent: 'bg-red-500/10 text-red-500',
  high: 'bg-yellow-500/10 text-yellow-500',
  normal: 'bg-[#27272a] text-[#a1a1aa]',
  low: 'bg-[#27272a] text-[#71717a]',
}

const requestTypeLabels: Record<string, string> = {
  pre_arrival: 'Pre-Arrival Prep',
  concierge: 'Concierge Service',
  maintenance: 'Maintenance',
  emergency: 'Emergency',
  seasonal: 'Seasonal Service',
}

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
      id, title, description, request_type, status, priority,
      created_at, scheduled_date, estimated_cost, notes,
      property:lwp_properties(id, name, street, city, state, zip),
      technician:lwp_users!technician_id(id, first_name, last_name)
    `)
    .eq('id', id)
    .single()

  if (error || !request) {
    notFound()
  }

  const propertyData = request.property as { id: number; name: string; street: string; city: string; state: string; zip: string } | { id: number; name: string; street: string; city: string; state: string; zip: string }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
  const techData = request.technician as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
  const technician = Array.isArray(techData) ? techData[0] : techData

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  const fullAddress = property
    ? `${property.street || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip || ''}`.trim()
    : ''

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/portal/requests"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to requests
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[request.status] || statusColors.pending}`}>
            {request.status.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${priorityColors[request.priority] || priorityColors.normal}`}>
            {request.priority} priority
          </span>
          <span className="text-xs px-2 py-1 bg-[#27272a] rounded">
            {requestTypeLabels[request.request_type] || request.request_type}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
        <p className="text-[#71717a]">Request #{request.id} • Created {formatDateTime(request.created_at)}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Request Details</h2>
            <p className="whitespace-pre-wrap text-[#a1a1aa]">{request.description || 'No description provided.'}</p>
          </section>

          {/* Team Notes */}
          {request.notes && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Team Notes</h2>
              <p className="text-[#a1a1aa]">{request.notes}</p>
            </section>
          )}

          {/* Actions */}
          {request.status !== 'completed' && request.status !== 'cancelled' && (
            <div className="flex gap-3">
              <Link
                href="/portal/messages/new"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                Message Team
              </Link>
              <CancelRequestButton requestId={id} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          {property && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property</h2>
              <Link
                href={`/portal/properties/${property.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-[#71717a]">{fullAddress}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Schedule */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Scheduled Date</p>
                  <p className="font-medium">
                    {request.scheduled_date ? formatDate(request.scheduled_date) : 'Not yet scheduled'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Created</p>
                  <p className="font-medium">{formatDate(request.created_at)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Assigned Technician */}
          {technician && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Assigned To</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                  {technician.first_name[0]}{technician.last_name?.[0] || ''}
                </div>
                <div>
                  <p className="font-medium">{technician.first_name} {technician.last_name}</p>
                  <p className="text-sm text-[#71717a]">Technician</p>
                </div>
              </div>
            </section>
          )}

          {/* Estimated Cost */}
          {request.estimated_cost && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Estimated Cost</h2>
              <p className="text-2xl font-bold text-[#4cbb17]">${request.estimated_cost}</p>
              <p className="text-sm text-[#71717a] mt-1">Final invoice after completion</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
