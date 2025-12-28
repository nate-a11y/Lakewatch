import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardList,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Edit,
  UserPlus,
} from 'lucide-react'

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const request = {
    id,
    title: 'Gutter cleaning needed',
    description: 'Gutters are clogged with leaves from the fall. Need cleaning before winter to prevent ice dams and water damage. Customer noticed water overflow during last rain.',
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    customer: {
      id: '5',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.customer@example.com',
      phone: '(314) 555-1001',
    },
    assignedTo: {
      id: '4',
      firstName: 'Sarah',
      lastName: 'Tech',
    },
    priority: 'medium',
    status: 'scheduled',
    category: 'Maintenance',
    createdAt: 'Dec 18, 2025',
    scheduledFor: 'Jan 5, 2026',
    estimatedDuration: '2 hours',
    estimatedCost: 150,
    notes: 'Will need ladder and safety harness. Check downspouts as well.',
    history: [
      { id: '1', action: 'Request created', user: 'John Smith', date: 'Dec 18, 2025 10:30 AM' },
      { id: '2', action: 'Assigned to Sarah Tech', user: 'Admin', date: 'Dec 19, 2025 9:00 AM' },
      { id: '3', action: 'Scheduled for Jan 5, 2026', user: 'Sarah Tech', date: 'Dec 19, 2025 2:15 PM' },
    ],
    relatedInspection: {
      id: '3',
      date: 'Dec 6, 2025',
    },
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
    }
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
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            request.priority === 'urgent' ? 'bg-red-500/10' :
            request.priority === 'high' ? 'bg-orange-500/10' :
            request.priority === 'medium' ? 'bg-yellow-500/10' :
            'bg-[#27272a]'
          }`}>
            <ClipboardList className={`w-8 h-8 ${
              request.priority === 'urgent' ? 'text-red-500' :
              request.priority === 'high' ? 'text-orange-500' :
              request.priority === 'medium' ? 'text-yellow-500' :
              'text-[#71717a]'
            }`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
              <span className="text-xs text-[#71717a]">{request.category}</span>
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
              <span className="text-sm">Created {request.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
            <CheckCircle className="w-4 h-4" />
            Mark Complete
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Description</h2>
            <p className="text-[#a1a1aa]">{request.description}</p>
          </section>

          {/* Schedule & Estimate */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule & Estimate</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Scheduled For</p>
                  <p className="font-medium">{request.scheduledFor || 'Not scheduled'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Est. Duration</p>
                  <p className="font-medium">{request.estimatedDuration}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-[#71717a]">Est. Cost</p>
                <p className="font-medium text-[#4cbb17]">${request.estimatedCost}</p>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <button className="text-sm text-[#4cbb17] hover:underline">Add note</button>
            </div>
            <p className="text-[#a1a1aa]">{request.notes}</p>
          </section>

          {/* Activity History */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Activity History</h2>
            <div className="space-y-4">
              {request.history.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-[#4cbb17] rounded-full mt-2" />
                    {index < request.history.length - 1 && (
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
              <button className="text-sm text-[#4cbb17] hover:underline">Change</button>
            </div>
            {request.assignedTo ? (
              <Link
                href={`/manage/team/${request.assignedTo.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                  {request.assignedTo.firstName[0]}{request.assignedTo.lastName[0]}
                </div>
                <div>
                  <p className="font-medium">
                    {request.assignedTo.firstName} {request.assignedTo.lastName}
                  </p>
                  <p className="text-sm text-[#71717a]">Technician</p>
                </div>
              </Link>
            ) : (
              <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#27272a] rounded-lg text-[#71717a] hover:text-white hover:border-[#4cbb17] transition-colors">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm">Assign technician</span>
              </button>
            )}
          </section>

          {/* Property */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Property</h2>
            <Link
              href={`/manage/properties/${request.property.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <p className="font-medium">{request.property.name}</p>
                <p className="text-sm text-[#71717a]">{request.property.address}</p>
              </div>
            </Link>
          </section>

          {/* Customer */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <Link
              href={`/manage/customers/${request.customer.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors mb-3"
            >
              <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                {request.customer.firstName[0]}{request.customer.lastName[0]}
              </div>
              <div>
                <p className="font-medium">
                  {request.customer.firstName} {request.customer.lastName}
                </p>
                <p className="text-sm text-[#71717a]">{request.customer.email}</p>
              </div>
            </Link>
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors text-sm">
              <MessageSquare className="w-4 h-4" />
              Message Customer
            </button>
          </section>

          {/* Related Inspection */}
          {request.relatedInspection && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Related Inspection</h2>
              <Link
                href={`/manage/inspections/${request.relatedInspection.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Issue found during inspection</p>
                  <p className="text-xs text-[#71717a]">{request.relatedInspection.date}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Quick Actions */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors">
                Reschedule
              </button>
              <button className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors">
                Create Invoice
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                Cancel Request
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
