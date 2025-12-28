import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  FileText,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import InvoiceFilters from './InvoiceFilters'

export default async function InvoicesPage() {
  const supabase = await createClient()

  // Fetch invoices with related data
  const { data: invoices, error } = await supabase
    .from('lwp_invoices')
    .select(`
      id, invoice_number, status, issue_date, due_date, paid_date, subtotal, tax, total,
      customer:lwp_users!customer_id(id, first_name, last_name),
      property:lwp_properties(id, name)
    `)
    .order('issue_date', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching invoices:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Check if invoice is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid' || status === 'cancelled') return false
    const due = new Date(dueDate)
    return due < new Date()
  }

  const invoicesList = (invoices || []).map((inv) => {
    const customerData = inv.customer as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
    const customer = Array.isArray(customerData) ? customerData[0] : customerData

    const propertyData = inv.property as { id: number; name: string } | { id: number; name: string }[] | null
    const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

    const status = isOverdue(inv.due_date, inv.status) ? 'overdue' : inv.status

    return {
      id: inv.id,
      number: inv.invoice_number,
      customer: {
        id: customer?.id || 0,
        name: customer ? `${customer.first_name} ${customer.last_name}` : 'Unknown',
      },
      property: property ? {
        id: property.id,
        name: property.name,
      } : null,
      amount: Number(inv.total) || 0,
      status,
      dueDate: formatDate(inv.due_date),
      issuedDate: formatDate(inv.issue_date),
    }
  })

  const stats = {
    pending: invoicesList.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0),
    overdue: invoicesList.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0),
    paidThisMonth: invoicesList.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0),
    overdueCount: invoicesList.filter(i => i.status === 'overdue').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <FileText className="w-4 h-4 text-[#71717a]" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Invoices</h1>
          <p className="text-[#a1a1aa]">
            Manage billing and payments ({invoicesList.length} total)
          </p>
        </div>
        <Link
          href="/manage/invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Invoice
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-yellow-500" />
            <p className="text-sm text-[#71717a]">Pending</p>
          </div>
          <p className="text-2xl font-bold">${stats.pending.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-400">Overdue ({stats.overdueCount})</p>
          </div>
          <p className="text-2xl font-bold text-red-500">${stats.overdue.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <p className="text-sm text-[#71717a]">Collected</p>
          </div>
          <p className="text-2xl font-bold text-green-500">${stats.paidThisMonth.toLocaleString()}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-[#4cbb17]" />
            <p className="text-sm text-[#71717a]">Total Outstanding</p>
          </div>
          <p className="text-2xl font-bold">${(stats.pending + stats.overdue).toLocaleString()}</p>
        </div>
      </div>

      <InvoiceFilters />

      {/* Invoices Table */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Invoice</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden md:table-cell">Property</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden lg:table-cell">Due Date</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-[#71717a]">Amount</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {invoicesList.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium font-mono">{invoice.number}</p>
                      <p className="text-xs text-[#71717a]">{invoice.issuedDate}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/manage/customers/${invoice.customer.id}`} className="hover:text-[#4cbb17]">
                      {invoice.customer.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    {invoice.property ? (
                      <Link href={`/manage/properties/${invoice.property.id}`} className="text-sm text-[#a1a1aa] hover:text-[#4cbb17]">
                        {invoice.property.name}
                      </Link>
                    ) : (
                      <span className="text-sm text-[#71717a]">Multiple</span>
                    )}
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-sm ${
                      invoice.status === 'overdue' ? 'text-red-500' : 'text-[#a1a1aa]'
                    }`}>
                      {invoice.dueDate}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold">${invoice.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(invoice.status)}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-500/10 text-green-500' :
                        invoice.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        invoice.status === 'overdue' ? 'bg-red-500/10 text-red-500' :
                        invoice.status === 'draft' ? 'bg-[#27272a] text-[#71717a]' :
                        'bg-[#27272a] text-[#71717a]'
                      }`}>
                        {invoice.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/manage/invoices/${invoice.id}`}
                      className="p-2 rounded-lg hover:bg-[#27272a] transition-colors inline-flex"
                    >
                      <ChevronRight className="w-5 h-5 text-[#71717a]" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {invoicesList.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
            <p className="text-[#71717a]">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  )
}
