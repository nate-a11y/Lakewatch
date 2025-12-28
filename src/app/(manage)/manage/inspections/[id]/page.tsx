import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ClipboardCheck,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Camera,
} from 'lucide-react'
import InspectionActionButtons from './InspectionActionButtons'

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch inspection with related data
  const { data: inspection, error } = await supabase
    .from('lwp_inspections')
    .select(`
      *,
      property:lwp_properties(id, name, street, city, state, zip, owner_id),
      technician:lwp_users!technician_id(id, first_name, last_name),
      checklist:lwp_checklists(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !inspection) {
    notFound()
  }

  // Get property owner
  const propertyData = inspection.property as { id: number; name: string; street: string; city: string; state: string; zip: string; owner_id: number } | { id: number; name: string; street: string; city: string; state: string; zip: string; owner_id: number }[] | null
  const property = Array.isArray(propertyData) ? propertyData[0] : propertyData

  let customer = null
  if (property?.owner_id) {
    const { data: ownerData } = await supabase
      .from('lwp_users')
      .select('id, first_name, last_name, email')
      .eq('id', property.owner_id)
      .single()
    customer = ownerData
  }

  // Get checklist responses
  const { data: responses } = await supabase
    .from('lwp_inspections_responses')
    .select('*')
    .eq('_parent_id', id)
    .order('_order')

  // Get issues
  const { data: issues } = await supabase
    .from('lwp_inspections_issues')
    .select('*')
    .eq('_parent_id', id)
    .order('_order')

  const techData = inspection.technician as { id: number; first_name: string; last_name: string } | { id: number; first_name: string; last_name: string }[] | null
  const technician = Array.isArray(techData) ? techData[0] : techData

  const checklistData = inspection.checklist as { id: number; name: string } | { id: number; name: string }[] | null
  const checklist = Array.isArray(checklistData) ? checklistData[0] : checklistData

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Calculate duration if check-in and check-out times exist
  let duration = ''
  if (inspection.check_in_time && inspection.check_out_time) {
    const checkIn = new Date(inspection.check_in_time)
    const checkOut = new Date(inspection.check_out_time)
    const diffMs = checkOut.getTime() - checkIn.getTime()
    const diffMins = Math.round(diffMs / 60000)
    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      duration = `${hours}h ${mins}m`
    } else {
      duration = `${diffMins} min`
    }
  }

  // Build checklist items from responses
  const checklistItems = (responses || []).map(r => ({
    id: r.id.toString(),
    name: r.item,
    category: r.category,
    status: r.response as 'pass' | 'issue' | 'fail',
    notes: r.notes || ''
  }))

  // Add issues as additional items
  const issueItems = (issues || []).map(iss => ({
    id: `issue-${iss.id}`,
    name: iss.title,
    category: iss.category || 'Issue',
    status: 'issue' as const,
    notes: iss.description || ''
  }))

  const allItems = checklistItems.length > 0 ? checklistItems : issueItems

  const passCount = allItems.filter(i => i.status === 'pass').length
  const issueCount = allItems.filter(i => i.status === 'issue').length
  const failCount = allItems.filter(i => i.status === 'fail').length

  const weather = inspection.weather_conditions
    ? `${inspection.weather_conditions}${inspection.weather_temp ? `, ${inspection.weather_temp}°F` : ''}`
    : null

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
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            inspection.status === 'completed' ? 'bg-green-500/10' :
            inspection.status === 'scheduled' ? 'bg-blue-500/10' :
            'bg-yellow-500/10'
          }`}>
            <ClipboardCheck className={`w-8 h-8 ${
              inspection.status === 'completed' ? 'text-green-500' :
              inspection.status === 'scheduled' ? 'text-blue-500' :
              'text-yellow-500'
            }`} />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">
              Inspection #{id}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[#a1a1aa]">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                inspection.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                inspection.status === 'scheduled' ? 'bg-blue-500/10 text-blue-400' :
                inspection.status === 'missed' ? 'bg-red-500/10 text-red-500' :
                'bg-yellow-500/10 text-yellow-500'
              }`}>
                {inspection.status}
              </span>
              <span className="text-sm">{formatDate(inspection.scheduled_date)} at {formatTime(inspection.scheduled_time)}</span>
            </div>
          </div>
        </div>
        <InspectionActionButtons inspectionId={id} customerId={customer?.id || 0} />
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
              {duration && (
                <div>
                  <p className="text-[#71717a]">Duration</p>
                  <p>{duration}</p>
                </div>
              )}
              {weather && (
                <div>
                  <p className="text-[#71717a]">Weather</p>
                  <p>{weather}</p>
                </div>
              )}
            </div>
          </section>

          {/* Checklist */}
          {allItems.length > 0 && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Checklist: {checklist?.name || 'Default'}</h2>
                <span className="text-sm text-[#71717a]">
                  {passCount}/{allItems.length} passed
                </span>
              </div>
              <div className="space-y-2">
                {allItems.map((item) => (
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
          )}

          {/* Photos placeholder */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Photos</h2>
            </div>
            <div className="text-center py-8">
              <Camera className="w-12 h-12 text-[#27272a] mx-auto mb-2" />
              <p className="text-[#71717a] text-sm">No photos attached</p>
            </div>
          </section>

          {/* Notes */}
          {(inspection.summary || inspection.internal_notes) && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Technician Notes</h2>
              <p className="text-[#a1a1aa]">{inspection.summary || inspection.internal_notes}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property */}
          {property && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Property</h2>
              <Link
                href={`/manage/properties/${property.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#27272a] rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-[#71717a]" />
                </div>
                <div>
                  <p className="font-medium">{property.name}</p>
                  <p className="text-sm text-[#71717a]">{property.street}, {property.city}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Customer */}
          {customer && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Customer</h2>
              <Link
                href={`/manage/customers/${customer.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-[#4cbb17]/10 rounded-lg flex items-center justify-center text-[#4cbb17] font-bold">
                  {(customer.first_name?.[0] || '?')}{(customer.last_name?.[0] || '')}
                </div>
                <div>
                  <p className="font-medium">
                    {customer.first_name} {customer.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">{customer.email}</p>
                </div>
              </Link>
            </section>
          )}

          {/* Technician */}
          {technician && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Technician</h2>
              <Link
                href={`/manage/team/${technician.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-bold">
                  {(technician.first_name?.[0] || '?')}{(technician.last_name?.[0] || '')}
                </div>
                <div>
                  <p className="font-medium">
                    {technician.first_name} {technician.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">Technician</p>
                </div>
              </Link>
            </section>
          )}

          {/* Details */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-[#71717a]" />
                <span>{formatDate(inspection.scheduled_date)}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#71717a]" />
                <span>{formatTime(inspection.scheduled_time)}{duration ? ` (${duration})` : ''}</span>
              </div>
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-4 h-4 text-[#71717a]" />
                <span>{checklist?.name || 'Default Checklist'}</span>
              </div>
            </div>
          </section>

          {/* Overall Status */}
          {inspection.overall_status && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{inspection.overall_status}</span>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
