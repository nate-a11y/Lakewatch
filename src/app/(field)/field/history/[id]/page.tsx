import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
} from 'lucide-react'
import DownloadButton from '@/components/buttons/DownloadButton'

export default async function InspectionHistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch inspection with details
  const { data: inspection, error } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, scheduled_time, status, overall_status, completed_at, notes,
      property:lwp_properties(id, name, street, city, state, zip),
      checklist:lwp_checklists(name),
      responses:lwp_inspections_responses(id, checklist_item_id, status, notes, photos),
      issues:lwp_inspections_issues(id, title, description, severity, status, photos)
    `)
    .eq('id', parseInt(id))
    .single()

  if (error || !inspection) {
    notFound()
  }

  const propertyData = inspection.property as { id: number; name: string; street: string; city: string; state: string; zip: string } | { id: number; name: string; street: string; city: string; state: string; zip: string }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
  const checklistData = inspection.checklist as { name: string } | { name: string }[] | null
  const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData
  const responses = (inspection.responses || []) as { id: number; checklist_item_id: number; status: string; notes: string; photos: string[] }[]
  const issues = (inspection.issues || []) as { id: number; title: string; description: string; severity: string; status: string; photos: string[] }[]

  // Calculate summary from responses
  const summary = {
    passed: responses.filter(r => r.status === 'pass').length,
    attention: responses.filter(r => r.status === 'attention').length,
    failed: responses.filter(r => r.status === 'fail').length,
    na: responses.filter(r => r.status === 'na').length,
  }

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatTime = (time: string | null) => {
    if (!time) return '—'
    const [hours, minutes] = time.split(':')
    const h = parseInt(hours)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const hour = h % 12 || 12
    return `${hour}:${minutes} ${ampm}`
  }

  // Calculate duration
  let duration = '—'
  if (inspection.completed_at && inspection.scheduled_time) {
    const scheduledDateTime = new Date(`${inspection.scheduled_date}T${inspection.scheduled_time}`)
    const completedDateTime = new Date(inspection.completed_at)
    const durationMinutes = Math.round((completedDateTime.getTime() - scheduledDateTime.getTime()) / 60000)
    if (durationMinutes > 0 && durationMinutes < 480) {
      duration = `${durationMinutes} min`
    }
  }

  const checkInTime = formatTime(inspection.scheduled_time)

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
            {inspection.status === 'completed' ? 'Completed' : inspection.status}
          </span>
          <span className="text-xs text-[#71717a]">{checklist?.name || 'Inspection'}</span>
        </div>
        <h1 className="text-2xl font-bold mb-1">{property?.name || 'Property'}</h1>
        <p className="text-[#71717a]">
          {property ? `${property.street}, ${property.city}, ${property.state} ${property.zip}` : ''}
        </p>
      </div>

      {/* Time Info */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-[#71717a] mb-1">Date</p>
            <p className="font-medium">{formatDate(inspection.scheduled_date)}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a] mb-1">Check-in</p>
            <p className="font-medium">{checkInTime}</p>
          </div>
          <div>
            <p className="text-xs text-[#71717a] mb-1">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-4">Summary</h2>
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-500">{summary.passed}</p>
            <p className="text-xs text-green-500/70">Passed</p>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-500">{summary.attention}</p>
            <p className="text-xs text-yellow-500/70">Attention</p>
          </div>
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <XCircle className="w-5 h-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{summary.failed}</p>
            <p className="text-xs text-red-500/70">Failed</p>
          </div>
          <div className="text-center p-3 bg-[#27272a] rounded-lg">
            <span className="text-xl text-[#71717a]">—</span>
            <p className="text-lg font-bold">{summary.na}</p>
            <p className="text-xs text-[#71717a]">N/A</p>
          </div>
        </div>
      </section>

      {/* Issues */}
      {issues.length > 0 && (
        <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 mb-4">
          <h2 className="font-semibold mb-4">Issues Found ({issues.length})</h2>
          <div className="space-y-3">
            {issues.map(issue => (
              <div
                key={issue.id}
                className={`p-3 rounded-lg border ${
                  issue.severity === 'critical' || issue.severity === 'high'
                    ? 'border-red-500/20 bg-red-500/5'
                    : 'border-yellow-500/20 bg-yellow-500/5'
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {issue.severity === 'critical' || issue.severity === 'high' ? (
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  <p className="font-medium text-sm">{issue.title}</p>
                </div>
                {issue.description && (
                  <p className="text-sm text-[#a1a1aa] ml-6">{issue.description}</p>
                )}
                {issue.photos && issue.photos.length > 0 && (
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
        <DownloadButton
          label="Download PDF"
          fileName={`inspection-${id}`}
          className="flex-1 px-4 py-3 border border-[#27272a] rounded-xl hover:bg-[#27272a]"
        />
        <Link
          href={`/manage/inspections/${id}`}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#27272a] rounded-xl hover:bg-[#3f3f46] transition-colors"
        >
          View Full Report
        </Link>
      </div>
    </div>
  )
}
