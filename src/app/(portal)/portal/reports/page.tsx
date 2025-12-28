import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Download,
} from 'lucide-react'
import ReportsFilterButton from './ReportsFilterButton'

export default async function ReportsPage() {
  const supabase = await createClient()

  // Fetch completed inspections (reports)
  const { data: inspections, error } = await supabase
    .from('lwp_inspections')
    .select(`
      id, scheduled_date, status, overall_status, notes, created_at,
      property:lwp_properties(id, name),
      technician:lwp_users!technician_id(first_name, last_name),
      issues:lwp_inspections_issues(count)
    `)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching reports:', error)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const reports = (inspections || []).map((inspection) => {
    const propertyData = inspection.property as { id: number; name: string } | { id: number; name: string }[] | null
    const property = Array.isArray(propertyData) ? propertyData[0] : propertyData
    const techData = inspection.technician as { first_name: string; last_name: string } | { first_name: string; last_name: string }[] | null
    const technician = Array.isArray(techData) ? techData[0] : techData
    const issuesData = inspection.issues as { count: number }[] | null
    const issueCount = issuesData?.[0]?.count || 0

    return {
      id: inspection.id,
      property: { id: property?.id || 0, name: property?.name || 'Property' },
      date: formatDate(inspection.scheduled_date),
      status: issueCount > 0 ? 'issues_found' : 'all_clear',
      technician: technician ? `${technician.first_name} ${technician.last_name?.[0]}.` : 'Technician',
      summary: inspection.notes || (issueCount > 0
        ? `Found ${issueCount} issue${issueCount > 1 ? 's' : ''} during inspection.`
        : 'All systems checked and functioning properly. No issues found.'),
      viewed: true, // Could track this in database
    }
  })

  const unviewedCount = reports.filter(r => !r.viewed).length

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Inspection Reports</h1>
          <p className="text-[#a1a1aa]">
            View detailed reports from all property inspections
            {unviewedCount > 0 && (
              <span className="ml-2 text-[#4cbb17]">
                ({unviewedCount} new)
              </span>
            )}
          </p>
        </div>
        <ReportsFilterButton />
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Link
            key={report.id}
            href={`/portal/reports/${report.id}`}
            className={`block bg-[#0f0f0f] border rounded-xl p-6 hover:border-[#4cbb17]/50 transition-colors ${
              !report.viewed ? 'border-[#4cbb17]' : 'border-[#27272a]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              {/* Status icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                report.status === 'all_clear'
                  ? 'bg-green-500/10'
                  : 'bg-yellow-500/10'
              }`}>
                {report.status === 'all_clear' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                )}
              </div>

              {/* Report info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold">{report.property.name}</h3>
                  {!report.viewed && (
                    <span className="text-xs px-2 py-0.5 bg-[#4cbb17] text-black rounded-full font-medium">
                      New
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#71717a] mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {report.date}
                  </span>
                  <span>Inspected by {report.technician}</span>
                </div>
                <p className="text-[#a1a1aa] text-sm line-clamp-2">
                  {report.summary}
                </p>
              </div>

              {/* Status & actions */}
              <div className="flex items-center gap-4">
                <span className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${
                  report.status === 'all_clear'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {report.status === 'all_clear' ? 'All Clear' : 'Issues Found'}
                </span>
                <button
                  className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
                  aria-label="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-16 bg-[#0f0f0f] border border-[#27272a] rounded-xl">
          <FileText className="w-16 h-16 text-[#71717a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
          <p className="text-[#a1a1aa]">
            Inspection reports will appear here after your first visit
          </p>
        </div>
      )}
    </div>
  )
}
