import Link from 'next/link'
import {
  Users,
  Building2,
  ClipboardCheck,
  ClipboardList,
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react'

export default function AdminDashboardPage() {
  // Mock data - replace with actual API calls
  const stats = {
    activeCustomers: 47,
    activeProperties: 82,
    inspectionsToday: 12,
    pendingRequests: 5,
    overdueInvoices: 3,
    revenueThisMonth: 24850,
    revenueLastMonth: 22340,
  }

  const todaySchedule = [
    { id: '1', time: '8:00 AM', property: 'Lake House - Smith', technician: 'Mike T.', status: 'completed' },
    { id: '2', time: '9:30 AM', property: 'Sunset Cove - Doe', technician: 'Mike T.', status: 'in_progress' },
    { id: '3', time: '11:00 AM', property: 'Woodland Cabin - Wilson', technician: 'Lisa M.', status: 'scheduled' },
    { id: '4', time: '1:00 PM', property: 'Marina View - Johnson', technician: 'Lisa M.', status: 'scheduled' },
    { id: '5', time: '2:30 PM', property: 'Hillside Retreat - Brown', technician: 'Mike T.', status: 'scheduled' },
  ]

  const pendingRequests = [
    { id: '1', type: 'Pre-Arrival', property: 'Lake House', customer: 'John Smith', date: 'Jan 9, 2026', priority: 'high' },
    { id: '2', type: 'Grocery Stocking', property: 'Lake House', customer: 'John Smith', date: 'Jan 10, 2026', priority: 'normal' },
    { id: '3', type: 'Maintenance', property: 'Sunset Cove', customer: 'Jane Doe', date: 'ASAP', priority: 'low' },
  ]

  const overdueInvoices = [
    { id: '1', customer: 'Bob Wilson', amount: 99, daysOverdue: 5 },
    { id: '2', customer: 'Sarah Johnson', amount: 199, daysOverdue: 12 },
    { id: '3', customer: 'Tom Brown', amount: 349, daysOverdue: 3 },
  ]

  const revenueChange = ((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth * 100).toFixed(1)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-[#a1a1aa]">
          Welcome back. Here&apos;s what&apos;s happening today.
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

          <div className="space-y-3">
            {pendingRequests.map((item) => (
              <Link
                key={item.id}
                href={`/manage/requests/${item.id}`}
                className="flex items-center gap-4 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  item.priority === 'high' ? 'bg-red-500' :
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
            {overdueInvoices.map((invoice) => (
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
