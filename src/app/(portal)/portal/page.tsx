import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Building2,
  Calendar,
  FileText,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
} from 'lucide-react'

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user data from our database
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('supabase_id', user?.id)
    .single()

  const firstName = userData?.first_name || user?.user_metadata?.first_name || 'there'
  const userId = userData?.id

  // Fetch real stats
  const [propertiesResult, inspectionsResult, requestsResult, messagesResult] = await Promise.all([
    supabase.from('lwp_properties').select('id', { count: 'exact' }).eq('owner_id', userId || 0),
    supabase.from('lwp_inspections')
      .select('id, scheduled_date, property:lwp_properties!property_id(name, owner_id)')
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .eq('status', 'scheduled')
      .order('scheduled_date')
      .limit(10),
    supabase.from('lwp_service_requests')
      .select('id')
      .eq('requested_by_id', userId || 0)
      .in('status', ['pending', 'approved', 'scheduled']),
    supabase.from('lwp_conversations')
      .select('id')
      .eq('customer_id', userId || 0)
      .eq('unread_by_customer', true),
  ])

  // Filter inspections to customer's properties
  const upcomingInspections = inspectionsResult.data?.filter((i) => {
    const propData = i.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    return property?.owner_id === userId
  }) || []

  // Get recent reports (completed inspections)
  const { data: recentReports } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, overall_status,
      property:lwp_properties!property_id(id, name, owner_id)
    `)
    .eq('status', 'completed')
    .order('check_out_time', { ascending: false })
    .limit(10)

  const customerReports = recentReports?.filter((r) => {
    const propData = r.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    return property?.owner_id === userId
  }).slice(0, 3) || []

  const stats = {
    properties: propertiesResult.count || 0,
    upcomingInspections: upcomingInspections.length,
    recentReports: customerReports.length,
    pendingRequests: requestsResult.data?.length || 0,
    unreadMessages: messagesResult.data?.length || 0,
  }

  const nextInspection = upcomingInspections[0] ? (() => {
    const propData = upcomingInspections[0].property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    return {
      property: property?.name || 'Property',
      date: new Date(upcomingInspections[0].scheduled_date).toLocaleDateString('en-US', {
        month: 'long', day: 'numeric', year: 'numeric'
      }),
      timeWindow: '9:00 AM - 12:00 PM',
    }
  })() : null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, {firstName}
        </h1>
        <p className="text-[#a1a1aa]">
          Here&apos;s what&apos;s happening with your properties
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Building2}
          label="Properties"
          value={stats.properties}
          href="/portal/properties"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Inspections"
          value={stats.upcomingInspections}
          href="/portal/calendar"
        />
        <StatCard
          icon={FileText}
          label="Recent Reports"
          value={stats.recentReports}
          href="/portal/reports"
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={stats.pendingRequests}
          href="/portal/requests"
          highlight={stats.pendingRequests > 0}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Next inspection card */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Next Scheduled Visit</h2>
            <Link
              href="/portal/calendar"
              className="text-[#4cbb17] text-sm hover:underline flex items-center gap-1"
            >
              View calendar
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {nextInspection ? (
            <div className="bg-[#4cbb17]/10 border border-[#4cbb17]/20 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#4cbb17]/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-[#4cbb17]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lg">{nextInspection.property}</p>
                  <p className="text-[#a1a1aa]">{nextInspection.date}</p>
                  <p className="text-sm text-[#71717a]">{nextInspection.timeWindow}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming inspections scheduled</p>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton
              href="/portal/requests/new"
              icon={Clock}
              label="Request Service"
              description="Pre-arrival, concierge, or other services"
            />
            <QuickActionButton
              href="/portal/calendar"
              icon={Calendar}
              label="Update Occupancy"
              description="Let us know when you'll be at the lake"
            />
            <QuickActionButton
              href="/portal/messages"
              icon={MessageSquare}
              label="Send Message"
              description="Contact the Lake Watch Pros team"
              badge={stats.unreadMessages > 0 ? stats.unreadMessages : undefined}
            />
          </div>
        </div>
      </div>

      {/* Recent reports */}
      <div className="mt-6 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Inspection Reports</h2>
          <Link
            href="/portal/reports"
            className="text-[#4cbb17] text-sm hover:underline flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {customerReports.length > 0 ? (
          <div className="space-y-3">
            {customerReports.map((report) => {
              const propData = report.property as unknown
              const property = Array.isArray(propData) ? propData[0] : propData
              return (
                <Link
                  key={report.id}
                  href={`/portal/reports/${report.id}`}
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      report.overall_status === 'good'
                        ? 'bg-green-500/10'
                        : 'bg-yellow-500/10'
                    }`}>
                      {report.overall_status === 'good' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{property?.name || 'Property'}</p>
                      <p className="text-sm text-[#71717a]">
                        {new Date(report.scheduled_date).toLocaleDateString('en-US', {
                          month: 'long', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm px-3 py-1 rounded-full ${
                    report.overall_status === 'good'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {report.overall_status === 'good' ? 'All Clear' : 'Issues Found'}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-[#71717a]">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No inspection reports yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  highlight = false,
}: {
  icon: React.ElementType
  label: string
  value: number
  href: string
  highlight?: boolean
}) {
  return (
    <Link
      href={href}
      className={`bg-[#0f0f0f] border rounded-xl p-4 hover:border-[#4cbb17]/50 transition-colors ${
        highlight ? 'border-[#4cbb17]' : 'border-[#27272a]'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${highlight ? 'text-[#4cbb17]' : 'text-[#71717a]'}`} />
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-[#71717a]">{label}</p>
    </Link>
  )
}

function QuickActionButton({
  href,
  icon: Icon,
  label,
  description,
  badge,
}: {
  href: string
  icon: React.ElementType
  label: string
  description: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors group"
    >
      <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center group-hover:bg-[#4cbb17]/20 transition-colors relative">
        <Icon className="w-5 h-5 text-[#4cbb17]" />
        {badge && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#4cbb17] text-black text-xs font-bold rounded-full flex items-center justify-center">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-[#71717a]">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] transition-colors" />
    </Link>
  )
}
