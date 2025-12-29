'use client'

import { TrendingUp, Clock, AlertTriangle, Target, Award, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PersonalStatsProps {
  stats: {
    weekInspections: number
    monthInspections: number
    avgDuration: number // minutes
    issuesFoundRate: number // percentage
    streak: number // consecutive days with inspections
    onTimeRate: number // percentage
  }
  className?: string
}

export function PersonalStats({ stats, className }: PersonalStatsProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-[#4cbb17]" />
          Your Stats
        </h3>
        {stats.streak > 0 && (
          <div className="flex items-center gap-1 px-2 py-1 bg-orange-500/10 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-orange-500">{stats.streak} day streak!</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* This Week */}
        <div className="bg-[#0a0a0a] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[#71717a] mb-1">
            <Target className="w-4 h-4" />
            <span className="text-xs">This Week</span>
          </div>
          <p className="text-2xl font-bold">{stats.weekInspections}</p>
          <p className="text-xs text-[#71717a]">inspections</p>
        </div>

        {/* This Month */}
        <div className="bg-[#0a0a0a] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[#71717a] mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">This Month</span>
          </div>
          <p className="text-2xl font-bold">{stats.monthInspections}</p>
          <p className="text-xs text-[#71717a]">inspections</p>
        </div>

        {/* Average Duration */}
        <div className="bg-[#0a0a0a] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[#71717a] mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Avg Time</span>
          </div>
          <p className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</p>
          <p className="text-xs text-[#71717a]">per inspection</p>
        </div>

        {/* Issues Found Rate */}
        <div className="bg-[#0a0a0a] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[#71717a] mb-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">Issues Found</span>
          </div>
          <p className="text-2xl font-bold">{stats.issuesFoundRate}%</p>
          <p className="text-xs text-[#71717a]">of inspections</p>
        </div>

        {/* On-Time Rate */}
        <div className="bg-[#0a0a0a] rounded-lg p-3 col-span-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[#71717a] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">On-Time Arrivals</span>
              </div>
              <p className="text-2xl font-bold">{stats.onTimeRate}%</p>
            </div>
            {/* Progress bar */}
            <div className="w-24 h-24 relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#27272a"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#4cbb17"
                  strokeWidth="3"
                  strokeDasharray={`${stats.onTimeRate}, 100`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold">{stats.onTimeRate}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational message */}
      <div className="mt-4 pt-4 border-t border-[#27272a] text-center">
        {stats.weekInspections >= 10 ? (
          <p className="text-sm text-[#4cbb17]">
            Great work this week! You&apos;re crushing it!
          </p>
        ) : stats.streak >= 5 ? (
          <p className="text-sm text-orange-500">
            {stats.streak} day streak! Keep it going!
          </p>
        ) : (
          <p className="text-sm text-[#71717a]">
            Keep up the good work!
          </p>
        )}
      </div>
    </div>
  )
}
