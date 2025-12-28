import Link from 'next/link'
import { ClipboardList, Plus, Clock } from 'lucide-react'

interface ServiceRequest {
  id: string
  title: string
  type: string
  property: string
  status: string
  priority: string
  createdAt: string
  preferredDate: string
}

export default function RequestsPage() {
  // Mock data
  const requests: ServiceRequest[] = [
    {
      id: '1',
      title: 'Pre-arrival preparation',
      type: 'pre_arrival',
      property: 'Lake House',
      status: 'scheduled',
      priority: 'normal',
      createdAt: 'December 20, 2025',
      preferredDate: 'January 10, 2026',
    },
    {
      id: '2',
      title: 'Grocery stocking for arrival',
      type: 'grocery_stocking',
      property: 'Lake House',
      status: 'pending',
      priority: 'normal',
      createdAt: 'December 22, 2025',
      preferredDate: 'January 10, 2026',
    },
  ]

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
        {requests.map((request) => (
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
                  {request.property} • Requested {request.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-sm text-[#a1a1aa]">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {request.preferredDate}
                </div>
                <span className={`text-sm px-3 py-1 rounded-full ${statusColors[request.status]}`}>
                  {statusLabels[request.status]}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {requests.length === 0 && (
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
