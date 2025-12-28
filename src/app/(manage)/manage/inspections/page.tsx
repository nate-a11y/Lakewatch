'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Filter,
  ClipboardCheck,
  Calendar,
  User,
  Building2,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'

interface Inspection {
  id: string
  property: {
    id: string
    name: string
    address: string
  }
  customer: {
    id: string
    name: string
  }
  technician: {
    id: string
    name: string
  }
  date: string
  time: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed'
  issues: number
  checklist: string
}

export default function InspectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Mock data
  const inspections: Inspection[] = [
    {
      id: '1',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      customer: { id: '5', name: 'John Smith' },
      technician: { id: '3', name: 'Mike Johnson' },
      date: 'Jan 3, 2026',
      time: '9:00 AM',
      status: 'scheduled',
      issues: 0,
      checklist: 'Premium Weekly',
    },
    {
      id: '2',
      property: { id: '3', name: 'Sunset Cove', address: '456 Marina Way' },
      customer: { id: '6', name: 'Jane Doe' },
      technician: { id: '4', name: 'Sarah Tech' },
      date: 'Jan 4, 2026',
      time: '10:00 AM',
      status: 'scheduled',
      issues: 0,
      checklist: 'Premium Weekly',
    },
    {
      id: '3',
      property: { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      customer: { id: '5', name: 'John Smith' },
      technician: { id: '3', name: 'Mike Johnson' },
      date: 'Dec 27, 2025',
      time: '9:00 AM',
      status: 'completed',
      issues: 0,
      checklist: 'Premium Weekly',
    },
    {
      id: '4',
      property: { id: '2', name: 'Guest Cabin', address: '125 Lakefront Dr' },
      customer: { id: '5', name: 'John Smith' },
      technician: { id: '3', name: 'Mike Johnson' },
      date: 'Dec 20, 2025',
      time: '10:30 AM',
      status: 'completed',
      issues: 1,
      checklist: 'Standard Bi-Weekly',
    },
    {
      id: '5',
      property: { id: '4', name: 'Hillside Retreat', address: '789 Hill Rd' },
      customer: { id: '7', name: 'Bob Wilson' },
      technician: { id: '4', name: 'Sarah Tech' },
      date: 'Dec 10, 2025',
      time: '2:00 PM',
      status: 'completed',
      issues: 2,
      checklist: 'Basic Monthly',
    },
    {
      id: '6',
      property: { id: '8', name: 'The Brown House', address: '400 Oak St' },
      customer: { id: '9', name: 'Tom Brown' },
      technician: { id: '3', name: 'Mike Johnson' },
      date: 'Dec 5, 2025',
      time: '11:00 AM',
      status: 'missed',
      issues: 0,
      checklist: 'Standard Bi-Weekly',
    },
  ]

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch =
      inspection.property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inspection.technician.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inspection.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    scheduled: inspections.filter(i => i.status === 'scheduled').length,
    completed: inspections.filter(i => i.status === 'completed').length,
    withIssues: inspections.filter(i => i.issues > 0).length,
    missed: inspections.filter(i => i.status === 'missed').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'scheduled':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'missed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Inspections</h1>
          <p className="text-[#a1a1aa]">
            Track and manage property inspections
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Plus className="w-5 h-5" />
          Schedule Inspection
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-[#71717a]">Scheduled</p>
          </div>
          <p className="text-2xl font-bold">{stats.scheduled}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-[#71717a]">Completed</p>
          </div>
          <p className="text-2xl font-bold">{stats.completed}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-[#71717a]">With Issues</p>
          </div>
          <p className="text-2xl font-bold">{stats.withIssues}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-[#71717a]">Missed</p>
          </div>
          <p className="text-2xl font-bold">{stats.missed}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search inspections..."
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Property</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden md:table-cell">Technician</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Date/Time</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden lg:table-cell">Checklist</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#71717a]" />
                      </div>
                      <div>
                        <p className="font-medium">{inspection.property.name}</p>
                        <p className="text-sm text-[#71717a]">{inspection.customer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-[#71717a]" />
                      <span className="text-sm">{inspection.technician.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p>{inspection.date}</p>
                      <p className="text-[#71717a]">{inspection.time}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm text-[#a1a1aa]">{inspection.checklist}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(inspection.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                        inspection.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                        inspection.status === 'in_progress' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {inspection.status.replace('_', ' ')}
                      </span>
                      {inspection.issues > 0 && (
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500">
                          {inspection.issues} issue{inspection.issues > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/manage/inspections/${inspection.id}`}
                      className="p-2 rounded-lg hover:bg-[#27272a] transition-colors inline-flex"
                    >
                      <ChevronRight className="w-5 h-5 text-[#71717a]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInspections.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
            <p className="text-[#71717a]">No inspections found</p>
          </div>
        )}
      </div>
    </div>
  )
}
