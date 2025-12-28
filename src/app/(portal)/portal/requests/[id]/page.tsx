import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
} from 'lucide-react'
import CancelRequestButton from '@/components/buttons/CancelRequestButton'

export default async function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const request = {
    id,
    type: 'pre_arrival',
    typeName: 'Pre-Arrival Prep',
    title: 'Prepare house for holiday visit',
    description: 'We\'re arriving on December 28th for the New Year holiday. Please:\n\n• Set HVAC to 72°F\n• Stock the fridge with the attached grocery list\n• Put fresh linens on all beds\n• Open blinds and check all lights work\n• Make sure hot tub is ready',
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    status: 'in_progress',
    priority: 'normal',
    createdAt: 'Dec 20, 2025',
    preferredDate: 'Dec 28, 2025',
    preferredTime: 'Morning (before noon)',
    assignedTo: {
      id: '4',
      name: 'Sarah Tech',
    },
    timeline: [
      {
        id: '1',
        action: 'Request submitted',
        date: 'Dec 20, 2025 10:30 AM',
        user: 'You',
      },
      {
        id: '2',
        action: 'Request reviewed and scheduled',
        date: 'Dec 20, 2025 2:15 PM',
        user: 'Admin',
      },
      {
        id: '3',
        action: 'Assigned to Sarah Tech',
        date: 'Dec 20, 2025 2:20 PM',
        user: 'Admin',
      },
      {
        id: '4',
        action: 'Work started',
        date: 'Dec 28, 2025 9:00 AM',
        user: 'Sarah Tech',
      },
    ],
    estimatedCost: 150,
    notes: 'Grocery list received. Will purchase items the morning of and stock before noon.',
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500'
      case 'scheduled':
        return 'bg-purple-500/10 text-purple-500'
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-[#27272a] text-[#71717a]'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500'
      case 'high':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-[#27272a] text-[#a1a1aa]'
    }
  }

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
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
            {request.status.replace('_', ' ')}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(request.priority)}`}>
            {request.priority} priority
          </span>
          <span className="text-xs px-2 py-1 bg-[#27272a] rounded">
            {request.typeName}
          </span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
        <p className="text-[#71717a]">Request #{request.id} • Created {request.createdAt}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Request Details</h2>
            <p className="whitespace-pre-wrap text-[#a1a1aa]">{request.description}</p>
          </section>

          {/* Timeline */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Activity</h2>
            <div className="space-y-4">
              {request.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-3">
                  <div className="relative">
                    <div className={`w-3 h-3 rounded-full mt-1.5 ${
                      index === request.timeline.length - 1 ? 'bg-[#4cbb17]' : 'bg-[#27272a]'
                    }`} />
                    {index < request.timeline.length - 1 && (
                      <div className="absolute top-4 left-1 w-0.5 h-full bg-[#27272a]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{event.action}</p>
                    <p className="text-sm text-[#71717a]">{event.user} • {event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Team Notes */}
          {request.notes && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Team Notes</h2>
              <p className="text-[#a1a1aa]">{request.notes}</p>
            </section>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/portal/messages/1"
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#4cbb17] text-black font-semibold rounded-xl hover:bg-[#60e421] transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
              Message Team
            </Link>
            <CancelRequestButton requestId={id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Property</h2>
            <Link
              href={`/portal/properties/${request.property.id}`}
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

          {/* Schedule */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Schedule</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Preferred Date</p>
                  <p className="font-medium">{request.preferredDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Preferred Time</p>
                  <p className="font-medium">{request.preferredTime}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Assigned Technician */}
          {request.assignedTo && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Assigned To</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                  {request.assignedTo.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium">{request.assignedTo.name}</p>
                  <p className="text-sm text-[#71717a]">Technician</p>
                </div>
              </div>
            </section>
          )}

          {/* Estimated Cost */}
          {request.estimatedCost && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Estimated Cost</h2>
              <p className="text-2xl font-bold text-[#4cbb17]">${request.estimatedCost}</p>
              <p className="text-sm text-[#71717a] mt-1">Final invoice after completion</p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
