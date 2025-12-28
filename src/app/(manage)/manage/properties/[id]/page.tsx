import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  MapPin,
  User,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Edit,
  Thermometer,
  Droplets,
  Wind,
  Camera,
} from 'lucide-react'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const property = {
    id,
    name: 'Lake House',
    address: '123 Lakefront Dr',
    city: 'Lake Ozark',
    state: 'MO',
    zip: '65049',
    customer: {
      id: '5',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.customer@example.com',
      phone: '(314) 555-1001',
    },
    plan: 'Premium',
    status: 'active',
    gateCode: '1234',
    accessNotes: 'Key under mat. Dog is friendly.',
    propertyNotes: 'Check boat dock after storms. Watch for flooding in basement during heavy rain.',
    createdAt: 'June 15, 2024',
    lastInspection: {
      id: '1',
      date: 'Dec 20, 2025',
      status: 'completed',
      technician: 'Mike Johnson',
      issues: 0,
    },
    nextInspection: {
      date: 'Jan 3, 2026',
      technician: 'Mike Johnson',
    },
    recentInspections: [
      { id: '1', date: 'Dec 20, 2025', status: 'completed', issues: 0 },
      { id: '2', date: 'Dec 6, 2025', status: 'completed', issues: 1 },
      { id: '3', date: 'Nov 22, 2025', status: 'completed', issues: 0 },
    ],
    openRequests: [
      { id: '1', title: 'Gutter cleaning needed', priority: 'medium', date: 'Dec 18, 2025' },
    ],
    checklist: {
      name: 'Premium Lake House Checklist',
      items: 24,
    },
    sensors: {
      temperature: 68,
      humidity: 45,
      lastReading: '2 hours ago',
    },
    recentPhotos: [
      { id: '1', url: '/placeholder.jpg', caption: 'Front entrance', date: 'Dec 20, 2025' },
      { id: '2', url: '/placeholder.jpg', caption: 'Dock area', date: 'Dec 20, 2025' },
      { id: '3', url: '/placeholder.jpg', caption: 'Back patio', date: 'Dec 20, 2025' },
    ],
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/manage/properties"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to properties
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-[#27272a] rounded-xl flex items-center justify-center">
            <Building2 className="w-8 h-8 text-[#71717a]" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              {property.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                property.status === 'active'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-[#27272a] text-[#71717a]'
              }`}>
                {property.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                property.plan === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                property.plan === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {property.plan}
              </span>
              <span className="text-sm">Since {property.createdAt}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/manage/inspections/new?property=${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            New Inspection
          </Link>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location & Access */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Location & Access</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#71717a] mt-0.5" />
                <div>
                  <p className="text-sm text-[#71717a]">Address</p>
                  <p>{property.address}</p>
                  <p>{property.city}, {property.state} {property.zip}</p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[#71717a]">Gate Code</p>
                  <p className="font-mono">{property.gateCode}</p>
                </div>
                <div>
                  <p className="text-sm text-[#71717a]">Access Notes</p>
                  <p className="text-sm">{property.accessNotes}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Customer */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Owner</h2>
            <Link
              href={`/manage/customers/${property.customer.id}`}
              className="flex items-center gap-4 p-4 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-12 h-12 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17] font-bold">
                {property.customer.firstName[0]}{property.customer.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {property.customer.firstName} {property.customer.lastName}
                </p>
                <p className="text-sm text-[#71717a]">{property.customer.email}</p>
                <p className="text-sm text-[#71717a]">{property.customer.phone}</p>
              </div>
            </Link>
          </section>

          {/* Recent Inspections */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Inspections</h2>
              <Link href={`/manage/inspections?property=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {property.recentInspections.map((inspection) => (
                <Link
                  key={inspection.id}
                  href={`/manage/inspections/${inspection.id}`}
                  className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardCheck className="w-4 h-4 text-[#71717a]" />
                    <div>
                      <p className="text-sm font-medium">{inspection.date}</p>
                      <p className="text-xs text-[#71717a]">
                        {inspection.issues === 0 ? 'No issues found' : `${inspection.issues} issue(s) found`}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                    inspection.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {inspection.status}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Open Service Requests */}
          {property.openRequests.length > 0 && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Open Service Requests</h2>
                <Link href={`/manage/requests?property=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {property.openRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/manage/requests/${request.id}`}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-4 h-4 ${
                        request.priority === 'high' ? 'text-red-500' :
                        request.priority === 'medium' ? 'text-yellow-500' :
                        'text-[#71717a]'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-[#71717a]">{request.date}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                      request.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                      'bg-[#27272a] text-[#71717a]'
                    }`}>
                      {request.priority}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Next Inspection */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Next Inspection</h2>
            <div className="flex items-center gap-3 p-3 bg-[#4cbb17]/10 rounded-lg border border-[#4cbb17]/20">
              <Calendar className="w-5 h-5 text-[#4cbb17]" />
              <div>
                <p className="font-medium text-[#4cbb17]">{property.nextInspection.date}</p>
                <p className="text-sm text-[#a1a1aa]">{property.nextInspection.technician}</p>
              </div>
            </div>
          </section>

          {/* Sensors */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Sensors</h2>
              <span className="text-xs text-[#71717a]">{property.sensors.lastReading}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Thermometer className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="text-sm text-[#71717a]">Temp</p>
                  <p className="font-semibold">{property.sensors.temperature}°F</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplets className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-[#71717a]">Humidity</p>
                  <p className="font-semibold">{property.sensors.humidity}%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Checklist</h2>
            <Link
              href={`/manage/checklists?property=${id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <FileText className="w-5 h-5 text-[#71717a]" />
              <div>
                <p className="text-sm font-medium">{property.checklist.name}</p>
                <p className="text-xs text-[#71717a]">{property.checklist.items} items</p>
              </div>
            </Link>
          </section>

          {/* Property Notes */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <button className="text-sm text-[#4cbb17] hover:underline">Edit</button>
            </div>
            <p className="text-sm text-[#a1a1aa]">{property.propertyNotes}</p>
          </section>

          {/* Recent Photos */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Photos</h2>
              <Link href={`/manage/properties/${id}/photos`} className="text-sm text-[#4cbb17] hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {property.recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="aspect-square bg-[#27272a] rounded-lg flex items-center justify-center"
                >
                  <Camera className="w-6 h-6 text-[#71717a]" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
