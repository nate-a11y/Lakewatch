import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardCheck,
  Building2,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  MessageSquare,
  Edit,
  Download,
} from 'lucide-react'

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data - replace with actual API call
  const inspection = {
    id,
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    customer: {
      id: '5',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.customer@example.com',
    },
    technician: {
      id: '3',
      firstName: 'Mike',
      lastName: 'Johnson',
    },
    date: 'Dec 27, 2025',
    time: '9:00 AM',
    duration: '45 min',
    status: 'completed',
    checklist: 'Premium Weekly',
    checklistItems: [
      { id: '1', name: 'Check all exterior doors and locks', status: 'pass', notes: '' },
      { id: '2', name: 'Inspect windows for damage or leaks', status: 'pass', notes: '' },
      { id: '3', name: 'Check HVAC system operation', status: 'pass', notes: 'Thermostat set to 68°F' },
      { id: '4', name: 'Inspect water heater', status: 'pass', notes: '' },
      { id: '5', name: 'Check for water leaks (sinks, toilets)', status: 'pass', notes: '' },
      { id: '6', name: 'Inspect basement/crawl space', status: 'issue', notes: 'Minor moisture detected - recommend dehumidifier' },
      { id: '7', name: 'Check sump pump operation', status: 'pass', notes: '' },
      { id: '8', name: 'Inspect roof and gutters', status: 'pass', notes: '' },
      { id: '9', name: 'Check boat dock', status: 'pass', notes: 'All cleats secure' },
      { id: '10', name: 'Test smoke/CO detectors', status: 'pass', notes: '' },
      { id: '11', name: 'Check security system', status: 'pass', notes: '' },
      { id: '12', name: 'Inspect landscaping', status: 'pass', notes: '' },
    ],
    photos: [
      { id: '1', caption: 'Front entrance', category: 'exterior' },
      { id: '2', caption: 'Basement moisture', category: 'issue' },
      { id: '3', caption: 'Dock area', category: 'exterior' },
      { id: '4', caption: 'HVAC thermostat', category: 'systems' },
    ],
    notes: 'Overall property in good condition. Recommend customer address basement moisture with dehumidifier before next visit. Dock is secure and ready for winter.',
    weather: 'Clear, 45°F',
    signature: true,
  }

  const passCount = inspection.checklistItems.filter(i => i.status === 'pass').length
  const issueCount = inspection.checklistItems.filter(i => i.status === 'issue').length
  const failCount = inspection.checklistItems.filter(i => i.status === 'fail').length

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/manage/inspections"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to inspections
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-xl flex items-center justify-center">
            <ClipboardCheck className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              Inspection #{id}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                inspection.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                {inspection.status}
              </span>
              <span className="text-sm">{inspection.date} at {inspection.time}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <Download className="w-4 h-4" />
            Export PDF
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors">
            <MessageSquare className="w-4 h-4" />
            Message
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Summary</h2>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-500">{passCount}</p>
                <p className="text-xs text-[#71717a]">Passed</p>
              </div>
              <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-yellow-500">{issueCount}</p>
                <p className="text-xs text-[#71717a]">Issues</p>
              </div>
              <div className="text-center p-3 bg-red-500/10 rounded-lg">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="text-2xl font-bold text-red-500">{failCount}</p>
                <p className="text-xs text-[#71717a]">Failed</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#71717a]">Duration</p>
                <p>{inspection.duration}</p>
              </div>
              <div>
                <p className="text-[#71717a]">Weather</p>
                <p>{inspection.weather}</p>
              </div>
            </div>
          </section>

          {/* Checklist */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Checklist: {inspection.checklist}</h2>
              <span className="text-sm text-[#71717a]">
                {passCount}/{inspection.checklistItems.length} passed
              </span>
            </div>
            <div className="space-y-2">
              {inspection.checklistItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.status === 'pass' ? 'bg-black/30' :
                    item.status === 'issue' ? 'bg-yellow-500/5 border border-yellow-500/20' :
                    'bg-red-500/5 border border-red-500/20'
                  }`}
                >
                  {item.status === 'pass' ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                  ) : item.status === 'issue' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.name}</p>
                    {item.notes && (
                      <p className="text-sm text-[#a1a1aa] mt-1">{item.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Photos */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Photos ({inspection.photos.length})</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {inspection.photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-[#27272a] rounded-lg flex items-center justify-center">
                    <Camera className="w-8 h-8 text-[#71717a]" />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                    <p className="text-xs truncate">{photo.caption}</p>
                  </div>
                  {photo.category === 'issue' && (
                    <div className="absolute top-2 right-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Notes */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Technician Notes</h2>
            <p className="text-[#a1a1aa]">{inspection.notes}</p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Property</h2>
            <Link
              href={`/manage/properties/${inspection.property.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#71717a]" />
              </div>
              <div>
                <p className="font-medium">{inspection.property.name}</p>
                <p className="text-sm text-[#71717a]">{inspection.property.address}</p>
              </div>
            </Link>
          </section>

          {/* Customer */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Customer</h2>
            <Link
              href={`/manage/customers/${inspection.customer.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                {inspection.customer.firstName[0]}{inspection.customer.lastName[0]}
              </div>
              <div>
                <p className="font-medium">
                  {inspection.customer.firstName} {inspection.customer.lastName}
                </p>
                <p className="text-sm text-[#71717a]">{inspection.customer.email}</p>
              </div>
            </Link>
          </section>

          {/* Technician */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Technician</h2>
            <Link
              href={`/manage/team/${inspection.technician.id}`}
              className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                {inspection.technician.firstName[0]}{inspection.technician.lastName[0]}
              </div>
              <div>
                <p className="font-medium">
                  {inspection.technician.firstName} {inspection.technician.lastName}
                </p>
                <p className="text-sm text-[#71717a]">Technician</p>
              </div>
            </Link>
          </section>

          {/* Details */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#71717a]" />
                <span>{inspection.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#71717a]" />
                <span>{inspection.time} ({inspection.duration})</span>
              </div>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-4 h-4 text-[#71717a]" />
                <span>{inspection.checklist}</span>
              </div>
            </div>
          </section>

          {/* Signature */}
          {inspection.signature && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Digitally signed</span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
