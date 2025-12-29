import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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
import EditableNotes from '@/components/EditableNotes'
import CustomerActionButtons from './CustomerActionButtons'
import { CustomerHealthScore } from '@/components/manage/CustomerHealthScore'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch customer data
  const { data: customer, error } = await supabase
    .from('lwp_users')
    .select('*')
    .eq('id', id)
    .eq('role', 'customer')
    .single()

  if (error || !customer) {
    notFound()
  }

  // Fetch customer's properties with service plans
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select(`
      id, name, street, city, state, status,
      service_plan:lwp_service_plans(name)
    `)
    .eq('owner_id', id)
    .order('name')

  // Fetch recent invoices
  const { data: invoices } = await supabase
    .from('lwp_invoices')
    .select('id, invoice_number, total, status, issue_date')
    .eq('customer_id', id)
    .order('issue_date', { ascending: false })
    .limit(5)

  // Fetch recent activity (inspections and requests)
  const { data: recentInspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status,
      property:lwp_properties(name)
    `)
    .in('property_id', properties?.map(p => p.id) || [0])
    .order('scheduled_date', { ascending: false })
    .limit(3)

  // Fetch data for customer health score
  const [allInvoicesResult, messagesResult, requestsResult] = await Promise.all([
    supabase.from('lwp_invoices').select('id, status').eq('customer_id', id),
    supabase.from('lwp_messages').select('id', { count: 'exact' }).eq('customer_id', id),
    supabase.from('lwp_service_requests').select('id', { count: 'exact' }).eq('requested_by_id', id),
  ])

  const allInvoices = allInvoicesResult.data || []
  const paidOnTime = allInvoices.filter(i => i.status === 'paid').length
  const paidLate = allInvoices.filter(i => i.status === 'overdue').length

  // Calculate tenure in months
  const tenureMonths = Math.max(1, Math.floor(
    (new Date().getTime() - new Date(customer.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
  ))

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const transformedProperties = (properties || []).map(p => {
    const planData = p.service_plan as { name: string } | { name: string }[] | null
    const planName = Array.isArray(planData) ? planData[0]?.name : planData?.name
    return {
      ...p,
      plan: planName || 'No plan',
      address: `${p.street}, ${p.city}, ${p.state}`,
    }
  })

  const totalMonthly = transformedProperties.reduce((acc, p) => {
    const planPrices: Record<string, number> = { 'Premium': 349, 'Standard': 199, 'Basic': 99 }
    return acc + (planPrices[p.plan] || 0)
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
            {(customer.first_name?.[0] || '?')}{(customer.last_name?.[0] || '')}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {customer.first_name} {customer.last_name}
            </h1>
            <div className="flex items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                customer.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {customer.status || 'active'}
              </span>
              <span className="text-sm">Customer since {formatDate(customer.created_at)}</span>
            </div>
          </div>
        </div>
        <CustomerActionButtons customerId={id} />
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
                  <p>{customer.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Properties */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Properties ({transformedProperties.length})</h2>
              <Link
                href={`/manage/properties/new?customer=${id}`}
                className="text-sm text-[#4cbb17] hover:underline"
              >
                Add property
              </Link>
            </div>
            <div className="space-y-3">
              {transformedProperties.length > 0 ? transformedProperties.map((property) => (
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
              )) : (
                <p className="text-[#71717a] text-sm py-4 text-center">No properties yet</p>
              )}
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
              {invoices && invoices.length > 0 ? invoices.map((invoice) => (
                <Link
                  key={invoice.id}
                  href={`/manage/invoices/${invoice.id}`}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-[#71717a]" />
                    <div>
                      <p className="text-sm font-medium">{invoice.invoice_number}</p>
                      <p className="text-xs text-[#71717a]">{formatDate(invoice.issue_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${invoice.total}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                      invoice.status === 'pending' || invoice.status === 'sent' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-red-500/10 text-red-500'
                    }`}>
                      {invoice.status}
                    </span>
                  </div>
                </Link>
              )) : (
                <p className="text-[#71717a] text-sm py-4 text-center">No invoices yet</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Health Score */}
          <CustomerHealthScore
            paymentHistory={{
              onTime: paidOnTime,
              late: paidLate,
              total: allInvoices.length,
            }}
            engagement={{
              messages: messagesResult.count || 0,
              requests: requestsResult.count || 0,
            }}
            tenureMonths={tenureMonths}
          />

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
                <span>{transformedProperties.length}</span>
              </div>
              {customer.stripe_customer_id && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Payment Method</span>
                  <span>•••• 4242</span>
                </div>
              )}
            </div>
            <Link
              href={`/manage/invoices/new?customer=${id}`}
              className="block w-full mt-4 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors text-sm text-center"
            >
              Create Invoice
            </Link>
          </section>

          {/* Notes - using EditableNotes component */}
          <EditableNotes
            initialNotes=""
            title="Notes"
            placeholder="Add customer notes..."
          />

          {/* Recent Activity */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentInspections && recentInspections.length > 0 ? recentInspections.map((inspection) => {
                const propertyData = inspection.property as { name: string } | { name: string }[] | null
                const propertyName = Array.isArray(propertyData) ? propertyData[0]?.name : propertyData?.name
                return (
                  <div key={inspection.id} className="text-sm">
                    <p className="font-medium">
                      Inspection {inspection.status === 'completed' ? 'completed' : 'scheduled'}
                    </p>
                    <p className="text-[#71717a]">
                      {propertyName} • {formatDate(inspection.scheduled_date)}
                    </p>
                  </div>
                )
              }) : (
                <p className="text-[#71717a] text-sm">No recent activity</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
