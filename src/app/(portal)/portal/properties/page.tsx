import Link from 'next/link'
import { Building2, MapPin, Home, Calendar, ArrowRight, Plus } from 'lucide-react'

interface Property {
  id: string
  name: string
  address: string
  type: string
  squareFootage: number
  status: string
  servicePlan: string
  nextInspection: string
  lastInspection: string
}

export default function PropertiesPage() {
  // Mock data - replace with actual API calls
  const properties = [
    {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
      type: 'house',
      squareFootage: 3500,
      status: 'active',
      servicePlan: 'Bi-weekly Standard',
      nextInspection: 'January 3, 2026',
      lastInspection: 'December 20, 2025',
    },
    {
      id: '2',
      name: 'Guest Cabin',
      address: '125 Lakefront Dr, Lake Ozark, MO 65049',
      type: 'cabin',
      squareFootage: 1200,
      status: 'active',
      servicePlan: 'Monthly Basic',
      nextInspection: 'January 15, 2026',
      lastInspection: 'December 15, 2025',
    },
  ]

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
      <div className="grid gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {properties.length === 0 && (
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

function PropertyCard({ property }: { property: Property }) {
  const typeIcons: Record<string, React.ReactNode> = {
    house: <Home className="w-5 h-5" />,
    cabin: <Home className="w-5 h-5" />,
    condo: <Building2 className="w-5 h-5" />,
    townhouse: <Building2 className="w-5 h-5" />,
  }

  return (
    <Link
      href={`/portal/properties/${property.id}`}
      className="block bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors group"
    >
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
        {/* Property icon */}
        <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17]">
          {typeIcons[property.type] || <Home className="w-6 h-6" />}
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
            <span className="text-sm">{property.address}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[#71717a]">
            <span>{property.squareFootage.toLocaleString()} sq ft</span>
            <span>•</span>
            <span>{property.servicePlan}</span>
          </div>
        </div>

        {/* Inspection info */}
        <div className="flex flex-col lg:items-end gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#4cbb17]" />
            <span className="text-[#a1a1aa]">Next: {property.nextInspection}</span>
          </div>
          <div className="text-sm text-[#71717a]">
            Last inspected: {property.lastInspection}
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="hidden lg:block w-5 h-5 text-[#71717a] group-hover:text-[#4cbb17] transition-colors" />
      </div>
    </Link>
  )
}
