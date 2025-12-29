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
  Phone,
  Sun,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Car,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { WeatherAlertBanner } from '@/components/field/WeatherAlertBanner'

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
  const [showQuickActions, setShowQuickActions] = useState(false)
  const inspections = initialItems

  const stats = {
    completed: inspections.filter(i => i.status === 'completed').length,
    remaining: inspections.filter(i => i.status !== 'completed').length,
    total: inspections.length,
    totalDuration: inspections.reduce((sum, i) => sum + i.estimatedDuration, 0),
    estimatedDriveTime: inspections.length * 15, // Rough estimate: 15 min between stops
  }

  const currentInspection = inspections.find(i => i.status === 'in_progress')
  const nextInspection = inspections.find(i => i.status === 'scheduled')

  const handleMarkUnavailable = () => {
    toast.success('Status updated', {
      description: 'Dispatch has been notified that you are unavailable.',
    })
    setShowQuickActions(false)
  }

  const handleContactDispatch = () => {
    toast.info('Opening phone...', {
      description: 'Calling dispatch at (573) 555-0100',
    })
    window.location.href = 'tel:+15735550100'
    setShowQuickActions(false)
  }

  const handleEndDayEarly = () => {
    toast.success('Day ended', {
      description: 'Your remaining stops have been reassigned.',
    })
    setShowQuickActions(false)
  }

  if (inspections.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        {/* Weather Widget */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Sun className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">68°F</span>
                <span className="text-[#71717a]">Partly Cloudy</span>
              </div>
              <p className="text-sm text-[#71717a]">Lake of the Ozarks</p>
            </div>
          </div>
        </div>

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
      {/* Weather Widget */}
      <div className="mb-4 p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="w-6 h-6 text-yellow-400" />
            <div>
              <span className="font-semibold">68°F</span>
              <span className="text-[#71717a] ml-2 text-sm">Partly Cloudy</span>
            </div>
          </div>
          <div className="text-xs text-[#71717a]">
            Lake of the Ozarks
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      <WeatherAlertBanner className="mb-4" />

      {/* Route Overview Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-xl font-bold text-[#4cbb17]">{stats.completed}</p>
          <p className="text-[10px] text-[#71717a]">Done</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{stats.remaining}</p>
          <p className="text-[10px] text-[#71717a]">Left</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{Math.round(stats.totalDuration / 60)}h</p>
          <p className="text-[10px] text-[#71717a]">Work</p>
        </div>
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl p-3 text-center">
          <p className="text-xl font-bold">{stats.estimatedDriveTime}m</p>
          <p className="text-[10px] text-[#71717a]">Drive</p>
        </div>
      </div>

      {/* Current/Next Inspection CTA */}
      {(currentInspection || nextInspection) && (
        <div className="mb-6">
          {currentInspection ? (
            <div className="block p-4 bg-[#4cbb17] text-black rounded-xl">
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
              <div className="flex items-center gap-2">
                <Link
                  href={`/field/inspect/${currentInspection.id}`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-black/20 rounded-lg font-bold hover:bg-black/30 transition-colors"
                >
                  Continue <ChevronRight className="w-5 h-5" />
                </Link>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${currentInspection.property.address}, ${currentInspection.property.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                >
                  <Navigation className="w-5 h-5" />
                </a>
                <a
                  href="tel:+15735551234"
                  className="p-2 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          ) : nextInspection && (
            <div className="block p-4 bg-[#0f0f0f] border-2 border-[#4cbb17] rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#4cbb17] bg-[#4cbb17]/10 px-2 py-1 rounded">
                  NEXT UP
                </span>
                <div className="flex items-center gap-2 text-sm text-[#71717a]">
                  <Car className="w-4 h-4" />
                  <span>~12 min away</span>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">
                {nextInspection.property.name}
              </h3>
              <p className="text-sm text-[#71717a] mb-3">
                {nextInspection.property.address}, {nextInspection.property.city}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(`${nextInspection.property.address}, ${nextInspection.property.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#4cbb17] text-black rounded-lg font-bold hover:bg-[#60e421] transition-colors"
                >
                  <Navigation className="w-4 h-4" /> Start Navigation
                </a>
                <Link
                  href={`/field/inspect/${nextInspection.id}`}
                  className="p-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  <Play className="w-5 h-5 text-[#4cbb17]" />
                </Link>
                <a
                  href="tel:+15735551234"
                  className="p-2 border border-[#27272a] rounded-lg hover:bg-[#27272a] transition-colors"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
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
            <div
              key={inspection.id}
              className={cn(
                'block p-4 rounded-xl border transition-all',
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

                  {/* Action buttons for non-completed items */}
                  {inspection.status !== 'completed' && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#27272a]">
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${inspection.property.address}, ${inspection.property.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-[#27272a] rounded-lg text-sm hover:bg-[#3f3f46] transition-colors"
                      >
                        <Navigation className="w-4 h-4" /> Navigate
                      </a>
                      <a
                        href="tel:+15735551234"
                        className="p-2 bg-[#27272a] rounded-lg hover:bg-[#3f3f46] transition-colors"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                      <Link
                        href={inspection.type === 'inspection' ? `/field/inspect/${inspection.id}` : `/field/requests`}
                        className="p-2 bg-[#4cbb17] text-black rounded-lg hover:bg-[#60e421] transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Map View Placeholder */
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl aspect-[4/3] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent" />
          <div className="text-center relative z-10">
            <MapPin className="w-12 h-12 text-[#4cbb17] mx-auto mb-2" />
            <p className="text-[#a1a1aa] font-medium">Route Map</p>
            <p className="text-xs text-[#71717a]">{stats.total} stops • {stats.estimatedDriveTime} min total drive</p>
          </div>
          {/* Mock route visualization */}
          <div className="absolute left-4 top-1/4 bottom-1/4 w-1 bg-[#4cbb17]/30 rounded-full" />
          {inspections.slice(0, 4).map((_, i) => (
            <div
              key={i}
              className="absolute left-2 w-5 h-5 bg-[#4cbb17] rounded-full border-2 border-black"
              style={{ top: `${25 + (i * 15)}%` }}
            />
          ))}
        </div>
      )}

      {/* Quick Actions FAB */}
      <div className="fixed bottom-24 right-4">
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all',
            showQuickActions
              ? 'bg-[#27272a] rotate-45'
              : 'bg-[#4cbb17] text-black'
          )}
        >
          <XCircle className={cn('w-6 h-6', !showQuickActions && 'hidden')} />
          <MessageSquare className={cn('w-6 h-6', showQuickActions && 'hidden')} />
        </button>

        {/* Quick action menu */}
        {showQuickActions && (
          <div className="absolute bottom-16 right-0 bg-[#0f0f0f] border border-[#27272a] rounded-xl p-2 w-48 shadow-xl">
            <button
              onClick={handleContactDispatch}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#27272a] transition-colors text-left"
            >
              <Phone className="w-5 h-5 text-blue-400" />
              <span className="text-sm">Contact Dispatch</span>
            </button>
            <button
              onClick={handleMarkUnavailable}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#27272a] transition-colors text-left"
            >
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              <span className="text-sm">Mark Unavailable</span>
            </button>
            <button
              onClick={handleEndDayEarly}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[#27272a] transition-colors text-left"
            >
              <XCircle className="w-5 h-5 text-red-400" />
              <span className="text-sm">End Day Early</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
