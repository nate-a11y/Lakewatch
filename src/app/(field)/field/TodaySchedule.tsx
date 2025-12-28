'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Navigation,
  Clock,
  CheckCircle,
  ChevronRight,
  Play,
  Map,
  List,
  CalendarX,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScheduleItem {
  id: string
  property: {
    id: string
    name: string
    address: string
    city: string
  }
  timeWindow: string
  status: 'scheduled' | 'in_progress' | 'completed'
  type: 'inspection' | 'service'
  checklist: string
  estimatedDuration: number
  order: number
}

interface TodayScheduleProps {
  initialItems: ScheduleItem[]
  technicianName: string
}

export default function TodaySchedule({ initialItems, technicianName }: TodayScheduleProps) {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const inspections = initialItems

  const stats = {
    completed: inspections.filter(i => i.status === 'completed').length,
    remaining: inspections.filter(i => i.status !== 'completed').length,
    total: inspections.length,
  }

  const currentInspection = inspections.find(i => i.status === 'in_progress')
  const nextInspection = inspections.find(i => i.status === 'scheduled')

  if (inspections.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center py-16">
          <CalendarX className="w-16 h-16 text-[#27272a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No inspections today</h2>
          <p className="text-[#71717a] mb-6">
            Hey {technicianName}, you have no scheduled inspections for today.
          </p>
          <Link
            href="/field/history"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors"
          >
            View Past Inspections
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-24">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[#4cbb17]">{stats.completed}</p>
          <p className="text-xs text-[#71717a]">Completed</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.remaining}</p>
          <p className="text-xs text-[#71717a]">Remaining</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-[#71717a]">Total</p>
        </div>
      </div>

      {/* Current/Next Inspection CTA */}
      {(currentInspection || nextInspection) && (
        <div className="mb-6">
          {currentInspection ? (
            <Link
              href={`/field/inspect/${currentInspection.id}`}
              className="block p-4 bg-[#4cbb17] text-black rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium bg-black/20 px-2 py-1 rounded">
                  IN PROGRESS
                </span>
                <span className="text-sm font-medium">
                  {currentInspection.timeWindow}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {currentInspection.property.name}
              </h3>
              <p className="text-sm opacity-80 mb-3">
                {currentInspection.property.address}, {currentInspection.property.city}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {currentInspection.checklist}
                </span>
                <span className="inline-flex items-center gap-1 font-bold">
                  Continue <ChevronRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          ) : nextInspection && (
            <Link
              href={`/field/inspect/${nextInspection.id}`}
              className="block p-4 bg-[#0f0f0f] border border-[#4cbb17] rounded-xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#4cbb17]">
                  NEXT UP
                </span>
                <span className="text-sm text-[#71717a]">
                  {nextInspection.timeWindow}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {nextInspection.property.name}
              </h3>
              <p className="text-sm text-[#71717a] mb-3">
                {nextInspection.property.address}, {nextInspection.property.city}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#a1a1aa]">
                  {nextInspection.checklist} • ~{nextInspection.estimatedDuration} min
                </span>
                <span className="inline-flex items-center gap-1 text-[#4cbb17] font-medium">
                  <Play className="w-4 h-4" /> Start
                </span>
              </div>
            </Link>
          )}
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">Today&apos;s Route</h2>
        <div className="flex bg-[#0f0f0f] border border-[#27272a] rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              viewMode === 'list' ? 'bg-[#27272a] text-white' : 'text-[#71717a]'
            )}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={cn(
              'px-3 py-1.5 rounded text-sm font-medium transition-colors',
              viewMode === 'map' ? 'bg-[#27272a] text-white' : 'text-[#71717a]'
            )}
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Schedule List */}
      {viewMode === 'list' ? (
        <div className="space-y-3">
          {inspections.map((inspection, index) => (
            <Link
              key={inspection.id}
              href={inspection.type === 'inspection' ? `/field/inspect/${inspection.id}` : `/field/requests`}
              className={cn(
                'block p-4 rounded-xl border transition-colors',
                inspection.status === 'completed'
                  ? 'bg-[#0f0f0f] border-[#27272a] opacity-60'
                  : inspection.status === 'in_progress'
                  ? 'bg-[#0f0f0f] border-[#4cbb17]'
                  : 'bg-[#0f0f0f] border-[#27272a] hover:border-[#4cbb17]/50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Order indicator */}
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    inspection.status === 'completed'
                      ? 'bg-green-500/10 text-green-500'
                      : inspection.status === 'in_progress'
                      ? 'bg-[#4cbb17] text-black'
                      : 'bg-[#27272a] text-[#71717a]'
                  )}>
                    {inspection.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      inspection.order
                    )}
                  </div>
                  {index < inspections.length - 1 && (
                    <div className="w-0.5 h-8 bg-[#27272a] mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {inspection.property.name}
                    </h3>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded',
                      inspection.type === 'service'
                        ? 'bg-purple-500/10 text-purple-400'
                        : 'bg-blue-500/10 text-blue-400'
                    )}>
                      {inspection.type}
                    </span>
                  </div>
                  <p className="text-sm text-[#71717a] mb-2">
                    {inspection.property.address}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-[#71717a]">
                      <Clock className="w-3 h-3" />
                      {inspection.timeWindow}
                    </span>
                    <span className="text-[#71717a]">
                      ~{inspection.estimatedDuration} min
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#71717a] mt-2" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        /* Map View Placeholder */
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl aspect-[4/3] flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-[#27272a] mx-auto mb-2" />
            <p className="text-[#71717a]">Map view</p>
            <p className="text-xs text-[#71717a]">Integration coming soon</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {nextInspection && (
        <div className="fixed bottom-20 left-4 right-4 max-w-lg mx-auto">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(`${nextInspection.property.address}, ${nextInspection.property.city}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#27272a] rounded-xl font-medium hover:bg-[#3f3f46] transition-colors"
          >
            <Navigation className="w-5 h-5" />
            Navigate to Next Stop
          </a>
        </div>
      )}
    </div>
  )
}
