import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
  Download,
} from 'lucide-react'

export default async function InspectionHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Mock data
  const inspection = {
    id,
    property: {
      id: '1',
      name: 'Lake House',
      address: '123 Lakefront Dr, Lake Ozark, MO 65049',
    },
    date: 'Dec 27, 2025',
    time: '9:15 AM',
    duration: '42 min',
    checklist: 'Premium Weekly',
    status: 'completed',
    checkIn: {
      time: '9:15 AM',
      verified: true,
    },
    checkOut: {
      time: '9:57 AM',
    },
    summary: {
      passed: 13,
      attention: 1,
      failed: 0,
      na: 1,
    },
    issues: [
      {
        id: '1',
        item: 'Check basement/crawl space',
        status: 'attention',
        notes: 'Minor moisture detected near water heater. Recommend monitoring.',
        photos: ['photo1.jpg'],
      },
    ],
    notes: 'Property in good overall condition. Moisture in basement should be monitored. Recommend customer consider dehumidifier.',
  }

  return (
    <div className="max-w-lg mx-auto pb-8">
      <Link
        href="/field/history"
        className="inline-flex items-center gap-2 text-[#a1a1aa] hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to history
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full">
            Completed
          </span>
          <span className="text-xs text-[#71717a]">{inspection.checklist}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{inspection.property.name}</h1>
        <p className="text-[#71717a]">{inspection.property.address}</p>
      </div>

      {/* Time Info */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#71717a] mb-1">Date</p>
            <p className="font-medium">{inspection.date}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a] mb-1">Check-in</p>
            <p className="font-medium">{inspection.checkIn.time}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a] mb-1">Duration</p>
            <p className="font-medium">{inspection.duration}</p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-500">{inspection.summary.passed}</p>
            <p className="text-xs text-green-500/70">Passed</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-500">{inspection.summary.attention}</p>
            <p className="text-xs text-yellow-500/70">Attention</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{inspection.summary.failed}</p>
            <p className="text-xs text-red-500/70">Failed</p>
          </div>
          <div className="text-center p-3 bg-[#27272a] rounded-lg">
            <span className="text-xl text-[#71717a]">—</span>
            <p className="text-lg font-bold">{inspection.summary.na}</p>
            <p className="text-xs text-[#71717a]">N/A</p>
          </div>
        </div>
      </section>

      {/* Issues */}
      {inspection.issues.length > 0 && (
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-4">Issues Found ({inspection.issues.length})</h2>
          <div className="space-y-3">
            {inspection.issues.map(issue => (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border ${
                  issue.status === 'attention'
                    ? 'border-yellow-500/20 bg-yellow-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {issue.status === 'attention' ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  )}
                  <p className="font-medium text-sm">{issue.item}</p>
                </div>
                {issue.notes && (
                  <p className="text-sm text-[#a1a1aa] ml-6">{issue.notes}</p>
                )}
                {issue.photos.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 ml-6">
                    <Camera className="w-4 h-4 text-[#71717a]" />
                    <span className="text-xs text-[#71717a]">
                      {issue.photos.length} photo{issue.photos.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Notes */}
      {inspection.notes && (
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-sm text-[#a1a1aa]">{inspection.notes}</p>
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a] transition-colors">
          <Download className="w-5 h-5" />
          Download PDF
        </button>
        <Link
          href={`/field/inspect/${id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#27272a] rounded-xl hover:bg-[#3f3f46] transition-colors"
        >
          View Full Report
        </Link>
      </div>
    </div>
  )
}
