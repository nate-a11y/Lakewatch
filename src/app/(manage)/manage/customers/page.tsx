import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Building2,
  Mail,
  Phone,
  ChevronRight,
} from 'lucide-react'
import CustomerFilters from './CustomerFilters'

interface Customer {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string | null
  status: string
  created_at: string
  properties_count: number
  plan_name: string | null
}

export default async function CustomersPage() {
  // Verify user is authenticated and is staff
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Use admin client (bypasses RLS) for admin data fetching
  const adminClient = createAdminClient()

  // Verify user is staff before allowing access
  const { data: userData } = await adminClient
    .from('lwp_users')
    .select('role')
    .eq('email', user.email)
    .single()

  if (!userData || !['admin', 'owner', 'staff'].includes(userData.role)) {
    redirect('/portal')
  }

  // Fetch customers (using admin client to bypass RLS)
  const { data: customers, error } = await adminClient
    .from('lwp_users')
    .select('id, first_name, last_name, email, phone, status, created_at')
    .eq('role', 'customer')
    .order('last_name')

  if (error) {
    console.error('Error fetching customers:', error)
  }

  // Fetch property counts
  const customerIds = (customers || []).map(c => c.id)
  let propertyCounts: Record<number, number> = {}

  if (customerIds.length > 0) {
    const { data: properties } = await adminClient
      .from('lwp_properties')
      .select('owner_id')
      .in('owner_id', customerIds)

    if (properties) {
      propertyCounts = properties.reduce((acc, p) => {
        acc[p.owner_id] = (acc[p.owner_id] || 0) + 1
        return acc
      }, {} as Record<number, number>)
    }
  }

  // Transform data to include property counts
  const customersWithCounts: Customer[] = (customers || []).map(c => ({
    id: c.id,
    first_name: c.first_name || '',
    last_name: c.last_name || '',
    email: c.email,
    phone: c.phone,
    status: c.status || 'active',
    created_at: c.created_at,
    properties_count: propertyCounts[c.id] || 0,
    plan_name: null, // Will be derived from their properties
  }))

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Customers</h1>
          <p className="text-[#a1a1aa]">
            Manage your customer accounts ({customersWithCounts.length} total)
          </p>
        </div>
        <Link
          href="/manage/customers/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </Link>
      </div>

      <CustomerFilters />

      {/* Customer List */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#27272a]">
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden md:table-cell">Contact</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a] hidden lg:table-cell">Properties</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-[#71717a]">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {customersWithCounts.map((customer) => (
                <tr key={customer.id} className="hover:bg-[#171717] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                      <p className="text-sm text-[#71717a] md:hidden">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="text-sm">
                      <p className="flex items-center gap-2 text-[#a1a1aa]">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </p>
                      {customer.phone && (
                        <p className="flex items-center gap-2 text-[#71717a]">
                          <Phone className="w-4 h-4" />
                          {customer.phone}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-[#71717a]" />
                      {customer.properties_count}
                    </div>
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

        {customersWithCounts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#71717a]">No customers found</p>
          </div>
        )}
      </div>
    </div>
  )
}
