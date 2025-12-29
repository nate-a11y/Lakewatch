import { createClient } from '@/lib/supabase/server'
import NewMessageClient from './NewMessageClient'

export default async function NewMessagePage() {
  const supabase = await createClient()

  // Fetch properties for the current user
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select('id, name, street, city')
    .order('name')

  const formattedProperties = (properties || []).map(p => ({
    id: String(p.id),
    name: p.name || `${p.street || ''}, ${p.city || ''}`.trim().replace(/^,\s*/, ''),
  }))

  return <NewMessageClient properties={formattedProperties} />
}
