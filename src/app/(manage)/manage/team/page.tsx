import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  UserCog,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from 'lucide-react'
import TeamFilters from './TeamFilters'

interface TeamMember {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role: 'owner' | 'admin' | 'technician'
  status: string
  created_at: string
  assigned_properties: number
  completed_inspections: number
}

export default async function TeamPage() {
  const supabase = await createClient()

  // Fetch team members (non-customers)
  const { data: teamMembers, error } = await supabase
    .from('lwp_users')
    .select('*')
    .in('role', ['owner', 'admin', 'technician'])
    .order('role')
    .order('last_name')

  if (error) {
    console.error('Error fetching team:', error)
  }

  // Get technician IDs for stats query
  const technicianIds = (teamMembers || [])
    .filter(m => m.role === 'technician')
    .map(m => m.id)

  // Get inspection counts per technician
  let inspectionCounts: { technician_id: number; count: number }[] = []
  if (technicianIds.length > 0) {
    const { data: inspections } = await supabase
      .from('lwp_inspections')
      .select('technician_id')
      .in('technician_id', technicianIds)
      .eq('status', 'completed')

    // Count inspections per technician
    const countMap = new Map<number, number>()
    inspections?.forEach(insp => {
      countMap.set(insp.technician_id, (countMap.get(insp.technician_id) || 0) + 1)
    })
    inspectionCounts = Array.from(countMap, ([technician_id, count]) => ({ technician_id, count }))
  }

  // Get service request counts per technician
  let requestCounts: { assigned_to_id: number; count: number }[] = []
  if (technicianIds.length > 0) {
    const { data: requests } = await supabase
      .from('lwp_service_requests')
      .select('assigned_to_id')
      .in('assigned_to_id', technicianIds)
      .eq('status', 'completed')

    const countMap = new Map<number, number>()
    requests?.forEach(req => {
      if (req.assigned_to_id) {
        countMap.set(req.assigned_to_id, (countMap.get(req.assigned_to_id) || 0) + 1)
      }
    })
    requestCounts = Array.from(countMap, ([assigned_to_id, count]) => ({ assigned_to_id, count }))
  }

  // Get active inspection/request assignments
  let activeAssignments: { technician_id: number; count: number }[] = []
  if (technicianIds.length > 0) {
    const { data: activeInspections } = await supabase
      .from('lwp_inspections')
      .select('technician_id, property_id')
      .in('technician_id', technicianIds)
      .in('status', ['scheduled', 'in_progress'])

    const assignmentMap = new Map<number, Set<number>>()
    activeInspections?.forEach(insp => {
      if (!assignmentMap.has(insp.technician_id)) {
        assignmentMap.set(insp.technician_id, new Set())
      }
      assignmentMap.get(insp.technician_id)?.add(insp.property_id)
    })
    activeAssignments = Array.from(assignmentMap, ([technician_id, properties]) => ({
      technician_id,
      count: properties.size,
    }))
  }

  const membersWithStats: TeamMember[] = (teamMembers || []).map(m => {
    const inspections = inspectionCounts.find(i => i.technician_id === m.id)?.count || 0
    const requests = requestCounts.find(r => r.assigned_to_id === m.id)?.count || 0
    const assignments = activeAssignments.find(a => a.technician_id === m.id)?.count || 0

    return {
      id: m.id,
      first_name: m.first_name || '',
      last_name: m.last_name || '',
      email: m.email,
      phone: m.phone,
      role: m.role as 'owner' | 'admin' | 'technician',
      status: m.status || 'active',
      created_at: m.created_at,
      assigned_properties: assignments,
      completed_inspections: inspections + requests,
    }
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-[#27272a] text-[#a1a1aa] border-[#27272a]'
    }
  }

  const stats = {
    total: membersWithStats.length,
    technicians: membersWithStats.filter(m => m.role === 'technician').length,
    admins: membersWithStats.filter(m => m.role === 'admin' || m.role === 'owner').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Team</h1>
          <p className="text-[#a1a1aa]">
            Manage staff accounts and permissions ({membersWithStats.length} members)
          </p>
        </div>
        <Link
          href="/manage/team/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Total Members</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Technicians</p>
          <p className="text-2xl font-bold">{stats.technicians}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Admins</p>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </div>
      </div>

      <TeamFilters />

      {/* Team Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {membersWithStats.map((member) => (
          <Link
            key={member.id}
            href={`/manage/team/${member.id}`}
            className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 hover:border-[#4cbb17]/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' :
                  member.role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-[#4cbb17]/10 text-[#4cbb17]'
                }`}>
                  {(member.first_name?.[0] || '?')}{(member.last_name?.[0] || '')}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-[#4cbb17] transition-colors">
                    {member.first_name} {member.last_name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded border ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                member.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {member.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[#a1a1aa]">
                <Mail className="w-4 h-4 text-[#71717a]" />
                <span className="truncate">{member.email}</span>
              </div>
              {member.phone && (
                <div className="flex items-center gap-2 text-[#a1a1aa]">
                  <Phone className="w-4 h-4 text-[#71717a]" />
                  <span>{member.phone}</span>
                </div>
              )}
            </div>

            {member.role === 'technician' && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#27272a] text-sm">
                <div className="flex items-center gap-2 text-[#71717a]">
                  <MapPin className="w-4 h-4" />
                  <span>{member.assigned_properties} properties</span>
                </div>
                <div className="flex items-center gap-2 text-[#71717a]">
                  <Calendar className="w-4 h-4" />
                  <span>{member.completed_inspections} inspections</span>
                </div>
              </div>
            )}
          </Link>
        ))}
      </div>

      {membersWithStats.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <UserCog className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No team members found</p>
        </div>
      )}
    </div>
  )
}
