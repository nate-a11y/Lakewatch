'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Download,
  Filter,
} from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  property: { id: string; name: string }
  date: string
  status: string
  technician: string
  summary: string
  viewed: boolean
}

export default function ReportsPage() {
  const [showFilters, setShowFilters] = useState(false)

  // Mock data - replace with actual API calls
  const reports = [
    {
      id: '1',
      property: { id: '1', name: 'Lake House' },
      date: 'December 20, 2025',
      status: 'all_clear',
      technician: 'Mike T.',
      summary: 'All systems checked and functioning properly. No issues found.',
      viewed: true,
    },
    {
      id: '2',
      property: { id: '1', name: 'Lake House' },
      date: 'December 6, 2025',
      status: 'all_clear',
      technician: 'Sarah M.',
      summary: 'Regular inspection completed. Everything in order.',
      viewed: true,
    },
    {
      id: '3',
      property: { id: '2', name: 'Guest Cabin' },
      date: 'December 15, 2025',
      status: 'issues_found',
      technician: 'Mike T.',
      summary: 'Found minor water leak under kitchen sink. Repair recommended.',
      viewed: false,
    },
    {
      id: '4',
      property: { id: '1', name: 'Lake House' },
      date: 'November 22, 2025',
      status: 'all_clear',
      technician: 'Sarah M.',
      summary: 'Post-storm check completed. No damage found.',
      viewed: true,
    },
  ]

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
        <button
          onClick={() => {
            setShowFilters(!showFilters)
            toast.info(showFilters ? 'Filters hidden' : 'Filter options coming soon')
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] text-white rounded-lg hover:bg-[#3f3f46] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Reports list */}
      <div className="space-y-4">
        {reports.map((report) => (
          <ReportCard key={report.id} report={report} />
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

function ReportCard({ report }: { report: Report }) {
  return (
    <Link
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
            onClick={(e) => {
              e.preventDefault()
              toast.success(`Downloading report for ${report.property.name}...`)
            }}
            className="p-2 text-[#71717a] hover:text-white hover:bg-[#27272a] rounded-lg transition-colors"
            aria-label="Download PDF"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  )
}
