'use client'

import { cn } from '@/lib/utils'
import { RefreshCw } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const PULL_THRESHOLD = 80
const MAX_PULL = 120

export function PullToRefresh({
  onRefresh,
  children,
  className,
  disabled = false,
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [startY, setStartY] = useState(0)
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || isRefreshing) return
      const container = containerRef.current
      if (!container) return

      // Only start pull if at the top of scroll
      if (container.scrollTop <= 0) {
        setStartY(e.touches[0].clientY)
        setIsPulling(true)
      }
    },
    [disabled, isRefreshing]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isPulling || disabled || isRefreshing) return

      const currentY = e.touches[0].clientY
      const delta = currentY - startY

      // Only allow pulling down
      if (delta > 0) {
        // Apply resistance
        const resistance = 0.5
        const adjustedDelta = Math.min(delta * resistance, MAX_PULL)
        setPullDistance(adjustedDelta)

        // Prevent scroll while pulling
        if (adjustedDelta > 10) {
          e.preventDefault()
        }
      }
    },
    [isPulling, startY, disabled, isRefreshing]
  )

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling || disabled) return

    setIsPulling(false)

    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true)
      setPullDistance(PULL_THRESHOLD * 0.6) // Hold at indicator position

      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled])

  const progress = Math.min(pullDistance / PULL_THRESHOLD, 1)
  const rotation = progress * 360

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-auto', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <div
        className={cn(
          'absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-10',
          'transition-opacity duration-200',
          pullDistance > 10 || isRefreshing ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          top: Math.max(pullDistance - 40, 8),
          transition: isPulling ? 'none' : 'top 0.3s ease-out, opacity 0.2s',
        }}
      >
        <div
          className={cn(
            'w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#27272a] flex items-center justify-center shadow-lg',
            isRefreshing && 'animate-pulse'
          )}
        >
          <RefreshCw
            size={20}
            className={cn(
              'text-[#4cbb17]',
              isRefreshing && 'animate-spin'
            )}
            style={{
              transform: !isRefreshing ? `rotate(${rotation}deg)` : undefined,
              transition: isPulling ? 'none' : 'transform 0.2s',
            }}
          />
        </div>
      </div>

      {/* Content with transform */}
      <div
        style={{
          transform: `translateY(${pullDistance}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        {children}
      </div>
    </div>
  )
}
