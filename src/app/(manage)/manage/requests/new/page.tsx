import { createClient } from '@/lib/supabase/server'
import NewRequestClient from './NewRequestClient'

export default async function NewRequestPage() {
  const supabase = await createClient()

  // Fetch customers
  const { data: customers } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'customer')
    .order('last_name')

  // Fetch properties with owner info
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name, owner_id')
    .order('name')

  // Fetch technicians
  const { data: technicians } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'technician')
    .order('last_name')

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
  }))

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name,
    customerId: String(p.owner_id),
  }))

  const formattedTechnicians = (technicians || []).map(t => ({
    id: String(t.id),
    name: `${t.first_name} ${t.last_name}`,
  }))

  return (
    <NewRequestClient
      customers={formattedCustomers}
      properties={formattedProperties}
      technicians={formattedTechnicians}
    />
  )
}
