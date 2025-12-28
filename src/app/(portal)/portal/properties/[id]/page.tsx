import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Key,
  Users,
  Zap,
  Edit,
  Plus,
} from 'lucide-react'

export default function PropertyDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Mock data - replace with actual API call
  const property = {
    id: params.id,
    name: 'Lake House',
    address: {
      street: '123 Lakefront Dr',
      city: 'Lake Ozark',
      state: 'MO',
      zip: '65049',
    },
    type: 'house',
    squareFootage: 3500,
    status: 'active',
    servicePlan: {
      name: 'Bi-weekly Standard',
      frequency: 'Every 2 weeks',
      nextInspection: 'January 3, 2026',
    },
    accessInfo: {
      gateCode: '1234',
      lockboxCode: '5678',
      alarmCode: '0000',
      alarmCompany: 'ADT',
      wifiNetwork: 'LakeHouse_5G',
      specialInstructions: 'Please check the dock area for any storm damage.',
    },
    contacts: [
      { name: 'John Smith (Neighbor)', phone: '(555) 123-4567', relationship: 'neighbor' },
      { name: 'Bob\'s HVAC', phone: '(555) 987-6543', relationship: 'contractor' },
    ],
    utilities: [
      { type: 'Electric', provider: 'Ameren', phone: '(800) 552-7583' },
      { type: 'Propane', provider: 'Lake Propane', phone: '(573) 555-1234' },
      { type: 'Internet', provider: 'Spectrum', phone: '(855) 707-7328' },
    ],
    recentInspections: [
      { id: '1', date: 'December 20, 2025', status: 'all_clear' },
      { id: '2', date: 'December 6, 2025', status: 'all_clear' },
      { id: '3', date: 'November 22, 2025', status: 'issues_found' },
    ],
  }

  const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state} ${property.address.zip}`

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back button */}
      <Link
        href="/portal/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17]">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">{property.name}</h1>
            <div className="flex items-center gap-2 text-[#a1a1aa]">
              <MapPin className="w-4 h-4" />
              <span>{fullAddress}</span>
            </div>
          </div>
        </div>
        <Link
          href={`/portal/properties/${property.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit Property
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Service Plan */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-[#4cbb17]" />
              <h2 className="text-lg font-semibold">Service Plan</h2>
            </div>
            <div className="bg-[#4cbb17]/10 border border-[#4cbb17]/20 rounded-lg p-4">
              <p className="font-medium text-lg">{property.servicePlan.name}</p>
              <p className="text-[#a1a1aa]">{property.servicePlan.frequency}</p>
              <p className="text-sm text-[#71717a] mt-2">
                Next inspection: {property.servicePlan.nextInspection}
              </p>
            </div>
          </section>

          {/* Access Information */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Access Information</h2>
              </div>
              <Link
                href={`/portal/properties/${property.id}/edit#access`}
                className="text-[#4cbb17] text-sm hover:underline"
              >
                Edit
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoItem label="Gate Code" value={property.accessInfo.gateCode} masked />
              <InfoItem label="Lockbox Code" value={property.accessInfo.lockboxCode} masked />
              <InfoItem label="Alarm Code" value={property.accessInfo.alarmCode} masked />
              <InfoItem label="Alarm Company" value={property.accessInfo.alarmCompany} />
              <InfoItem label="WiFi Network" value={property.accessInfo.wifiNetwork} />
            </div>
            {property.accessInfo.specialInstructions && (
              <div className="mt-4 pt-4 border-t border-[#27272a]">
                <p className="text-sm text-[#71717a] mb-1">Special Instructions</p>
                <p className="text-[#a1a1aa]">{property.accessInfo.specialInstructions}</p>
              </div>
            )}
          </section>

          {/* Recent Inspections */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Recent Inspections</h2>
              </div>
              <Link
                href="/portal/reports"
                className="text-[#4cbb17] text-sm hover:underline"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {property.recentInspections.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/portal/reports/${inspection.id}`}
                  className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <span>{inspection.date}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    inspection.status === 'all_clear'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {inspection.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Details */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="space-y-3">
              <InfoItem label="Type" value={property.type} />
              <InfoItem label="Square Footage" value={`${property.squareFootage.toLocaleString()} sq ft`} />
              <InfoItem label="Status" value={property.status} />
            </div>
          </section>

          {/* Emergency Contacts */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Contacts</h2>
              </div>
              <button className="text-[#4cbb17] text-sm hover:underline">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {property.contacts.map((contact, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-[#71717a]">{contact.phone}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Utilities */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#4cbb17]" />
                <h2 className="text-lg font-semibold">Utilities</h2>
              </div>
              <button className="text-[#4cbb17] text-sm hover:underline">
                <Plus className="w-4 h-4 inline" /> Add
              </button>
            </div>
            <div className="space-y-3">
              {property.utilities.map((utility, i) => (
                <div key={i} className="text-sm">
                  <p className="font-medium">{utility.type}</p>
                  <p className="text-[#71717a]">{utility.provider} • {utility.phone}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

function InfoItem({
  label,
  value,
  masked = false,
}: {
  label: string
  value: string
  masked?: boolean
}) {
  return (
    <div>
      <p className="text-sm text-[#71717a]">{label}</p>
      <p className="font-medium">
        {masked ? '••••••' : value}
      </p>
    </div>
  )
}
