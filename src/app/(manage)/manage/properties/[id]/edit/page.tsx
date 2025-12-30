import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import EditPropertyForm from './EditPropertyForm'

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch property
  const { data: property, error } = await supabase
    .from('lwp_properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Fetch customers for the dropdown
  const { data: customers } = await supabase
    .from('lwp_users')
    .select('id, first_name, last_name')
    .eq('role', 'customer')
    .order('last_name')

  const formattedCustomers = (customers || []).map(c => ({
    id: String(c.id),
    name: `${c.first_name} ${c.last_name}`,
  }))

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/manage/properties/${id}`}
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to property
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Edit Property</h1>
        <p className="text-[#a1a1aa]">Update property details</p>
      </div>

      <EditPropertyForm
        property={{
          id: String(property.id),
          name: property.name || '',
          ownerId: String(property.owner_id),
          street: property.street || '',
          city: property.city || '',
          state: property.state || '',
          zip: property.zip || '',
          propertyType: property.property_type || 'residential',
          gateCode: property.gate_code || '',
          specialInstructions: property.special_instructions || '',
          status: property.status || 'active',
        }}
        customers={formattedCustomers}
      />
    </div>
  )
}
