import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  MapPin,
  User,
  Thermometer,
  Cloud,
  Download,
  Camera,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'

export default function ReportDetailPage({
  params,
}: {
  params: { id: string }
}) {
  // Mock data - replace with actual API call
  const report = {
    id: params.id,
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    date: 'December 20, 2025',
    status: 'all_clear',
    technician: 'Mike Thompson',
    checkIn: '9:15 AM',
    checkOut: '10:32 AM',
    weather: {
      temperature: 42,
      conditions: 'Partly Cloudy',
    },
    summary: 'Completed standard bi-weekly inspection. All systems are functioning properly. No issues found during this visit. Property is well-maintained and secure.',
    checklist: [
      {
        category: 'Exterior',
        items: [
          { item: 'Check exterior doors and locks', response: 'pass', notes: '' },
          { item: 'Inspect windows for damage', response: 'pass', notes: '' },
          { item: 'Check for signs of pests or animals', response: 'pass', notes: '' },
          { item: 'Inspect roof visible from ground', response: 'pass', notes: '' },
          { item: 'Check gutters and downspouts', response: 'pass', notes: '' },
          { item: 'Inspect deck/patio condition', response: 'pass', notes: '' },
        ],
      },
      {
        category: 'HVAC',
        items: [
          { item: 'Check thermostat settings', response: 'pass', notes: 'Set to 55°F' },
          { item: 'Verify HVAC is operating', response: 'pass', notes: '' },
          { item: 'Check air filters', response: 'pass', notes: 'Filters clean' },
          { item: 'Listen for unusual sounds', response: 'pass', notes: '' },
        ],
      },
      {
        category: 'Plumbing',
        items: [
          { item: 'Check under all sinks for leaks', response: 'pass', notes: '' },
          { item: 'Flush toilets', response: 'pass', notes: '' },
          { item: 'Run water in all faucets', response: 'pass', notes: '' },
          { item: 'Check water heater', response: 'pass', notes: 'Operating normally' },
          { item: 'Inspect washing machine connections', response: 'pass', notes: '' },
        ],
      },
      {
        category: 'Electrical',
        items: [
          { item: 'Test smoke detectors', response: 'pass', notes: '' },
          { item: 'Test CO detectors', response: 'pass', notes: '' },
          { item: 'Check GFI outlets', response: 'pass', notes: '' },
          { item: 'Verify lights are working', response: 'pass', notes: '' },
        ],
      },
      {
        category: 'Security',
        items: [
          { item: 'Verify alarm system status', response: 'pass', notes: 'Armed and functioning' },
          { item: 'Check all door locks', response: 'pass', notes: '' },
          { item: 'Inspect garage door', response: 'pass', notes: '' },
        ],
      },
    ],
    issues: [],
    photos: [
      { id: '1', caption: 'Front exterior', url: '/placeholder-house.jpg' },
      { id: '2', caption: 'Back deck', url: '/placeholder-deck.jpg' },
      { id: '3', caption: 'Thermostat reading', url: '/placeholder-thermostat.jpg' },
    ],
  }

  const totalItems = report.checklist.reduce((acc, cat) => acc + cat.items.length, 0)
  const passedItems = report.checklist.reduce(
    (acc, cat) => acc + cat.items.filter(i => i.response === 'pass').length,
    0
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <Link
        href="/portal/reports"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to reports
      </Link>

      {/* Header */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{report.property.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm ${
                report.status === 'all_clear'
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-yellow-500/10 text-yellow-500'
              }`}>
                {report.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
              </span>
            </div>
            <p className="text-[#a1a1aa] flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {report.property.address}
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors">
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-[#71717a] mb-1">Date</p>
            <p className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#4cbb17]" />
              {report.date}
            </p>
          </div>
          <div>
            <p className="text-[#71717a] mb-1">Time</p>
            <p className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#4cbb17]" />
              {report.checkIn} - {report.checkOut}
            </p>
          </div>
          <div>
            <p className="text-[#71717a] mb-1">Technician</p>
            <p className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#4cbb17]" />
              {report.technician}
            </p>
          </div>
          <div>
            <p className="text-[#71717a] mb-1">Weather</p>
            <p className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#4cbb17]" />
              {report.weather.temperature}°F
            </p>
          </div>
          <div>
            <p className="text-[#71717a] mb-1">Conditions</p>
            <p className="flex items-center gap-2">
              <Cloud className="w-4 h-4 text-[#4cbb17]" />
              {report.weather.conditions}
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Summary</h2>
        <p className="text-[#a1a1aa]">{report.summary}</p>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-[#27272a]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <span className="text-sm">
              <strong>{passedItems}</strong> of <strong>{totalItems}</strong> items passed
            </span>
          </div>
          {report.issues.length > 0 && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm">
                <strong>{report.issues.length}</strong> issues found
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Issues (if any) */}
      {report.issues.length > 0 && (
        <section className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Issues Found
          </h2>
          {/* Issues list would go here */}
        </section>
      )}

      {/* Checklist */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Inspection Checklist</h2>
        <div className="space-y-6">
          {report.checklist.map((category) => (
            <div key={category.category}>
              <h3 className="text-[#4cbb17] font-medium mb-3">{category.category}</h3>
              <div className="space-y-2">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-[#0a0a0a] rounded-lg"
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.response === 'pass'
                        ? 'bg-green-500/20 text-green-500'
                        : item.response === 'fail'
                        ? 'bg-red-500/20 text-red-500'
                        : item.response === 'needs_attention'
                        ? 'bg-yellow-500/20 text-yellow-500'
                        : 'bg-[#27272a] text-[#71717a]'
                    }`}>
                      {item.response === 'pass' ? (
                        <Check className="w-4 h-4" />
                      ) : item.response === 'fail' ? (
                        <X className="w-4 h-4" />
                      ) : item.response === 'needs_attention' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">N/A</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{item.item}</p>
                      {item.notes && (
                        <p className="text-xs text-[#71717a] mt-1">{item.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Photos */}
      {report.photos.length > 0 && (
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#4cbb17]" />
            Photos ({report.photos.length})
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {report.photos.map((photo) => (
              <div key={photo.id} className="aspect-video bg-[#27272a] rounded-lg overflow-hidden relative group cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center text-[#71717a]">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-xs text-white">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
