import { createClient } from '@/lib/supabase/server'
import NewInvoiceClient from './NewInvoiceClient'

export default async function NewInvoicePage() {
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

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
  }))

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name,
    customerId: String(p.owner_id),
  }))

  return (
    <NewInvoiceClient
      customers={formattedCustomers}
      properties={formattedProperties}
    />
  )
}
