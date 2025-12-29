'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, User, Clock, GripVertical } from 'lucide-react'
import { toast } from 'sonner'

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

interface KanbanViewProps {
  requests: Request[]
}

const COLUMNS = [
  { id: 'pending', label: 'New', color: 'border-[#71717a]' },
  { id: 'scheduled', label: 'Scheduled', color: 'border-blue-500' },
  { id: 'in_progress', label: 'In Progress', color: 'border-yellow-500' },
  { id: 'completed', label: 'Completed', color: 'border-green-500' },
]

export default function KanbanView({ requests }: KanbanViewProps) {
  const [localRequests, setLocalRequests] = useState(requests)
  const [draggedItem, setDraggedItem] = useState<Request | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const getRequestsByStatus = (status: string) => {
    return localRequests.filter(r => r.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
      case 'normal':
        return 'bg-yellow-500'
      default:
        return 'bg-[#71717a]'
    }
  }

  const getTimeElapsed = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60))

    if (diffHours < 24) return `${diffHours}h`
    if (diffHours < 48) return '1d'
    return `${Math.floor(diffHours / 24)}d`
  }

  const getSLAColor = (createdAt: string, status: string) => {
    if (status === 'completed') return 'text-green-500'
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)

    if (diffHours < 24) return 'text-green-500'
    if (diffHours < 48) return 'text-yellow-500'
    return 'text-red-500'
  }

  const handleDragStart = (e: React.DragEvent, request: Request) => {
    setDraggedItem(request)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', request.id.toString())
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (!draggedItem || draggedItem.status === newStatus) {
      setDraggedItem(null)
      return
    }

    // Optimistic update
    setLocalRequests(prev =>
      prev.map(r =>
        r.id === draggedItem.id ? { ...r, status: newStatus } : r
      )
    )

    try {
      const response = await fetch(`/api/service-requests/${draggedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error('Failed to update')
      toast.success(`Moved to ${COLUMNS.find(c => c.id === newStatus)?.label}`)
    } catch {
      // Revert on error
      setLocalRequests(prev =>
        prev.map(r =>
          r.id === draggedItem.id ? { ...r, status: draggedItem.status } : r
        )
      )
      toast.error('Failed to update status')
    }

    setDraggedItem(null)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((column) => {
        const columnRequests = getRequestsByStatus(column.id)
        const isOver = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            className={`flex flex-col min-h-[400px] bg-[#0a0a0a] rounded-xl border-t-2 ${column.color} ${
              isOver ? 'ring-2 ring-[#4cbb17] ring-opacity-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-3 border-b border-[#27272a]">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">{column.label}</h3>
                <span className="text-xs px-2 py-0.5 bg-[#27272a] rounded-full text-[#71717a]">
                  {columnRequests.length}
                </span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto">
              {columnRequests.map((request) => (
                <div
                  key={request.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, request)}
                  className={`group bg-[#0f0f0f] border border-[#27272a] rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-[#4cbb17]/30 transition-all ${
                    draggedItem?.id === request.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Drag Handle + Priority */}
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-[#3f3f46] opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(request.priority)}`} />
                    <span className="text-xs text-[#71717a] capitalize">{request.priority}</span>
                    <span className={`ml-auto text-xs font-medium flex items-center gap-1 ${getSLAColor(request.createdAt, request.status)}`}>
                      <Clock className="w-3 h-3" />
                      {getTimeElapsed(request.createdAt)}
                    </span>
                  </div>

                  {/* Title */}
                  <Link
                    href={`/manage/requests/${request.id}`}
                    className="block font-medium text-sm mb-2 hover:text-[#4cbb17] transition-colors line-clamp-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {request.title}
                  </Link>

                  {/* Meta */}
                  <div className="flex flex-wrap gap-2 text-xs text-[#71717a]">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {request.property.name}
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#27272a]">
                    <span className="flex items-center gap-1 text-xs text-[#71717a]">
                      <User className="w-3 h-3" />
                      {request.customer.name}
                    </span>
                    {request.assignedTo ? (
                      <span className="text-xs text-[#71717a]">{request.assignedTo.name.split(' ')[0]}</span>
                    ) : (
                      <span className="text-xs text-yellow-500">Unassigned</span>
                    )}
                  </div>
                </div>
              ))}

              {columnRequests.length === 0 && (
                <div className="text-center py-8 text-[#71717a] text-sm">
                  No requests
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
