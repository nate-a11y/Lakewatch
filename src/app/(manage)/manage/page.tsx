import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Building2,
  ClipboardCheck,
  ClipboardList,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
} from 'lucide-react'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/manage')
  }

  // Verify admin/staff role
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role, first_name')
    .eq('supabase_id', user.id)
    .single()

  if (!userData || !['admin', 'staff'].includes(userData.role)) {
    redirect('/portal')
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const nowTime = now.getTime()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  // Fetch real stats in parallel
  const [
    customersResult,
    propertiesResult,
    inspectionsTodayResult,
    pendingRequestsResult,
    overdueInvoicesResult,
    thisMonthRevenueResult,
    lastMonthRevenueResult,
    todayScheduleResult,
  ] = await Promise.all([
    supabase.from('lwp_users').select('id', { count: 'exact' }).eq('role', 'customer'),
    supabase.from('lwp_properties').select('id', { count: 'exact' }).eq('status', 'active'),
    supabase.from('lwp_inspections').select('id', { count: 'exact' }).eq('scheduled_date', today),
    supabase.from('lwp_service_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
    supabase.from('lwp_invoices').select('id, customer_id, total, due_date').eq('status', 'overdue'),
    supabase.from('lwp_invoices').select('total').eq('status', 'paid').gte('paid_date', thisMonthStart),
    supabase.from('lwp_invoices').select('total').eq('status', 'paid').gte('paid_date', lastMonthStart).lte('paid_date', lastMonthEnd),
    supabase.from('lwp_inspections')
      .select(`
        id, scheduled_time, status,
        property:lwp_properties!property_id(name, owner:lwp_users!owner_id(last_name)),
        technician:lwp_users!technician_id(first_name, last_name)
      `)
      .eq('scheduled_date', today)
      .order('scheduled_time')
      .limit(5),
  ])

  // Get pending requests details
  const { data: pendingRequestsData } = await supabase
    .from('lwp_service_requests')
    .select(`
      id, request_type, priority, preferred_date, title,
      property:lwp_properties!property_id(name),
      requested_by:lwp_users!requested_by_id(first_name, last_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(3)

  // Get customer names for overdue invoices
  const overdueWithCustomers = await Promise.all(
    (overdueInvoicesResult.data || []).slice(0, 3).map(async (inv) => {
      const { data: customer } = await supabase
        .from('lwp_users')
        .select('first_name, last_name')
        .eq('id', inv.customer_id)
        .single()
      const daysOverdue = Math.floor((nowTime - new Date(inv.due_date).getTime()) / (1000 * 60 * 60 * 24))
      return {
        id: inv.id,
        customer: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
        amount: inv.total,
        daysOverdue,
      }
    })
  )

  const thisMonthRevenue = thisMonthRevenueResult.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const lastMonthRevenue = lastMonthRevenueResult.data?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0
  const revenueChange = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '0'

  const stats = {
    activeCustomers: customersResult.count || 0,
    activeProperties: propertiesResult.count || 0,
    inspectionsToday: inspectionsTodayResult.count || 0,
    pendingRequests: pendingRequestsResult.count || 0,
    overdueInvoices: overdueInvoicesResult.data?.length || 0,
    revenueThisMonth: thisMonthRevenue,
  }

  const todaySchedule = (todayScheduleResult.data || []).map((item) => {
    // Handle Supabase joins which may return arrays
    const propData = item.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    const ownerData = property?.owner as unknown
    const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData
    const techData = item.technician as unknown
    const technician = Array.isArray(techData) ? techData[0] : techData
    return {
      id: String(item.id),
      time: item.scheduled_time ? formatTime(item.scheduled_time) : 'TBD',
      property: `${property?.name || 'Property'} - ${owner?.last_name || 'Owner'}`,
      technician: technician ? `${technician.first_name} ${technician.last_name?.charAt(0)}.` : 'Unassigned',
      status: item.status,
    }
  })

  const pendingRequests = (pendingRequestsData || []).map((req) => {
    const propData = req.property as unknown
    const property = Array.isArray(propData) ? propData[0] : propData
    const reqByData = req.requested_by as unknown
    const requestedBy = Array.isArray(reqByData) ? reqByData[0] : reqByData
    return {
      id: String(req.id),
      type: req.title || req.request_type,
      property: property?.name || 'Property',
      customer: requestedBy ? `${requestedBy.first_name} ${requestedBy.last_name}` : 'Customer',
      date: req.preferred_date ? new Date(req.preferred_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'ASAP',
      priority: req.priority,
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-[#a1a1aa]">
          Welcome back{userData.first_name ? `, ${userData.first_name}` : ''}. Here&apos;s what&apos;s happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/manage/customers" className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.activeCustomers}</p>
          <p className="text-sm text-[#71717a]">Active Customers</p>
        </Link>

        <Link href="/manage/properties" className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.activeProperties}</p>
          <p className="text-sm text-[#71717a]">Properties</p>
        </Link>

        <Link href="/manage/schedule" className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#4cbb17]/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-[#4cbb17]" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.inspectionsToday}</p>
          <p className="text-sm text-[#71717a]">Inspections Today</p>
        </Link>

        <Link href="/manage/requests" className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
          <p className="text-2xl font-bold">{stats.pendingRequests}</p>
          <p className="text-sm text-[#71717a]">Pending Requests</p>
        </Link>
      </div>

      {/* Revenue Card */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Revenue This Month</h2>
          <div className={`flex items-center gap-1 text-sm ${Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            <TrendingUp className="w-4 h-4" />
            {revenueChange}% vs last month
          </div>
        </div>
        <p className="text-4xl font-bold text-[#4cbb17]">${stats.revenueThisMonth.toLocaleString()}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Today's Schedule */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#4cbb17]" />
              <h2 className="text-lg font-semibold">Today&apos;s Schedule</h2>
            </div>
            <Link href="/manage/schedule" className="text-sm text-[#4cbb17] hover:underline">
              View all
            </Link>
          </div>

          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3 bg-black/30 rounded-lg"
                >
                  <div className="w-16 text-sm text-[#71717a]">{item.time}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.property}</p>
                    <p className="text-xs text-[#71717a]">{item.technician}</p>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'completed' ? 'bg-green-500' :
                    item.status === 'in_progress' ? 'bg-yellow-500' :
                    'bg-[#27272a]'
                  }`} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No inspections scheduled today</p>
            </div>
          )}
        </div>

        {/* Pending Requests */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-semibold">Pending Requests</h2>
            </div>
            <Link href="/manage/requests" className="text-sm text-[#4cbb17] hover:underline">
              View all
            </Link>
          </div>

          {pendingRequests.length > 0 ? (
            <div className="space-y-3">
              {pendingRequests.map((item) => (
                <Link
                  key={item.id}
                  href={`/manage/requests/${item.id}`}
                  className="flex items-center gap-4 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    item.priority === 'high' || item.priority === 'urgent' ? 'bg-red-500' :
                    item.priority === 'normal' ? 'bg-yellow-500' :
                    'bg-[#71717a]'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.type}</p>
                    <p className="text-xs text-[#71717a]">{item.property} • {item.customer}</p>
                  </div>
                  <div className="text-xs text-[#71717a]">{item.date}</div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[#71717a]">
              <ClipboardList className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No pending requests</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {stats.overdueInvoices > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-lg font-semibold">Overdue Invoices ({stats.overdueInvoices})</h2>
          </div>

          <div className="space-y-2">
            {overdueWithCustomers.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/manage/invoices/${invoice.id}`}
                className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-black/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{invoice.customer}</p>
                  <p className="text-xs text-red-400">{invoice.daysOverdue} days overdue</p>
                </div>
                <p className="font-semibold">${invoice.amount}</p>
              </Link>
            ))}
          </div>

          <Link
            href="/manage/invoices?status=overdue"
            className="inline-block mt-4 text-sm text-red-400 hover:underline"
          >
            View all overdue invoices →
          </Link>
        </div>
      )}
    </div>
  )
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`
}
