'use client'

import { useState } from 'react'
import { Route, Clock, MapPin, Loader2, CheckCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Stop {
  id: string
  propertyName: string
  address: string
  scheduledTime: string
  order: number
}

interface RouteOptimizationProps {
  technicianName: string
  stops: Stop[]
  onReorder?: (newOrder: string[]) => void
  className?: string
}

export function RouteOptimization({
  technicianName,
  stops,
  onReorder,
  className,
}: RouteOptimizationProps) {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedStops, setOptimizedStops] = useState<Stop[] | null>(null)
  const [estimatedSavings, setEstimatedSavings] = useState<number | null>(null)

  const handleOptimize = async () => {
    setIsOptimizing(true)

    // Simulate API call to optimization service
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Simulate optimization result - in reality would call maps API
    const shuffled = [...stops].sort(() => Math.random() - 0.5)
    const reordered = shuffled.map((stop, idx) => ({ ...stop, order: idx + 1 }))

    setOptimizedStops(reordered)
    setEstimatedSavings(Math.floor(Math.random() * 30) + 10) // 10-40 min savings
    setIsOptimizing(false)
  }

  const applyOptimization = () => {
    if (optimizedStops) {
      onReorder?.(optimizedStops.map(s => s.id))
      toast.success('Route optimized!', {
        description: `Estimated ${estimatedSavings} minutes saved.`,
      })
      setOptimizedStops(null)
      setEstimatedSavings(null)
    }
  }

  const cancelOptimization = () => {
    setOptimizedStops(null)
    setEstimatedSavings(null)
  }

  return (
    <div className={cn('bg-[#0f0f0f] border border-[#27272a] rounded-xl p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Route className="w-5 h-5 text-[#4cbb17]" />
          <h3 className="font-medium">{technicianName}&apos;s Route</h3>
        </div>
        {!optimizedStops && (
          <button
            onClick={handleOptimize}
            disabled={isOptimizing || stops.length < 2}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              stops.length < 2
                ? 'bg-[#27272a] text-[#71717a] cursor-not-allowed'
                : 'bg-[#4cbb17] text-black hover:bg-[#60e421]'
            )}
          >
            {isOptimizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Optimizing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Optimize Route
              </>
            )}
          </button>
        )}
      </div>

      {/* Current/Optimized Route */}
      <div className="space-y-2">
        {(optimizedStops || stops).map((stop, idx) => (
          <div
            key={stop.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg transition-colors',
              optimizedStops ? 'bg-[#4cbb17]/5 border border-[#4cbb17]/20' : 'bg-[#0a0a0a]'
            )}
          >
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              optimizedStops ? 'bg-[#4cbb17] text-black' : 'bg-[#27272a]'
            )}>
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{stop.propertyName}</p>
              <div className="flex items-center gap-2 text-xs text-[#71717a]">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{stop.address}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#71717a]">
              <Clock className="w-3 h-3" />
              {stop.scheduledTime}
            </div>
          </div>
        ))}
      </div>

      {/* Optimization Result */}
      {optimizedStops && estimatedSavings && (
        <div className="mt-4 pt-4 border-t border-[#27272a]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#4cbb17]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Save ~{estimatedSavings} minutes</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={cancelOptimization}
              className="flex-1 px-3 py-2 border border-[#27272a] rounded-lg text-sm hover:bg-[#27272a] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyOptimization}
              className="flex-1 px-3 py-2 bg-[#4cbb17] text-black rounded-lg text-sm font-medium hover:bg-[#60e421] transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      )}

      {stops.length < 2 && (
        <p className="text-xs text-[#71717a] text-center mt-2">
          Add at least 2 stops to optimize
        </p>
      )}
    </div>
  )
}
