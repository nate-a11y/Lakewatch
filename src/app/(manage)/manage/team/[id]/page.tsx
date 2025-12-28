import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Edit,
  Shield,
  Building2,
} from 'lucide-react'
import ActionButton from '@/components/buttons/ActionButton'

export default async function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const member = {
    id,
    firstName: 'Mike',
    lastName: 'Johnson',
    email: 'mike@lakewatchpros.com',
    phone: '(314) 555-0003',
    role: 'technician',
    status: 'active',
    hireDate: 'Jun 1, 2023',
    assignedProperties: [
      { id: '1', name: 'Lake House', address: '123 Lakefront Dr' },
      { id: '2', name: 'Guest Cabin', address: '125 Lakefront Dr' },
      { id: '3', name: 'Sunset Cove', address: '456 Marina Way' },
    ],
    stats: {
      totalInspections: 156,
      thisMonth: 12,
      avgDuration: '42 min',
      issuesFound: 8,
    },
    recentActivity: [
      { id: '1', action: 'Completed inspection', property: 'Lake House', date: 'Dec 27, 2025' },
      { id: '2', action: 'Completed inspection', property: 'Guest Cabin', date: 'Dec 20, 2025' },
      { id: '3', action: 'Submitted service request', property: 'Lake House', date: 'Dec 18, 2025' },
    ],
    upcomingSchedule: [
      { id: '1', property: 'Lake House', date: 'Jan 3, 2026', time: '9:00 AM' },
      { id: '2', property: 'Guest Cabin', date: 'Jan 3, 2026', time: '10:30 AM' },
      { id: '3', property: 'Sunset Cove', date: 'Jan 4, 2026', time: '9:00 AM' },
    ],
    notes: 'Reliable technician. Experienced with boat dock inspections.',
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
            {member.firstName[0]}{member.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {member.firstName} {member.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                member.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {member.status}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded border ${getRoleBadge(member.role)}`}>
                {member.role}
              </span>
              <span className="text-sm">Since {member.hireDate}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <ActionButton
            label="Edit"
            message="Edit team member coming soon"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
          />
          <ActionButton
            label="Permissions"
            message="Manage permissions coming soon"
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
          />
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
                  <p>{member.phone}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          {member.role === 'technician' && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold text-[#4cbb17]">{member.stats.totalInspections}</p>
                  <p className="text-xs text-[#71717a]">Total Inspections</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold">{member.stats.thisMonth}</p>
                  <p className="text-xs text-[#71717a]">This Month</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold">{member.stats.avgDuration}</p>
                  <p className="text-xs text-[#71717a]">Avg Duration</p>
                </div>
                <div className="text-center p-3 bg-black/30 rounded-lg">
                  <p className="text-2xl font-bold">{member.stats.issuesFound}</p>
                  <p className="text-xs text-[#71717a]">Issues Found</p>
                </div>
              </div>
            </section>
          )}

          {/* Assigned Properties */}
          {member.role === 'technician' && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">
                  Assigned Properties ({member.assignedProperties.length})
                </h2>
                <ActionButton label="Manage" message="Manage property assignments coming soon" />
              </div>
              <div className="space-y-2">
                {member.assignedProperties.map((property) => (
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
                      <p className="text-sm text-[#71717a]">{property.address}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {member.recentActivity.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 bg-[#4cbb17] rounded-full mt-2" />
                    {index < member.recentActivity.length - 1 && (
                      <div className="absolute top-4 left-0.5 w-0.5 h-full bg-[#27272a]" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-[#71717a]">{activity.property} • {activity.date}</p>
                  </div>
                </div>
              ))}
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
                {member.upcomingSchedule.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-[#71717a]" />
                    <div>
                      <p className="text-sm font-medium">{item.property}</p>
                      <p className="text-xs text-[#71717a]">{item.date} at {item.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Notes */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <ActionButton label="Edit" message="Edit notes coming soon" />
            </div>
            <p className="text-sm text-[#a1a1aa]">{member.notes}</p>
          </section>

          {/* Quick Actions */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <ActionButton
                label="View all inspections"
                message="View inspections coming soon"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
              />
              <ActionButton
                label="Assign properties"
                message="Property assignment coming soon"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
              />
              <ActionButton
                label="Reset password"
                message="Password reset email sent"
                className="w-full text-left px-4 py-2 text-sm hover:bg-[#27272a] rounded-lg transition-colors"
              />
              <ActionButton
                label="Deactivate account"
                message="Account deactivation coming soon"
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
