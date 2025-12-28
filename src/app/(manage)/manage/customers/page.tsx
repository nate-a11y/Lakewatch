'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Building2,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react'

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  propertiesCount: number
  status: 'active' | 'inactive'
  plan: string
  createdAt: string
}

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Mock data
  const customers: Customer[] = [
    { id: '5', firstName: 'John', lastName: 'Smith', email: 'john.customer@example.com', phone: '(314) 555-1001', propertiesCount: 2, status: 'active', plan: 'Premium', createdAt: '2024-06-15' },
    { id: '6', firstName: 'Jane', lastName: 'Doe', email: 'jane.customer@example.com', phone: '(816) 555-1002', propertiesCount: 1, status: 'active', plan: 'Premium', createdAt: '2024-08-22' },
    { id: '7', firstName: 'Bob', lastName: 'Wilson', email: 'bob.customer@example.com', phone: '(417) 555-1003', propertiesCount: 1, status: 'active', plan: 'Basic', createdAt: '2024-09-10' },
    { id: '8', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@example.com', phone: '(573) 555-2001', propertiesCount: 3, status: 'active', plan: 'Premium', createdAt: '2024-03-05' },
    { id: '9', firstName: 'Tom', lastName: 'Brown', email: 'tom.brown@example.com', phone: '(636) 555-3001', propertiesCount: 1, status: 'inactive', plan: 'Standard', createdAt: '2024-01-20' },
  ]

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Customers</h1>
          <p className="text-[#a1a1aa]">
            Manage your customer accounts
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#71717a]" />
          <input
            type="text"
            placeholder="Search customers..."
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden lg:table-cell">Properties</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden lg:table-cell">Plan</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{customer.firstName} {customer.lastName}</p>
                      <p className="text-sm text-[#71717a] md:hidden">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm">
                      <p className="flex items-center gap-2 text-[#a1a1aa]">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </p>
                      <p className="flex items-center gap-2 text-[#71717a]">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-[#71717a]" />
                      {customer.propertiesCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className={`text-sm px-2 py-1 rounded ${
                      customer.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                      customer.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-[#27272a] text-[#a1a1aa]'
                    }`}>
                      {customer.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      customer.status === 'active'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-[#27272a] text-[#71717a]'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/manage/customers/${customer.id}`}
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#71717a]">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}
