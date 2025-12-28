'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Wrench,
  Building2,
  Clock,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Phone,
  MapPin,
  Play,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ServiceRequest {
  id: string
  title: string
  type: string
  property: {
    id: string
    name: string
    address: string
    ownerPhone: string
  }
  priority: 'low' | 'normal' | 'high' | 'urgent'
  status: 'assigned' | 'in_progress' | 'completed'
  scheduledDate: string
  scheduledTime: string
  estimatedDuration: number
  notes: string
}

export default function TechnicianRequestsPage() {
  const [filter, setFilter] = useState<'all' | 'assigned' | 'in_progress' | 'completed'>('all')

  // Mock data
  const requests: ServiceRequest[] = [
    {
      id: '1',
      title: 'Gutter Cleaning',
      type: 'Maintenance',
      property: {
        id: '1',
        name: 'Lake House',
        address: '123 Lakefront Dr, Lake Ozark',
        ownerPhone: '(314) 555-1001',
      },
      priority: 'normal',
      status: 'assigned',
      scheduledDate: 'Today',
      scheduledTime: '2:00 PM',
      estimatedDuration: 60,
      notes: 'Customer noted leaves clogging downspouts on north side.',
    },
    {
      id: '2',
      title: 'Pre-Arrival Prep',
      type: 'Concierge',
      property: {
        id: '3',
        name: 'Sunset Cove',
        address: '456 Marina Way, Osage Beach',
        ownerPhone: '(314) 555-1002',
      },
      priority: 'high',
      status: 'in_progress',
      scheduledDate: 'Today',
      scheduledTime: '4:00 PM',
      estimatedDuration: 90,
      notes: 'Set HVAC to 72°F, stock groceries (list attached), fresh linens on all beds.',
    },
    {
      id: '3',
      title: 'HVAC Filter Change',
      type: 'Maintenance',
      property: {
        id: '2',
        name: 'Guest Cabin',
        address: '125 Lakefront Dr, Lake Ozark',
        ownerPhone: '(314) 555-1001',
      },
      priority: 'low',
      status: 'assigned',
      scheduledDate: 'Tomorrow',
      scheduledTime: '10:00 AM',
      estimatedDuration: 30,
      notes: 'Filter size: 20x25x1. Filters are in the garage.',
    },
    {
      id: '4',
      title: 'Storm Check',
      type: 'Inspection',
      property: {
        id: '4',
        name: 'Hillside Retreat',
        address: '789 Hill Rd, Camdenton',
        ownerPhone: '(314) 555-1003',
      },
      priority: 'urgent',
      status: 'completed',
      scheduledDate: 'Yesterday',
      scheduledTime: '11:00 AM',
      estimatedDuration: 45,
      notes: 'Check for damage after last night\'s storm. Document any issues.',
    },
  ]

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
      case 'normal':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-[#27272a] text-[#71717a]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-[#27272a] text-[#a1a1aa]'
    }
  }

  const stats = {
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Service Requests</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setFilter(filter === 'assigned' ? 'all' : 'assigned')}
          className={cn(
            'p-4 rounded-xl border text-center transition-colors',
            filter === 'assigned'
              ? 'bg-[#4cbb17]/10 border-[#4cbb17]'
              : 'bg-[#0f0f0f] border-[#27272a]'
          )}
        >
          <p className="text-xl font-bold">{stats.assigned}</p>
          <p className="text-xs text-[#71717a]">Assigned</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'in_progress' ? 'all' : 'in_progress')}
          className={cn(
            'p-4 rounded-xl border text-center transition-colors',
            filter === 'in_progress'
              ? 'bg-yellow-500/10 border-yellow-500'
              : 'bg-[#0f0f0f] border-[#27272a]'
          )}
        >
          <p className="text-xl font-bold text-yellow-500">{stats.inProgress}</p>
          <p className="text-xs text-[#71717a]">In Progress</p>
        </button>
        <button
          onClick={() => setFilter(filter === 'completed' ? 'all' : 'completed')}
          className={cn(
            'p-4 rounded-xl border text-center transition-colors',
            filter === 'completed'
              ? 'bg-green-500/10 border-green-500'
              : 'bg-[#0f0f0f] border-[#27272a]'
          )}
        >
          <p className="text-xl font-bold text-green-500">{stats.completed}</p>
          <p className="text-xs text-[#71717a]">Completed</p>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map(request => (
          <div
            key={request.id}
            className={cn(
              'bg-[#0f0f0f] border rounded-xl overflow-hidden',
              request.status === 'completed'
                ? 'border-[#27272a] opacity-60'
                : request.priority === 'urgent'
                ? 'border-red-500/30'
                : request.status === 'in_progress'
                ? 'border-yellow-500/30'
                : 'border-[#27272a]'
            )}
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getPriorityColor(request.priority)}`}>
                    {request.priority}
                  </span>
                  <span className="text-xs text-[#71717a]">{request.type}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ')}
                </span>
              </div>

              <h3 className="font-semibold mb-1">{request.title}</h3>

              <div className="flex items-center gap-2 text-sm text-[#71717a] mb-2">
                <Building2 className="w-4 h-4" />
                <span>{request.property.name}</span>
              </div>

              <div className="flex items-center gap-4 text-xs text-[#71717a] mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {request.scheduledDate}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {request.scheduledTime}
                </span>
                <span>~{request.estimatedDuration} min</span>
              </div>

              {request.notes && (
                <p className="text-sm text-[#a1a1aa] p-3 bg-black/30 rounded-lg mb-3">
                  {request.notes}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {request.status === 'assigned' && (
                  <>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(request.property.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#27272a] rounded-lg text-sm hover:bg-[#27272a] transition-colors"
                    >
                      <MapPin className="w-4 h-4" />
                      Navigate
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#4cbb17] text-black rounded-lg text-sm font-medium hover:bg-[#60e421] transition-colors">
                      <Play className="w-4 h-4" />
                      Start
                    </button>
                  </>
                )}
                {request.status === 'in_progress' && (
                  <>
                    <a
                      href={`tel:${request.property.ownerPhone}`}
                      className="flex items-center justify-center gap-2 px-3 py-2 border border-[#27272a] rounded-lg text-sm hover:bg-[#27272a] transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#4cbb17] text-black rounded-lg text-sm font-medium hover:bg-[#60e421] transition-colors">
                      <Check className="w-4 h-4" />
                      Mark Complete
                    </button>
                  </>
                )}
                {request.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-500 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <Wrench className="w-12 h-12 text-[#27272a] mx-auto mb-3" />
          <p className="text-[#71717a]">No requests found</p>
        </div>
      )}
    </div>
  )
}
