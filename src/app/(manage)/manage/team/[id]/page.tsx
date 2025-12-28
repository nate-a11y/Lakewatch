import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Building2,
} from 'lucide-react'
import EditableNotes from '@/components/EditableNotes'
import TeamMemberQuickActions from './TeamMemberQuickActions'

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch team member data
  const { data: member, error } = await supabase
    .from('lwp_users')
    .select('*')
    .eq('id', id)
    .in('role', ['owner', 'admin', 'technician'])
    .single()

  if (error || !member) {
    notFound()
  }

  // Fetch inspections done by this technician
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status,
      property:lwp_properties(id, name, street)
    `)
    .eq('technician_id', id)
    .order('scheduled_date', { ascending: false })
    .limit(10)

  // Separate into completed and upcoming
  const completedInspections = (inspections || []).filter(i => i.status === 'completed')
  const upcomingInspections = (inspections || []).filter(i => i.status === 'scheduled')

  // Get properties this technician has inspected (as assigned properties)
  const uniquePropertyIds = [...new Set((inspections || []).map(i => {
    const prop = i.property as { id: number } | { id: number }[] | null
    return Array.isArray(prop) ? prop[0]?.id : prop?.id
  }).filter(Boolean))]

  const { data: assignedProperties } = await supabase
    .from('lwp_properties')
    .select('id, name, street, city')
    .in('id', uniquePropertyIds.length > 0 ? uniquePropertyIds : [0])
    .limit(10)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'admin':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      default:
        return 'bg-[#4cbb17]/10 text-[#4cbb17] border-[#4cbb17]/20'
    }
  }

  const stats = {
    totalInspections: completedInspections.length,
    thisMonth: completedInspections.filter(i => {
      const date = new Date(i.scheduled_date)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length,
    assignedProperties: uniquePropertyIds.length,
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/manage/team"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to team
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold ${
            member.role === 'owner' ? 'bg-purple-500/10 text-purple-400' :
            member.role === 'admin' ? 'bg-blue-500/10 text-blue-400' :
            'bg-[#4cbb17]/10 text-[#4cbb17]'
          }`}>
            {(member.first_name?.[0] || '?')}{(member.last_name?.[0] || '')}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {member.first_name} {member.last_name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                member.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {member.status || 'active'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border ${getRoleBadge(member.role)}`}>
                {member.role}
              </span>
              <span className="text-sm">Since {formatDate(member.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/manage/team/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Info */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Email</p>
                  <p>{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Phone</p>
                  <p>{member.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          {member.role === 'technician' && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold text-[#4cbb17]">{stats.totalInspections}</p>
                  <p className="text-xs text-[#71717a]">Total Inspections</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold">{stats.thisMonth}</p>
                  <p className="text-xs text-[#71717a]">This Month</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold">{stats.assignedProperties}</p>
                  <p className="text-xs text-[#71717a]">Properties</p>
                </div>
              </div>
            </section>
          )}

          {/* Assigned Properties */}
          {member.role === 'technician' && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Properties ({assignedProperties?.length || 0})
                </h2>
                <Link
                  href="/manage/properties"
                  className="text-sm text-[#4cbb17] hover:underline"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-2">
                {assignedProperties && assignedProperties.length > 0 ? assignedProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/manage/properties/${property.id}`}
                    className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#71717a]" />
                    </div>
                    <div>
                      <p className="font-medium">{property.name}</p>
                      <p className="text-sm text-[#71717a]">{property.street}, {property.city}</p>
                    </div>
                  </Link>
                )) : (
                  <p className="text-[#71717a] text-sm py-4 text-center">No properties assigned</p>
                )}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {completedInspections.length > 0 ? completedInspections.slice(0, 5).map((inspection, index) => {
                const prop = inspection.property as { name: string; id: number } | { name: string; id: number }[] | null
                const propertyName = Array.isArray(prop) ? prop[0]?.name : prop?.name
                return (
                  <div key={inspection.id} className="flex gap-3">
                    <div className="relative">
                      <div className="w-2 h-2 bg-[#4cbb17] rounded-full mt-2" />
                      {index < Math.min(completedInspections.length, 5) - 1 && (
                        <div className="absolute top-4 left-0.5 w-0.5 h-full bg-[#27272a]" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="text-sm font-medium">Completed inspection</p>
                      <p className="text-xs text-[#71717a]">{propertyName} • {formatDate(inspection.scheduled_date)}</p>
                    </div>
                  </div>
                )
              }) : (
                <p className="text-[#71717a] text-sm">No recent activity</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Schedule */}
          {member.role === 'technician' && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Upcoming Schedule</h2>
                <Link href={`/manage/schedule?technician=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingInspections.length > 0 ? upcomingInspections.slice(0, 3).map((item) => {
                  const prop = item.property as { name: string } | { name: string }[] | null
                  const propertyName = Array.isArray(prop) ? prop[0]?.name : prop?.name
                  return (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                      <Calendar className="w-5 h-5 text-[#71717a]" />
                      <div>
                        <p className="text-sm font-medium">{propertyName}</p>
                        <p className="text-xs text-[#71717a]">{formatDate(item.scheduled_date)}</p>
                      </div>
                    </div>
                  )
                }) : (
                  <p className="text-[#71717a] text-sm py-2">No upcoming inspections</p>
                )}
              </div>
            </section>
          )}

          {/* Notes */}
          <EditableNotes
            initialNotes=""
            title="Notes"
            placeholder="Add team member notes..."
          />

          {/* Quick Actions */}
          <TeamMemberQuickActions memberId={id} memberRole={member.role} />
        </div>
      </div>
    </div>
  )
}
