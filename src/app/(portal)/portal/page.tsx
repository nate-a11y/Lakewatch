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
  CreditCard,
  Sun,
  Thermometer,
  Plus,
  Bell,
  ChevronRight,
} from 'lucide-react'

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

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
  const [propertiesResult, inspectionsResult, requestsResult, messagesResult, invoicesResult] = await Promise.all([
    supabase.from('lwp_properties').select('id, name', { count: 'exact' }).eq('owner_id', userId || 0),
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
    supabase.from('lwp_invoices')
      .select('id, amount_due')
      .eq('customer_id', userId || 0)
      .eq('status', 'pending'),
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
      id, scheduled_date, overall_status, check_out_time,
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

  // Calculate outstanding balance
  const outstandingBalance = invoicesResult.data?.reduce((sum, inv) => sum + (inv.amount_due || 0), 0) || 0
  const unpaidInvoices = invoicesResult.data?.length || 0

  // Get recent activity
  const { data: recentActivity } = await supabase
    .from('lwp_inspections')
    .select(`
      id, check_out_time, overall_status,
      property:lwp_properties!property_id(name, owner_id)
    `)
    .eq('status', 'completed')
    .not('check_out_time', 'is', null)
    .order('check_out_time', { ascending: false })
    .limit(20)

  const customerActivity = recentActivity?.filter((a) => {
    const propData = a.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    return property?.owner_id === userId
  }).slice(0, 5) || []

  const properties = propertiesResult.data || []
  const primaryProperty = properties[0]

  const stats = {
    properties: propertiesResult.count || 0,
    upcomingInspections: upcomingInspections.length,
    recentReports: customerReports.length,
    pendingRequests: requestsResult.data?.length || 0,
    unreadMessages: messagesResult.data?.length || 0,
  }

  // Calculate dates for comparison (server-side safe)
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const nextInspection = upcomingInspections[0] ? (() => {
    const propData = upcomingInspections[0].property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    const date = new Date(upcomingInspections[0].scheduled_date)
    const isToday = date.toDateString() === now.toDateString()
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    return {
      property: property?.name || 'Property',
      date: isToday ? 'Today' : isTomorrow ? 'Tomorrow' : date.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric'
      }),
      dateRaw: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      timeWindow: '9:00 AM - 12:00 PM',
      isToday,
      isTomorrow,
    }
  })() : null

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Outstanding Balance Alert */}
      {unpaidInvoices > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="font-medium text-yellow-500">Outstanding Balance</p>
                <p className="text-sm text-[#a1a1aa]">
                  {unpaidInvoices} invoice{unpaidInvoices > 1 ? 's' : ''} totaling ${outstandingBalance.toFixed(2)}
                </p>
              </div>
            </div>
            <Link
              href="/portal/billing"
              className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Pay Now
            </Link>
          </div>
        </div>
      )}

      {/* Header with greeting and weather */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">
            {getTimeOfDayGreeting()}, {firstName}
          </h1>
          <p className="text-[#a1a1aa]">
            {nextInspection ? (
              <>Your next scheduled visit is <span className="text-white font-medium">{nextInspection.date.toLowerCase()}</span></>
            ) : (
              <>Here&apos;s what&apos;s happening with your properties</>
            )}
          </p>
        </div>

        {/* Weather Widget */}
        {primaryProperty && (
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#71717a]" />
                <span className="font-semibold">68°F</span>
                <span className="text-[#71717a]">Partly Cloudy</span>
              </div>
              <p className="text-sm text-[#71717a]">{primaryProperty.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Property Health Cards */}
      {properties.length > 0 && (
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-3" style={{ minWidth: 'max-content' }}>
            {properties.slice(0, 3).map((property) => {
              const propertyReport = customerReports.find((r) => {
                const propData = r.property as unknown
                const prop = Array.isArray(propData) ? propData[0] : propData
                return prop?.id === property.id
              })
              const daysSinceVisit = propertyReport?.scheduled_date
                ? Math.floor((now.getTime() - new Date(propertyReport.scheduled_date).getTime()) / (1000 * 60 * 60 * 24))
                : null

              return (
                <div
                  key={property.id}
                  className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 min-w-[280px] lg:min-w-0 hover:border-[#4cbb17]/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-[#4cbb17]" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{property.name}</h3>
                        <p className="text-sm text-[#71717a]">
                          {daysSinceVisit !== null ? `${daysSinceVisit} days since last visit` : 'No visits yet'}
                        </p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      propertyReport?.overall_status === 'good' ? 'bg-green-500' :
                      propertyReport?.overall_status === 'issues' ? 'bg-yellow-500' :
                      'bg-[#71717a]'
                    }`} />
                  </div>
                  <div className="flex gap-2">
                    {propertyReport ? (
                      <Link
                        href={`/portal/reports/${propertyReport.id}`}
                        className="flex-1 text-center py-2 text-sm border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                      >
                        View Report
                      </Link>
                    ) : null}
                    <Link
                      href="/portal/requests/new"
                      className="flex-1 text-center py-2 text-sm bg-[#4cbb17] text-black font-medium rounded-lg hover:bg-[#60e421] transition-colors"
                    >
                      Request Service
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          label="Properties"
          value={stats.properties}
          href="/portal/properties"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Visits"
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
          icon={MessageSquare}
          label="Unread Messages"
          value={stats.unreadMessages}
          href="/portal/messages"
          highlight={stats.unreadMessages > 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Next inspection card */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
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
            <div className={`rounded-lg p-4 ${
              nextInspection.isToday ? 'bg-[#4cbb17]/20 border border-[#4cbb17]/30' :
              nextInspection.isTomorrow ? 'bg-blue-500/10 border border-blue-500/20' :
              'bg-[#4cbb17]/10 border border-[#4cbb17]/20'
            }`}>
              <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  nextInspection.isToday ? 'bg-[#4cbb17]/30' : 'bg-[#4cbb17]/20'
                }`}>
                  <Calendar className="w-7 h-7 text-[#4cbb17]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{nextInspection.property}</p>
                    {nextInspection.isToday && (
                      <span className="px-2 py-0.5 bg-[#4cbb17] text-black text-xs font-bold rounded">TODAY</span>
                    )}
                    {nextInspection.isTomorrow && (
                      <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">TOMORROW</span>
                    )}
                  </div>
                  <p className="text-[#a1a1aa]">{nextInspection.dateRaw}</p>
                  <p className="text-sm text-[#71717a]">Estimated: {nextInspection.timeWindow}</p>
                </div>
                <Link
                  href="/portal/calendar"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  View Details
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No upcoming inspections scheduled</p>
              <Link
                href="/portal/requests/new"
                className="inline-flex items-center gap-2 mt-4 text-[#4cbb17] hover:underline"
              >
                <Plus className="w-4 h-4" />
                Request a visit
              </Link>
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
              href="/portal/messages/new"
              icon={MessageSquare}
              label="Send Message"
              description="Contact the Lake Watch Pros team"
              badge={stats.unreadMessages > 0 ? stats.unreadMessages : undefined}
            />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Bell className="w-5 h-5 text-[#71717a]" />
          </div>

          {customerActivity.length > 0 ? (
            <div className="space-y-4">
              {customerActivity.map((activity) => {
                const propData = activity.property as unknown
                const property = Array.isArray(propData) ? propData[0] : propData
                const timeAgo = getRelativeTime(activity.check_out_time)
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.overall_status === 'good' ? 'bg-green-500/10' : 'bg-yellow-500/10'
                    }`}>
                      {activity.overall_status === 'good' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">Inspection completed</span> at {property?.name || 'property'}
                      </p>
                      <p className="text-xs text-[#71717a]">{timeAgo}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          )}
        </div>

        {/* Recent reports */}
        <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
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
                    className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors group"
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
                    <div className="flex items-center gap-3">
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        report.overall_status === 'good'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {report.overall_status === 'good' ? 'All Clear' : 'Issues Found'}
                      </span>
                      <ChevronRight className="w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] transition-colors" />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No inspection reports yet</p>
              <p className="text-sm mt-1">Reports will appear here after your first inspection</p>
            </div>
          )}
        </div>
      </div>

      {/* Announcements */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Winter Prep Reminder</h3>
            <p className="text-sm text-[#a1a1aa]">
              Cold weather is approaching! Make sure to schedule your winterization service before December 1st to ensure your property is protected.
            </p>
            <Link
              href="/portal/requests/new"
              className="inline-flex items-center gap-1 mt-3 text-sm text-blue-400 hover:underline"
            >
              Schedule winterization
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function getRelativeTime(dateString: string | null): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
      className={`bg-[#0f0f0f] border rounded-xl p-4 hover:border-[#4cbb17]/50 transition-all hover:scale-[1.02] active:scale-[0.98] ${
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
      className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-all hover:scale-[1.01] active:scale-[0.99] group"
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
      <ArrowRight className="w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] group-hover:translate-x-1 transition-all" />
    </Link>
  )
}
