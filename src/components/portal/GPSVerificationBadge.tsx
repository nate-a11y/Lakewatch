'use client'

import { useState } from 'react'
import { MapPin, Clock, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GPSVerificationBadgeProps {
  verified: boolean
  checkInTime?: string
  checkOutTime?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  className?: string
}

export function GPSVerificationBadge({
  verified,
  checkInTime,
  checkOutTime,
  location,
  className,
}: GPSVerificationBadgeProps) {
  const [expanded, setExpanded] = useState(false)

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return null
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  if (!verified) {
    return (
      <div className={cn(
        'inline-flex items-center gap-2 px-3 py-2 bg-[#27272a] rounded-lg text-sm text-[#71717a]',
        className
      )}>
        <MapPin className="w-4 h-4" />
        <span>Location not verified</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-xl border border-[#27272a] overflow-hidden', className)}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-[#4cbb17]/20 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-[#4cbb17]" />
          </span>
          <div className="text-left">
            <p className="text-sm font-medium text-[#4cbb17]">Verified On-Site</p>
            <p className="text-xs text-[#71717a]">
              {formatTime(checkInTime)} - {formatTime(checkOutTime)}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-[#71717a]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#71717a]" />
        )}
      </button>

      {expanded && (
        <div className="p-4 border-t border-[#27272a] bg-[#0a0a0a]">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-[#71717a]" />
              <div>
                <span className="text-[#71717a]">Check-in: </span>
                <span className="font-medium">{formatTime(checkInTime)}</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-[#71717a]" />
              <div>
                <span className="text-[#71717a]">Check-out: </span>
                <span className="font-medium">{formatTime(checkOutTime)}</span>
              </div>
            </div>
            {location && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-[#71717a] mt-0.5" />
                <div>
                  <span className="text-[#71717a]">Location: </span>
                  <span className="font-medium">
                    {location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Mini map placeholder */}
          {location && (
            <div className="mt-4 h-32 bg-[#27272a] rounded-lg flex items-center justify-center">
              <a
                href={`https://www.google.com/maps?q=${location.lat},${location.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#4cbb17] hover:underline"
              >
                View on Google Maps
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
