'use client'

import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, Star, Target } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PerformanceMetrics {
  inspectionsCompleted: {
    week: number
    month: number
    allTime: number
  }
  averageDuration: number // in minutes
  onTimeRate: number // percentage
  issuesFoundRate: number // percentage
  customerSatisfaction?: number // 1-5 rating
  teamAverage: {
    inspectionsPerWeek: number
    averageDuration: number
    onTimeRate: number
  }
}

interface TeamPerformanceDashboardProps {
  technicianName: string
  metrics: PerformanceMetrics
  className?: string
}

export function TeamPerformanceDashboard({
  technicianName,
  metrics,
  className,
}: TeamPerformanceDashboardProps) {
  const getComparisonColor = (value: number, teamAvg: number, higherIsBetter: boolean = true) => {
    const diff = value - teamAvg
    if (higherIsBetter) {
      return diff >= 0 ? 'text-green-500' : 'text-red-500'
    }
    return diff <= 0 ? 'text-green-500' : 'text-red-500'
  }

  const getComparisonIcon = (value: number, teamAvg: number, higherIsBetter: boolean = true) => {
    const diff = value - teamAvg
    const isPositive = higherIsBetter ? diff >= 0 : diff <= 0
    return isPositive ? (
      <TrendingUp className="w-4 h-4" />
    ) : (
      <TrendingDown className="w-4 h-4" />
    )
  }

  const formatComparison = (value: number, teamAvg: number, unit: string = '') => {
    const diff = value - teamAvg
    const sign = diff >= 0 ? '+' : ''
    return `${sign}${diff.toFixed(0)}${unit} vs team`
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{technicianName}&apos;s Performance</h2>
        {metrics.customerSatisfaction && (
          <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 rounded-full">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-medium text-yellow-500">
              {metrics.customerSatisfaction.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Inspections Completed */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-medium">Inspections Completed</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-[#4cbb17]">
              {metrics.inspectionsCompleted.week}
            </p>
            <p className="text-xs text-[#71717a]">This Week</p>
            <p className={cn(
              'text-xs mt-1 flex items-center justify-center gap-1',
              getComparisonColor(metrics.inspectionsCompleted.week, metrics.teamAverage.inspectionsPerWeek)
            )}>
              {getComparisonIcon(metrics.inspectionsCompleted.week, metrics.teamAverage.inspectionsPerWeek)}
              {formatComparison(metrics.inspectionsCompleted.week, metrics.teamAverage.inspectionsPerWeek)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.inspectionsCompleted.month}</p>
            <p className="text-xs text-[#71717a]">This Month</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{metrics.inspectionsCompleted.allTime}</p>
            <p className="text-xs text-[#71717a]">All Time</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Average Duration */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <h4 className="text-sm text-[#71717a]">Avg Duration</h4>
          </div>
          <p className="text-2xl font-bold">{metrics.averageDuration} min</p>
          <p className={cn(
            'text-xs mt-1 flex items-center gap-1',
            getComparisonColor(metrics.averageDuration, metrics.teamAverage.averageDuration, false)
          )}>
            {getComparisonIcon(metrics.averageDuration, metrics.teamAverage.averageDuration, false)}
            {formatComparison(metrics.averageDuration, metrics.teamAverage.averageDuration, ' min')}
          </p>
        </div>

        {/* On-Time Rate */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-purple-500" />
            <h4 className="text-sm text-[#71717a]">On-Time Rate</h4>
          </div>
          <p className="text-2xl font-bold">{metrics.onTimeRate}%</p>
          <p className={cn(
            'text-xs mt-1 flex items-center gap-1',
            getComparisonColor(metrics.onTimeRate, metrics.teamAverage.onTimeRate)
          )}>
            {getComparisonIcon(metrics.onTimeRate, metrics.teamAverage.onTimeRate)}
            {formatComparison(metrics.onTimeRate, metrics.teamAverage.onTimeRate, '%')}
          </p>
        </div>

        {/* Issues Found Rate */}
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <h4 className="text-sm text-[#71717a]">Issues Found</h4>
          </div>
          <p className="text-2xl font-bold">{metrics.issuesFoundRate}%</p>
          <p className="text-xs text-[#71717a] mt-1">of inspections</p>
        </div>

        {/* Customer Satisfaction */}
        {metrics.customerSatisfaction && (
          <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <h4 className="text-sm text-[#71717a]">Satisfaction</h4>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{metrics.customerSatisfaction.toFixed(1)}</p>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-4 h-4',
                      star <= Math.round(metrics.customerSatisfaction!)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-[#27272a]'
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar for On-Time Rate */}
      <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#71717a]">On-Time Performance</span>
          <span className="text-sm font-medium">{metrics.onTimeRate}%</span>
        </div>
        <div className="h-3 bg-[#27272a] rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              metrics.onTimeRate >= 90 ? 'bg-green-500' :
              metrics.onTimeRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
            )}
            style={{ width: `${metrics.onTimeRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-[#71717a]">
          <span>Target: 90%</span>
          <span>Team Avg: {metrics.teamAverage.onTimeRate}%</span>
        </div>
      </div>
    </div>
  )
}
