'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  FileText,
  DollarSign,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Download,
} from 'lucide-react'

interface Invoice {
  id: string
  number: string
  customer: {
    id: string
    name: string
  }
  property: {
    id: string
    name: string
  } | null
  amount: number
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  issuedDate: string
  type: 'subscription' | 'service' | 'one-time'
}

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  // Mock data
  const invoices: Invoice[] = [
    {
      id: '1',
      number: 'INV-2026-001',
      customer: { id: '5', name: 'John Smith' },
      property: { id: '1', name: 'Lake House' },
      amount: 349,
      status: 'pending',
      dueDate: 'Jan 15, 2026',
      issuedDate: 'Jan 1, 2026',
      type: 'subscription',
    },
    {
      id: '2',
      number: 'INV-2026-002',
      customer: { id: '5', name: 'John Smith' },
      property: { id: '2', name: 'Guest Cabin' },
      amount: 199,
      status: 'pending',
      dueDate: 'Jan 15, 2026',
      issuedDate: 'Jan 1, 2026',
      type: 'subscription',
    },
    {
      id: '3',
      number: 'INV-2025-089',
      customer: { id: '6', name: 'Jane Doe' },
      property: { id: '3', name: 'Sunset Cove' },
      amount: 349,
      status: 'paid',
      dueDate: 'Dec 15, 2025',
      issuedDate: 'Dec 1, 2025',
      type: 'subscription',
    },
    {
      id: '4',
      number: 'INV-2025-090',
      customer: { id: '7', name: 'Bob Wilson' },
      property: { id: '4', name: 'Hillside Retreat' },
      amount: 99,
      status: 'overdue',
      dueDate: 'Dec 15, 2025',
      issuedDate: 'Dec 1, 2025',
      type: 'subscription',
    },
    {
      id: '5',
      number: 'INV-2025-091',
      customer: { id: '8', name: 'Sarah Johnson' },
      property: null,
      amount: 647,
      status: 'paid',
      dueDate: 'Dec 15, 2025',
      issuedDate: 'Dec 1, 2025',
      type: 'subscription',
    },
    {
      id: '6',
      number: 'INV-2025-092',
      customer: { id: '5', name: 'John Smith' },
      property: { id: '1', name: 'Lake House' },
      amount: 150,
      status: 'draft',
      dueDate: 'Jan 20, 2026',
      issuedDate: 'Dec 28, 2025',
      type: 'service',
    },
  ]

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    const matchesType = typeFilter === 'all' || invoice.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const stats = {
    pending: invoices.filter(i => i.status === 'pending').reduce((acc, i) => acc + i.amount, 0),
    overdue: invoices.filter(i => i.status === 'overdue').reduce((acc, i) => acc + i.amount, 0),
    paidThisMonth: invoices.filter(i => i.status === 'paid').reduce((acc, i) => acc + i.amount, 0),
    overdueCount: invoices.filter(i => i.status === 'overdue').length,
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
            Manage billing and payments
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f0f0f] border border-[#27272a] rounded-lg focus:outline-none focus:border-[#4cbb17]"
          >
            <option value="all">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="service">Service</option>
            <option value="one-time">One-time</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

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
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium font-mono">{invoice.number}</p>
                      <p className="text-xs text-[#71717a]">{invoice.type}</p>
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
                    <span className="font-semibold">${invoice.amount}</span>
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

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
            <p className="text-[#71717a]">No invoices found</p>
          </div>
        )}
      </div>
    </div>
  )
}
