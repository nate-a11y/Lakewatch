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

  const firstName = user?.user_metadata?.first_name || 'there'

  // Mock data - replace with actual API calls
  const stats = {
    properties: 2,
    upcomingInspections: 3,
    recentReports: 5,
    pendingRequests: 1,
  }

  const nextInspection = {
    property: 'Lake House',
    date: 'January 3, 2026',
    timeWindow: '9:00 AM - 12:00 PM',
  }

  const recentReports = [
    {
      id: '1',
      property: 'Lake House',
      date: 'December 20, 2025',
      status: 'all_clear',
    },
    {
      id: '2',
      property: 'Lake House',
      date: 'December 6, 2025',
      status: 'all_clear',
    },
    {
      id: '3',
      property: 'Guest Cabin',
      date: 'December 15, 2025',
      status: 'issues_found',
    },
  ]

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

        <div className="space-y-3">
          {recentReports.map((report) => (
            <Link
              key={report.id}
              href={`/portal/reports/${report.id}`}
              className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  report.status === 'all_clear'
                    ? 'bg-green-500/10'
                    : 'bg-yellow-500/10'
                }`}>
                  {report.status === 'all_clear' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{report.property}</p>
                  <p className="text-sm text-[#71717a]">{report.date}</p>
                </div>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${
                report.status === 'all_clear'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {report.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
              </span>
            </Link>
          ))}
        </div>
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
}: {
  href: string
  icon: React.ElementType
  label: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 p-4 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors group"
    >
      <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center group-hover:bg-[#4cbb17]/20 transition-colors">
        <Icon className="w-5 h-5 text-[#4cbb17]" />
      </div>
      <div className="flex-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-[#71717a]">{description}</p>
      </div>
      <ArrowRight className="w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] transition-colors" />
    </Link>
  )
}
