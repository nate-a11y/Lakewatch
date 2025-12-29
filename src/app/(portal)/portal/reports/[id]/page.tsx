import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
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
  Check,
  X,
  AlertCircle,
  MessageCircle,
} from 'lucide-react'
import DownloadPDFButton from './DownloadPDFButton'
import ReportPhotoGallery from './ReportPhotoGallery'
import { GPSVerificationBadge } from '@/components/portal/GPSVerificationBadge'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  // Get user data
  const { data: userData } = await supabase
    .from('lwp_users')
    .select('id, role')
    .eq('supabase_id', user.id)
    .single()

  // Get inspection with all details
  const { data: inspection } = await supabase
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties!property_id(
        id, name, street, city, state, zip,
        owner:lwp_users!owner_id(id, first_name, last_name)
      ),
      technician:lwp_users!technician_id(id, first_name, last_name)
    `)
    .eq('id', parseInt(id))
    .single()

  if (!inspection) {
    notFound()
  }

  // Check access
  const property = Array.isArray(inspection.property)
    ? inspection.property[0]
    : inspection.property
  const owner = property?.owner
  const ownerData = Array.isArray(owner) ? owner[0] : owner

  // Allow access for admins or the property owner
  const isAdmin = userData?.role && ['admin', 'owner', 'staff'].includes(userData.role)
  if (!isAdmin && ownerData?.id !== userData?.id) {
    notFound()
  }

  const technician = Array.isArray(inspection.technician)
    ? inspection.technician[0]
    : inspection.technician

  // Build report from real data
  const report = {
    id,
    property: {
      id: property?.id || '',
      name: property?.name || 'Property',
      address: `${property?.street || ''}, ${property?.city || ''}, ${property?.state || 'MO'} ${property?.zip || ''}`,
    },
    date: new Date(inspection.scheduled_date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    status: inspection.overall_status === 'good' ? 'all_clear' : 'issues_found',
    technician: technician ? `${technician.first_name} ${technician.last_name}` : 'N/A',
    checkIn: inspection.check_in_time
      ? new Date(inspection.check_in_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : 'N/A',
    checkOut: inspection.check_out_time
      ? new Date(inspection.check_out_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      : 'N/A',
    weather: inspection.weather || { temperature: null, conditions: null },
    summary: inspection.summary || 'No summary provided.',
    checklist: (() => {
      const responses = (inspection.checklist_responses || []) as Array<{ category?: string; item?: string; response?: string; notes?: string }>
      const categories = [...new Set(responses.map((r) => r.category || 'General'))] as string[]
      return categories.map(category => ({
        category,
        items: responses.filter((r) => (r.category || 'General') === category),
      }))
    })() as Array<{ category: string; items: Array<{ item?: string; response?: string; notes?: string }> }>,
    issues: inspection.issues_found || [],
    photos: inspection.photos || [],
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
          <DownloadPDFButton inspectionId={id} />
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
          {report.weather?.temperature && (
            <div>
              <p className="text-[#71717a] mb-1">Weather</p>
              <p className="flex items-center gap-2">
                <Thermometer className="w-4 h-4 text-[#4cbb17]" />
                {report.weather.temperature}°F
              </p>
            </div>
          )}
          {report.weather?.conditions && (
            <div>
              <p className="text-[#71717a] mb-1">Conditions</p>
              <p className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-[#4cbb17]" />
                {report.weather.conditions}
              </p>
            </div>
          )}
        </div>

        {/* GPS Verification */}
        <GPSVerificationBadge
          verified={!!inspection.check_in_time && !!inspection.check_out_time}
          checkInTime={inspection.check_in_time}
          checkOutTime={inspection.check_out_time}
          location={inspection.gps_location ? {
            lat: inspection.gps_location.lat,
            lng: inspection.gps_location.lng,
            address: report.property.address,
          } : undefined}
          className="mt-4"
        />
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
          <div className="space-y-4">
            {report.issues.map((issue: { severity?: string; description?: string; action_taken?: string }, idx: number) => (
              <div key={idx} className="p-4 bg-black/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    issue.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                    issue.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                    issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {issue.severity || 'low'}
                  </span>
                  <div className="flex-1">
                    <p className="text-white">{issue.description}</p>
                    {issue.action_taken && (
                      <p className="text-sm text-[#a1a1aa] mt-2">
                        <strong>Action taken:</strong> {issue.action_taken}
                      </p>
                    )}
                    <Link
                      href={`/portal/messages/new?subject=${encodeURIComponent(`Question about ${report.property.name} inspection on ${report.date}`)}&body=${encodeURIComponent(`I have a question about the issue: "${issue.description}"\n\n`)}`}
                      className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#4cbb17] hover:underline"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Ask About This
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Checklist */}
      {report.checklist.length > 0 && (
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
      )}

      {/* Photos with Lightbox */}
      <ReportPhotoGallery photos={report.photos} />
    </div>
  )
}
