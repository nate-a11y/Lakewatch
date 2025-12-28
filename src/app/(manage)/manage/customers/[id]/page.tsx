import Link from 'next/link'
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  FileText,
  MessageSquare,
  Edit,
} from 'lucide-react'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const customer = {
    id,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.customer@example.com',
    phone: '(314) 555-1001',
    role: 'customer',
    createdAt: 'June 15, 2024',
    status: 'active',
    stripeCustomerId: 'cus_abc123',
    properties: [
      { id: '1', name: 'Lake House', address: '123 Lakefront Dr, Lake Ozark, MO', plan: 'Premium', status: 'active' },
      { id: '2', name: 'Guest Cabin', address: '125 Lakefront Dr, Lake Ozark, MO', plan: 'Standard', status: 'active' },
    ],
    recentInvoices: [
      { id: '1', number: 'INV-2026-001', amount: 349, status: 'pending', date: 'Jan 1, 2026' },
      { id: '2', number: 'INV-2025-001', amount: 349, status: 'paid', date: 'Dec 1, 2025' },
      { id: '3', number: 'INV-2025-002', amount: 199, status: 'paid', date: 'Dec 1, 2025' },
    ],
    recentActivity: [
      { id: '1', action: 'Inspection completed', property: 'Lake House', date: 'Dec 20, 2025' },
      { id: '2', action: 'Service request submitted', property: 'Lake House', date: 'Dec 18, 2025' },
      { id: '3', action: 'Invoice paid', property: null, date: 'Dec 10, 2025' },
    ],
    notes: 'VIP customer - always responds quickly. Prefers email communication.',
  }

  const totalMonthly = customer.properties.reduce((acc, p) => {
    return acc + (p.plan === 'Premium' ? 349 : p.plan === 'Standard' ? 199 : 99)
  }, 0)

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/manage/customers"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to customers
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17] text-xl font-bold">
            {customer.firstName[0]}{customer.lastName[0]}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {customer.firstName} {customer.lastName}
            </h1>
            <div className="flex items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                customer.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {customer.status}
              </span>
              <span className="text-sm">Customer since {customer.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
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
                  <p>{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm text-[#71717a]">Phone</p>
                  <p>{customer.phone}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Properties */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Properties ({customer.properties.length})</h2>
              <button className="text-sm text-[#4cbb17] hover:underline">Add property</button>
            </div>
            <div className="space-y-3">
              {customer.properties.map((property) => (
                <Link
                  key={property.id}
                  href={`/manage/properties/${property.id}`}
                  className="flex items-center gap-4 p-4 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-[#71717a]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{property.name}</p>
                    <p className="text-sm text-[#71717a]">{property.address}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    property.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                    property.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-[#27272a] text-[#a1a1aa]'
                  }`}>
                    {property.plan}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Recent Invoices */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Invoices</h2>
              <Link href={`/manage/invoices?customer=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {customer.recentInvoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/manage/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#71717a]" />
                    <div>
                      <p className="text-sm font-medium">{invoice.number}</p>
                      <p className="text-xs text-[#71717a]">{invoice.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${invoice.amount}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                      invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Billing Summary */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Billing Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Monthly Total</span>
                <span className="font-semibold text-[#4cbb17]">${totalMonthly}/mo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Properties</span>
                <span>{customer.properties.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#71717a]">Payment Method</span>
                <span>•••• 4242</span>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors text-sm">
              Manage Billing
            </button>
          </section>

          {/* Notes */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <button className="text-sm text-[#4cbb17] hover:underline">Edit</button>
            </div>
            <p className="text-sm text-[#a1a1aa]">{customer.notes}</p>
          </section>

          {/* Recent Activity */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {customer.recentActivity.map((activity) => (
                <div key={activity.id} className="text-sm">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-[#71717a]">
                    {activity.property && `${activity.property} • `}{activity.date}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
