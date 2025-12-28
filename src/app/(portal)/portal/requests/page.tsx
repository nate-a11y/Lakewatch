import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ClipboardList, Plus, Clock } from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/10 text-yellow-500',
  scheduled: 'bg-blue-500/10 text-blue-500',
  in_progress: 'bg-purple-500/10 text-purple-500',
  completed: 'bg-green-500/10 text-green-500',
  cancelled: 'bg-[#71717a]/10 text-[#71717a]',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default async function RequestsPage() {
  const supabase = await createClient()

  // Fetch service requests for the current customer
  const { data: requests, error } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, title, request_type, status, priority, created_at, scheduled_date,
      property:lwp_properties(id, name)
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching requests:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Service Requests</h1>
          <p className="text-[#a1a1aa]">
            Request and track concierge services
          </p>
        </div>
        <Link
          href="/portal/requests/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Request
        </Link>
      </div>

      {/* Requests list */}
      <div className="space-y-4">
        {(requests || []).map((request) => {
          const propertyData = request.property as { id: number; name: string } | { id: number; name: string }[] | null
          const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

          return (
            <Link
              key={request.id}
              href={`/portal/requests/${request.id}`}
              className="block bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-12 h-12 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-[#4cbb17]" />
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold mb-1">{request.title}</h3>
                  <p className="text-sm text-[#71717a]">
                    {property?.name || 'Property'} • Requested {formatDate(request.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {request.scheduled_date && (
                    <div className="text-sm text-[#a1a1aa]">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {formatDate(request.scheduled_date)}
                    </div>
                  )}
                  <span className={`text-sm px-3 py-1 rounded-full ${statusColors[request.status] || statusColors.pending}`}>
                    {statusLabels[request.status] || request.status}
                  </span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {(!requests || requests.length === 0) && (
        <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <ClipboardList className="w-16 h-16 text-[#71717a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No service requests</h2>
          <p className="text-[#a1a1aa] mb-6">
            Request pre-arrival, concierge, or other services
          </p>
          <Link
            href="/portal/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Request
          </Link>
        </div>
      )}
    </div>
  )
}
