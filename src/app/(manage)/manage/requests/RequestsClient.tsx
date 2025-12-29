'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Building2,
  User,
  ChevronRight,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  List,
  LayoutGrid,
} from 'lucide-react'
import KanbanView from './KanbanView'

interface Request {
  id: number
  title: string
  description: string
  property: { id: number; name: string }
  customer: { id: number; name: string }
  assignedTo: { id: number; name: string } | null
  priority: string
  status: string
  category: string
  createdAt: string
  scheduledFor: string | null
  hoursSinceCreated: number
}

interface RequestsClientProps {
  requests: Request[]
}

export default function RequestsClient({ requests }: RequestsClientProps) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

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

  const getSLAIndicator = (hours: number, status: string) => {
    // Don't show SLA for completed/cancelled requests
    if (status === 'completed' || status === 'cancelled') return null

    // SLA thresholds: <24h = green, 24-48h = yellow, >48h = red
    if (hours < 24) {
      return (
        <span className="text-xs text-green-500" title="Within SLA">
          {hours}h
        </span>
      )
    } else if (hours < 48) {
      return (
        <span className="text-xs text-yellow-500 font-medium" title="Approaching SLA limit">
          {Math.round(hours / 24)}d
        </span>
      )
    } else {
      return (
        <span className="text-xs text-red-500 font-medium animate-pulse" title="SLA exceeded">
          {Math.round(hours / 24)}d ⚠
        </span>
      )
    }
  }

  return (
    <div>
      {/* View Toggle */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-[#27272a] p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors min-h-[36px] ${
              viewMode === 'list'
                ? 'bg-[#27272a] text-white'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors min-h-[36px] ${
              viewMode === 'kanban'
                ? 'bg-[#27272a] text-white'
                : 'text-[#71717a] hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanView requests={requests} />
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
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
                    {getSLAIndicator(request.hoursSinceCreated, request.status)}
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

          {requests.length === 0 && (
            <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
              <AlertTriangle className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
              <p className="text-[#71717a]">No service requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
