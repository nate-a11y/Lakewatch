'use client'

import { useState } from 'react'
import { ArrowLeftRight, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface PhotoComparisonProps {
  currentPhoto: string
  currentDate: string
  previousPhoto?: string
  previousDate?: string
  itemName: string
  className?: string
}

export function PhotoComparison({
  currentPhoto,
  currentDate,
  previousPhoto,
  previousDate,
  itemName,
  className,
}: PhotoComparisonProps) {
  const [showComparison, setShowComparison] = useState(false)
  const [sliderPosition, setSliderPosition] = useState(50)

  if (!previousPhoto) {
    return null
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className={cn('', className)}>
      <button
        onClick={() => setShowComparison(!showComparison)}
        className="flex items-center gap-2 text-sm text-[#4cbb17] hover:text-[#60e421] transition-colors mb-3"
      >
        <ArrowLeftRight className="w-4 h-4" />
        {showComparison ? 'Hide comparison' : 'Compare to previous visit'}
      </button>

      {showComparison && (
        <div className="bg-[#0f0f0f] border border-[#27272a] rounded-xl overflow-hidden">
          {/* Comparison slider */}
          <div
            className="relative h-64 w-full cursor-ew-resize select-none"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
              setSliderPosition((x / rect.width) * 100)
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const touch = e.touches[0]
              const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
              setSliderPosition((x / rect.width) * 100)
            }}
          >
            {/* Previous photo (left/back) */}
            <div className="absolute inset-0">
              <Image
                src={previousPhoto}
                alt={`Previous: ${itemName}`}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs">
                {formatDate(previousDate!)}
              </div>
            </div>

            {/* Current photo (right/front) with clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${sliderPosition}%)` }}
            >
              <Image
                src={currentPhoto}
                alt={`Current: ${itemName}`}
                fill
                className="object-cover"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs">
                {formatDate(currentDate)}
              </div>
            </div>

            {/* Slider handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ChevronLeft className="w-3 h-3 text-black -mr-1" />
                <ChevronRight className="w-3 h-3 text-black -ml-1" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="flex justify-between px-4 py-2 text-xs text-[#71717a] border-t border-[#27272a]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Previous: {formatDate(previousDate!)}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Current: {formatDate(currentDate)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
