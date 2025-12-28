import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, MapPin, Home, Calendar, ArrowRight, Plus } from 'lucide-react'

interface Property {
  id: number
  name: string
  street: string
  city: string
  state: string
  zip: string
  property_type: string
  square_footage: number | null
  status: string
  service_plan: {
    name: string
  } | null
}

interface Inspection {
  id: number
  scheduled_date: string
  property_id: number
}

export default async function PropertiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get user's internal ID
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id')
    .eq('supabase_id', user?.id)
    .single()

  // Fetch properties
  const { data: properties } = await supabase
    .from('lwp_properties')
    .select(`
      id, name, street, city, state, zip, property_type, square_footage, status,
      service_plan:lwp_service_plans(name)
    `)
    .eq('owner_id', userData?.id || 0)
    .order('name')

  // Get upcoming inspections for each property
  const propertyIds = properties?.map(p => p.id) || []
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select('id, scheduled_date, property_id')
    .in('property_id', propertyIds.length > 0 ? propertyIds : [0])
    .eq('status', 'scheduled')
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date')

  // Get last completed inspections
  const { data: completedInspections } = await supabase
    .from('lwp_inspections')
    .select('id, scheduled_date, property_id')
    .in('property_id', propertyIds.length > 0 ? propertyIds : [0])
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })

  // Map next/last inspections to properties
  const nextInspectionMap = new Map<number, string>()
  const lastInspectionMap = new Map<number, string>()

  inspections?.forEach((insp: Inspection) => {
    if (!nextInspectionMap.has(insp.property_id)) {
      nextInspectionMap.set(insp.property_id, insp.scheduled_date)
    }
  })

  completedInspections?.forEach((insp: Inspection) => {
    if (!lastInspectionMap.has(insp.property_id)) {
      lastInspectionMap.set(insp.property_id, insp.scheduled_date)
    }
  })

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">My Properties</h1>
          <p className="text-[#a1a1aa]">
            Manage your properties and view their status
          </p>
        </div>
        <Link
          href="/portal/properties/add"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Property
        </Link>
      </div>

      {/* Properties grid */}
      {properties && properties.length > 0 ? (
        <div className="grid gap-6">
          {properties.map((property) => {
            // Handle Supabase join returning array
            const planData = property.service_plan as unknown
            const servicePlan = Array.isArray(planData) ? planData[0] : planData
            const transformedProperty: Property = {
              ...property,
              service_plan: servicePlan || null,
            }
            return (
              <PropertyCard
                key={property.id}
                property={transformedProperty}
                nextInspection={nextInspectionMap.get(property.id)}
                lastInspection={lastInspectionMap.get(property.id)}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <Building2 className="w-16 h-16 text-[#71717a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
          <p className="text-[#a1a1aa] mb-6">
            Add your first property to get started with Lake Watch Pros
          </p>
          <Link
            href="/portal/properties/add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Property
          </Link>
        </div>
      )}
    </div>
  )
}

function PropertyCard({
  property,
  nextInspection,
  lastInspection,
}: {
  property: Property
  nextInspection?: string
  lastInspection?: string
}) {
  const typeIcons: Record<string, React.ReactNode> = {
    house: <Home className="w-5 h-5" />,
    cabin: <Home className="w-5 h-5" />,
    condo: <Building2 className="w-5 h-5" />,
    townhouse: <Building2 className="w-5 h-5" />,
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <Link
      href={`/portal/properties/${property.id}`}
      className="block bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Property icon */}
        <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17]">
          {typeIcons[property.property_type] || <Home className="w-6 h-6" />}
        </div>

        {/* Property info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-semibold">{property.name}</h2>
            <span className={`text-xs px-2 py-1 rounded-full ${
              property.status === 'active'
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
            }`}>
              {property.status === 'active' ? 'Active' : 'Pending'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#a1a1aa] mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {property.street}, {property.city}, {property.state} {property.zip}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#71717a]">
            {property.square_footage && (
              <>
                <span>{property.square_footage.toLocaleString()} sq ft</span>
                <span>•</span>
              </>
            )}
            <span>{property.service_plan?.name || 'No plan assigned'}</span>
          </div>
        </div>

        {/* Inspection info */}
        <div className="flex flex-col lg:items-end gap-2">
          {nextInspection ? (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#4cbb17]" />
              <span className="text-[#a1a1aa]">Next: {formatDate(nextInspection)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#71717a]" />
              <span className="text-[#71717a]">No upcoming inspection</span>
            </div>
          )}
          {lastInspection && (
            <div className="text-sm text-[#71717a]">
              Last inspected: {formatDate(lastInspection)}
            </div>
          )}
        </div>

        {/* Arrow */}
        <ArrowRight className="hidden lg:block w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] transition-colors" />
      </div>
    </Link>
  )
}
