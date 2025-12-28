import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  ClipboardCheck,
  User,
  Building2,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import InspectionFilters from './InspectionFilters'

export default async function InspectionsPage() {
  const supabase = await createClient()

  // Fetch inspections with related data
  const { data: inspections, error } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status, overall_status,
      property:lwp_properties(id, name, street, owner_id, owner:lwp_users!owner_id(first_name, last_name)),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists(name),
      issues:lwp_inspections_issues(count)
    `)
    .order('scheduled_date', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching inspections:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const inspectionsList = (inspections || []).map((i) => {
    const propertyData = i.property as { id: number; name: string; street: string; owner: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null } | { id: number; name: string; street: string; owner: { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null }[] | null
    const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

    const techData = i.technician as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
    const technician = Array.isArray(techData) ? techData[0] : techData

    const checklistData = i.checklist as { name: string } | { name: string }[] | null
    const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData

    const ownerData = property?.owner
    const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

    const issuesData = i.issues as { count: number }[] | null
    const issueCount = issuesData?.[0]?.count || 0

    return {
      id: i.id,
      property: {
        id: property?.id || 0,
        name: property?.name || 'Unknown',
        address: property?.street || '',
      },
      customer: {
        name: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
      },
      technician: {
        id: technician?.id || 0,
        name: technician ? `${technician.first_name} ${technician.last_name}` : 'Unassigned',
      },
      date: formatDate(i.scheduled_date),
      time: formatTime(i.scheduled_time),
      status: i.status as string,
      issues: issueCount,
      checklist: checklist?.name || 'Default',
    }
  })

  const stats = {
    scheduled: inspectionsList.filter(i => i.status === 'scheduled').length,
    completed: inspectionsList.filter(i => i.status === 'completed').length,
    withIssues: inspectionsList.filter(i => i.issues > 0).length,
    missed: inspectionsList.filter(i => i.status === 'missed').length,
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
            Track and manage property inspections ({inspectionsList.length} total)
          </p>
        </div>
        <Link
          href="/manage/schedule/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Schedule Inspection
        </Link>
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

      <InspectionFilters />

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
              {inspectionsList.map((inspection) => (
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

        {inspectionsList.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
            <p className="text-[#71717a]">No inspections found</p>
          </div>
        )}
      </div>
    </div>
  )
}
