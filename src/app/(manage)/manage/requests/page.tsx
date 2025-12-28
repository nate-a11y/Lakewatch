'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
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

interface ServiceRequest {
  id: string
  title: string
  description: string
  property: {
    id: string
    name: string
  }
  customer: {
    id: string
    name: string
  }
  assignedTo: {
    id: string
    name: string
  } | null
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'scheduled' | 'completed' | 'cancelled'
  category: string
  createdAt: string
  scheduledFor: string | null
}

export default function RequestsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')

  // Mock data
  const requests: ServiceRequest[] = [
    {
      id: '1',
      title: 'Gutter cleaning needed',
      description: 'Gutters are clogged with leaves from the fall. Need cleaning before winter.',
      property: { id: '1', name: 'Lake House' },
      customer: { id: '5', name: 'John Smith' },
      assignedTo: { id: '4', name: 'Sarah Tech' },
      priority: 'medium',
      status: 'scheduled',
      category: 'Maintenance',
      createdAt: 'Dec 18, 2025',
      scheduledFor: 'Jan 5, 2026',
    },
    {
      id: '2',
      title: 'Basement moisture issue',
      description: 'Technician found moisture in basement during inspection. Recommend installing dehumidifier.',
      property: { id: '1', name: 'Lake House' },
      customer: { id: '5', name: 'John Smith' },
      assignedTo: null,
      priority: 'high',
      status: 'open',
      category: 'Repair',
      createdAt: 'Dec 27, 2025',
      scheduledFor: null,
    },
    {
      id: '3',
      title: 'Dock winterization',
      description: 'Need to prepare dock for winter - remove ladder, check cleats, inspect floats.',
      property: { id: '3', name: 'Sunset Cove' },
      customer: { id: '6', name: 'Jane Doe' },
      assignedTo: { id: '3', name: 'Mike Johnson' },
      priority: 'medium',
      status: 'in_progress',
      category: 'Seasonal',
      createdAt: 'Dec 15, 2025',
      scheduledFor: 'Dec 28, 2025',
    },
    {
      id: '4',
      title: 'Replace smoke detector batteries',
      description: 'Low battery warning on main floor smoke detector.',
      property: { id: '4', name: 'Hillside Retreat' },
      customer: { id: '7', name: 'Bob Wilson' },
      assignedTo: { id: '4', name: 'Sarah Tech' },
      priority: 'low',
      status: 'completed',
      category: 'Maintenance',
      createdAt: 'Dec 10, 2025',
      scheduledFor: null,
    },
    {
      id: '5',
      title: 'Burst pipe emergency',
      description: 'Pipe burst in upstairs bathroom. Water shut off. Need immediate repair.',
      property: { id: '5', name: 'Lakewood Estate' },
      customer: { id: '8', name: 'Sarah Johnson' },
      assignedTo: { id: '3', name: 'Mike Johnson' },
      priority: 'urgent',
      status: 'in_progress',
      category: 'Emergency',
      createdAt: 'Dec 28, 2025',
      scheduledFor: 'Dec 28, 2025',
    },
    {
      id: '6',
      title: 'HVAC filter replacement',
      description: 'Regular quarterly HVAC filter change.',
      property: { id: '6', name: 'Marina View' },
      customer: { id: '8', name: 'Sarah Johnson' },
      assignedTo: null,
      priority: 'low',
      status: 'open',
      category: 'Maintenance',
      createdAt: 'Dec 20, 2025',
      scheduledFor: null,
    },
  ]

  const filteredRequests = requests.filter(request => {
    const matchesSearch =
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    open: requests.filter(r => r.status === 'open').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    scheduled: requests.filter(r => r.status === 'scheduled').length,
    urgent: requests.filter(r => r.priority === 'urgent' && r.status !== 'completed').length,
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
            Manage customer service requests and work orders
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.map((request) => (
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

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <ClipboardList className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No service requests found</p>
        </div>
      )}
    </div>
  )
}
