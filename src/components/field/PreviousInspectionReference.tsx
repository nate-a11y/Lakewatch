'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Calendar, Clock, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PreviousIssue {
  id: string
  title: string
  severity: 'low' | 'medium' | 'high'
  resolved: boolean
  notes?: string
}

interface PreviousInspection {
  id: string
  date: string
  technicianName: string
  duration: number // in minutes
  issuesFound: number
  issues: PreviousIssue[]
  overallNotes?: string
}

interface PreviousInspectionReferenceProps {
  inspection: PreviousInspection | null
  propertyName: string
  className?: string
}

export function PreviousInspectionReference({
  inspection,
  propertyName: _propertyName,
  className,
}: PreviousInspectionReferenceProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!inspection) {
    return (
      <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4', className)}>
        <div className="flex items-center gap-2 text-[#71717a]">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">First inspection for this property</span>
        </div>
      </div>
    )
  }

  const unresolvedIssues = inspection.issues.filter(i => !i.resolved)
  const hasUnresolvedIssues = unresolvedIssues.length > 0

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10'
      default: return 'text-blue-500 bg-blue-500/10'
    }
  }

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden', className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-[#171717] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            hasUnresolvedIssues ? 'bg-yellow-500/10' : 'bg-green-500/10'
          )}>
            {hasUnresolvedIssues ? (
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </div>
          <div className="text-left">
            <p className="font-medium text-sm">Last Visit: {formatDate(inspection.date)}</p>
            <p className="text-xs text-[#71717a]">
              {inspection.issuesFound === 0 ? (
                'No issues found'
              ) : (
                <>
                  {inspection.issuesFound} issue{inspection.issuesFound !== 1 ? 's' : ''} found
                  {hasUnresolvedIssues && (
                    <span className="text-yellow-500 ml-1">
                      ({unresolvedIssues.length} unresolved)
                    </span>
                  )}
                </>
              )}
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#71717a]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#71717a]" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-[#27272a] p-4 space-y-4">
          {/* Visit Details */}
          <div className="flex items-center gap-4 text-sm text-[#71717a]">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {inspection.technicianName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {inspection.duration} min
            </span>
          </div>

          {/* Issues List */}
          {inspection.issues.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide">
                Issues from last visit
              </p>
              {inspection.issues.map((issue) => (
                <div
                  key={issue.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg',
                    issue.resolved ? 'bg-[#0a0a0a]' : 'bg-yellow-500/5 border border-yellow-500/20'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-0.5',
                    issue.resolved ? 'bg-green-500/10' : getSeverityColor(issue.severity)
                  )}>
                    {issue.resolved ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn(
                        'text-sm font-medium',
                        issue.resolved && 'text-[#71717a] line-through'
                      )}>
                        {issue.title}
                      </p>
                      {!issue.resolved && (
                        <span className={cn(
                          'text-xs px-1.5 py-0.5 rounded',
                          getSeverityColor(issue.severity)
                        )}>
                          {issue.severity}
                        </span>
                      )}
                    </div>
                    {issue.notes && (
                      <p className="text-xs text-[#71717a] mt-1">{issue.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Overall Notes */}
          {inspection.overallNotes && (
            <div className="bg-[#0a0a0a] rounded-lg p-3">
              <p className="text-xs font-medium text-[#71717a] mb-1">Notes from technician</p>
              <p className="text-sm">{inspection.overallNotes}</p>
            </div>
          )}

          {/* Follow-up Reminder */}
          {hasUnresolvedIssues && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-sm text-yellow-500 font-medium">
                ⚠️ Remember to check on {unresolvedIssues.length} unresolved issue{unresolvedIssues.length !== 1 ? 's' : ''} from last visit
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
