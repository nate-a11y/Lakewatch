import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewMessageClient from './NewMessageClient'

export default async function NewMessagePage({
  searchParams,
}: {
  searchParams: Promise<{ customer?: string }>
}) {
  const { customer: customerId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch customers
  const { data: customers } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name, email')
    .eq('role', 'customer')
    .order('last_name')

  // Fetch properties for the selected customer or all
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name, owner_id')
    .order('name')

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
    email: c.email,
  }))

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name,
    customerId: String(p.owner_id),
  }))

  return (
    <NewMessageClient
      customers={formattedCustomers}
      properties={formattedProperties}
      preselectedCustomerId={customerId || ''}
    />
  )
}
