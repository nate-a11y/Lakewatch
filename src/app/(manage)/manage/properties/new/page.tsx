import { createClient } from '@/lib/supabase/server'
import NewPropertyClient from './NewPropertyClient'

export default async function NewPropertyPage() {
  const supabase = await createClient()

  // Fetch customers
  const { data: customers } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'customer')
    .order('last_name')

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
  }))

  return <NewPropertyClient customers={formattedCustomers} />
}
