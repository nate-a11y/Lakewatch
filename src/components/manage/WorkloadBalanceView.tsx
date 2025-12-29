'use client'

import { Users, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TechnicianWorkload {
  id: string
  name: string
  avatar?: string
  inspectionsThisWeek: number
  hoursScheduled: number
  capacity: number // max inspections per week
}

interface WorkloadBalanceViewProps {
  technicians: TechnicianWorkload[]
  className?: string
}

export function WorkloadBalanceView({ technicians, className }: WorkloadBalanceViewProps) {
  const totalInspections = technicians.reduce((sum, t) => sum + t.inspectionsThisWeek, 0)
  const avgInspections = technicians.length > 0 ? totalInspections / technicians.length : 0

  const getUtilizationColor = (current: number, capacity: number) => {
    const rate = (current / capacity) * 100
    if (rate >= 100) return 'bg-red-500'
    if (rate >= 80) return 'bg-yellow-500'
    if (rate >= 50) return 'bg-[#4cbb17]'
    return 'bg-blue-500'
  }

  const getUtilizationLabel = (current: number, capacity: number) => {
    const rate = (current / capacity) * 100
    if (rate >= 100) return { text: 'Over capacity', color: 'text-red-500' }
    if (rate >= 80) return { text: 'Near capacity', color: 'text-yellow-500' }
    if (rate >= 50) return { text: 'Balanced', color: 'text-green-500' }
    return { text: 'Under-utilized', color: 'text-blue-500' }
  }

  const maxInspections = Math.max(...technicians.map(t => t.inspectionsThisWeek), 1)

  // Sort by inspections descending
  const sortedTechnicians = [...technicians].sort(
    (a, b) => b.inspectionsThisWeek - a.inspectionsThisWeek
  )

  const overloadedCount = technicians.filter(t => t.inspectionsThisWeek >= t.capacity).length
  const underUtilizedCount = technicians.filter(t => (t.inspectionsThisWeek / t.capacity) < 0.5).length

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-semibold">Workload Balance</h3>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[#71717a]">
            Avg: <span className="text-white font-medium">{avgInspections.toFixed(1)}</span> inspections
          </span>
        </div>
      </div>

      {/* Alerts */}
      {(overloadedCount > 0 || underUtilizedCount > 0) && (
        <div className="flex gap-3 mb-4">
          {overloadedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-500" />
              <span className="text-xs text-red-400">
                {overloadedCount} tech{overloadedCount !== 1 ? 's' : ''} overloaded
              </span>
            </div>
          )}
          {underUtilizedCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <TrendingDown className="w-4 h-4 text-blue-500" />
              <span className="text-xs text-blue-400">
                {underUtilizedCount} tech{underUtilizedCount !== 1 ? 's' : ''} under-utilized
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bar Chart */}
      <div className="space-y-3">
        {sortedTechnicians.map((tech) => {
          const utilization = getUtilizationLabel(tech.inspectionsThisWeek, tech.capacity)
          const barWidth = (tech.inspectionsThisWeek / maxInspections) * 100

          return (
            <div key={tech.id} className="group">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {tech.avatar ? (
                    <img
                      src={tech.avatar}
                      alt={tech.name}
                      className="w-6 h-6 rounded-full"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#27272a] flex items-center justify-center text-xs font-medium">
                      {tech.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium">{tech.name}</span>
                  {tech.inspectionsThisWeek >= tech.capacity && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('text-xs', utilization.color)}>
                    {utilization.text}
                  </span>
                  <span className="text-sm text-[#71717a]">
                    <span className="text-white font-medium">{tech.inspectionsThisWeek}</span>
                    /{tech.capacity}
                  </span>
                </div>
              </div>
              <div className="h-6 bg-[#27272a] rounded-lg overflow-hidden relative">
                <div
                  className={cn(
                    'h-full rounded-lg transition-all duration-300 group-hover:opacity-80',
                    getUtilizationColor(tech.inspectionsThisWeek, tech.capacity)
                  )}
                  style={{ width: `${barWidth}%` }}
                />
                {/* Capacity marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/30"
                  style={{ left: `${(tech.capacity / maxInspections) * 100}%` }}
                  title={`Capacity: ${tech.capacity}`}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-[#71717a]">
                <span>{tech.hoursScheduled}h scheduled</span>
                <span>{Math.round((tech.inspectionsThisWeek / tech.capacity) * 100)}% utilized</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-[#27272a]">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-xs text-[#71717a]">&lt;50%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-[#4cbb17]" />
          <span className="text-xs text-[#71717a]">50-80%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span className="text-xs text-[#71717a]">80-100%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-xs text-[#71717a]">&gt;100%</span>
        </div>
      </div>
    </div>
  )
}
