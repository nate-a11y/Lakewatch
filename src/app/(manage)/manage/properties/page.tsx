import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Plus,
  Building2,
  MapPin,
  User,
  Calendar,
} from 'lucide-react'
import PropertyFilters from './PropertyFilters'

export default async function PropertiesPage() {
  const supabase = await createClient()

  // Fetch properties with owner and service plan info
  const { data: properties, error } = await supabase
    .from('lwp_properties')
    .select(`
      id, name, street, city, state, zip, status, property_type,
      owner:lwp_users!owner_id(id, first_name, last_name),
      service_plan:lwp_service_plans(name)
    `)
    .order('name')

  if (error) {
    console.error('Error fetching properties:', error)
  }

  // Get next inspections for properties
  const propertyIds = (properties || []).map(p => p.id)
  const { data: upcomingInspections } = await supabase
    .from('lwp_inspections')
    .select('property_id, scheduled_date')
    .in('property_id', propertyIds.length > 0 ? propertyIds : [0])
    .eq('status', 'scheduled')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date')

  // Create a map of next inspection by property
  const nextInspectionMap: Record<number, string> = {}
  upcomingInspections?.forEach(insp => {
    if (!nextInspectionMap[insp.property_id]) {
      nextInspectionMap[insp.property_id] = insp.scheduled_date
    }
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Transform properties data
  const transformedProperties = (properties || []).map(p => {
    const ownerData = p.owner as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
    const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData
    const planData = p.service_plan as { name: string } | { name: string }[] | null
    const plan = Array.isArray(planData) ? planData[0]?.name : planData?.name

    return {
      id: p.id,
      name: p.name,
      street: p.street,
      city: p.city,
      state: p.state,
      status: p.status || 'active',
      customerName: owner ? `${owner.first_name} ${owner.last_name}` : 'Unknown',
      customerId: owner?.id,
      plan: plan || 'No plan',
      nextInspection: nextInspectionMap[p.id] || null,
    }
  })

  const stats = {
    total: transformedProperties.length,
    active: transformedProperties.filter(p => p.status === 'active').length,
    premium: transformedProperties.filter(p => p.plan === 'Premium').length,
    standard: transformedProperties.filter(p => p.plan === 'Standard').length,
    basic: transformedProperties.filter(p => p.plan === 'Basic').length,
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Properties</h1>
          <p className="text-[#a1a1aa]">
            Manage all monitored properties ({transformedProperties.length} total)
          </p>
        </div>
        <Link
          href="/manage/properties/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Total</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Active</p>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Premium</p>
          <p className="text-2xl font-bold text-purple-400">{stats.premium}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Standard</p>
          <p className="text-2xl font-bold text-blue-400">{stats.standard}</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <p className="text-sm text-[#71717a] mb-1">Basic</p>
          <p className="text-2xl font-bold text-[#a1a1aa]">{stats.basic}</p>
        </div>
      </div>

      <PropertyFilters />

      {/* Properties Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transformedProperties.map((property) => (
          <Link
            key={property.id}
            href={`/manage/properties/${property.id}`}
            className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-5 hover:border-[#4cbb17]/50 transition-colors group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-[#27272a] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#71717a]" />
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                property.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                property.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {property.plan}
              </span>
            </div>

            <h3 className="font-semibold text-lg mb-1 group-hover:text-[#4cbb17] transition-colors">
              {property.name}
            </h3>

            <div className="flex items-center gap-2 text-sm text-[#71717a] mb-3">
              <MapPin className="w-4 h-4" />
              <span>{property.street}, {property.city}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#a1a1aa] mb-3">
              <User className="w-4 h-4" />
              <span>{property.customerName}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#27272a]">
              <div className="flex items-center gap-2 text-xs text-[#71717a]">
                <Calendar className="w-4 h-4" />
                {property.nextInspection ? (
                  <span>Next: {formatDate(property.nextInspection)}</span>
                ) : (
                  <span>No upcoming inspection</span>
                )}
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                property.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : property.status === 'pending'
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {property.status}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {transformedProperties.length === 0 && (
        <div className="text-center py-12 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <Building2 className="w-12 h-12 text-[#27272a] mx-auto mb-4" />
          <p className="text-[#71717a]">No properties found</p>
        </div>
      )}
    </div>
  )
}
