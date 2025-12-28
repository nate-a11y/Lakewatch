import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  ClipboardCheck,
  AlertTriangle,
  FileText,
  Edit,
  Thermometer,
  Droplets,
  Camera,
} from 'lucide-react'
import EditableNotes from '@/components/EditableNotes'

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch property with owner and service plan
  const { data: property, error } = await supabase
    .from('lwp_properties')
    .select(`
      *,
      owner:lwp_users!owner_id(id, first_name, last_name, email, phone),
      service_plan:lwp_service_plans(id, name)
    `)
    .eq('id', id)
    .single()

  if (error || !property) {
    notFound()
  }

  // Fetch recent inspections for this property
  const { data: inspections } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status, overall_status,
      technician:lwp_users!technician_id(first_name, last_name),
      issues:lwp_inspections_issues(count)
    `)
    .eq('property_id', id)
    .order('scheduled_date', { ascending: false })
    .limit(5)

  // Fetch open service requests for this property
  const { data: openRequests } = await supabase
    .from('lwp_service_requests')
    .select('id, title, priority, created_at')
    .eq('property_id', id)
    .in('status', ['pending', 'in_progress', 'scheduled'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch checklist assigned to this property (based on property type)
  const { data: checklist } = await supabase
    .from('lwp_checklists')
    .select('id, name, items:lwp_checklists_items(count)')
    .or(`property_type.eq.${property.property_type},is_default.eq.true`)
    .limit(1)
    .single()

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  // Get owner data
  const ownerData = property.owner as { id: number; first_name: string; last_name: string; email: string; phone: string } | { id: number; first_name: string; last_name: string; email: string; phone: string }[] | null
  const owner = Array.isArray(ownerData) ? ownerData[0] : ownerData

  // Get plan data
  const planData = property.service_plan as { id: number; name: string } | { id: number; name: string }[] | null
  const plan = Array.isArray(planData) ? planData[0] : planData

  // Get next scheduled inspection
  const upcomingInspections = (inspections || []).filter(i => i.status === 'scheduled')
  const nextInspection = upcomingInspections[0]

  // Get recent completed inspections
  const recentCompleted = (inspections || []).filter(i => i.status === 'completed').slice(0, 3)

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
                {property.status || 'active'}
              </span>
              <span className={`text-xs px-2 py-1 rounded ${
                plan?.name === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                plan?.name === 'Standard' ? 'bg-blue-500/10 text-blue-400' :
                'bg-[#27272a] text-[#a1a1aa]'
              }`}>
                {plan?.name || 'No plan'}
              </span>
              <span className="text-sm">Since {formatDate(property.created_at)}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/manage/schedule/new?property=${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#4cbb17] text-black font-semibold rounded-lg hover:bg-[#60e421] transition-colors"
          >
            <ClipboardCheck className="w-4 h-4" />
            Schedule Inspection
          </Link>
          <Link
            href={`/manage/properties/${id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
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
                  <p>{property.street}</p>
                  <p>{property.city}, {property.state} {property.zip}</p>
                </div>
              </div>
              <div className="space-y-3">
                {property.gate_code && (
                  <div>
                    <p className="text-sm text-[#71717a]">Gate Code</p>
                    <p className="font-mono">{property.gate_code}</p>
                  </div>
                )}
                {property.special_instructions && (
                  <div>
                    <p className="text-sm text-[#71717a]">Access Notes</p>
                    <p className="text-sm">{property.special_instructions}</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Customer */}
          {owner && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Owner</h2>
              <Link
                href={`/manage/customers/${owner.id}`}
                className="flex items-center gap-4 p-4 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <div className="w-12 h-12 bg-[#4cbb17]/10 rounded-xl flex items-center justify-center text-[#4cbb17] font-bold">
                  {(owner.first_name?.[0] || '?')}{(owner.last_name?.[0] || '')}
                </div>
                <div className="flex-1">
                  <p className="font-medium">
                    {owner.first_name} {owner.last_name}
                  </p>
                  <p className="text-sm text-[#71717a]">{owner.email}</p>
                  {owner.phone && <p className="text-sm text-[#71717a]">{owner.phone}</p>}
                </div>
              </Link>
            </section>
          )}

          {/* Recent Inspections */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Inspections</h2>
              <Link href={`/manage/inspections?property=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {recentCompleted.length > 0 ? recentCompleted.map((inspection) => {
                const issuesData = inspection.issues as { count: number }[] | null
                const issueCount = issuesData?.[0]?.count || 0
                return (
                  <Link
                    key={inspection.id}
                    href={`/manage/inspections/${inspection.id}`}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-4 h-4 text-[#71717a]" />
                      <div>
                        <p className="text-sm font-medium">{formatDate(inspection.scheduled_date)}</p>
                        <p className="text-xs text-[#71717a]">
                          {issueCount === 0 ? 'No issues found' : `${issueCount} issue(s) found`}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-500">
                      completed
                    </span>
                  </Link>
                )
              }) : (
                <p className="text-[#71717a] text-sm py-4 text-center">No inspections yet</p>
              )}
            </div>
          </section>

          {/* Open Service Requests */}
          {openRequests && openRequests.length > 0 && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Open Service Requests</h2>
                <Link href={`/manage/requests?property=${id}`} className="text-sm text-[#4cbb17] hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-2">
                {openRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/manage/requests/${request.id}`}
                    className="flex items-center justify-between p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`w-4 h-4 ${
                        request.priority === 'high' || request.priority === 'urgent' ? 'text-red-500' :
                        request.priority === 'medium' ? 'text-yellow-500' :
                        'text-[#71717a]'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{request.title}</p>
                        <p className="text-xs text-[#71717a]">{formatDate(request.created_at)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      request.priority === 'high' || request.priority === 'urgent' ? 'bg-red-500/10 text-red-500' :
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
            {nextInspection ? (
              <div className="flex items-center gap-3 p-3 bg-[#4cbb17]/10 rounded-lg border border-[#4cbb17]/20">
                <Calendar className="w-5 h-5 text-[#4cbb17]" />
                <div>
                  <p className="font-medium text-[#4cbb17]">{formatDate(nextInspection.scheduled_date)}</p>
                  {nextInspection.technician && (() => {
                    const techData = nextInspection.technician as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
                    const tech = Array.isArray(techData) ? techData[0] : techData
                    return tech ? (
                      <p className="text-sm text-[#a1a1aa]">
                        {tech.first_name} {tech.last_name}
                      </p>
                    ) : null
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-[#71717a] text-sm mb-3">No inspection scheduled</p>
                <Link
                  href={`/manage/schedule/new?property=${id}`}
                  className="text-sm text-[#4cbb17] hover:underline"
                >
                  Schedule one
                </Link>
              </div>
            )}
          </section>

          {/* Property Details */}
          <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#71717a]">Type</span>
                <span className="capitalize">{property.property_type || 'N/A'}</span>
              </div>
              {property.square_footage && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Sq Ft</span>
                  <span>{property.square_footage.toLocaleString()}</span>
                </div>
              )}
              {property.bedrooms && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Bedrooms</span>
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex justify-between">
                  <span className="text-[#71717a]">Bathrooms</span>
                  <span>{property.bathrooms}</span>
                </div>
              )}
            </div>
          </section>

          {/* Checklist */}
          {checklist && (
            <section className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Checklist</h2>
              <Link
                href={`/manage/checklists/${checklist.id}`}
                className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-[#171717] transition-colors"
              >
                <FileText className="w-5 h-5 text-[#71717a]" />
                <div>
                  <p className="text-sm font-medium">{checklist.name}</p>
                  <p className="text-xs text-[#71717a]">
                    {(checklist.items as { count: number }[])?.[0]?.count || 0} items
                  </p>
                </div>
              </Link>
            </section>
          )}

          {/* Property Notes */}
          <EditableNotes
            initialNotes={property.special_instructions || ''}
            title="Notes"
            placeholder="Add property notes..."
          />
        </div>
      </div>
    </div>
  )
}
