import { createClient } from '@/lib/supabase/server'
import NewRequestClient from './NewRequestClient'

export default async function NewServiceRequestPage() {
  const supabase = await createClient()

  // Fetch properties for the current user
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name, street, city')
    .order('name')

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name,
    address: `${p.street || ''}, ${p.city || ''}`.trim().replace(/^,\s*/, ''),
  }))

  return <NewRequestClient properties={formattedProperties} />
}
